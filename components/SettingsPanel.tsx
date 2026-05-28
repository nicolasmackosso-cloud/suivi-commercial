"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { THEMES, ThemeKey } from "@/lib/themes";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";

export default function SettingsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { themeKey, setTheme, refreshTeamName } = useTheme();
  const { session, user } = useAuth();
  const [teamName, setTeamName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open || !session?.access_token) return;
    fetch("/api/profile", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((p) => setTeamName(p.team_name || ""))
      .catch(() => {});
  }, [open, session]);

  const save = async () => {
    if (!session?.access_token) return;
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ team_name: teamName }),
    });
    setSaving(false);
    setSaved(true);
    refreshTeamName();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Paramètres</h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Compte connecté
                </p>
                <p className="text-sm text-slate-700">{user?.email}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-2">
                  Nom de l'équipe
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Ex : Équipe Mistral"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                  Couleur du thème
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(THEMES) as [ThemeKey, (typeof THEMES)[ThemeKey]][]).map(
                    ([key, t]) => (
                      <button
                        key={key}
                        onClick={() => setTheme(key)}
                        className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-xs font-medium transition ${
                          themeKey === key
                            ? "border-slate-900 bg-slate-50"
                            : "border-transparent hover:border-slate-200 bg-slate-50"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: t.hex }}
                        />
                        {t.label}
                        {themeKey === key && (
                          <span className="ml-auto text-slate-900">✓</span>
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200">
              <button
                onClick={save}
                disabled={saving}
                className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
                style={{ backgroundColor: "var(--th-primary)" }}
              >
                {saving ? "Sauvegarde..." : saved ? "Sauvegardé ✓" : "Sauvegarder"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
