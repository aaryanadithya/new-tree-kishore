import { Minus, Plus } from "lucide-react";
import MemberCard from "./MemberCard.jsx";

export default function TreeNode({
  person,
  generation = 1,
  expandedIds,
  onToggle,
  onCardClick,
  onCardContextMenu,
  onCardDoubleClick,
  highlightedId,
  cardRefs,
}) {
  const hasChildren = person.children && person.children.length > 0;
  const isExpanded = expandedIds.has(person.id);

  return (
    <li>
      <div className={person.spouse ? "flex items-stretch gap-2" : ""}>
        <MemberCard
          ref={(el) => {
            if (cardRefs) cardRefs.current[person.id] = el;
          }}
          person={person}
          generation={generation}
          highlighted={highlightedId === person.id}
          onClick={onCardClick}
          onContextMenu={onCardContextMenu}
          onDoubleClick={onCardDoubleClick}
        />
        {person.spouse && (
          <>
            <div className="flex items-center text-slate-300 dark:text-slate-600">
              &#9673;
            </div>
            <MemberCard
              ref={(el) => {
                if (cardRefs) cardRefs.current[person.spouse.id] = el;
              }}
              person={person.spouse}
              generation={generation}
              highlighted={highlightedId === person.spouse.id}
              onClick={onCardClick}
              onContextMenu={onCardContextMenu}
              onDoubleClick={onCardDoubleClick}
            />
          </>
        )}
      </div>

      {hasChildren && (
        <>
          <button
            type="button"
            aria-label={isExpanded ? "Collapse branch" : "Expand branch"}
            onClick={() => onToggle(person.id)}
            className="relative z-10 mx-auto mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-success text-white shadow-md transition-transform hover:scale-110 active:scale-95"
          >
            {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
          </button>

          {isExpanded && (
            <ul className="tree-lines flex">
              {person.children.map((child) => (
                <TreeNode
                  key={child.id}
                  person={child}
                  generation={generation + 1}
                  expandedIds={expandedIds}
                  onToggle={onToggle}
                  onCardClick={onCardClick}
                  onCardContextMenu={onCardContextMenu}
                  onCardDoubleClick={onCardDoubleClick}
                  highlightedId={highlightedId}
                  cardRefs={cardRefs}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </li>
  );
}
