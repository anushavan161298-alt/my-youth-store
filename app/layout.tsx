import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from './components/ToastProvider';
import { UserProvider } from './components/UserContext';
import { StoreProvider } from './components/StoreContext';
import Header from './components/Header';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Youth Store",
  description: "Modern e-commerce for youth fashion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50`}>
        <UserProvider>
          <ToastProvider>
            <StoreProvider>
              <Header />
              {children}
            </StoreProvider>
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}