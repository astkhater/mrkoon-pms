import React, { useMemo, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase.js';

function useUsers() {
  return useQuery({
    queryKey: ['def.users.full'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('def')
        .from('users')
        .select('id, email, full_name_en, full_name_ar, role_code, permissions, active, department:departments(code, name_en), level:levels(code, title_en), functional_role:functional_roles(code, name_en), manager:manager_id(full_name_en)')
        .order('full_name_en');
      if (error) throw error;
      return data ?? [];
    },
  });
}

export default function UsersPanel() {
  const { t, lang } = useTranslation();
  const qc = useQueryClient();
  const users = useUsers();
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [editing, setEditing] = useState(null); // user.id
  const [draft, setDraft] = useState({});

  const filtered = useMemo(() => {
    return (users.data ?? []).filter(u => {
      if (search) {
        const s = search.toLowerCase();
        const match = (u.full_name_en || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s);
        if (!match) return false;
      }
      if (filterDept && u.department?.code !== filterDept) return false;
      if (filterRole && u.role_code !== filterRole) return false;
      return true;
    });
  }, [users.data, search, filterDept, filterRole]);

  function startEdit(u) {
    setEditing(u.id);
    setDraft({
      role_code: u.role_code,
      permissions: u.permissions ?? [],
      active: u.active,
    });
  }
  async function save(u) {
    const { error } = await supabase.schema('def').from('users').update(draft).eq('id', u.id);
    if (error) { alert('Save error: ' + error.message); return; }
    setEditing(null);
    qc.invalidateQueries({ queryKey: ['def.users.full'] });
  }
  function togglePerm(p) {
    const has = draft.permissions?.includes(p);
    setDraft({ ...draft, permissions: has ? draft.permissions.filter(x => x !== p) : [...(draft.permissions ?? []), p] });
  }

  // unique dept / role lists
  const depts = Array.from(new Set((users.data ?? []).map(u => u.department?.code).filter(Boolean))).sort();
  const roles = ['employee','manager','dept_head','c_level','admin'];
  const allPerms = ['hr','finance','admin'];

  return (
    <div className='space-y-4'>
      <div className='flex items-baseline justify-between'>
        <h1 className='text-2xl font-semibold'>{t('admin.users')}</h1>
        <div className='text-sm text-slate-500'>{filtered.length} / {users.data?.length ?? 0}</div>
      </div>

      <Card>
        <div className='flex flex-wrap gap-2 items-center text-sm'>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'ar' ? 'بحث' : 'search name/email'} className='border rounded px-2 py-1 w-64' />
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className='border rounded px-2 py-1'>
            <option value=''>All depts</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className='border rounded px-2 py-1'>
            <option value=''>All roles</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        {users.isLoading ? <Skeleton count={6} className='h-8' /> : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='text-xs text-slate-500 border-b'>
                <tr>
                  <th className='text-start py-1'>{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                  <th className='text-start'>{lang === 'ar' ? 'البريد' : 'Email'}</th>
                  <th className='text-start'>{lang === 'ar' ? 'القسم' : 'Dept'}</th>
                  <th className='text-start'>{lang === 'ar' ? 'الدور الوظيفي' : 'Functional'}</th>
                  <th className='text-start'>{lang === 'ar' ? 'المستوى' : 'Level'}</th>
                  <th className='text-start'>Role</th>
                  <th className='text-start'>Perms</th>
                  <th className='text-start'>Active</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className='border-b last:border-0 align-top'>
                    <td className='py-1.5'>{lang === 'ar' ? (u.full_name_ar || u.full_name_en) : u.full_name_en}</td>
                    <td className='text-xs text-slate-500'>{u.email}</td>
                    <td className='text-xs'>{u.department?.code ?? '—'}</td>
                    <td className='text-xs'>{u.functional_role?.code ?? '—'}</td>
                    <td className='text-xs'>{u.level?.code ?? '—'}</td>
                    <td className='text-xs'>
                      {editing === u.id ? (
                        <select value={draft.role_code} onChange={e => setDraft({ ...draft, role_code: e.target.value })} className='border rounded px-1 py-0.5 text-xs'>
                          {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <span className='font-mono'>{u.role_code}</span>
                      )}
                    </td>
                    <td className='text-xs'>
                      {editing === u.id ? (
                        <div className='flex gap-1'>
                          {allPerms.map(p => (
                            <label key={p} className='flex items-center gap-0.5 text-xs'>
                              <input type='checkbox' checked={draft.permissions?.includes(p) || false} onChange={() => togglePerm(p)} />
                              {p}
                            </label>
                          ))}
                        </div>
                      ) : (
                        (u.permissions ?? []).map(p => <span key={p} className='inline-block text-xs px-1.5 py-0.5 rounded bg-mrkoon-green-tint text-mrkoon-green me-1'>{p}</span>)
                      )}
                    </td>
                    <td className='text-xs'>
                      {editing === u.id ? (
                        <input type='checkbox' checked={draft.active} onChange={e => setDraft({ ...draft, active: e.target.checked })} />
                      ) : (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{u.active ? '✓' : '×'}</span>
                      )}
                    </td>
                    <td className='text-end text-xs'>
                      {editing === u.id ? (
                        <div className='flex gap-1'>
                          <button onClick={() => save(u)} className='text-mrkoon hover:underline'>{t('common.save')}</button>
                          <button onClick={() => setEditing(null)} className='text-slate-500 hover:underline'>{t('common.cancel')}</button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(u)} className='text-mrkoon hover:underline'>edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
