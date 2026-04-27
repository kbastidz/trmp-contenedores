import { ReactNode } from 'react';
import { MainLayout } from '@/layouts/Main';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
