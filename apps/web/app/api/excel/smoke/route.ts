import ExcelJS from 'exceljs'

export const dynamic = 'force-dynamic'

export async function GET() {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Smoke Test')
  sheet.getCell('A1').value = 'hello'
  sheet.getCell('A2').value = 'exceljs on Node smoke test PASS'

  const buffer = await workbook.xlsx.writeBuffer()
  return new Response(buffer as ArrayBuffer, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="smoke.xlsx"',
    },
  })
}
