"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import getSupabaseClient from "../lib/supabaseClient";

interface Operator {
  id: string;
  email?: string;
  username?: string;
  role: string;
  active: boolean;
  created_at: string;
}

export default function OperatorManagement() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creatingOperator, setCreatingOperator] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const supabase = await getSupabaseClient();
        const { data: userData } = await supabase.auth.getUser();
        const authUser = (userData as any)?.user;

        if (!authUser) {
          router.push("/auth/login");
          return;
        }

        // Check if user is superadmin
        const { data: opData } = await supabase
          .from("operators")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (!opData || opData.role !== "superadmin") {
          router.push("/");
          return;
        }

        if (mounted) setUser(authUser);

        // Fetch all operators (including email from auth users)
        const { data: allOps } = await supabase
          .from("operators")
          .select("*")
          .order("created_at", { ascending: false });

        if (mounted && allOps) setOperators(allOps);
      } catch (err) {
        console.error(err);
        if (mounted) router.push("/");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function toggleOperatorActive(operatorId: string, currentActive: boolean) {
    try {
      const supabase = await getSupabaseClient();
      const { error } = await supabase
        .from("operators")
        .update({ active: !currentActive })
        .eq("id", operatorId);

      if (error) {
        setMessage("Gagal update: " + error.message);
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      // Refresh operators list
      const { data: updated } = await supabase
        .from("operators")
        .select("*")
        .order("created_at", { ascending: false });

      if (updated) setOperators(updated);
      setMessage(`Operator ${!currentActive ? "diaktifkan" : "dinonaktifkan"}`);
      setTimeout(() => setMessage(null), 2000);
    } catch (err: any) {
      setMessage("Error: " + err.message);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function createNewOperator(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || !newPassword || !newUsername) {
      setMessage("Email, username, dan password harus diisi");
      return;
    }

    setCreatingOperator(true);
    try {
      const supabase = await getSupabaseClient();

      // Create auth user via signup (requires email verification)
      const { data, error } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
      });

      if (error) {
        setMessage("Gagal membuat user: " + error.message);
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      const newUserId = (data as any)?.user?.id;
      if (!newUserId) {
        setMessage("User created but ID not returned");
        return;
      }

      // Create operator row with role 'operator', active = true, email and username
      const { error: opErr } = await supabase
        .from("operators")
        .insert([{ id: newUserId, email: newEmail, username: newUsername, role: "operator", active: true }]);

      if (opErr) {
        setMessage("User created but failed to add operator role: " + opErr.message);
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      setMessage(`Operator ${newEmail} berhasil dibuat`);
      setNewEmail("");
      setNewUsername("");
      setNewPassword("");

      // Refresh list
      const { data: updated } = await supabase
        .from("operators")
        .select("*")
        .order("created_at", { ascending: false });

      if (updated) setOperators(updated);
      setTimeout(() => setMessage(null), 2000);
    } catch (err: any) {
      setMessage("Error: " + err.message);
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setCreatingOperator(false);
    }
  }

  if (loading)
    return (
      <div className="bg-white p-6 rounded shadow">
        <div className="text-center text-gray-600">Loading...</div>
      </div>
    );

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6 text-gray-900">Kelola Operator</h1>

      {/* Create New Operator Form */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Buat Operator Baru</h2>
        <form onSubmit={createNewOperator} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-900">Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2 text-gray-900"
                placeholder="operator@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Username</label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2 text-gray-900"
                placeholder="operator_username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2 text-gray-900"
              />
            </div>
            <button
              disabled={creatingOperator}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {creatingOperator ? "Membuat..." : "Buat Operator"}
            </button>
          </form>
        </div>

        {/* Operators List */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Daftar Operator</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2 text-left text-gray-900">Username</th>
                  <th className="border p-2 text-left text-gray-900">Email</th>
                  <th className="border p-2 text-left text-gray-900">Role</th>
                  <th className="border p-2 text-left text-gray-900">Status</th>
                  <th className="border p-2 text-left text-gray-900">Dibuat</th>
                  <th className="border p-2 text-left text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {operators.map((op) => (
                  <tr key={op.id} className="hover:bg-gray-100">
                    <td className="border p-2 text-sm font-semibold text-gray-900">{op.username || "-"}</td>
                    <td className="border p-2 text-sm text-gray-900">{op.email || "-"}</td>
                    <td className="border p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          op.role === "superadmin"
                            ? "bg-red-200 text-red-900"
                            : "bg-blue-200 text-blue-900"
                        }`}
                      >
                        {op.role}
                      </span>
                    </td>
                    <td className="border p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          op.active
                            ? "bg-green-200 text-green-900"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        {op.active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="border p-2 text-xs text-gray-900">
                      {new Date(op.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="border p-2">
                      <button
                        onClick={() => toggleOperatorActive(op.id, op.active)}
                        className={`px-3 py-1 text-xs text-white rounded ${
                          op.active ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {op.active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {operators.length === 0 && (
              <div className="text-center py-4 text-gray-500">Belum ada operator</div>
            )}
          </div>
        </div>

        {message && (
          <div className="fixed right-6 bottom-6 bg-black text-white px-4 py-2 rounded shadow">
            {message}
          </div>
        )}
    </div>
  );
}
