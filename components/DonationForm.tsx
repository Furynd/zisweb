"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import getSupabaseClient from "../lib/supabaseClient";

export default function DonationForm() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [donorName, setDonorName] = useState("");
  const [address, setAddress] = useState("");
  const [kelurahan, setKelurahan] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [kota, setKota] = useState("");
  const [phone, setPhone] = useState("");
  const [zakatFitrahAmount, setZakatFitrahAmount] = useState("");
  const [zakatFitrahRice, setZakatFitrahRice] = useState("");
  const [zakatMaalAmount, setZakatMaalAmount] = useState("");
  const [infaqAmount, setInfaqAmount] = useState("");
  const [shodaqohAmount, setShodaqohAmount] = useState("");
  const [fidyahAmount, setFidyahAmount] = useState("");
  const [fidyahRice, setFidyahRice] = useState("");
  const [wakafAmount, setWakafAmount] = useState("");
  const [hibahAmount, setHibahAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transferReceipt, setTransferReceipt] = useState("");
  const [notes, setNotes] = useState("");

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const supabase = await getSupabaseClient();
        const res = await supabase.auth.getUser();
        const u = (res as any)?.data?.user;
        if (!u && mounted) router.push("/");
        if (u && mounted) setUser(u);
      } catch (err) {
        if (mounted) router.push("/");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return router.push("/");

    const payload: any = {
      donor_name: donorName,
      address,
      kelurahan,
      kecamatan,
      kota,
      phone,
      zakat_fitrah_amount: Number(zakatFitrahAmount) || 0,
      zakat_fitrah_rice: Number(zakatFitrahRice) || 0,
      zakat_maal_amount: Number(zakatMaalAmount) || 0,
      infaq_amount: Number(infaqAmount) || 0,
      shodaqoh_amount: Number(shodaqohAmount) || 0,
      fidyah_amount: Number(fidyahAmount) || 0,
      fidyah_rice: Number(fidyahRice) || 0,
      wakaf_amount: Number(wakafAmount) || 0,
      hibah_amount: Number(hibahAmount) || 0,
      payment_method: paymentMethod,
      transfer_receipt: transferReceipt || null,
      operator_id: user.id,
    };

    setLoading(true);
    try {
      const supabase = await getSupabaseClient();
      const { error } = await supabase.from("transactions").insert([payload]);
      if (error) {
        setToast("Gagal menyimpan: " + error.message);
        setTimeout(() => setToast(null), 4000);
        return;
      }
    } catch (err: any) {
      setToast("Gagal menyimpan: " + (err?.message ?? String(err)));
      setTimeout(() => setToast(null), 4000);
      return;
    } finally {
      setLoading(false);
    }

    setToast("Transaksi berhasil disimpan");
    setTimeout(() => setToast(null), 3000);
    // Optionally reset form here
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-semibold text-gray-900">Catat Donasi Baru</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Nama Donatur</label>
            <input value={donorName} onChange={e => setDonorName(e.target.value)} required className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">No. HP</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-900">Alamat Lengkap</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Kelurahan</label>
            <input value={kelurahan} onChange={e => setKelurahan(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Kecamatan</label>
            <input value={kecamatan} onChange={e => setKecamatan(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Kota</label>
            <input value={kota} onChange={e => setKota(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Zakat Fitrah (Rp)</label>
            <input type="number" value={zakatFitrahAmount} onChange={e => setZakatFitrahAmount(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Zakat Fitrah (Beras, kg)</label>
            <input type="number" step="0.1" value={zakatFitrahRice} onChange={e => setZakatFitrahRice(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Zakat Maal (Rp)</label>
            <input type="number" value={zakatMaalAmount} onChange={e => setZakatMaalAmount(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Infaq (Rp)</label>
            <input type="number" value={infaqAmount} onChange={e => setInfaqAmount(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Shodaqoh (Rp)</label>
            <input type="number" value={shodaqohAmount} onChange={e => setShodaqohAmount(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Fidyah (Rp)</label>
            <input type="number" value={fidyahAmount} onChange={e => setFidyahAmount(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Fidyah (Beras/Kg)</label>
            <input type="number" value={fidyahRice} onChange={e => setFidyahRice(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Wakaf (Rp)</label>
            <input type="number" value={wakafAmount} onChange={e => setWakafAmount(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Hibah (Rp)</label>
            <input type="number" value={hibahAmount} onChange={e => setHibahAmount(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Metode Pembayaran</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900">
              <option value="cash">Tunai</option>
              <option value="rice">Beras</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Bukti Transfer (Opsional)</label>
            <input value={transferReceipt} onChange={e => setTransferReceipt(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" placeholder="URL/link foto" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Catatan</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 text-gray-900" />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">
            {loading ? "Menyimpan..." : "Simpan Donasi"}
          </button>
        </div>
      </form>
      {toast && (
        <div className="fixed right-6 bottom-6 bg-black text-white px-4 py-2 rounded shadow">{toast}</div>
      )}
    </div>
  );
}
