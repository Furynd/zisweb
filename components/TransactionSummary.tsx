"use client";

import React, { useEffect, useState } from "react";
import getSupabaseClient from "../lib/supabaseClient";

interface Stats {
  zakat_fitrah: number;
  zakat_fitrah_rice: number;
  zakat_maal: number;
  infaq: number;
  shodaqoh: number;
  fidyah: number;
  fidyah_rice: number;
  wakaf: number;
  hibah: number;
  total_amount: number;
  total_rice: number;
}

export default function TransactionSummary() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let channel: any = null;

    async function fetchStats() {
      try {
        const supabase = await getSupabaseClient();
        const { data, error: err } = await supabase.rpc("get_transaction_stats");

        if (err) {
          console.error("Stats error:", err);
          if (mounted) setError(err.message);
          return;
        }

        if (mounted && data) {
          setStats(data[0] || {});
        }
      } catch (err: any) {
        console.error(err);
        if (mounted) setError(err?.message ?? String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    (async () => {
      await fetchStats();

      try {
        const supabase = await getSupabaseClient();
        // subscribe to all changes on transactions table
        channel = supabase
          .channel('public:transactions')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, (payload: any) => {
            // on any change, refetch stats
            fetchStats();
          })
          .subscribe();
      } catch (e) {
        console.error('Realtime subscribe failed', e);
      }
    })();

    return () => {
      mounted = false;
      try {
        if (channel && typeof channel.unsubscribe === 'function') channel.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  if (loading)
    return (
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="text-center text-gray-600">Loading statistics...</div>
      </div>
    );

  if (error)
    return (
      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="text-sm text-red-600">Error: {error}</div>
      </div>
    );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val || 0);
  };

  const formattedStats = (stats || {}) as Stats;

  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Ringkasan Transaksi</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Money donations */}
        <div className="p-4 bg-green-50 rounded border border-green-200">
          <div className="text-xs font-medium text-gray-600">Total Zakat Fitrah (Rp)</div>
          <div className="text-lg font-bold text-green-700 mt-1">
            {formatCurrency(formattedStats.zakat_fitrah)}
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded border border-green-200">
          <div className="text-xs font-medium text-gray-600">Total Zakat Maal (Rp)</div>
          <div className="text-lg font-bold text-green-700 mt-1">
            {formatCurrency(formattedStats.zakat_maal)}
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded border border-blue-200">
          <div className="text-xs font-medium text-gray-600">Total Infaq (Rp)</div>
          <div className="text-lg font-bold text-blue-700 mt-1">
            {formatCurrency(formattedStats.infaq)}
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded border border-purple-200">
          <div className="text-xs font-medium text-gray-600">Total Shodaqoh (Rp)</div>
          <div className="text-lg font-bold text-purple-700 mt-1">
            {formatCurrency(formattedStats.shodaqoh)}
          </div>
        </div>

        <div className="p-4 bg-orange-50 rounded border border-orange-200">
          <div className="text-xs font-medium text-gray-600">Total Fidyah (Rp)</div>
          <div className="text-lg font-bold text-orange-700 mt-1">
            {formatCurrency(formattedStats.fidyah)}
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
          <div className="text-xs font-medium text-gray-600">Total Wakaf (Rp)</div>
          <div className="text-lg font-bold text-yellow-700 mt-1">
            {formatCurrency(formattedStats.wakaf)}
          </div>
        </div>

        <div className="p-4 bg-indigo-50 rounded border border-indigo-200">
          <div className="text-xs font-medium text-gray-600">Total Hibah (Rp)</div>
          <div className="text-lg font-bold text-indigo-700 mt-1">
            {formatCurrency(formattedStats.hibah)}
          </div>
        </div>
      </div>

      {/* Rice donations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border-t pt-6">
        <div className="p-4 bg-amber-50 rounded border border-amber-200">
          <div className="text-xs font-medium text-gray-600">Total Zakat Fitrah (Beras, kg)</div>
          <div className="text-lg font-bold text-amber-700 mt-1">
            {(formattedStats.zakat_fitrah_rice || 0).toFixed(2)} kg
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded border border-amber-200">
          <div className="text-xs font-medium text-gray-600">Total Fidyah (Beras, kg)</div>
          <div className="text-lg font-bold text-amber-700 mt-1">
            {(formattedStats.fidyah_rice || 0).toFixed(2)} kg
          </div>
        </div>
      </div>

      {/* Grand totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded border-2 border-green-300">
          <div className="text-sm font-medium text-gray-700">Total Uang (Rp)</div>
          <div className="text-2xl font-bold text-green-800 mt-2">
            {formatCurrency(formattedStats.total_amount)}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded border-2 border-amber-300">
          <div className="text-sm font-medium text-gray-700">Total Beras (kg)</div>
          <div className="text-2xl font-bold text-amber-800 mt-2">
            {(formattedStats.total_rice || 0).toFixed(2)} kg
          </div>
        </div>
      </div>
    </div>
  );
}
