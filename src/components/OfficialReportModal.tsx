import React from 'react';
import {
  X,
  Printer,
  Award,
  CheckCircle2,
  Calendar,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import {
  CompanyEvaluationResult,
  CriteriaWeights,
  Judge,
} from '../types/scoring';
import { formatScoreID } from '../utils/calculations';
import { Logo } from './Logo';

interface OfficialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: CompanyEvaluationResult[];
  weights: CriteriaWeights;
  judges: Judge[];
}

export const OfficialReportModal: React.FC<OfficialReportModalProps> = ({
  isOpen,
  onClose,
  results,
  weights,
  judges,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const sortedResults = [...results]
    .filter((r) => r.finalScore !== null)
    .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));

  const incomplete = results.filter((r) => r.finalScore === null);
  const isFinal = results.length > 0 && incomplete.length === 0;
  const topRanked = sortedResults.filter((r) => r.rank === 1);
  const winner = topRanked.length === 1 ? topRanked[0] : undefined;
  const now = new Date();
  const dateLong = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const docNo = `BA-SIM/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

  return (
    <div role="dialog" aria-modal="true" aria-label="Pratinjau berita acara" onKeyDown={(e) => e.key === 'Escape' && onClose()} onClick={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div id="print-area" className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto print:m-0 print:border-none print:shadow-none print:max-w-none">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-sm">
              Berita Acara Resmi Sidang Pleno Dewan Juri (Pratinjau Cetak)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-8 sm:p-12 text-slate-900 font-sans space-y-6 print:p-0">
          {!isFinal && (
            <div className="p-3 rounded-lg border-2 border-amber-400 bg-amber-50 text-xs text-amber-900 font-semibold">
              DRAF, belum final. {incomplete.length > 0
                ? `Penilaian belum lengkap untuk: ${incomplete.map((r) => r.participant.id).join(', ')}.`
                : 'Belum ada peserta.'} Peringkat dan penetapan pemenang baru berlaku setelah semua juri selesai menilai.
            </div>
          )}

          {/* Header Kop Surat */}
          <div className="border-b-2 border-slate-900 pb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo className="w-14 h-14" fallbackClassName="rounded-xl bg-slate-900 text-amber-400 font-black text-xl border-2 border-amber-400" />
              <div>
                <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                  MSI Group Innovation & Excellence Awards 2026
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Sekretariat Dewan Juri & Komite Akreditasi Mutu Korporasi
                </p>
                <p className="text-[11px] text-slate-500">
                  Dokumen simulasi tes praktik, bukan dokumen resmi MSI Group
                </p>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-mono font-bold text-slate-800">
                No: {docNo}
              </div>
              <div className="text-slate-500 mt-0.5">Sifat: Rahasia & Mengikat</div>
              <div className="text-[11px] text-slate-400">Tanggal: {dateLong}</div>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center py-2">
            <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900">
              BERITA ACARA REKAPITULASI PENILAIAN AKHIR DEWAN JURI
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl mx-auto">
              Berdasarkan hasil sidang pleno tertutup dewan juri yang dicetak pada <strong>{dateLong}</strong>, hasil evaluasi kriteria inovasi adalah sebagai berikut:
            </p>
          </div>

          {/* Rules Summary */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
            <div>
              <span className="font-bold text-slate-700">Komposisi Bobot Kriteria: </span>
              <span className="font-mono text-slate-900">
                Strategi ({weights.strategi}%), Implementasi ({weights.implementasi}%), Hasil ({weights.hasil}%)
              </span>
            </div>
            <div className="text-slate-600">
              Rentang Skor: <span className="font-mono font-semibold">0 s/d 5</span> (Skala Akhir: 0 – 100)
            </div>
          </div>

          {/* Official Scores Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="py-2.5 px-3 text-center w-12">Peringkat</th>
                  <th className="py-2.5 px-3">Kode Peserta</th>
                  <th className="py-2.5 px-4">Nama Perusahaan Finalis</th>
                  <th className="py-2.5 px-3 text-center">Nilai Juri 1 (J1)</th>
                  <th className="py-2.5 px-3 text-center">Nilai Juri 2 (J2)</th>
                  <th className="py-2.5 px-3 text-right bg-slate-200/70 font-extrabold">
                    Nilai Rata-rata Akhir
                  </th>
                  <th className="py-2.5 px-3 text-center">Keterangan Penghargaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedResults.map((r) => (
                  <tr key={r.participant.id} className="text-slate-800">
                    <td className="py-2.5 px-3 text-center font-bold font-mono">
                      #{r.rank}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-900">
                      {r.participant.id}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-900">{r.participant.companyName}</div>
                      <div className="text-[10px] text-slate-500">{r.participant.innovationTitle}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {formatScoreID(r.j1Score)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {formatScoreID(r.j2Score)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-extrabold text-sm bg-slate-50">
                      {formatScoreID(r.finalScore)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-[11px]">
                      {r.rank === 1 ? (
                        <span className="text-amber-700 font-bold">Gold Award (Pemenang Utama)</span>
                      ) : r.rank === 2 ? (
                        <span className="text-slate-700 font-bold">Silver Award (Runner-Up 1)</span>
                      ) : r.rank === 3 ? (
                        <span className="text-amber-900 font-bold">Bronze Award (Runner-Up 2)</span>
                      ) : (
                        <span className="text-slate-500">Finalis Kehormatan</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Decision Notice */}
          <div className="p-3.5 bg-slate-50 border-l-4 border-slate-800 text-xs text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">
              Ketetapan Pemenang Utama:
            </p>
            {isFinal && winner ? (
              <p>
                Dewan juri menetapkan <strong>{winner.participant.companyName} ({winner.participant.id})</strong> dengan nilai akhir <strong>{formatScoreID(winner.finalScore)}</strong> sebagai peraih predikat <strong>Pemenang Utama</strong>.
              </p>
            ) : isFinal ? (
              <p>
                Terdapat nilai seri pada peringkat 1 ({topRanked.map((r) => r.participant.id).join(', ')}, nilai {formatScoreID(topRanked[0]?.finalScore)}). Penetapan pemenang menunggu keputusan sidang pleno.
              </p>
            ) : (
              <p>Belum dapat ditetapkan karena penilaian belum lengkap.</p>
            )}
          </div>

          {/* Signatures Block */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-12">
              <p className="font-semibold text-slate-600">Dewan Juri 1 (Teknologi)</p>
              <div className="border-b border-slate-400 pb-1">
                <p className="font-bold text-slate-900">Dr. Hendra Prasetya, M.Sc</p>
                <p className="text-[10px] text-slate-500">Lead Technology Assessor</p>
              </div>
            </div>

            <div className="space-y-12">
              <p className="font-semibold text-slate-600">Dewan Juri 2 (Strategi Bisnis)</p>
              <div className="border-b border-slate-400 pb-1">
                <p className="font-bold text-slate-900">Ir. Maya Anggraeni, MBA</p>
                <p className="text-[10px] text-slate-500">Principal Business Assessor</p>
              </div>
            </div>

            <div className="space-y-12">
              <p className="font-semibold text-slate-600">Ketua Komite Awards MSI</p>
              <div className="border-b border-slate-400 pb-1">
                <p className="font-bold text-slate-900">Prof. Dr. Faisal Pratama, SE, MM</p>
                <p className="text-[10px] text-slate-500">Head of Corporate Committee</p>
              </div>
            </div>
          </div>

          {/* Official Stamp & Verification Stamp */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Dokumen resmi Berita Acara Rekapitulasi Sidang Pleno MSI Group Awards 2026.</span>
            </div>
            <div>Halaman 1 dari 1 • Dicetak otomatis</div>
          </div>
        </div>
      </div>
    </div>
  );
};
