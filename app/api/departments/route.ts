import { createClient } from '@/app/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET all shifts
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// POST a new department
export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('departments')
    .insert([body])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}