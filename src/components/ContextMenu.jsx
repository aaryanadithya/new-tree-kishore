import { useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Info,
  Pencil,
  Trash2,
  UserPlus,
  Users,
  Volume2,
} from "lucide-react";

export default function ContextMenu({ x, y, onClose, actions }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    function handleEscape(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const items = [
    { label: "View Details", icon: Info, onClick: actions.viewDetails },
    { label: "Edit Member", icon: Pencil, onClick: actions.edit },
    { label: "Add Child", icon: UserPlus, onClick: actions.addChild },
    { label: "Add Spouse", icon: Users, onClick: actions.addSpouse },
    {
      label: "Delete Member",
      icon: Trash2,
      onClick: actions.delete,
      danger: true,
    },
    { label: "Play Voice", icon: Volume2, onClick: actions.playVoice },
    { label: "Expand Node", icon: ChevronDown, onClick: actions.expandNode },
    { label: "Collapse Node", icon: ChevronUp, onClick: actions.collapseNode },
    { label: "Export JSON", icon: Download, onClick: actions.exportNode },
  ];

  return (
    <ul
      ref={ref}
      style={{ top: y, left: x }}
      className="animate-scaleIn fixed z-[60] min-w-[190px] origin-top-left rounded-2xl border border-white/30 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:bg-slate-800/95"
    >
      {items.map(({ label, icon: Icon, onClick, danger }) => (
        <li key={label}>
          <button
            onClick={() => {
              onClick?.();
              onClose();
            }}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition ${
              danger
                ? "text-danger hover:bg-danger/10"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        </li>
      ))}
    </ul>
  );
}
