"use client";

import React from 'react';
import ErrorState from '@/components/shared/ErrorState';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8 relative">
      {/* Background noise to match the global theme */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
      }}></div>
      
      <ErrorState 
        type="404"
        title="Laman Tidak Ditemukan"
        description="Sepertinya kamu salah jalur. Yuk balik ke lapangan."
        actionLabel="Kembali ke Dashboard"
        actionHref="/dashboard"
      />
    </div>
  );
}
