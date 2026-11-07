import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserAccount } from '../types/scoring';

export function useAuth() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadProfile = useCallback(async (session: Session | null) => {
    if (!session) {
      setUser(null);
      setReady(true);
      return;
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
    if (error || !data) {
      setNotice('Akun ini belum terdaftar sebagai administrator atau juri. Hubungi sekretariat.');
      await supabase.auth.signOut();
      setUser(null);
    } else {
      setNotice(null);
      setUser({ id: data.id, role: data.role, name: data.name, title: data.title, institution: data.institution });
    }
    setReady(true);
  }, []);

  useEffect(() => {
    // Jangan memanggil Supabase langsung di dalam callback ini (bisa deadlock), jadwalkan dulu.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setReady(true);
      } else if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        setTimeout(() => loadProfile(session), 0);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (!error) return null;
    if (/invalid login/i.test(error.message)) return 'Email atau kata sandi tidak sesuai.';
    return 'Tidak dapat masuk saat ini. Periksa koneksi internet lalu coba lagi.';
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, ready, notice, signIn, signOut };
}
