import { NextRequest, NextResponse } from "next/server";

// Simulated in-memory database for demo
const sales: Array<{
  id: string;
  agent: string;
  neighborhood: string;
  date: string;
}> = [];

export async function GET() {
  return NextResponse.json(sales);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newSale = {
    id: crypto.randomUUID(),
    agent: body.agent,
    neighborhood: body.neighborhood,
    date: body.date,
  };

  sales.push(newSale);
  return NextResponse.json(newSale, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const index = sales.findIndex((s) => s.id === body.id);

  if (index === -1) {
    return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  }

  sales[index] = { ...sales[index], ...body };
  return NextResponse.json(sales[index]);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const index = sales.findIndex((s) => s.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  }

  sales.splice(index, 1);
  return NextResponse.json({ success: true });
}
