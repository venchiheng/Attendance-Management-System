import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET all shifts
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('positions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// POST a new position
export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('positions')
    .insert([body])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}