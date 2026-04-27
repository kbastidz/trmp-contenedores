import { ReactNode } from 'react';
import { MainLayout } from '@/layouts/Main';

type Props = { children: ReactNode };

function OperadorLayout({ children }: Props) {
  return <MainLayout>{children}</MainLayout>;
}

export default OperadorLayout;
