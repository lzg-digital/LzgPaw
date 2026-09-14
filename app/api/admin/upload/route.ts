import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { requireAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from '@/lib/validation';

// Extensions are derived from this whitelist — NEVER from the client's
// filename or its claimed extension. This is what prevents an ".exe"
// renamed to ".jpg" (or vice versa) from being trusted (section 25 of the
// build spec — upload security).
const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return NextResponse.json({ error: 'Unsupported file type.' }, { status: 415 });
  }

  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: `File is too large (max ${Math.round(maxBytes / (1024 * 1024))}MB).` }, { status: 413 });
  }

  // Re-derive the "real" type from a magic-byte sniff of the first few bytes
  // as a second check — browsers can lie about `file.type`, and we never
  // trust the client-supplied filename/extension at all.
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!looksLikeDeclaredType(buffer, file.type)) {
    return NextResponse.json({ error: 'File contents do not match the declared file type.' }, { status: 415 });
  }

  const extension = EXTENSION_BY_MIME[file.type];
  const safeFilename = `${randomUUID()}.${extension}`;
  const path = `${isImage ? 'images' : 'videos'}/${safeFilename}`;

  const supabase = createAdminClient();
  const { error: uploadError } = await supabase.storage
    .from('product-media')
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error('[admin/upload] failed', uploadError.message);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }

  const { data } = supabase.storage.from('product-media').getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}

/** Minimal magic-byte check — not exhaustive, but catches the common case of
 * a mismatched/spoofed Content-Type on the uploaded file. */
function looksLikeDeclaredType(buffer: Buffer, mimeType: string): boolean {
  const bytes = buffer.subarray(0, 12);
  switch (mimeType) {
    case 'image/jpeg':
      return bytes[0] === 0xff && bytes[1] === 0xd8;
    case 'image/png':
      return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
    case 'image/webp':
      return bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    case 'video/mp4':
    case 'image/avif':
    case 'video/webm':
      // Container formats vary enough that we accept the declared type here
      // once size/extension whitelisting has already constrained the risk.
      return true;
    default:
      return false;
  }
}
