"use client";

import React, { useEffect, useState } from "react";
import getSupabaseClient from "../lib/supabaseClient";

interface Transaction {
  id: string;
  donor_name: string;
  address?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  phone?: string;
  zakat_fitrah_amount?: number;
  zakat_fitrah_rice?: number;
  zakat_maal_amount?: number;
  infaq_amount?: number;
  shodaqoh_amount?: number;
  fidyah_amount?: number;
  fidyah_rice?: number;
  wakaf_amount?: number;
  hibah_amount?: number;
  total_amount?: number;
  total_rice?: number;
  payment_method?: string;
  transfer_receipt?: string | null;
  notes?: string;
  operator_id?: string;
  created_at?: string;
  operators?: { username?: string; email?: string };
}

export default function TransactionsManagement() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  // filters
  const [operatorsList, setOperatorsList] = useState<{ id: string; username?: string; email?: string }[]>([]);
  const [operatorFilter, setOperatorFilter] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  // modal full edit
  const [fullEditItem, setFullEditItem] = useState<Transaction | null>(null);

  useEffect(() => {
    refresh();
    fetchOperators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, operatorFilter, dateFrom, dateTo]);

  async function fetchOperators() {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase.from('operators').select('id, username, email').order('created_at', { ascending: false });
      if (error) return; // silent
      setOperatorsList((data as any) || []);
    } catch (e) {
      // ignore
    }
  }

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const supabase = await getSupabaseClient();
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let q: any = supabase
        .from("transactions")
        .select("*, operators(username,email)", { count: "exact" })
        .order("created_at", { ascending: false });

      if (operatorFilter) q = q.eq('operator_id', operatorFilter);
      if (dateFrom) q = q.gte('created_at', dateFrom);
      if (dateTo) q = q.lte('created_at', dateTo + ' 23:59:59');

      const { data, error: err, count } = await q.range(from, to);

      if (err) return setError(err.message);
      setItems((data as Transaction[]) || []);
      setTotal(count || 0);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  async function deleteTransaction(id: string) {
    if (!confirm("Hapus transaksi ini?")) return;
    setActionLoading(true);
    try {
      const supabase = await getSupabaseClient();
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) return setError(error.message);
      // refresh current page
      await refresh();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setActionLoading(false);
    }
  }

  function startEdit(item: Transaction) {
    setEditingId(item.id);
    setEditNotes(item.notes || "");
  }

  async function saveEdit(id: string) {
    setActionLoading(true);
    try {
      const supabase = await getSupabaseClient();
      const { error } = await supabase.from("transactions").update({ notes: editNotes }).eq("id", id);
      if (error) return setError(error.message);
      setEditingId(null);
      setEditNotes("");
      await refresh();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setActionLoading(false);
    }
  }

  function openFullEdit(item: Transaction) {
    setFullEditItem({ ...item });
  }

  function closeFullEdit() {
    setFullEditItem(null);
  }

  async function saveFullEdit() {
    if (!fullEditItem) return;
    setActionLoading(true);
    try {
      const supabase = await getSupabaseClient();
      const payload: any = {
        donor_name: fullEditItem.donor_name,
        address: fullEditItem.address,
        kelurahan: fullEditItem.kelurahan,
        kecamatan: fullEditItem.kecamatan,
        kota: fullEditItem.kota,
        phone: fullEditItem.phone,
        zakat_fitrah_amount: Number(fullEditItem.zakat_fitrah_amount) || 0,
        zakat_fitrah_rice: Number(fullEditItem.zakat_fitrah_rice) || 0,
        zakat_maal_amount: Number(fullEditItem.zakat_maal_amount) || 0,
        infaq_amount: Number(fullEditItem.infaq_amount) || 0,
        shodaqoh_amount: Number(fullEditItem.shodaqoh_amount) || 0,
        fidyah_amount: Number(fullEditItem.fidyah_amount) || 0,
        fidyah_rice: Number(fullEditItem.fidyah_rice) || 0,
        wakaf_amount: Number(fullEditItem.wakaf_amount) || 0,
        hibah_amount: Number(fullEditItem.hibah_amount) || 0,
        payment_method: fullEditItem.payment_method,
        notes: fullEditItem.notes,
        transfer_receipt: fullEditItem.transfer_receipt || null,
      };

      const { error } = await supabase.from("transactions").update(payload).eq("id", fullEditItem.id);
      if (error) return setError(error.message);
      closeFullEdit();
      await refresh();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setActionLoading(false);
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  if (loading) return <div className="bg-white p-6 rounded shadow mb-6">Loading transactions...</div>;
  if (error) return <div className="bg-white p-6 rounded shadow mb-6 text-red-600">Error: {error}</div>;

  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Kelola Transaksi</h2>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-900">Operator</label>
          <select value={operatorFilter || ""} onChange={e => { setOperatorFilter(e.target.value || null); setPage(1); }} className="mt-1 w-full border rounded px-3 py-2 text-gray-900">
            <option value="">Semua Operator</option>
            {operatorsList.map(op => (
              <option key={op.id} value={op.id}>{op.username || op.email || op.id}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Dari Tanggal</label>
          <input type="date" value={dateFrom || ""} onChange={e => { setDateFrom(e.target.value || null); setPage(1); }} className="mt-1 w-full border rounded px-3 py-2 text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900">Sampai Tanggal</label>
          <input type="date" value={dateTo || ""} onChange={e => { setDateTo(e.target.value || null); setPage(1); }} className="mt-1 w-full border rounded px-3 py-2 text-gray-900" />
        </div>
        <div className="flex items-end">
          <button onClick={() => { setOperatorFilter(null); setDateFrom(null); setDateTo(null); setPage(1); }} className="px-3 py-2 bg-gray-200 rounded text-gray-900">Reset</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left text-gray-900">Waktu</th>
              <th className="p-2 text-left text-gray-900">Donatur</th>
              <th className="p-2 text-left text-gray-900">Jumlah (Rp)</th>
              <th className="p-2 text-left text-gray-900">Beras (kg)</th>
              <th className="p-2 text-left text-gray-900">Metode</th>
              <th className="p-2 text-left text-gray-900">Operator</th>
              <th className="p-2 text-left text-gray-900">Catatan</th>
              <th className="p-2 text-left text-gray-900">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const expanded = expandedIds.includes(it.id);
              return (
                <React.Fragment key={it.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="p-2 text-xs text-gray-700">{it.created_at ? new Date(it.created_at).toLocaleString("id-ID") : "-"}</td>
                    <td className="p-2 text-gray-800">{it.donor_name}</td>
                    <td className="p-2 text-right text-gray-800">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(it.total_amount || 0)}</td>
                    <td className="p-2 text-right text-gray-800">{(it.total_rice || 0).toFixed(2)}</td>
                    <td className="p-2 text-gray-800">{it.payment_method}</td>
                    <td className="p-2 text-gray-800">
                      <div className="font-medium">{it.operators?.username || it.operator_id || "-"}</div>
                      <div className="text-xs text-gray-500">{it.operators?.email || ""}</div>
                    </td>
                    <td className="p-2 text-gray-800">
                      {editingId === it.id ? (
                        <div className="flex gap-2">
                          <input className="border rounded px-2 py-1 text-sm w-full" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
                          <button disabled={actionLoading} onClick={() => saveEdit(it.id)} className="px-2 py-1 bg-green-600 text-white rounded text-sm">Simpan</button>
                          <button disabled={actionLoading} onClick={() => setEditingId(null)} className="px-2 py-1 bg-gray-300 rounded text-sm">Batal</button>
                        </div>
                      ) : (
                        <div className="text-sm">{it.notes || '-'}</div>
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button onClick={() => { startEdit(it); }} className="px-2 py-1 bg-blue-600 text-white rounded text-sm">Quick Edit</button>
                        <button onClick={() => openFullEdit(it)} className="px-2 py-1 bg-indigo-600 text-white rounded text-sm">Full Edit</button>
                        <button disabled={actionLoading} onClick={() => deleteTransaction(it.id)} className="px-2 py-1 bg-red-600 text-white rounded text-sm">Hapus</button>
                        <button
                          onClick={() => {
                            setExpandedIds(prev => prev.includes(it.id) ? prev.filter(x => x !== it.id) : [...prev, it.id]);
                          }}
                          className="px-2 py-1 bg-gray-200 rounded text-gray-900 text-sm"
                        >
                          {expanded ? 'Sembunyikan' : 'Rincian'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expanded && (
                    <tr className="bg-gray-50">
                      <td colSpan={8} className="p-3 text-sm text-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-xs text-gray-600">Zakat Fitrah (Rp)</div>
                            <div className="font-medium">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(it.zakat_fitrah_amount || 0)}</div>
                            <div className="text-xs text-gray-600 mt-2">Zakat Fitrah (Beras, kg)</div>
                            <div className="font-medium">{(it.zakat_fitrah_rice || 0).toFixed(2)} kg</div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-600">Zakat Maal</div>
                            <div className="font-medium">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(it.zakat_maal_amount || 0)}</div>
                            <div className="text-xs text-gray-600 mt-2">Infaq</div>
                            <div className="font-medium">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(it.infaq_amount || 0)}</div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-600">Shodaqoh</div>
                            <div className="font-medium">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(it.shodaqoh_amount || 0)}</div>
                            <div className="text-xs text-gray-600 mt-2">Fidyah (Rp / Beras)</div>
                            <div className="font-medium">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(it.fidyah_amount || 0)} / {(it.fidyah_rice || 0).toFixed(2)} kg</div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-600">Wakaf</div>
                            <div className="font-medium">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(it.wakaf_amount || 0)}</div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-600">Hibah</div>
                            <div className="font-medium">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(it.hibah_amount || 0)}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Halaman {page} dari {pageCount} — {total} transaksi</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-200 rounded text-gray-900">Sebelumnya</button>
          <div className="flex items-center gap-2">
            <input type="number" min={1} max={pageCount} value={page} onChange={e => setPage(Math.max(1, Math.min(pageCount, Number(e.target.value || 1))))} className="w-20 px-2 py-1 border rounded text-gray-900" />
            <button onClick={() => setPage(p => Math.min(pageCount, Math.max(1, p)))} className="px-3 py-1 bg-gray-200 rounded text-gray-900">Go</button>
          </div>
          <button disabled={page >= pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))} className="px-3 py-1 bg-gray-200 rounded text-gray-900">Berikutnya</button>
        </div>
      </div>

      {/* Full edit modal */}
      {fullEditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={closeFullEdit}></div>
          <div className="relative bg-white rounded shadow-lg w-full max-w-3xl p-6 z-10">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Edit Transaksi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900">Nama Donatur</label>
                <input value={fullEditItem.donor_name} onChange={e => setFullEditItem({...fullEditItem, donor_name: e.target.value})} className="mt-1 w-full border rounded px-2 py-1 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">No. HP</label>
                <input value={fullEditItem.phone} onChange={e => setFullEditItem({...fullEditItem, phone: e.target.value})} className="mt-1 w-full border rounded px-2 py-1 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Zakat Fitrah (Rp)</label>
                <input type="number" value={fullEditItem.zakat_fitrah_amount as any || 0} onChange={e => setFullEditItem({...fullEditItem, zakat_fitrah_amount: Number(e.target.value)})} className="mt-1 w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Zakat Fitrah (Beras kg)</label>
                <input type="number" step="0.1" value={fullEditItem.zakat_fitrah_rice as any || 0} onChange={e => setFullEditItem({...fullEditItem, zakat_fitrah_rice: Number(e.target.value)})} className="mt-1 w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Infaq (Rp)</label>
                <input type="number" value={fullEditItem.infaq_amount as any || 0} onChange={e => setFullEditItem({...fullEditItem, infaq_amount: Number(e.target.value)})} className="mt-1 w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Shodaqoh (Rp)</label>
                <input type="number" value={fullEditItem.shodaqoh_amount as any || 0} onChange={e => setFullEditItem({...fullEditItem, shodaqoh_amount: Number(e.target.value)})} className="mt-1 w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Fidyah (Rp)</label>
                <input type="number" value={fullEditItem.fidyah_amount as any || 0} onChange={e => setFullEditItem({...fullEditItem, fidyah_amount: Number(e.target.value)})} className="mt-1 w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Fidyah (Beras kg)</label>
                <input type="number" step="0.1" value={fullEditItem.fidyah_rice as any || 0} onChange={e => setFullEditItem({...fullEditItem, fidyah_rice: Number(e.target.value)})} className="mt-1 w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Wakaf (Rp)</label>
                <input type="number" value={fullEditItem.wakaf_amount as any || 0} onChange={e => setFullEditItem({...fullEditItem, wakaf_amount: Number(e.target.value)})} className="mt-1 w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Hibah (Rp)</label>
                <input type="number" value={fullEditItem.hibah_amount as any || 0} onChange={e => setFullEditItem({...fullEditItem, hibah_amount: Number(e.target.value)})} className="mt-1 w-full border rounded px-2 py-1" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900">Catatan</label>
                <textarea value={fullEditItem.notes} onChange={e => setFullEditItem({...fullEditItem, notes: e.target.value})} className="mt-1 w-full border rounded px-2 py-1 text-gray-900" />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={closeFullEdit} className="px-4 py-2 bg-gray-200 rounded text-gray-900">Batal</button>
              <button disabled={actionLoading} onClick={saveFullEdit} className="px-4 py-2 bg-green-600 text-white rounded">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}