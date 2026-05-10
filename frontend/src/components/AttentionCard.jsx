import React from 'react';
import { Link } from 'react-router-dom';
import Card from './ui/Card.jsx';
import Skeleton from './ui/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
import { useAttentionItems } from '../hooks/usePending.js';

const kindIcon = {
  appraisal: '📋',
  okr:       '🎯',
  payout:    '💰',
  notif:     '🔔',
};

export default function AttentionCard() {
  const { profile, role, permissions } = useAuth();
  const { lang } = useTranslation();
  const { items, isLoading } = useAttentionItems(profile, role, permissions);

  return (
    <Card title={lang === 'ar' ? 'يحتاج انتباهك' : 'Needs your attention'}>
      {isLoading ? (
        <Skeleton count={2} className='h-6' />
      ) : items.length === 0 ? (
        <div className='text-sm text-slate-500'>{lang === 'ar' ? 'كل شيء على ما يرام' : "You're all caught up."}</div>
      ) : (
        <ul className='space-y-2'>
          {items.map(i => (
            <li key={i.id}>
              <Link to={i.link} className='flex items-center gap-3 p-2 border rounded hover:bg-slate-50'>
                <span className='text-xl'>{kindIcon[i.kind]}</span>
                <span className='flex-1 text-sm'>{lang === 'ar' ? i.label_ar : i.label_en}</span>
                <span className='text-xs font-semibold bg-mrkoon-accent text-white rounded-full px-2 py-0.5'>{i.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
