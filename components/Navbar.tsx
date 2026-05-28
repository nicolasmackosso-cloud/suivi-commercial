"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import SettingsPanel from "./SettingsPanel";

type Page = "tableau" | "synthese" | "classement";

const links: { href: string; label: string; key: Page }[] = [
  { href: "/", label: "Tableau croisé", key: "tableau" },
  { href: "/synthese", label: "Synthèse", key: "synthese" },
  { href: "/classement", label: "Classement", key: "classement" },
];

export default function Navbar({ active }: { active: Page }) {
  const { teamName } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = async () => {
    const { supabase } = await import("@/lib/supabase");
    await supabase.auth.signOut();
  };

  return (
    <>
      <nav className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Suivi commercial</h1>
              {teamName && (
                <p className="text-xs text-slate-500 mt-0.5">{teamName}</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap justify-end items-center">
              {links.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className={
                    active === link.key
                      ? "rounded-lg px-4 py-2 text-sm font-medium text-white"
                      : "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  }
                  style={
                    active === link.key
                      ? { backgroundColor: "var(--th-primary)" }
                      : {}
                  }
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => setSettingsOpen(true)}
                title="Paramètres"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-600 transition hover:bg-slate-50 text-base"
              >
                ⚙
              </button>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
