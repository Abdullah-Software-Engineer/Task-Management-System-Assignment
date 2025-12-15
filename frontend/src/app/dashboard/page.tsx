'use client';

import { useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardContent } from '@/components/DashboardContent';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

