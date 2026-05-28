import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createAuthenticatedSupabase(accessToken);
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return NextResponse.json(data || { id: user.id, email: user.email, team_name: "", theme_color: "slate" });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createAuthenticatedSupabase(accessToken);
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    const update: Record<string, unknown> = { id: user.id, email: user.email };
    if (body.team_name !== undefined) update.team_name = body.team_name;
    if (body.theme_color !== undefined) update.theme_color = body.theme_color;

    const { data, error } = await supabase
      .from("profiles")
      .upsert(update)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
