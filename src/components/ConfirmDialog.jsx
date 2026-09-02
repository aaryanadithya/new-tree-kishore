export default function ConfirmDialog({ message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-scaleIn w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-slate-800">
        <p className="mb-5 text-sm text-slate-700 dark:text-slate-200">{message}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-danger px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
