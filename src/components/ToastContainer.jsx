import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

const STYLES = {
  success: { icon: CheckCircle2, className: "border-success/30 text-success" },
  error: { icon: TriangleAlert, className: "border-danger/30 text-danger" },
  info: { icon: Info, className: "border-primary/30 text-primary" },
};

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 left-5 z-[80] flex w-72 flex-col gap-2">
      {toasts.map((toast) => {
        const { icon: Icon, className } = STYLES[toast.type] || STYLES.info;
        return (
          <div
            key={toast.id}
            className={`animate-slideUp flex items-start gap-2.5 rounded-xl border bg-white/95 p-3 text-sm shadow-lg backdrop-blur dark:bg-slate-800/95 ${className}`}
          >
            <Icon size={16} className="mt-0.5 shrink-0" />
            <p className="flex-1 text-slate-700 dark:text-slate-200">{toast.message}</p>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
