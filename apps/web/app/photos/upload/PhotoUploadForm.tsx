'use client'

import { useState } from 'react'
import type { UploadPhotoResult } from './_actions/uploadPhoto'

type Props = {
  uploadPhotoAction: (formData: FormData) => Promise<UploadPhotoResult>
}

const inputClass =
  'min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900'

export default function PhotoUploadForm({ uploadPhotoAction }: Props) {
  const [projectId, setProjectId] = useState('')
  const [locationName, setLocationName] = useState('')
  const [tradeName, setTradeName] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [contentText, setContentText] = useState('')
  const [takenAt, setTakenAt] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [storagePath, setStoragePath] = useState<string | null>(null)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)

  async function handleUpload() {
    setError(null)
    setStoragePath(null)
    setSignedUrl(null)

    if (
      !projectId ||
      !locationName ||
      !tradeName ||
      !vendorName ||
      !contentText ||
      !file
    ) {
      setError(
        'project_id, 위치, 공종, 업체, 내용, 파일을 모두 입력하세요.',
      )
      return
    }

    setUploading(true)

    const formData = new FormData()
    formData.append('project_id', projectId)
    formData.append('location_name', locationName)
    formData.append('trade_name', tradeName)
    formData.append('vendor_name', vendorName)
    formData.append('content_text', contentText)
    if (takenAt) {
      const iso = new Date(takenAt).toISOString()
      formData.append('taken_at', iso)
    }
    formData.append('file', file)

    const result = await uploadPhotoAction(formData)

    if (!result.ok) {
      const messages: Record<typeof result.error, string> = {
        validation:
          '입력값 검증 실패 (project_id UUID / 위치·공종·업체 1~100자 / 내용 1~200자 / 파일 확인).',
        unauthorized: '로그인 필요.',
        storage: 'storage upload 실패.',
        db: 'DB insert 실패 (storage rollback 수행).',
        master: '위치·공종·업체 마스터 upsert 실패.',
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
      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-700">project_id (UUID)</span>
        <input
          type="text"
          aria-label="project_id"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-700">위치 (1~100자)</span>
        <input
          type="text"
          aria-label="location_name"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-700">공종 (1~100자)</span>
        <input
          type="text"
          aria-label="trade_name"
          value={tradeName}
          onChange={(e) => setTradeName(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-700">업체 (1~100자)</span>
        <input
          type="text"
          aria-label="vendor_name"
          value={vendorName}
          onChange={(e) => setVendorName(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-700">내용 (1~200자)</span>
        <input
          type="text"
          aria-label="content_text"
          value={contentText}
          onChange={(e) => setContentText(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-700">일자 (선택)</span>
        <input
          type="date"
          aria-label="taken_at"
          value={takenAt}
          onChange={(e) => setTakenAt(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-700">사진 파일</span>
        <input
          type="file"
          aria-label="photo file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full"
        />
      </label>
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
