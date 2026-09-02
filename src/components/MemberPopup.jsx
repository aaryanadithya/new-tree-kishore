import { Volume2, X } from "lucide-react";

export default function MemberPopup({ person, onClose }) {
  if (!person) return null;

  const playVoice = () => {
    if (!person.voice) return;
    new Audio(person.voice).play().catch(() => {});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex animate-slideUp items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-sm rounded-3xl border border-white/30 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-2xl dark:bg-slate-800/95">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-700 dark:hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border-4 border-primary">
          {person.photo ? (
            <img
              src={person.photo}
              alt={person.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-3xl font-semibold text-slate-500">
              {person.name?.[0] ?? "?"}
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {person.name}
        </h2>
        <h4 className="mt-1 text-sm capitalize text-slate-500 dark:text-slate-400">
          {person.gender}
        </h4>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {person.details || "No details available"}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={playVoice}
            disabled={!person.voice}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Volume2 size={15} />
            Play Voice
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
