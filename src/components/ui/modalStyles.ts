export const cinemaModalClassNames = {
  backdrop: 'bg-slate-950/75 backdrop-blur-sm',
  base: 'max-h-[calc(100dvh-2rem)] overflow-hidden border border-white/10 bg-[#17233a] text-slate-100 shadow-2xl',
  header: 'shrink-0 border-b border-white/10 px-6 py-5',
  body: 'min-h-0 flex-1 overflow-y-auto px-6 py-5',
  footer: 'shrink-0 border-t border-white/10 bg-[#17233a] px-6 py-4',
  closeButton: 'right-4 top-4 text-slate-300 transition hover:bg-white/10 hover:text-white active:bg-white/15'
} as const;

export const cinemaFieldClassName = 'mt-1.5 w-full rounded-lg border border-slate-600 bg-slate-950/35 px-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-aero-blue focus:ring-2 focus:ring-aero-blue/30';
