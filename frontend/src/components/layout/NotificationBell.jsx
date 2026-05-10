import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useNotifications, useNotificationActions } from '../../hooks/useNotifications.js';

export default function NotificationBell() {
  const { profile } = useAuth();
  const { lang } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data: notifs } = useNotifications(profile?.id, false);
  const { markRead, dismiss, markAllRead } = useNotificationActions();
  const unread = (notifs ?? []).length;

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className='relative' ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className='relative p-2 rounded-full hover:bg-slate-100'
        aria-label='Notifications'
      >
        <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
          <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
          <path d='M13.73 21a2 2 0 0 1-3.46 0' />
        </svg>
        {unread > 0 && (
          <span className='absolute -top-0.5 -end-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1'>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className='absolute end-0 mt-2 w-80 max-h-[28rem] overflow-y-auto bg-white border rounded-lg shadow-lg z-50'>
          <div className='flex items-center justify-between p-3 border-b'>
            <div className='font-semibold text-sm'>{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</div>
            <div className='flex items-center gap-2'>
              {unread > 0 && (
                <button onClick={() => markAllRead(profile.id)} className='text-xs text-mrkoon hover:underline'>
                  {lang === 'ar' ? 'قراءة الكل' : 'mark all read'}
                </button>
              )}
              <Link to='/notifications' onClick={() => setOpen(false)} className='text-xs text-mrkoon hover:underline'>
                {lang === 'ar' ? 'الكل' : 'all →'}
              </Link>
            </div>
          </div>
          {(notifs ?? []).length === 0 ? (
            <div className='p-6 text-sm text-center text-slate-400'>{lang === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new notifications'}</div>
          ) : (
            <ul className='divide-y'>
              {(notifs ?? []).slice(0, 8).map(n => (
                <li key={n.id} className='p-3 hover:bg-slate-50'>
                  <div className='flex items-start gap-2'>
                    <div className='flex-1 min-w-0'>
                      <div className='text-xs text-slate-400 font-mono'>{n.kind}</div>
                      <div className='text-sm font-medium truncate'>{lang === 'ar' ? (n.title_ar || n.title_en) : n.title_en}</div>
                      <div className='text-[10px] text-slate-500 mt-0.5'>{new Date(n.created_at).toLocaleString()}</div>
                      {n.link_url && (
                        <Link to={n.link_url} onClick={() => { markRead(n.id); setOpen(false); }} className='text-xs text-mrkoon hover:underline'>
                          {lang === 'ar' ? 'افتح →' : 'open →'}
                        </Link>
                      )}
                    </div>
                    <button onClick={() => dismiss(n.id)} className='text-xs text-slate-400 hover:text-rose-600' title='Dismiss'>×</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
