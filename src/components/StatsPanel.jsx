import { X } from "lucide-react";
import { computeStats, getAge } from "../utils/family.js";

export default function StatsPanel({ tree, onClose }) {
  const stats = computeStats(tree);

  const rows = [
    { label: "Total members", value: stats.total },
    { label: "Male", value: stats.males },
    { label: "Female", value: stats.females },
    { label: "Generations", value: stats.generations },
    { label: "Living", value: stats.livingCount },
    { label: "Deceased", value: stats.deceasedCount },
    { label: "Average age", value: stats.avgAge != null ? `${stats.avgAge} yrs` : "—" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
      <div className="animate-slideUp h-full w-full max-w-sm overflow-y-auto bg-white p-6 shadow-2xl dark:bg-slate-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Family Statistics
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 transition hover:text-slate-700 dark:hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/50"
            >
              <p className="text-2xl font-bold text-primary">{row.value}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{row.label}</p>
            </div>
          ))}
        </div>

        {stats.oldest && (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/50">
            <p className="text-xs text-slate-500 dark:text-slate-400">Oldest member</p>
            <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
              {stats.oldest.name} · {getAge(stats.oldest)} yrs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
