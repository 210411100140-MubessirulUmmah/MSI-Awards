import React, { useEffect, useRef, useState } from 'react';
import { BarChart3, ChevronDown, Download, FileSpreadsheet, History, LogOut, Plus, Printer, RotateCcw, Scale } from 'lucide-react';
import { UserAccount } from '../types/scoring';
import { Logo } from './Logo';

export type AdminTab = 'dashboard' | 'recap' | 'weights' | 'log';

interface HeaderProps {
  currentUser: UserAccount;
  onLogout: () => void;
  adminTab: AdminTab;
  onAdminTabChange: (tab: AdminTab) => void;
  onOpenReportModal: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  onOpenAddParticipant: () => void;
}

const TABS = [
  { id: 'dashboard', label: 'Ringkasan', Icon: BarChart3 },
  { id: 'recap', label: 'Rekapitulasi', Icon: FileSpreadsheet },
  { id: 'weights', label: 'Bobot', Icon: Scale },
  { id: 'log', label: 'Riwayat', Icon: History },
] as const;

const btn = 'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors';

export const Header: React.FC<HeaderProps> = ({
  currentUser, onLogout, adminTab, onAdminTabChange,
  onOpenReportModal, onExportCSV, onResetData, onOpenAddParticipant,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const displayName = isAdmin ? 'Administrator' : currentUser.name.split(',')[0];
  const roleLabel = isAdmin ? 'Sekretariat awards' : `Dewan Juri ${currentUser.role}`;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Logo className="w-9 h-9" />
            <div className="leading-tight min-w-0">
              <div className="text-[15px] font-semibold text-slate-900 truncate">MSI Group Awards</div>
              <div className="text-xs text-slate-500 truncate">{isAdmin ? 'Panel administrator' : 'Portal dewan juri'}</div>
            </div>
          </div>

          <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open}
              className="flex items-center gap-2.5 rounded-full border border-slate-200 pl-1.5 pr-3 py-1.5 hover:bg-slate-50">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white grid place-items-center text-xs font-semibold">{isAdmin ? 'AD' : currentUser.role}</span>
              <span className="hidden sm:block text-left leading-tight">
                <span className="block text-sm font-medium text-slate-900 max-w-[160px] truncate">{displayName}</span>
                <span className="block text-[11px] text-slate-500">{roleLabel}</span>
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {open && (
              <div role="menu" className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white shadow-lg p-1.5 text-sm z-40">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="font-medium text-slate-900 truncate">{currentUser.name}</div>
                  <div className="text-xs text-slate-500">{currentUser.title}</div>
                </div>
                <button role="menuitem" onClick={() => { setOpen(false); onLogout(); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700">
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
                {isAdmin && (
                  <button role="menuitem" onClick={() => { setOpen(false); onResetData(); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600">
                    <RotateCcw className="w-4 h-4" /> Kembalikan data awal
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-4">
            <nav role="tablist" aria-label="Menu utama" className="flex gap-1 overflow-x-auto md:-mb-px border-b border-slate-100 md:border-0">
              {TABS.map(({ id, label, Icon }) => (
                <button key={id} role="tab" aria-selected={adminTab === id} onClick={() => onAdminTabChange(id)}
                  className={`flex items-center gap-2 px-3.5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    adminTab === id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </nav>
            <div className="flex items-center justify-end gap-2 py-2.5 md:py-2 shrink-0">
              <button onClick={onOpenAddParticipant} title="Tambah peserta" className={`${btn} border border-slate-200 text-slate-700 hover:bg-slate-50`}>
                <Plus className="w-4 h-4" /><span className="hidden sm:inline">Peserta</span>
              </button>
              <button onClick={onExportCSV} title="Ekspor CSV" className={`${btn} border border-slate-200 text-slate-700 hover:bg-slate-50`}>
                <Download className="w-4 h-4" /><span className="hidden sm:inline">Ekspor</span>
              </button>
              <button onClick={onOpenReportModal} title="Berita acara" className={`${btn} bg-[#0f1b2d] text-white hover:bg-slate-800`}>
                <Printer className="w-4 h-4" /><span className="hidden sm:inline">Berita acara</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
