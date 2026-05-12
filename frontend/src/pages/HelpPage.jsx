import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
import { useAuth } from '../context/AuthContext.jsx';

const sections = {
  en: [
    {
      title: 'Daily — Employees',
      items: [
        { t: 'Enter your KPI actuals for this period', to: '/kpis/entry' },
        { t: 'See your KPI history & trend', to: '/kpis' },
        { t: 'Look up an OKR / KR', to: '/okrs' },
        { t: 'Check notifications', to: '/notifications' },
      ],
    },
    {
      title: 'Quarterly — Employees',
      items: [
        { t: 'Submit your self-assessment when a cycle opens', to: '/appraisals' },
        { t: 'See your final rating after HR sign-off', to: '/appraisals' },
      ],
    },
    {
      title: 'Manager actions',
      items: [
        { t: 'See team performance (KPIs, RAG, staleness, last appraisal)', to: '/team' },
        { t: 'Enter KPIs on behalf of a direct report', to: '/kpis/entry' },
        { t: 'Review submitted self-assessments', to: '/appraisals' },
        { t: 'Approve / lock KRs for your team', to: '/okrs' },
      ],
    },
    {
      title: 'Department head actions',
      items: [
        { t: 'Calibrate ratings across the department', to: '/appraisals/calibration' },
        { t: 'See dept-level OKR ownership', to: '/okrs' },
        { t: 'Review submitted manager-reviewed appraisals', to: '/appraisals' },
      ],
    },
    {
      title: 'HR actions',
      items: [
        { t: 'Open a new cycle period (Q3, Q4 ...)', to: '/admin/cycle-periods' },
        { t: 'Open an appraisal cycle & bulk-generate appraisals', to: '/appraisals' },
        { t: 'Bulk-import KPI actuals from CSV', to: '/kpis/import' },
        { t: 'Sign off completed appraisals', to: '/appraisals' },
        { t: 'Manage user roster + permissions', to: '/admin/users' },
        { t: 'Track active PIPs', to: '/pips' },
      ],
    },
    {
      title: 'Finance actions',
      items: [
        { t: 'Run commission for a period', to: '/bonus' },
        { t: 'Approve / hold / reject payouts', to: '/bonus' },
        { t: 'Configure compensation rates', to: '/admin/compensation-inputs' },
      ],
    },
    {
      title: 'C-Level / strategy',
      items: [
        { t: 'Edit company assumptions (changes cascade to KRs/KPIs)', to: '/admin/assumptions' },
        { t: 'Company OKR progress at a glance', to: '/' },
        { t: 'Approve KRs at lock', to: '/okrs' },
      ],
    },
    {
      title: 'Admin (you)',
      items: [
        { t: 'Full configuration index', to: '/admin/config' },
        { t: 'Audit log with diff viewer', to: '/audit' },
        { t: 'User permissions overlay (hr/finance/admin)', to: '/admin/users' },
        { t: 'KPI ↔ SOP links + KR ↔ SOP links', to: '/sops' },
      ],
    },
    {
      title: 'Power-user shortcuts',
      items: [
        { t: 'Press ⌘K / Ctrl+K to open the search palette anywhere', to: '#' },
        { t: 'Bell icon in topbar = notifications inbox', to: '/notifications' },
        { t: 'Click a KPI ID anywhere to open its trend chart', to: '/kpis' },
        { t: 'Click any OKR Code in the tree to expand', to: '/okrs' },
        { t: 'Every list page has an Export CSV button', to: '#' },
      ],
    },
  ],
  ar: [
    { title: 'يومي — الموظفون',         items: [
      { t: 'إدخال قيم المؤشرات الفعلية', to: '/kpis/entry' },
      { t: 'مراجعة سجل المؤشرات والاتجاه', to: '/kpis' },
      { t: 'البحث عن هدف / نتيجة رئيسية', to: '/okrs' },
      { t: 'مراجعة الإشعارات', to: '/notifications' },
    ]},
    { title: 'ربعي — الموظفون',          items: [
      { t: 'إرسال التقييم الذاتي عند فتح الدورة', to: '/appraisals' },
      { t: 'مشاهدة التقييم النهائي بعد اعتماد الموارد البشرية', to: '/appraisals' },
    ]},
    { title: 'إجراءات المدير',         items: [
      { t: 'مشاهدة أداء الفريق (المؤشرات / الحالة)', to: '/team' },
      { t: 'إدخال المؤشرات نيابة عن موظف مباشر', to: '/kpis/entry' },
      { t: 'مراجعة التقييمات الذاتية المرسلة', to: '/appraisals' },
      { t: 'اعتماد / قفل النتائج الرئيسية للفريق', to: '/okrs' },
    ]},
    { title: 'إجراءات رئيس القسم',     items: [
      { t: 'معايرة التقييمات عبر القسم', to: '/appraisals/calibration' },
      { t: 'مراجعة ملكية أهداف القسم', to: '/okrs' },
      { t: 'مراجعة التقييمات المعتمدة من المدير', to: '/appraisals' },
    ]},
    { title: 'إجراءات الموارد البشرية', items: [
      { t: 'فتح فترة دورة جديدة', to: '/admin/cycle-periods' },
      { t: 'فتح دورة تقييم وإنشاء تقييمات بكميات', to: '/appraisals' },
      { t: 'استيراد قيم المؤشرات الفعلية من CSV', to: '/kpis/import' },
      { t: 'اعتماد التقييمات المكتملة', to: '/appraisals' },
      { t: 'إدارة قائمة المستخدمين والصلاحيات', to: '/admin/users' },
      { t: 'متابعة خطط تحسين الأداء النشطة', to: '/pips' },
    ]},
    { title: 'إجراءات المالية',         items: [
      { t: 'تشغيل العمولات لفترة', to: '/bonus' },
      { t: 'اعتماد / تعليق / رفض الدفعات', to: '/bonus' },
      { t: 'إعدادات معدلات التعويض', to: '/admin/compensation-inputs' },
    ]},
    { title: 'الإدارة العليا',          items: [
      { t: 'تعديل افتراضات الشركة (يتدفق التغيير لكل النتائج والمؤشرات)', to: '/admin/assumptions' },
      { t: 'تقدم الأهداف على مستوى الشركة', to: '/' },
      { t: 'اعتماد النتائج الرئيسية عند القفل', to: '/okrs' },
    ]},
    { title: 'المسؤول',                 items: [
      { t: 'فهرس الإعدادات الكامل', to: '/admin/config' },
      { t: 'سجل التدقيق مع عارض الفروقات', to: '/audit' },
      { t: 'صلاحيات المستخدمين (hr/finance/admin)', to: '/admin/users' },
      { t: 'روابط المؤشرات بإجراءات العمل', to: '/sops' },
    ]},
    { title: 'اختصارات القوة',          items: [
      { t: 'اضغط ⌘K / Ctrl+K لفتح البحث السريع', to: '#' },
      { t: 'أيقونة الجرس = صندوق الإشعارات', to: '/notifications' },
      { t: 'انقر على رمز أي مؤشر لفتح الاتجاه', to: '/kpis' },
      { t: 'انقر على رمز أي هدف للتوسيع', to: '/okrs' },
      { t: 'كل قائمة فيها زر تصدير CSV', to: '#' },
    ]},
  ],
};

export default function HelpPage() {
  const { lang } = useTranslation();
  const { role, permissions = [] } = useAuth();
  const items = sections[lang === 'ar' ? 'ar' : 'en'];

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>{lang === 'ar' ? 'دليل سريع' : 'Help & quick reference'}</h1>
      <div className='text-sm text-slate-500'>
        {lang === 'ar' ? `دورك: ${role}` : `Your role: ${role}`}
        {permissions.length > 0 && ` · ${permissions.join(', ')}`}
      </div>
      <div className='grid md:grid-cols-2 gap-4'>
        {items.map((s, i) => (
          <Card key={i} title={s.title}>
            <ul className='space-y-2 text-sm'>
              {s.items.map((it, j) => (
                <li key={j}>
                  {it.to === '#' ? (
                    <span className='text-slate-600'>{it.t}</span>
                  ) : (
                    <Link to={it.to} className='text-mrkoon hover:underline'>{it.t} →</Link>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
