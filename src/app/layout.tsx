import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alkitab',
  description: 'Temukan Kedamaian dan Firman Tuhan Setiap Hari dalam Genggaman Anda.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
