'use client';

import { redirect } from 'next/navigation';
import { PATH_AUTH } from '@/routes';


export default function Home() {
  redirect(PATH_AUTH.signin);
}
