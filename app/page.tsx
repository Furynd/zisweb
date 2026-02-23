"use client";
import { useEffect, useState } from "react";
import getSupabaseClient from "../lib/supabaseClient";

export default function Home() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchUser() {
      try {
        const supabase = await getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (!ignore) {
            setUser(null);
            setRole("");
            setLoading(false);
          }
          return;
        }
        setUser(user);
        // Check role: Operator or SuperAdmin
        // Check operators table
        const { data: opData } = await supabase.from("operators").select("role").eq("id", user.id).maybeSingle();
        if (opData && opData.role) {
          setRole(opData.role);
        } else {
          setRole("");
        }
      } catch (e) {
        setUser(null);
        setRole("");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
    return () => { ignore = true; };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans">
      <main className="flex min-h-screen w-full max-w-2xl flex-col items-center justify-center py-20 px-6">
        <h1 className="text-3xl font-bold text-green-700 mb-2">ZISWeb</h1>
        <p className="text-lg text-gray-700 mb-8">Aplikasi pencatatan Zakat, Infaq, Shodaqoh</p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <a href="/calculator" className="rounded-lg bg-green-600 text-white py-3 px-6 text-center font-semibold hover:bg-green-700 transition">Kalkulator Zakat</a>
          {loading ? (
            <div className="text-center text-gray-500">Memuat...</div>
          ) : !user ? (
            <a href="/auth/login" className="rounded-lg border border-green-600 text-green-700 py-3 px-6 text-center font-semibold hover:bg-green-50 transition">Masuk Operator / Admin</a>
          ) : (
            <>
              {role === "superadmin" && (
                <a href="/admin" className="rounded-lg bg-yellow-500 text-white py-3 px-6 text-center font-semibold hover:bg-yellow-600 transition">Panel Admin</a>
              )}
              {role === "operator" && (
                <a href="/dashboard" className="rounded-lg bg-green-500 text-white py-3 px-6 text-center font-semibold hover:bg-green-600 transition">Input Data Transaksi</a>
              )}
              {role === "superadmin" && (
                <a href="/dashboard" className="rounded-lg bg-green-500 text-white py-3 px-6 text-center font-semibold hover:bg-green-600 transition">Input Data Transaksi</a>
              )}
              <button
                onClick={async () => {
                  const supabase = await getSupabaseClient();
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="rounded-lg border border-red-500 text-red-600 py-3 px-6 text-center font-semibold hover:bg-red-50 transition mt-2"
              >
                Keluar
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
