import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Logo } from '../Logo';

interface LoginPortalProps {
  onSignIn: (email: string, password: string) => Promise<string | null>;
  notice?: string | null;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onSignIn, notice }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return setError('Isi email dan kata sandi.');
    setBusy(true);
    setError(await onSignIn(email, password));
    setBusy(false);
  };

  const message = error ?? notice ?? null;
  const field = 'w-full h-12 rounded-xl border border-slate-300 px-4 text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10';

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-white">
      <aside className="hidden lg:flex flex-col justify-between bg-[#0f1b2d] text-white p-14">
        <div className="flex items-center gap-3">
          <Logo className="w-10 h-10" fallbackClassName="rounded-lg bg-white/10 text-sm font-bold" />
          <span className="text-sm font-medium text-slate-200">MSI Group</span>
        </div>
        <div>
          <div className="w-12 h-px bg-amber-400 mb-7" />
          <h1 className="font-display text-5xl leading-[1.1]">Sistem Penilaian<br />Dewan Juri</h1>
          <p className="mt-5 text-slate-300 max-w-sm leading-relaxed">
            Penilaian dan rekapitulasi MSI Group Innovation &amp; Excellence Awards 2026.
          </p>
        </div>
        <p className="text-sm text-slate-500">© 2026 MSI Group</p>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <Logo className="w-10 h-10" fallbackClassName="rounded-lg bg-[#0f1b2d] text-white text-sm font-bold" />
            <span className="font-semibold text-slate-900">MSI Group Awards</span>
          </div>

          <h2 className="font-display text-3xl text-slate-900">Masuk</h2>
          <p className="mt-2 text-sm text-slate-500">Gunakan akun yang diberikan sekretariat.</p>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-800 mb-1.5">Email</label>
              <input id="email" type="email" value={email} autoFocus autoComplete="username" className={field}
                onChange={(e) => { setEmail(e.target.value); setError(null); }} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-800 mb-1.5">Kata sandi</label>
              <div className="relative">
                <input id="password" type={show ? 'text' : 'password'} value={password} autoComplete="current-password" className={`${field} pr-12`}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }} />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700">
                  {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {message && <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-rose-600"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{message}</p>}
            </div>
            <button type="submit" disabled={busy}
              className="w-full h-12 rounded-xl bg-[#0f1b2d] hover:bg-slate-800 disabled:opacity-60 text-white font-medium flex items-center justify-center gap-2 transition-colors">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Masuk <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
