"use client";
import { SessionProvider } from "next-auth/react";

function SessionProviderAuth({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export default SessionProviderAuth;
