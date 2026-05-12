'use client'

import { useState } from 'react'

const inputClass =
  'min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900'

export default function ExcelGenerateForm() {
  const [projectId, setProjectId] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setError(null)
    if (!projectId || !vendorId) {
      setError('project_id, vendor_id 모두 UUID 입력 필요.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, vendor_id: vendorId }),
      })
      if (!res.ok) {
        const text = await res.text()
        setError(`생성 실패 (${res.status}): ${text}`)
        setLoading(false)
        return
      }
      const blob = await res.blob()
      const cd = res.headers.get('Content-Disposition') || ''
      const match = cd.match(/filename="([^"]+)"/)
      const filename = match?.[1]
        ? decodeURIComponent(match[1])
        : 'photo_excel.xlsx'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-3 rounded border border-slate-300 p-4">
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
        <span className="text-sm text-slate-700">vendor_id (UUID)</span>
        <input
          type="text"
          aria-label="vendor_id"
          value={vendorId}
          onChange={(e) => setVendorId(e.target.value)}
          className={inputClass}
        />
      </label>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="min-h-14 rounded-xl bg-slate-900 px-4 text-slate-50 disabled:bg-slate-200 disabled:text-slate-400"
      >
        {loading ? '생성 중...' : '엑셀 생성'}
      </button>
      {error && (
        <p role="alert" className="break-all text-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  )
}
