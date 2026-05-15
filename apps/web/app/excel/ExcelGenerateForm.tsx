'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const selectClass =
  'min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900'

type Row = { id: string; name: string }

export default function ExcelGenerateForm() {
  const supabase = createClient()

  const [projects, setProjects] = useState<Row[]>([])
  const [vendors, setVendors] = useState<Row[]>([])
  const [projectId, setProjectId] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [sortKey, setSortKey] = useState<'location' | 'date'>('location')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('projects')
      .select('id, name')
      .order('created_at', { ascending: false })
      .then(({ data }) => setProjects(data ?? []))
  }, [])

  useEffect(() => {
    if (!projectId) {
      setVendors([])
      setVendorId('')
      return
    }
    supabase
      .from('vendors')
      .select('id, name')
      .eq('project_id', projectId)
      .order('name')
      .then(({ data }) => {
        setVendors(data ?? [])
        setVendorId('')
      })
  }, [projectId])

  const handleGenerate = async () => {
    setError(null)
    if (!projectId || !vendorId) {
      setError('프로젝트와 업체를 선택해주세요.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          vendor_id: vendorId,
          sortKey,
        }),
      })
      if (!res.ok) {
        setError(`생성 실패 (${res.status}): ${await res.text()}`)
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
        <span className="text-sm text-slate-700">프로젝트</span>
        <select
          aria-label="프로젝트 선택"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className={selectClass}
        >
          <option value="">프로젝트 선택</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-slate-700">업체</span>
        <select
          aria-label="업체 선택"
          value={vendorId}
          onChange={(e) => setVendorId(e.target.value)}
          disabled={!projectId}
          className={selectClass}
        >
          <option value="">업체 선택</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="flex flex-col gap-1">
        <legend className="text-sm text-slate-700">엑셀 시트 분류 기준</legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-900">
            <input
              type="radio"
              name="sortKey"
              value="location"
              checked={sortKey === 'location'}
              onChange={() => setSortKey('location')}
            />
            위치별
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-900">
            <input
              type="radio"
              name="sortKey"
              value="date"
              checked={sortKey === 'date'}
              onChange={() => setSortKey('date')}
            />
            날짜순
          </label>
        </div>
      </fieldset>

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
