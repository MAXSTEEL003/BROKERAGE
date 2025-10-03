// app/layout.tsx
import '@/app/styles/globals.css';
import '@/app/styles/calculator.css';

export const metadata = {
  title: 'Brokerage Calculator Pro',
  description: 'Professional brokerage calculation and data management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
