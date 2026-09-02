import { useCallback, useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

import Topbar from "./components/Topbar.jsx";
import TreeNode from "./components/TreeNode.jsx";
import MemberPopup from "./components/MemberPopup.jsx";
import ContextMenu from "./components/ContextMenu.jsx";
import MemberFormModal from "./components/MemberFormModal.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import BackgroundMusic from "./components/BackgroundMusic.jsx";
import ToastContainer from "./components/ToastContainer.jsx";
import StatsPanel from "./components/StatsPanel.jsx";
import RelationshipFinder from "./components/RelationshipFinder.jsx";
import useFamilyTree from "./hooks/useFamilyTree.js";
import useToasts from "./hooks/useToasts.js";
import { loadSavedTheme, saveTheme } from "./utils/storage.js";

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2;

export default function App() {
  const {
    treeData,
    expandedIds,
    toggleExpanded,
    expandAll,
    collapseAll,
    expandPathTo,
    editMember,
    addChild,
    addSpouse,
    deleteMember,
    replaceTree,
    getNode,
    exportJSON,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useFamilyTree();

  const { toasts, showToast, dismiss } = useToasts();

  const [scale, setScale] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [highlightedId, setHighlightedId] = useState(null);
  const [popupPerson, setPopupPerson] = useState(null);
  const [menu, setMenu] = useState(null); // { x, y, person }
  const [formModal, setFormModal] = useState(null); // { mode, targetId, initial }
  const [confirmTarget, setConfirmTarget] = useState(null); // id to delete
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(() => loadSavedTheme() === "dark");
  const [showStats, setShowStats] = useState(false);
  const [showRelationshipFinder, setShowRelationshipFinder] = useState(false);

  const wrapperRef = useRef(null);
  const treeRef = useRef(null);
  const cardRefs = useRef({});
  const importInputRef = useRef(null);
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });

  // ---- language attribute (mirrors original toggle) ----
  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  // ---- dark mode ----
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    saveTheme(darkMode ? "dark" : "light");
  }, [darkMode]);

  // ---- fullscreen state sync ----
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ---- center tree horizontally after layout changes ----
  useEffect(() => {
    const id = setTimeout(() => {
      const wrapper = wrapperRef.current;
      const tree = treeRef.current;
      if (!wrapper || !tree) return;
      if (tree.scrollWidth > wrapper.clientWidth) {
        wrapper.scrollLeft = (tree.scrollWidth - wrapper.clientWidth) / 2;
      } else {
        wrapper.scrollLeft = 0;
      }
    }, 150);
    return () => clearTimeout(id);
  }, [expandedIds, scale]);

  // ---- keyboard shortcuts ----
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable;

      if (e.key === "Escape") {
        setPopupPerson(null);
        setMenu(null);
      }

      if ((e.ctrlKey || e.metaKey) && !typing) {
        if (e.key.toLowerCase() === "z" && !e.shiftKey) {
          e.preventDefault();
          if (undo()) showToast("Undid last change", "info");
        } else if (
          (e.key.toLowerCase() === "z" && e.shiftKey) ||
          e.key.toLowerCase() === "y"
        ) {
          e.preventDefault();
          if (redo()) showToast("Redid change", "info");
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [undo, redo, showToast]);

  // ---- drag to scroll ----
  const onMouseDown = (e) => {
    const wrapper = wrapperRef.current;
    dragState.current = {
      dragging: true,
      startX: e.pageX - wrapper.offsetLeft,
      startY: e.pageY - wrapper.offsetTop,
      scrollLeft: wrapper.scrollLeft,
      scrollTop: wrapper.scrollTop,
    };
    wrapper.style.cursor = "grabbing";
  };
  const stopDrag = () => {
    dragState.current.dragging = false;
    if (wrapperRef.current) wrapperRef.current.style.cursor = "grab";
  };
  const onMouseMove = (e) => {
    if (!dragState.current.dragging) return;
    e.preventDefault();
    const wrapper = wrapperRef.current;
    const x = e.pageX - wrapper.offsetLeft;
    const y = e.pageY - wrapper.offsetTop;
    wrapper.scrollLeft = dragState.current.scrollLeft - (x - dragState.current.startX);
    wrapper.scrollTop = dragState.current.scrollTop - (y - dragState.current.startY);
  };

  // ---- ctrl+wheel zoom ----
  const onWheel = (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    setScale((s) => {
      const next = e.deltaY < 0 ? s + 0.08 : s - 0.08;
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +next.toFixed(2)));
    });
  };

  // ---- go to a specific person (used by search + suggestions) ----
  const goToPerson = useCallback(
    (id) => {
      expandPathTo(id);
      setHighlightedId(id);
      setTimeout(() => {
        cardRefs.current[id]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }, 200);
      setTimeout(() => setHighlightedId(null), 3000);
    },
    [expandPathTo]
  );

  // ---- search ----
  const handleSearch = useCallback(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) return;

    function find(node) {
      if (node.name.toLowerCase().includes(keyword)) return node;
      if (node.spouse && node.spouse.name.toLowerCase().includes(keyword)) return node.spouse;
      for (const child of node.children || []) {
        const found = find(child);
        if (found) return found;
      }
      return null;
    }

    const match = find(treeData);
    if (!match) {
      showToast("Family member not found.", "error");
      return;
    }
    goToPerson(match.id);
  }, [searchValue, treeData, goToPerson, showToast]);

  // ---- zoom ----
  const zoomIn = () => setScale((s) => Math.min(MAX_ZOOM, +(s + 0.1).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(MIN_ZOOM, +(s - 0.1).toFixed(2)));
  const resetZoom = () => setScale(1);

  // ---- fullscreen ----
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  // ---- PNG export ----
  const downloadPNG = async () => {
    if (!treeRef.current) return;
    const canvas = await html2canvas(treeRef.current, {
      backgroundColor: darkMode ? "#0f1419" : "#f2f5fa",
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = "family-tree.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("Tree exported as PNG", "success");
  };

  // ---- JSON import ----
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed.id || !parsed.name) throw new Error("Missing id/name");
        replaceTree(parsed);
        showToast(`Imported "${parsed.name}"'s family tree`, "success");
      } catch {
        showToast("That file doesn't look like a valid family tree JSON.", "error");
      }
    };
    reader.readAsText(file);
  };

  // ---- card interactions ----
  const handleCardClick = (person) => setPopupPerson(person);
  const handleCardDoubleClick = (person) =>
    setFormModal({ mode: "edit", targetId: person.id, initial: person });
  const handleCardContextMenu = (e, person) => {
    e.preventDefault();
    setMenu({ x: e.pageX, y: e.pageY, person });
  };

  // ---- context menu actions ----
  const menuActions = menu
    ? {
        viewDetails: () => setPopupPerson(menu.person),
        edit: () => setFormModal({ mode: "edit", targetId: menu.person.id, initial: menu.person }),
        addChild: () => setFormModal({ mode: "addChild", targetId: menu.person.id }),
        addSpouse: () => {
          if (menu.person.spouse) {
            showToast("This member already has a spouse.", "error");
            return;
          }
          setFormModal({ mode: "addSpouse", targetId: menu.person.id });
        },
        delete: () => setConfirmTarget(menu.person.id),
        playVoice: () => {
          if (!menu.person.voice) return;
          new Audio(menu.person.voice).play().catch(() => {});
        },
        expandNode: () => toggleExpanded(menu.person.id, true),
        collapseNode: () => toggleExpanded(menu.person.id, false),
        exportNode: () => {
          exportJSON(menu.person.id);
          showToast(`Exported ${menu.person.name}'s branch`, "success");
        },
      }
    : {};

  // ---- form modal submit ----
  const handleFormSubmit = (values) => {
    if (!formModal) return;
    if (formModal.mode === "edit") {
      editMember(formModal.targetId, values);
      showToast(`Updated ${values.name}`, "success");
    }
    if (formModal.mode === "addChild") {
      addChild(formModal.targetId, values);
      showToast(`Added ${values.name} as a child`, "success");
    }
    if (formModal.mode === "addSpouse") {
      addSpouse(formModal.targetId, values);
      showToast(`Added ${values.name} as a spouse`, "success");
    }
    setFormModal(null);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f2f5fa] dark:bg-slate-900">
      <Topbar
        tree={treeData}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearch={handleSearch}
        onPickSuggestion={goToPerson}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        zoomPercent={Math.round(scale * 100)}
        onFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onExportJSON={() => {
          exportJSON();
          showToast("Tree exported as JSON", "success");
        }}
        onImportJSON={() => importInputRef.current?.click()}
        onPrint={() => window.print()}
        onDownloadPNG={downloadPNG}
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === "hi" ? "en" : "hi"))}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        onUndo={() => {
          if (undo()) showToast("Undid last change", "info");
        }}
        onRedo={() => {
          if (redo()) showToast("Redid change", "info");
        }}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenStats={() => setShowStats(true)}
        onOpenRelationshipFinder={() => setShowRelationshipFinder(true)}
      />

      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        onChange={handleImportFile}
        className="hidden"
      />

      <div
        ref={wrapperRef}
        onMouseDown={onMouseDown}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onMouseMove={onMouseMove}
        onWheel={onWheel}
        className="relative flex-1 cursor-grab overflow-auto bg-cover bg-center bg-fixed p-10"
style={{
  backgroundImage:
    "linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url('new/background.jpg')",
}}
      >
        <div
          ref={treeRef}
          style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
          className="tree-lines mx-auto flex w-fit justify-center transition-transform duration-200"
        >
          <ul className="flex">
            <TreeNode
              person={treeData}
              expandedIds={expandedIds}
              onToggle={toggleExpanded}
              onCardClick={handleCardClick}
              onCardContextMenu={handleCardContextMenu}
              onCardDoubleClick={handleCardDoubleClick}
              highlightedId={highlightedId}
              cardRefs={cardRefs}
            />
          </ul>
        </div>
      </div>

      <footer className="border-t border-slate-200 bg-white/80 px-4 py-2 text-center text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-900/80">
        Family Tree System · Ctrl+Z / Ctrl+Y to undo/redo · Ctrl+scroll to zoom
      </footer>

      <BackgroundMusic />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {popupPerson && (
        <MemberPopup person={popupPerson} onClose={() => setPopupPerson(null)} />
      )}

      {menu && (
        <ContextMenu x={menu.x} y={menu.y} onClose={() => setMenu(null)} actions={menuActions} />
      )}

      {formModal && (
        <MemberFormModal
          mode={formModal.mode}
          initial={formModal.initial}
          onCancel={() => setFormModal(null)}
          onSubmit={handleFormSubmit}
        />
      )}

      {confirmTarget != null && (
        <ConfirmDialog
          message={`Delete ${getNode(confirmTarget)?.name ?? "this member"}?`}
          onCancel={() => setConfirmTarget(null)}
          onConfirm={() => {
            const node = getNode(confirmTarget);
            deleteMember(confirmTarget);
            showToast(`Deleted ${node?.name ?? "member"}`, "info");
            setConfirmTarget(null);
          }}
        />
      )}
<BackgroundMusic src="new/as.webm" autoPlay />

      {showStats && <StatsPanel tree={treeData} onClose={() => setShowStats(false)} />}

      {showRelationshipFinder && (
        <RelationshipFinder tree={treeData} onClose={() => setShowRelationshipFinder(false)} />
      )}
    </div>
    
  );
}
