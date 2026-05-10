import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
import { useNotifications, useNotificationActions } from '../hooks/useNotifications.js';

const kindTone = {
  'appraisal.submitted': 'bg-blue-100 text-blue-700',
  'appraisal.mgr_reviewed': 'bg-indigo-100 text-indigo-700',
  'appraisal.ready_hr': 'bg-mrkoon-green-tint text-mrkoon-green',
  'kr.approved': 'bg-emerald-100 text-emerald-700',
  'payout.pending': 'bg-amber-100 text-amber-700',
  'cycle.opened': 'bg-purple-100 text-purple-700',
};

export default function NotificationsPage() {
  const { profile } = useAuth();
  const { t, lang } = useTranslation();
  const [showRead, setShowRead] = useState(false);
  const { data: notifs, isLoading } = useNotifications(profile?.id, showRead);
  const { markRead, dismiss, markAllRead } = useNotificationActions();

  return (
    <div className='space-y-4'>
      <div className='flex items-baseline justify-between'>
        <h1 className='text-2xl font-semibold'>{lang === 'ar' ? 'الإشعارات' : 'Notifications'}</h1>
        <div className='flex items-center gap-3 text-sm'>
          <label className='flex items-center gap-1'>
            <input type='checkbox' checked={showRead} onChange={e => setShowRead(e.target.checked)} />
            {lang === 'ar' ? 'إظهار المقروءة' : 'show read'}
          </label>
          <button onClick={() => markAllRead(profile.id)} className='text-mrkoon hover:underline'>
            {lang === 'ar' ? 'قراءة الكل' : 'mark all read'}
          </button>
        </div>
      </div>

      <Card>
        {isLoading ? <Skeleton count={5} className='h-12' /> : (
          (notifs ?? []).length === 0 ? (
            <div className='text-sm text-slate-500 py-8 text-center'>
              {lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
            </div>
          ) : (
            <ul className='divide-y'>
              {(notifs ?? []).map(n => (
                <li key={n.id} className={`p-3 flex items-start gap-3 ${!n.read_at ? 'bg-mrkoon-grey-light/40' : ''}`}>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${kindTone[n.kind] || 'bg-slate-100 text-slate-600'}`}>{n.kind}</span>
                      {!n.read_at && <span className='inline-block w-2 h-2 rounded-full bg-mrkoon-accent' />}
                    </div>
                    <div className='text-sm font-medium mt-1'>{lang === 'ar' ? (n.title_ar || n.title_en) : n.title_en}</div>
                    {(n.body_en || n.body_ar) && <div className='text-xs text-slate-600 mt-0.5'>{lang === 'ar' ? (n.body_ar || n.body_en) : n.body_en}</div>}
                    <div className='text-[11px] text-slate-400 mt-1'>{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  <div className='flex gap-2 text-xs'>
                    {n.link_url && <Link to={n.link_url} onClick={() => markRead(n.id)} className='text-mrkoon hover:underline'>open</Link>}
                    {!n.read_at && <button onClick={() => markRead(n.id)} className='text-slate-500 hover:underline'>read</button>}
                    <button onClick={() => dismiss(n.id)} className='text-rose-600 hover:underline'>dismiss</button>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </Card>
    </div>
  );
}
