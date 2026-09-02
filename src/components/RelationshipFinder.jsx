import { useMemo, useState } from "react";
import { Shuffle, X } from "lucide-react";
import { flattenPeople, findRelationship } from "../utils/family.js";

export default function RelationshipFinder({ tree, onClose }) {
  const people = useMemo(() => flattenPeople(tree), [tree]);
  const [idA, setIdA] = useState(people[0]?.id ?? "");
  const [idB, setIdB] = useState(people[1]?.id ?? "");

  const result =
    idA && idB
      ? idA === idB
        ? "Pick two different people."
        : findRelationship(tree, Number(idA), Number(idB))
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="animate-scaleIn relative w-full max-w-sm rounded-3xl border border-white/30 bg-white p-7 shadow-2xl dark:bg-slate-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-700 dark:hover:text-white"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          <Shuffle size={18} className="text-primary" />
          Relationship Finder
        </h3>

        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Person A
        </label>
        <select
          value={idA}
          onChange={(e) => setIdA(e.target.value)}
          className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        >
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
          Person B
        </label>
        <select
          value={idB}
          onChange={(e) => setIdB(e.target.value)}
          className="mb-6 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        >
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {result && idA !== idB && (
          <div className="rounded-2xl bg-primary/10 p-4 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {people.find((p) => String(p.id) === String(idA))?.name} is{" "}
              {people.find((p) => String(p.id) === String(idB))?.name}'s
            </p>
            <p className="mt-1 text-lg font-bold text-primary">{result}</p>
          </div>
        )}
        {result && idA === idB && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">{result}</p>
        )}
      </div>
    </div>
  );
}
