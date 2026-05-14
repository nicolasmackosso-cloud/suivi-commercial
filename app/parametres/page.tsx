"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function Settings() {
  const { user } = useAuth();
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const profile = await response.json();
          setTeamName(profile.team_name || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const saveTeamName = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_name: teamName }),
      });

      if (response.ok) {
        alert("Nom d'équipe sauvegardé !");
      } else {
        alert("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving team name:", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  if (!user) {
    return <div className="p-8">Veuillez vous connecter</div>;
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Email
          </label>
          <p className="text-gray-600">{user.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Nom de l'équipe
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Entrez le nom de votre équipe"
          />
        </div>

        <button
          onClick={saveTeamName}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
}