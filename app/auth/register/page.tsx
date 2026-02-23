"use client";

import React from "react";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded shadow text-center">
        <h1 className="text-xl font-semibold mb-4 text-gray-900">Registrasi Ditutup</h1>
        <p className="text-sm text-gray-800">
          Pendaftaran operator hanya dapat dilakukan oleh SuperAdmin dari panel admin.
          Jika Anda membutuhkan akses, hubungi administrator sistem.
        </p>
      </div>
    </main>
  );
}
