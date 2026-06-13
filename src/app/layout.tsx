/**
 * =============================================================================
 * ROOT LAYOUT
 * =============================================================================
 * 
 * TEACHING NOTE:
 * This is the root layout for the entire Next.js app.
 * It wraps all pages with:
 * 1. ReduxProvider — makes the Redux store available everywhere
 * 2. Navbar — consistent navigation across all pages
 * 3. Global CSS — styling for the entire application
 * =============================================================================
 */

import type { Metadata } from 'next';
import './globals.css';
import ReduxProvider from '@/components/ReduxProvider';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Student Task Manager — Redux Saga Teaching Project',
  description:
    'A comprehensive Next.js project demonstrating Redux Toolkit + Redux Saga concepts for students.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* ReduxProvider must wrap everything that uses Redux */}
        <ReduxProvider>
          <Navbar />
          <main>{children}</main>
        </ReduxProvider>
      </body>
    </html>
  );
}
