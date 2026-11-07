import React, { useState } from 'react';
import { X, PlusCircle, Building2 } from 'lucide-react';
import { Participant } from '../types/scoring';

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddParticipant: (participant: Participant) => Promise<string | null>;
  nextId: string;
  existingIds: string[];
}

/** Pembungkus: form hanya dipasang saat dibuka, sehingga state selalu segar
 *  dan aturan hooks React tidak dilanggar (sebelumnya hooks dipanggil setelah early return). */
export const AddParticipantModal: React.FC<AddParticipantModalProps> = (props) =>
  props.isOpen ? <AddParticipantForm {...props} /> : null;

const AddParticipantForm: React.FC<AddParticipantModalProps> = ({
  onClose,
  onAddParticipant,
  nextId,
  existingIds,
}) => {
  const [id, setId] = useState(nextId);
  const [companyName, setCompanyName] = useState('');
  const [innovationTitle, setInnovationTitle] = useState('');
  const [category, setCategory] = useState('Digital Transformation & Industry 4.0');
  const [leadPresenter, setLeadPresenter] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = id.trim().toUpperCase();
    if (!cleanId) {
      setError('Kode peserta wajib diisi');
      return;
    }
    if (existingIds.includes(cleanId)) {
      setError(`Kode ${cleanId} sudah dipakai peserta lain`);
      return;
    }
    if (!companyName.trim()) {
      setError('Nama perusahaan wajib diisi');
      return;
    }
    if (!innovationTitle.trim()) {
      setError('Judul inovasi wajib diisi');
      return;
    }

    setBusy(true);
    const err = await onAddParticipant({
      id: cleanId,
      companyName: companyName.trim(),
      innovationTitle: innovationTitle.trim(),
      category: category.trim(),
      leadPresenter: leadPresenter.trim() || 'Perwakilan Tim Finalis',
    });
    setBusy(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Tambah peserta" onKeyDown={(e) => e.key === 'Escape' && onClose()} onClick={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tambah Peserta Finalis
              </h3>
              <p className="text-xs text-slate-500">
                Daftarkan perusahaan baru ke dalam nominasi MSI Awards
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Kode Peserta (ID)
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. S04"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Nama Perusahaan
            </label>
            <input
              type="text"
              value={companyName}
              autoFocus
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. PT Inovasi Solusi Global"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Judul Inovasi / Solusi
            </label>
            <input
              type="text"
              value={innovationTitle}
              onChange={(e) => setInnovationTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. Platform Automasi AI Operasional Terintegrasi"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Kategori Penghargaan
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Digital Transformation & Industry 4.0">Digital Transformation & Industry 4.0</option>
              <option value="Supply Chain & Operational Excellence">Supply Chain & Operational Excellence</option>
              <option value="Sustainable Business Innovation">Sustainable Business Innovation</option>
              <option value="AI & Robotic Process Automation">AI & Robotic Process Automation</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Presenter / PIC Tim
            </label>
            <input
              type="text"
              value={leadPresenter}
              onChange={(e) => setLeadPresenter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. Ir. Dimas Prasojo, M.T."
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold shadow-xs"
            >
              {busy ? 'Menyimpan…' : 'Simpan Peserta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
