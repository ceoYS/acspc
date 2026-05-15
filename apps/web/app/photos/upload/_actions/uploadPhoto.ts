'use server'

import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const InputSchema = z.object({
  project_name: z.string().min(1).max(200),
  content_text: z.string().min(1).max(200),
  location_name: z.string().min(1).max(100),
  trade_name: z.string().min(1).max(100),
  vendor_name: z.string().min(1).max(100),
  taken_at: z.iso.datetime().optional(),
  file: z.instanceof(File),
})

export type UploadPhotoResult =
  | { ok: true; photoId: string; storagePath: string; signedUrl: string }
  | {
      ok: false
      error: 'validation' | 'unauthorized' | 'storage' | 'db' | 'master'
    }

// vendor_name 의 엑셀 파일명 금지 문자 → '_' (domain-model §4)
const VENDOR_FORBIDDEN = /[\\/:*?"<>|]/g

async function upsertProjectId(
  supabase: SupabaseClient,
  userId: string,
  name: string,
): Promise<string | null> {
  const { data: existing, error: selectError } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .maybeSingle()
  if (selectError) {
    return null
  }
  if (existing?.id) {
    return existing.id as string
  }
  const { data: inserted, error: insertError } = await supabase
    .from('projects')
    .insert({ user_id: userId, name })
    .select('id')
    .single()
  if (insertError || !inserted?.id) {
    return null
  }
  return inserted.id as string
}

async function upsertMasterId(
  supabase: SupabaseClient,
  table: 'locations' | 'trades' | 'vendors',
  userId: string,
  projectId: string,
  name: string,
): Promise<string | null> {
  const { data: existing, error: selectError } = await supabase
    .from(table)
    .select('id')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .eq('name', name)
    .maybeSingle()
  if (selectError) {
    return null
  }
  if (existing?.id) {
    return existing.id as string
  }
  const { data: inserted, error: insertError } = await supabase
    .from(table)
    .insert({ user_id: userId, project_id: projectId, name })
    .select('id')
    .single()
  if (insertError || !inserted?.id) {
    return null
  }
  return inserted.id as string
}

export async function uploadPhotoAction(
  formData: FormData,
): Promise<UploadPhotoResult> {
  const takenAtRaw = formData.get('taken_at')
  const parsed = InputSchema.safeParse({
    project_name: formData.get('project_name'),
    content_text: formData.get('content_text'),
    location_name: formData.get('location_name'),
    trade_name: formData.get('trade_name'),
    vendor_name: formData.get('vendor_name'),
    taken_at:
      typeof takenAtRaw === 'string' && takenAtRaw.length > 0
        ? takenAtRaw
        : undefined,
    file: formData.get('file'),
  })
  if (!parsed.success) {
    return { ok: false, error: 'validation' }
  }
  const {
    project_name,
    content_text,
    location_name,
    trade_name,
    vendor_name,
    taken_at,
    file,
  } = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: 'unauthorized' }
  }

  const projectId = await upsertProjectId(supabase, user.id, project_name)
  if (!projectId) {
    return { ok: false, error: 'master' }
  }

  const vendorNameSafe = vendor_name.replace(VENDOR_FORBIDDEN, '_')

  const locationId = await upsertMasterId(
    supabase,
    'locations',
    user.id,
    projectId,
    location_name,
  )
  const tradeId = await upsertMasterId(
    supabase,
    'trades',
    user.id,
    projectId,
    trade_name,
  )
  const vendorId = await upsertMasterId(
    supabase,
    'vendors',
    user.id,
    projectId,
    vendorNameSafe,
  )
  if (!locationId || !tradeId || !vendorId) {
    return { ok: false, error: 'master' }
  }

  const photoUuid = crypto.randomUUID()
  const storagePath = `${user.id}/${projectId}/${photoUuid}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(storagePath, file, { upsert: false })
  if (uploadError) {
    return { ok: false, error: 'storage' }
  }

  const { error: insertError } = await supabase.from('photos').insert({
    id: photoUuid,
    user_id: user.id,
    project_id: projectId,
    location_id: locationId,
    trade_id: tradeId,
    vendor_id: vendorId,
    content_text,
    taken_at: taken_at ?? new Date().toISOString(),
    storage_path: storagePath,
  })
  if (insertError) {
    const { error: removeError } = await supabase.storage
      .from('photos')
      .remove([storagePath])
    if (removeError) {
      console.error('rollback failed', removeError)
    }
    return { ok: false, error: 'db' }
  }

  let signedUrl = ''
  const { data: signedData, error: signedError } = await supabase.storage
    .from('photos')
    .createSignedUrl(storagePath, 60)
  if (!signedError && signedData) {
    signedUrl = signedData.signedUrl
  }

  return { ok: true, photoId: photoUuid, storagePath, signedUrl }
}
