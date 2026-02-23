"use client";
import DonationForm from "../../components/DonationForm";
import { useEffect, useState } from "react";
import getSupabaseClient from "../../lib/supabaseClient";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          {role === "superadmin" && (
            <a href="/admin" className="rounded bg-yellow-500 text-white px-4 py-2 font-semibold hover:bg-yellow-600 transition">Ke Panel Admin</a>
          )}
          <button
            onClick={handleLogout}
            className="rounded border border-red-500 text-red-600 px-4 py-2 font-semibold hover:bg-red-50 transition"
          >
            Keluar
          </button>
        </div>
        <DonationForm />
      </div>
    </main>
  );
}
