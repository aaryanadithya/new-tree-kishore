import { useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  Expand,
  FileUp,
  Globe,
  ImageDown,
  Moon,
  Printer,
  Redo2,
  Search,
  Shuffle,
  ShrinkIcon,
  Sun,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { flattenPeople } from "../utils/family.js";

export default function Topbar({
  tree,
  searchValue,
  onSearchChange,
  onSearch,
  onPickSuggestion,
  onExpandAll,
  onCollapseAll,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  zoomPercent,
  onFullscreen,
  isFullscreen,
  onExportJSON,
  onImportJSON,
  onPrint,
  onDownloadPNG,
  language,
  onToggleLanguage,
  darkMode,
  onToggleDarkMode,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenStats,
  onOpenRelationshipFinder,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const people = useMemo(() => flattenPeople(tree), [tree]);
  const suggestions = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return [];
    return people.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [searchValue, people]);

  return (
    <header className="relative z-20 flex h-auto flex-col gap-3 border-b border-white/10 bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 text-white shadow-lg sm:h-[75px] sm:flex-row sm:items-center sm:justify-between sm:py-0">
      <div className="flex items-center gap-3 text-2xl font-bold tracking-tight">
        <span className="animate-pulseIcon text-3xl">🌳</span>
        <span>Family Tree</span>
        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium transition hover:bg-white/20 active:scale-95"
        >
          <Globe size={13} />
          {language === "hi" ? "हिंदी" : "EN"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <div className="flex items-center overflow-hidden rounded-full bg-white/10">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="Search member"
              className="w-36 bg-transparent px-3 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none sm:w-44"
            />
            <button
              onClick={onSearch}
              aria-label="Search"
              className="flex h-full items-center bg-primary px-3 py-1.5 transition hover:bg-primary-dark"
            >
              <Search size={15} />
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute left-0 top-full z-30 mt-1 w-full min-w-[180px] overflow-hidden rounded-xl bg-white text-slate-800 shadow-2xl dark:bg-slate-700 dark:text-slate-100">
              {suggestions.map((p) => (
                <li key={p.id}>
                  <button
                    onMouseDown={() => onPickSuggestion(p.id)}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-600"
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-full bg-white/10 px-1 py-1">
          <IconButton onClick={onUndo} label="Undo" disabled={!canUndo}>
            <Undo2 size={15} />
          </IconButton>
          <IconButton onClick={onRedo} label="Redo" disabled={!canRedo}>
            <Redo2 size={15} />
          </IconButton>
        </div>

        <ToolbarButton onClick={onExpandAll} label="Expand All" />
        <ToolbarButton onClick={onCollapseAll} label="Collapse All" />

        <div className="flex items-center gap-1 rounded-full bg-white/10 px-1 py-1">
          <IconButton onClick={onZoomOut} label="Zoom out">
            <ZoomOut size={15} />
          </IconButton>
          <button
            onClick={onResetZoom}
            className="px-1.5 text-xs font-medium tabular-nums text-white/80 hover:text-white"
          >
            {zoomPercent}%
          </button>
          <IconButton onClick={onZoomIn} label="Zoom in">
            <ZoomIn size={15} />
          </IconButton>
        </div>

        <IconButton onClick={onOpenStats} label="Statistics">
          <BarChart3 size={15} />
        </IconButton>
        <IconButton onClick={onOpenRelationshipFinder} label="Relationship finder">
          <Shuffle size={15} />
        </IconButton>
        <IconButton onClick={onToggleDarkMode} label="Toggle dark mode">
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </IconButton>
        <IconButton onClick={onFullscreen} label="Toggle fullscreen">
          {isFullscreen ? <ShrinkIcon size={15} /> : <Expand size={15} />}
        </IconButton>
        <IconButton onClick={onImportJSON} label="Import JSON">
          <FileUp size={15} />
        </IconButton>
        <IconButton onClick={onExportJSON} label="Export JSON">
          <Download size={15} />
        </IconButton>
        <IconButton onClick={onPrint} label="Print">
          <Printer size={15} />
        </IconButton>
        <IconButton onClick={onDownloadPNG} label="Download PNG">
          <ImageDown size={15} />
        </IconButton>
      </div>
    </header>
  );
}

function ToolbarButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium transition hover:bg-white/20 active:scale-95"
    >
      {label}
    </button>
  );
}

function IconButton({ onClick, label, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white/10"
    >
      {children}
    </button>
  );
}
