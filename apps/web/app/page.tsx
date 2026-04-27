export default function Home() {
  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            acspc — Design Token Verification
          </h1>
          <p className="mt-2 text-base text-slate-700">
            docs/05_design_reference.md §3.1 색상 팔레트 적용 확인 페이지
          </p>
        </header>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            Primary
          </h2>
          <div className="flex gap-3">
            <div className="min-h-14 rounded-xl bg-slate-900 px-6 py-4 text-slate-50">
              Primary Button
            </div>
            <div className="min-h-14 rounded-xl bg-slate-900 px-6 py-4 text-slate-50">
              bg-slate-900 / text-slate-50
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            Accent (촬영 전용)
          </h2>
          <div className="flex items-center gap-3">
            <div className="size-16 rounded-full bg-orange-600" aria-label="Shutter sample" />
            <div className="min-h-14 rounded-xl bg-orange-600 px-6 py-4 text-slate-50">
              bg-orange-600 / text-slate-50
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            Surface
          </h2>
          <div className="flex gap-3">
            <div className="min-h-20 flex-1 rounded-lg border border-slate-300 bg-white p-4 text-slate-900">
              Surface (bg-white)
            </div>
            <div className="min-h-20 flex-1 rounded-lg border border-slate-300 bg-slate-50 p-4 text-slate-900">
              Surface-elevated (bg-slate-50)
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            Semantic
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="min-h-14 rounded-lg bg-emerald-700 px-4 py-3 text-white">
              Success
            </div>
            <div className="min-h-14 rounded-lg bg-red-700 px-4 py-3 text-white">
              Danger
            </div>
            <div className="min-h-14 rounded-lg bg-amber-700 px-4 py-3 text-white">
              Warning
            </div>
            <div className="min-h-14 rounded-lg bg-blue-700 px-4 py-3 text-white">
              Info
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            Text
          </h2>
          <div className="space-y-2">
            <p className="text-base text-slate-900">
              Primary text (text-slate-900) — 본문 주요 텍스트
            </p>
            <p className="text-base text-slate-700">
              Secondary text (text-slate-700) — 보조 설명
            </p>
            <p className="text-base text-slate-400">
              Disabled text (text-slate-400) — 비활성 상태
            </p>
            <p className="text-xs text-slate-500">
              Caption (text-xs text-slate-500) — 메타데이터
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            Tag Chip
          </h2>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex min-h-12 items-center rounded-full bg-slate-100 px-3 text-sm font-medium text-slate-700">
              미선택
            </span>
            <span className="inline-flex min-h-12 items-center rounded-full bg-slate-900 px-3 text-sm font-medium text-slate-50">
              선택됨
            </span>
            <span className="inline-flex min-h-12 items-center rounded-full border border-slate-700 bg-slate-100 px-3 text-sm font-medium text-slate-700">
              강조 보더
            </span>
          </div>
        </section>

        <footer className="border-t border-slate-300 pt-4">
          <p className="text-xs text-slate-500">
            이 페이지는 D-4a 검증 용도. V1 실제 화면은 이후 턴에서 별도 구현.
          </p>
        </footer>
      </div>
    </main>
  );
}
