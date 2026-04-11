import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

// 1. Change the type to Promise<{ id: string }>
// 2. Change the second argument name to 'context' (standard practice)
export async function PUT(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  
  // 3. Await the params to get the id
  const { id } = await context.params;
  const body = await request.json();

  const { data, error } = await supabase
    .from('positions')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// Do the same for DELETE if you have it in this file
export async function DELETE(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const { error } = await supabase.from('positions').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}