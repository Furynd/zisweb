"use client";
import OperatorManagement from "../../components/OperatorManagement";
import TransactionSummary from "../../components/TransactionSummary";
import TransactionsManagement from "../../components/TransactionsManagement";
import { useEffect, useState } from "react";
import getSupabaseClient from "../../lib/supabaseClient";

import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [role, setRole] = useState("");
  const router = useRouter();
  useEffect(() => {
    async function checkRole() {
      const supabase = await getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: opData } = await supabase.from("operators").select("role").eq("id", user.id).maybeSingle();
      if (opData && opData.role) setRole(opData.role);
    }
    checkRole();
  }, []);

  const handleLogout = async () => {
    const supabase = await getSupabaseClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          {role === "superadmin" && (
            <a href="/dashboard" className="rounded bg-green-600 text-white px-4 py-2 font-semibold hover:bg-green-700 transition">Ke Input Data</a>
          )}
          <button
            onClick={handleLogout}
            className="rounded border border-red-500 text-red-600 px-4 py-2 font-semibold hover:bg-red-50 transition"
          >
            Keluar
          </button>
        </div>
        <TransactionSummary />
        <TransactionsManagement />
        <OperatorManagement />
      </div>
    </main>
  );
}
