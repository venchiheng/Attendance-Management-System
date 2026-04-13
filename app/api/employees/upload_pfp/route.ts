import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or User ID' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // 1. Upload to Storage via REST API
    // We use the file type dynamically for the Content-Type header
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/pfp.${fileExt}`;
    const storageUrl = `${SUPABASE_URL}/storage/v1/object/avatars/${filePath}`;

    const storageResponse = await fetch(storageUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': file.type,
        'x-upsert': 'true',
      },
      body: file,
    });

    if (!storageResponse.ok) {
      const errorData = await storageResponse.json();
      return NextResponse.json({ error: 'Storage upload failed', details: errorData }, { status: 500 });
    }

    // 2. Update Profiles Table via REST API (PostgREST)
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`;
    const tableUrl = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;

    const dbResponse = await fetch(tableUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ pfp_url: publicUrl }),
    });

    if (!dbResponse.ok) {
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}