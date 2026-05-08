'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PhotoUploadForm() {
  const [projectId, setProjectId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [storagePath, setStoragePath] = useState<string | null>(null)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)

  async function handleUpload() {
    setError(null)
    setStoragePath(null)
    setSignedUrl(null)

    if (!projectId || !file) {
      setError('project_id 와 파일을 입력하세요.')
      return
    }

    setUploading(true)

    const supabase = createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      setError('로그인 필요.')
      setUploading(false)
      return
    }

    const userId = userData.user.id
    const photoUuid = crypto.randomUUID()
    const path = `${userId}/${projectId}/${photoUuid}.jpg`

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(path, file, { upsert: false })

    if (uploadError) {
      setError(`upload 실패: ${uploadError.message}`)
      setUploading(false)
      return
    }

    setStoragePath(path)

    const { data: signedData, error: signedError } = await supabase.storage
      .from('photos')
      .createSignedUrl(path, 60)

    if (signedError) {
      setError(`signed URL 생성 실패: ${signedError.message}`)
      setUploading(false)
      return
    }

    setSignedUrl(signedData.signedUrl)
    setUploading(false)
  }

  return (
    <section className="space-y-3 rounded border border-slate-300 p-4">
      <h2 className="text-lg font-semibold">Photo Upload (V1 임시)</h2>
      <input
        type="text"
        aria-label="project_id"
        placeholder="project_id (UUID)"
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        className="w-full rounded border border-slate-300 px-3 py-2"
      />
      <input
        type="file"
        aria-label="photo file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full"
      />
      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading}
        className="rounded bg-slate-900 px-4 py-2 text-slate-50 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && (
        <p role="alert" className="break-all text-sm text-red-700">
          {error}
        </p>
      )}
      {storagePath && (
        <p className="break-all text-sm">storage_path: {storagePath}</p>
      )}
      {signedUrl && (
        <p className="break-all text-sm">
          signed URL (60s):{' '}
          <a
            href={signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 underline"
          >
            {signedUrl}
          </a>
        </p>
      )}
    </section>
  )
}
