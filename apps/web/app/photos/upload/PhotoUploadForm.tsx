'use client'

import { useState } from 'react'
import type { UploadPhotoResult } from './_actions/uploadPhoto'

type Props = {
  uploadPhotoAction: (formData: FormData) => Promise<UploadPhotoResult>
}

export default function PhotoUploadForm({ uploadPhotoAction }: Props) {
  const [projectId, setProjectId] = useState('')
  const [contentText, setContentText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [storagePath, setStoragePath] = useState<string | null>(null)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)

  async function handleUpload() {
    setError(null)
    setStoragePath(null)
    setSignedUrl(null)

    if (!projectId || !contentText || !file) {
      setError('project_id, content_text, 파일을 모두 입력하세요.')
      return
    }

    setUploading(true)

    const formData = new FormData()
    formData.append('project_id', projectId)
    formData.append('content_text', contentText)
    formData.append('file', file)

    const result = await uploadPhotoAction(formData)

    if (!result.ok) {
      const messages: Record<typeof result.error, string> = {
        validation: '입력값 검증 실패 (project_id UUID / content_text / 파일 확인).',
        unauthorized: '로그인 필요.',
        storage: 'storage upload 실패.',
        db: 'DB insert 실패 (storage rollback 수행).',
      }
      setError(messages[result.error])
      setUploading(false)
      return
    }

    setStoragePath(result.storagePath)
    setSignedUrl(result.signedUrl)
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
        type="text"
        aria-label="content_text"
        placeholder="content_text (사진 설명, 1~200자)"
        value={contentText}
        onChange={(e) => setContentText(e.target.value)}
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
