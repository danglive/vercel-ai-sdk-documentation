// app/layout.tsx
import React from 'react';

export const metadata = {
  title: 'My AI Chat App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head />
      <body>
        {/* If there are any providers, wrap all children here */}
        {children}
      </body>
    </html>
  );
}