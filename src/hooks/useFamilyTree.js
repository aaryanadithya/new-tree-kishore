import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import familyData from "../data/familyData.js";
import { loadSavedTree, saveTree } from "../utils/storage.js";

function cloneTree(node) {
  return JSON.parse(JSON.stringify(node));
}

function collectAllIds(node, ids = []) {
  ids.push(node.id);
  if (node.spouse) ids.push(node.spouse.id);
  (node.children || []).forEach((child) => collectAllIds(child, ids));
  return ids;
}

function findAndUpdate(node, targetId, updater) {
  if (node.id === targetId) {
    updater(node);
    return true;
  }
  if (node.spouse && node.spouse.id === targetId) {
    updater(node.spouse);
    return true;
  }
  for (const child of node.children || []) {
    if (findAndUpdate(child, targetId, updater)) return true;
  }
  return false;
}

function findNode(node, targetId) {
  if (node.id === targetId) return node;
  if (node.spouse && node.spouse.id === targetId) return node.spouse;
  for (const child of node.children || []) {
    const found = findNode(child, targetId);
    if (found) return found;
  }
  return null;
}

function removeChildById(node, targetId) {
  if (!node.children) return;
  node.children = node.children.filter((child) => child.id !== targetId);
  node.children.forEach((child) => removeChildById(child, targetId));
}

const HISTORY_LIMIT = 50;

export default function useFamilyTree() {
  const initial = useMemo(() => loadSavedTree() || cloneTree(familyData), []);
  const [treeData, setTreeDataRaw] = useState(initial);
  const [expandedIds, setExpandedIds] = useState(() => new Set(collectAllIds(initial)));

  // ---- undo / redo history ----
  const past = useRef([]);
  const future = useRef([]);
  const [historyTick, setHistoryTick] = useState(0); // forces re-render for can-undo/redo flags

  // Every mutation goes through here so it's recorded on the undo stack.
  const setTreeData = useCallback((updater, { record = true } = {}) => {
    setTreeDataRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (record && next !== prev) {
        past.current.push(prev);
        if (past.current.length > HISTORY_LIMIT) past.current.shift();
        future.current = [];
        setHistoryTick((t) => t + 1);
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (!past.current.length) return false;
    setTreeDataRaw((current) => {
      const prev = past.current.pop();
      future.current.push(current);
      setHistoryTick((t) => t + 1);
      return prev;
    });
    return true;
  }, []);

  const redo = useCallback(() => {
    if (!future.current.length) return false;
    setTreeDataRaw((current) => {
      const next = future.current.pop();
      past.current.push(current);
      setHistoryTick((t) => t + 1);
      return next;
    });
    return true;
  }, []);

  const canUndo = past.current.length > 0;
  const canRedo = future.current.length > 0;

  // ---- autosave ----
  useEffect(() => {
    saveTree(treeData);
  }, [treeData]);

  const toggleExpanded = useCallback((id, force) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      const shouldExpand = force ?? !next.has(id);
      if (shouldExpand) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(collectAllIds(treeData)));
  }, [treeData]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const expandPathTo = useCallback((id) => {
    setTreeDataRaw((tree) => {
      const path = [];
      function walk(node, trail) {
        const newTrail = [...trail, node.id];
        if (node.id === id) {
          path.push(...newTrail);
          return true;
        }
        if (node.spouse && node.spouse.id === id) {
          path.push(...newTrail);
          return true;
        }
        for (const child of node.children || []) {
          if (walk(child, newTrail)) return true;
        }
        return false;
      }
      walk(tree, []);
      setExpandedIds((prev) => new Set([...prev, ...path]));
      return tree;
    });
  }, []);

  const editMember = useCallback(
    (id, updates) => {
      setTreeData((tree) => {
        const next = cloneTree(tree);
        findAndUpdate(next, id, (node) => Object.assign(node, updates));
        return next;
      });
    },
    [setTreeData]
  );

  const addChild = useCallback(
    (parentId, childData) => {
      setTreeData((tree) => {
        const next = cloneTree(tree);
        findAndUpdate(next, parentId, (node) => {
          if (!node.children) node.children = [];
          node.children.push({
            id: Date.now(),
            photo: "",
            voice: "",
            details: "",
            birthDate: "",
            deathDate: "",
            children: [],
            ...childData,
          });
        });
        return next;
      });
    },
    [setTreeData]
  );

  const addSpouse = useCallback(
    (memberId, spouseData) => {
      setTreeData((tree) => {
        const next = cloneTree(tree);
        findAndUpdate(next, memberId, (node) => {
          node.spouse = {
            id: Date.now(),
            photo: "",
            voice: "",
            details: "",
            birthDate: "",
            deathDate: "",
            ...spouseData,
          };
        });
        return next;
      });
    },
    [setTreeData]
  );

  const deleteMember = useCallback(
    (id) => {
      setTreeData((tree) => {
        if (tree.id === id) return tree; // root can't be deleted
        const next = cloneTree(tree);
        removeChildById(next, id);
        return next;
      });
    },
    [setTreeData]
  );

  const replaceTree = useCallback(
    (newTree) => {
      setTreeData(() => newTree);
      setExpandedIds(new Set(collectAllIds(newTree)));
    },
    [setTreeData]
  );

  const getNode = useCallback((id) => findNode(treeData, id), [treeData]);

  const exportJSON = useCallback(
    (nodeId) => {
      const node = nodeId ? findNode(treeData, nodeId) : treeData;
      const blob = new Blob([JSON.stringify(node, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(node.name || "family").replace(/\s+/g, "_")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [treeData]
  );

  const allIds = useMemo(() => collectAllIds(treeData), [treeData]);

  return {
    treeData,
    expandedIds,
    allIds,
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
    historyTick,
  };
}
