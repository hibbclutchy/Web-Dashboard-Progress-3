// PLACEHOLDER: ganti dengan BudgetCard asli milik teman.
// Sementara tidak menampilkan apa-apa agar landing page tetap bersih.
const BudgetCard = () => {
  return (
    <div className="glass flex items-center justify-between gap-3 rounded-2xl border-white/60 bg-white/70 px-4 py-3 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 lg:py-4">
      <h1 className="text-sm font-semibold text-slate-500 dark:text-white/65 md:text-lg">Total Anggaran:</h1>
      <h2 className="text-sm font-bold tracking-tight text-[#087443] dark:text-emerald-200 md:text-lg">1.000.000.000</h2>
    </div>
  )
}

export default BudgetCard
