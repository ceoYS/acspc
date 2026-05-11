'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const InputSchema = z.object({
  project_id: z.uuid(),
  content_text: z.string().min(1).max(200),
  file: z.instanceof(File),
})

export type UploadPhotoResult =
  | { ok: true; photoId: string; storagePath: string; signedUrl: string }
  | { ok: false; error: 'validation' | 'unauthorized' | 'storage' | 'db' }

export async function uploadPhotoAction(
  formData: FormData,
): Promise<UploadPhotoResult> {
  const parsed = InputSchema.safeParse({
    project_id: formData.get('project_id'),
    content_text: formData.get('content_text'),
    file: formData.get('file'),
  })
  if (!parsed.success) {
    return { ok: false, error: 'validation' }
  }
  const { project_id, content_text, file } = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: 'unauthorized' }
  }

  const photoUuid = crypto.randomUUID()
  const storagePath = `${user.id}/${project_id}/${photoUuid}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(storagePath, file, { upsert: false })
  if (uploadError) {
    return { ok: false, error: 'storage' }
  }

  const { error: insertError } = await supabase.from('photos').insert({
    id: photoUuid,
    user_id: user.id,
    project_id,
    content_text,
    taken_at: new Date().toISOString(),
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
