import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PhotoUploadForm from './PhotoUploadForm'
import { uploadPhotoAction } from './_actions/uploadPhoto'

export default async function PhotosUploadPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-bold">Photo Upload</h1>
      <PhotoUploadForm uploadPhotoAction={uploadPhotoAction} />
    </main>
  )
}
