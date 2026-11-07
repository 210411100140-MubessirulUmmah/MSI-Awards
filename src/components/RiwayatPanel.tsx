import React, { useState } from 'react';
import { History, Search } from 'lucide-react';
import { AuditLogEntry } from '../types/scoring';

export const RiwayatPanel: React.FC<{ log: AuditLogEntry[] }> = ({ log }) => {
  const [q, setQ] = useState('');
  const items = log.filter((l) => `${l.actor} ${l.action} ${l.detail}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center"><History className="w-4 h-4" /></div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Riwayat perubahan</h3>
            <p className="text-xs text-slate-500">Setiap nilai, bobot, dan data peserta yang diubah tercatat di sini ({log.length} catatan).</p>
          </div>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari aktor, aksi, atau peserta" aria-label="Cari riwayat"
            className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 w-full sm:w-64" />
        </div>
      </div>
      {items.length === 0 ? (
        <p className="p-8 text-center text-sm text-slate-500">{log.length === 0 ? 'Belum ada perubahan. Catatan muncul setelah juri menyimpan nilai atau admin mengubah bobot.' : 'Tidak ada catatan yang cocok dengan pencarian.'}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((l) => (
            <li key={l.id} className="p-4 flex gap-3 text-sm">
              <span className="shrink-0 text-xs font-mono text-slate-400 w-28">{new Date(l.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
              <div className="min-w-0">
                <div><b className="text-slate-900">{l.action}</b> <span className="text-slate-500">oleh {l.actor}</span></div>
                <div className="text-xs text-slate-600 break-words">{l.detail}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
