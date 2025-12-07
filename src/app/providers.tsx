// app/providers.jsx

'use client'

import { ThemeProvider } from 'next-themes'


type Props = {
  children?: React.ReactNode;
};

export function NextAuthProvider({ children }: Props) {
  return <ThemeProvider>{children}</ThemeProvider>
}