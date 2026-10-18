"use client";

import { SessionProvider } from "next-auth/react";
import PwaSetup from "@/components/pwa-setup";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      {children}
      <PwaSetup />
    </SessionProvider>
  );
}
