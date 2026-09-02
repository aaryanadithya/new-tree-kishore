import { forwardRef } from "react";
import { getAge, getLifeStatus } from "../utils/family.js";

const GENDER_RING = {
  male: "ring-blue-400",
  female: "ring-pink-400",
};

const MemberCard = forwardRef(function MemberCard(
  { person, highlighted, generation, onClick, onContextMenu, onDoubleClick },
  ref
) {
  const ring = GENDER_RING[person.gender] || "ring-slate-300";
  const age = getAge(person);
  const status = getLifeStatus(person);

  return (
    <div
      ref={ref}
      data-member-id={person.id}
      onClick={() => onClick(person)}
      onContextMenu={(e) => onContextMenu(e, person)}
      onDoubleClick={() => onDoubleClick(person)}
      className={`group relative w-[150px] sm:w-[170px] cursor-pointer select-none rounded-2xl border border-white/40 bg-white/90 p-4 text-center shadow-md backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-800/90 ${
        highlighted ? "search-highlight ring-4 ring-primary" : ""
      }`}
    >
      {generation != null && (
        <span className="absolute left-2 top-2 rounded-full bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-medium text-white dark:bg-white/20">
          Gen {generation}
        </span>
      )}

      <span
        title={status === "alive" ? "Living" : "Deceased"}
        className={`absolute right-2 top-2 h-2.5 w-2.5 rounded-full ${
          status === "alive" ? "bg-success" : "bg-slate-400"
        }`}
      />

      <div
        className={`mx-auto mb-2 h-[72px] w-[72px] overflow-hidden rounded-full ring-4 ${ring}`}
      >
        {person.photo ? (
          <img
            src={person.photo}
            alt={person.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-xl font-semibold text-slate-500 dark:from-slate-700 dark:to-slate-600">
            {person.name?.[0] ?? "?"}
          </div>
        )}
      </div>

      <h3 className="truncate text-[15px] font-semibold text-slate-800 transition-colors group-hover:text-primary dark:text-slate-100">
        {person.name}
      </h3>
      <p className="mt-0.5 text-xs capitalize text-slate-500 dark:text-slate-400">
        {person.gender}
        {age != null ? ` · ${age}${status === "deceased" ? " (at death)" : ""}` : ""}
      </p>
    </div>
  );
});

export default MemberCard;
