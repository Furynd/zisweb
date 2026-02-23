"use client";
import { useState } from "react";

export default function CalculatorPage() {
  const [beras, setBeras] = useState(2.5); // default 2.5kg
  const [hargaBeras, setHargaBeras] = useState(15000); // default per kg
  const [jumlahJiwa, setJumlahJiwa] = useState(1);
  const totalUang = beras * hargaBeras * jumlahJiwa;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans">
      <main className="flex flex-col items-center bg-white rounded-lg shadow p-8 w-full max-w-md">
        <div className="w-full mb-4">
          <a href="/" className="inline-block text-green-700 hover:text-green-900 font-semibold transition">&larr; Kembali</a>
        </div>
        <h1 className="text-2xl font-bold text-green-800 mb-4">Kalkulator Zakat Fitrah</h1>
        <form className="flex flex-col gap-4 w-full">
          <label className="flex flex-col text-gray-900 font-medium">
            Jumlah Jiwa
            <input
              type="number"
              min={1}
              value={jumlahJiwa}
              onChange={e => setJumlahJiwa(Number(e.target.value))}
              className="border border-gray-400 rounded px-3 py-2 mt-1 text-gray-900 bg-white focus:border-green-700 focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-gray-900 font-medium">
            Harga Beras per Kg (Rp)
            <input
              type="number"
              min={1}
              value={hargaBeras}
              onChange={e => setHargaBeras(Number(e.target.value))}
              className="border border-gray-400 rounded px-3 py-2 mt-1 text-gray-900 bg-white focus:border-green-700 focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-gray-900 font-medium">
            Jumlah Beras per Jiwa (kg)
            <input
              type="number"
              min={2.5}
              step={0.1}
              value={beras}
              onChange={e => setBeras(Number(e.target.value))}
              className="border border-gray-400 rounded px-3 py-2 mt-1 text-gray-900 bg-white focus:border-green-700 focus:outline-none"
            />
          </label>
        </form>
        <div className="mt-6 text-lg font-semibold text-gray-900">
          Total Zakat Fitrah:
          <div className="mt-2">
            <span className="text-green-800">{(beras * jumlahJiwa).toFixed(2)} kg beras</span>
            <span className="mx-2 text-gray-900">atau</span>
            <span className="text-green-800">Rp {totalUang.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
