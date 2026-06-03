type FilterButtonProps = {
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
};

export default function FilterButton({
  label,
  count,
  active = false,
  onClick,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-400/30"
          : "bg-slate-900/70 text-slate-300 ring-1 ring-slate-800/80 hover:bg-slate-800/70"
      }`}
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-semibold text-slate-100">
          {count}
        </span>
      )}
    </button>
  );
}
