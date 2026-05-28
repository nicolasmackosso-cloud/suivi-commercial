"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { THEMES, ThemeKey } from "@/lib/themes";
import { useAuth } from "./AuthProvider";

type ThemeCtxType = {
  themeKey: ThemeKey;
  teamName: string;
  setTheme: (k: ThemeKey) => Promise<void>;
  refreshTeamName: () => void;
};

const ThemeCtx = createContext<ThemeCtxType>({
  themeKey: "slate",
  teamName: "",
  setTheme: async () => {},
  refreshTeamName: () => {},
});

export const useTheme = () => useContext(ThemeCtx);

function applyCSS(key: ThemeKey) {
  const t = THEMES[key];
  const root = document.documentElement;
  root.style.setProperty("--th-primary", t.hex);
  root.style.setProperty("--th-hover", t.hover);
  root.style.setProperty("--th-light", t.light);
  root.style.setProperty("--th-light-text", t.lightText);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [themeKey, setThemeKey] = useState<ThemeKey>("slate");
  const [teamName, setTeamName] = useState("");

  const fetchProfile = () => {
    if (!session?.access_token) return;
    fetch("/api/profile", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((p) => {
        if (p.theme_color && THEMES[p.theme_color as ThemeKey]) {
          setThemeKey(p.theme_color as ThemeKey);
        }
        setTeamName(p.team_name || "");
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchProfile();
  }, [session]);

  useEffect(() => {
    applyCSS(themeKey);
  }, [themeKey]);

  const setTheme = async (key: ThemeKey) => {
    setThemeKey(key);
    if (!session?.access_token) return;
    await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ theme_color: key }),
    });
  };

  return (
    <ThemeCtx.Provider value={{ themeKey, teamName, setTheme, refreshTeamName: fetchProfile }}>
      {children}
    </ThemeCtx.Provider>
  );
}
