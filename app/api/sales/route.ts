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
      .from("sales")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createAuthenticatedSupabase(accessToken);
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    const { data, error } = await supabase
      .from("sales")
      .insert([{
        agent: body.agent,
        neighborhood: body.neighborhood,
        date: body.date,
        in_zone: body.in_zone ?? true,
        user_id: user.id,
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 });
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

    const { data, error } = await supabase
      .from("sales")
      .update({
        agent: body.agent,
        neighborhood: body.neighborhood,
        date: body.date,
        in_zone: body.in_zone ?? true,
      })
      .eq("id", body.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating sale:", error);
    return NextResponse.json({ error: "Failed to update sale" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createAuthenticatedSupabase(accessToken);
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const { error } = await supabase
      .from("sales")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sale:", error);
    return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 });
  }
}
