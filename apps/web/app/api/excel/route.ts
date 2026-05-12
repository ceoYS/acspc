import ExcelJS from 'exceljs'
import { GenerateExcelInputSchema } from '@repo/domain'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const FORBIDDEN = /[\\/:*?"<>|]/g

function sanitize(name: string): string {
  return name.replace(FORBIDDEN, '_')
}

function yymmdd(iso: string): string {
  const d = new Date(iso)
  const yy = String(d.getFullYear()).slice(-2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return yy + mm + dd
}

function toExcelSerial(iso: string): number {
  const d = new Date(iso)
  return d.getTime() / 86400000 + 25569
}

type PhotoRow = {
  id: string
  created_at: string
  taken_at: string
  content_text: string
  storage_path: string
  location: { name: string } | { name: string }[] | null
  trade: { name: string } | { name: string }[] | null
}

function pickName(rel: PhotoRow['location'] | PhotoRow['trade']): string {
  if (!rel) return ''
  if (Array.isArray(rel)) return rel[0]?.name ?? ''
  return rel.name
}

function applyBoxBorder(
  sheet: ExcelJS.Worksheet,
  range: { top: number; bottom: number; left: number; right: number },
  outer: ExcelJS.BorderStyle,
  inner: ExcelJS.BorderStyle | null,
): void {
  for (let r = range.top; r <= range.bottom; r++) {
    for (let c = range.left; c <= range.right; c++) {
      const cell = sheet.getCell(r, c)
      const border: Partial<ExcelJS.Borders> = {}
      if (r === range.top) border.top = { style: outer }
      else if (inner) border.top = { style: inner }
      if (r === range.bottom) border.bottom = { style: outer }
      else if (inner) border.bottom = { style: inner }
      if (c === range.left) border.left = { style: outer }
      else if (inner) border.left = { style: inner }
      if (c === range.right) border.right = { style: outer }
      else if (inner) border.right = { style: inner }
      cell.border = border
    }
  }
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response('invalid json', { status: 400 })
  }
  const parsed = GenerateExcelInputSchema.safeParse(body)
  if (!parsed.success) {
    return new Response('validation failed', { status: 400 })
  }
  const { project_id, vendor_id } = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response('unauthorized', { status: 401 })
  }

  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select(
      'id, created_at, taken_at, content_text, storage_path, location:locations(name), trade:trades(name)',
    )
    .eq('user_id', user.id)
    .eq('project_id', project_id)
    .eq('vendor_id', vendor_id)
    .order('created_at', { ascending: true })

  if (photosError) {
    return new Response('photos query failed', { status: 500 })
  }
  const rows = (photos ?? []) as PhotoRow[]
  if (rows.length === 0) {
    return new Response('no photos', { status: 404 })
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('name')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single()
  if (projectError || !project) {
    return new Response('project not found', { status: 404 })
  }

  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select('name')
    .eq('id', vendor_id)
    .eq('user_id', user.id)
    .single()
  if (vendorError || !vendor) {
    return new Response('vendor not found', { status: 404 })
  }

  const imageBuffers = await Promise.all(
    rows.map(async (p) => {
      const { data, error } = await supabase.storage
        .from('photos')
        .download(p.storage_path)
      if (error || !data) return null
      return new Uint8Array(await data.arrayBuffer())
    }),
  )

  const workbook = new ExcelJS.Workbook()
  const sheetCount = Math.ceil(rows.length / 2)

  for (let i = 0; i < sheetCount; i++) {
    const sheet = workbook.addWorksheet(String(i + 1))

    sheet.columns = [
      { width: 1 },
      { width: 9 },
      { width: 9 },
      { width: 9 },
      { width: 9 },
      { width: 9 },
      { width: 9 },
      { width: 9 },
      { width: 9 },
      { width: 1 },
    ]

    const rowHeights = [
      44.25, 6.95, 21, 4.5, 275.1, 4.5, 21, 22.5, 6, 4.5, 275.1, 4.5, 21, 22.5,
    ]
    rowHeights.forEach((h, idx) => {
      sheet.getRow(idx + 1).height = h
    })

    sheet.mergeCells('C1:H1')
    sheet.mergeCells('A3:J3')
    sheet.mergeCells('B5:I5')
    sheet.mergeCells('A7:B7')
    sheet.mergeCells('C7:E7')
    sheet.mergeCells('G7:J7')
    sheet.mergeCells('A8:B8')
    sheet.mergeCells('C8:E8')
    sheet.mergeCells('G8:J8')
    sheet.mergeCells('B11:I11')
    sheet.mergeCells('A13:B13')
    sheet.mergeCells('C13:E13')
    sheet.mergeCells('G13:J13')
    sheet.mergeCells('A14:B14')
    sheet.mergeCells('C14:E14')
    sheet.mergeCells('G14:J14')

    const title = sheet.getCell('C1')
    title.value = '사   진   대   지'
    title.font = { name: '맑은 고딕', bold: true, size: 32 }
    title.alignment = { horizontal: 'center', vertical: 'middle' }

    const projectCell = sheet.getCell('A3')
    projectCell.value = project.name
    projectCell.font = { bold: true, size: 12 }
    projectCell.alignment = { horizontal: 'center', vertical: 'middle' }

    applyBoxBorder(sheet, { top: 5, bottom: 5, left: 2, right: 10 }, 'thin', null)
    applyBoxBorder(sheet, { top: 7, bottom: 8, left: 1, right: 10 }, 'thin', 'hair')
    applyBoxBorder(sheet, { top: 11, bottom: 11, left: 2, right: 10 }, 'thin', null)
    applyBoxBorder(sheet, { top: 13, bottom: 14, left: 1, right: 10 }, 'thin', 'hair')

    const photo1 = rows[2 * i]
    const photo2 = rows[2 * i + 1]

    if (photo1) {
      sheet.getCell('A7').value = '공   종'
      sheet.getCell('C7').value = pickName(photo1.trade)
      sheet.getCell('F7').value = '위   치'
      sheet.getCell('G7').value = pickName(photo1.location)
      sheet.getCell('A8').value = '내   용'
      sheet.getCell('C8').value = photo1.content_text
      sheet.getCell('F8').value = '일   자'
      const date1 = sheet.getCell('G8')
      date1.value = toExcelSerial(photo1.taken_at)
      date1.numFmt = 'yyyy/mm/dd(aaa)'
      ;['A7', 'F7', 'A8', 'F8'].forEach((addr) => {
        const c = sheet.getCell(addr)
        c.alignment = { horizontal: 'center', vertical: 'middle' }
      })
      ;['C7', 'G7', 'C8', 'G8'].forEach((addr) => {
        const c = sheet.getCell(addr)
        c.alignment = { horizontal: 'center', vertical: 'middle' }
      })

      const buf1 = imageBuffers[2 * i]
      if (buf1) {
        const imageId1 = workbook.addImage({
          buffer: buf1.buffer as ArrayBuffer,
          extension: 'jpeg',
        })
        sheet.addImage(imageId1, 'B5:I5')
      }
    }

    if (photo2) {
      sheet.getCell('A13').value = '공   종'
      sheet.getCell('C13').value = pickName(photo2.trade)
      sheet.getCell('F13').value = '위   치'
      sheet.getCell('G13').value = pickName(photo2.location)
      sheet.getCell('A14').value = '내   용'
      sheet.getCell('C14').value = photo2.content_text
      sheet.getCell('F14').value = '일   자'
      const date2 = sheet.getCell('G14')
      date2.value = toExcelSerial(photo2.taken_at)
      date2.numFmt = 'yyyy/mm/dd(aaa)'
      ;['A13', 'F13', 'A14', 'F14'].forEach((addr) => {
        const c = sheet.getCell(addr)
        c.alignment = { horizontal: 'center', vertical: 'middle' }
      })
      ;['C13', 'G13', 'C14', 'G14'].forEach((addr) => {
        const c = sheet.getCell(addr)
        c.alignment = { horizontal: 'center', vertical: 'middle' }
      })

      const buf2 = imageBuffers[2 * i + 1]
      if (buf2) {
        const imageId2 = workbook.addImage({
          buffer: buf2.buffer as ArrayBuffer,
          extension: 'jpeg',
        })
        sheet.addImage(imageId2, 'B11:I11')
      }
    }
  }

  const first = rows[0]
  const last = rows[rows.length - 1]
  if (!first || !last) {
    return new Response('no photos', { status: 404 })
  }
  const minDate = yymmdd(first.created_at)
  const maxDate = yymmdd(last.created_at)
  const datePart = minDate === maxDate ? minDate : `${minDate}-${maxDate}`
  const filename = `${sanitize(project.name)}_${sanitize(vendor.name)}_${datePart}.xlsx`

  const buffer = await workbook.xlsx.writeBuffer()
  return new Response(buffer as ArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  })
}
