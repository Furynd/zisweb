"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import getSupabaseClient from "../../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        return;
      }

      const user = (data as any)?.user;
      if (!user) {
        setMessage("Login succeeded but no user returned.");
        return;
      }

      // Check operators table for this user
      const { data: opData, error: opErr } = await supabase.from('operators').select('*').eq('id', user.id).maybeSingle();
      if (opErr) {
        console.error('Operator query error:', opErr);
        setMessage('Unable to verify operator status: ' + opErr.message);
        return;
      }

      if (!opData) {
        setMessage('Akun Anda belum terdaftar sebagai Operator. Mohon minta SuperAdmin untuk mendaftarkan akun Anda.');
        return;
      }

      if (!opData.active) {
        setMessage('Akun Operator Anda belum aktif. Hubungi SuperAdmin untuk mengaktifkan akun.');
        return;
      }

      // Active operator — go to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setMessage(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-xl font-semibold mb-4 text-gray-900">Operator Login</h1>
        <label className="block text-sm font-medium text-gray-900">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 text-gray-900" />
        <label className="block text-sm font-medium text-gray-900 mt-3">Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 text-gray-900" />

        <div className="mt-4 flex gap-2">
          <button disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        {message && <div className="mt-4 text-sm text-gray-900 bg-yellow-50 p-3 rounded border border-yellow-200">{message}</div>}
      </form>
    </div>
  );
}
