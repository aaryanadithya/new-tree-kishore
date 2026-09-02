// ============================================
// Tree analysis: flattening, stats, relationships
// ============================================

/**
 * Flattens the tree into a lookup map keyed by id, recording each
 * person's blood parentId (null for the root and for anyone who only
 * appears as a spouse), depth (root = 0), and — for spouses — the id
 * of the blood-line partner they married into the family.
 */
export function buildIndex(root) {
  const index = new Map();

  function visit(node, parentId, depth) {
    index.set(node.id, { person: node, parentId, depth, marriedTo: null });

    if (node.spouse) {
      index.set(node.spouse.id, {
        person: node.spouse,
        parentId: null,
        depth,
        marriedTo: node.id,
      });
    }

    (node.children || []).forEach((child) => visit(child, node.id, depth + 1));
  }

  visit(root, null, 0);
  return index;
}

export function flattenPeople(root) {
  const index = buildIndex(root);
  return [...index.values()].map((entry) => entry.person);
}

function calcAge(birthDate, deathDate) {
  if (!birthDate) return null;
  const start = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();
  if (Number.isNaN(start.getTime())) return null;
  let age = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < start.getDate())) {
    age--;
  }
  return age;
}

export function getAge(person) {
  return calcAge(person.birthDate, person.deathDate);
}

export function getLifeStatus(person) {
  if (person.deathDate) return "deceased";
  return "alive";
}

/**
 * Aggregate stats used by the Statistics dashboard.
 */
export function computeStats(root) {
  const people = flattenPeople(root);
  const total = people.length;
  const males = people.filter((p) => p.gender === "male").length;
  const females = people.filter((p) => p.gender === "female").length;

  const index = buildIndex(root);
  const generations = new Set([...index.values()].map((e) => e.depth)).size;

  const ages = people.map(getAge).filter((a) => a != null);
  const avgAge = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null;

  const living = people.filter((p) => getLifeStatus(p) === "alive");
  const deceased = people.filter((p) => getLifeStatus(p) === "deceased");

  const oldest = ages.length
    ? people.reduce((a, b) => ((getAge(a) ?? -1) > (getAge(b) ?? -1) ? a : b))
    : null;

  return {
    total,
    males,
    females,
    generations,
    avgAge,
    livingCount: living.length,
    deceasedCount: deceased.length,
    oldest,
  };
}

const ORDINALS = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"];

function ordinal(n) {
  return ORDINALS[n] || `${n}th`;
}

/**
 * Finds how two people in the tree are related to each other.
 * Handles direct line (parent/child/grandparent...), siblings,
 * aunts/uncles, nieces/nephews, cousins (with "removed" degrees),
 * spouses, and in-laws (spouse of a blood relative).
 */
export function findRelationship(root, idA, idB) {
  if (idA === idB) return "Same person";

  const index = buildIndex(root);
  const a = index.get(idA);
  const b = index.get(idB);
  if (!a || !b) return "Unknown — one of these people isn't in the tree.";

  // Direct spouses of each other
  if (a.marriedTo === idB || b.marriedTo === idA) return "Spouse";

  // If either side married in, compute the blood relationship of their
  // partner instead, and label the result as "by marriage".
  if (a.marriedTo != null || b.marriedTo != null) {
    const bloodA = a.marriedTo ?? idA;
    const bloodB = b.marriedTo ?? idB;
    if (bloodA === bloodB) return "Spouse";
    const base = findRelationship(root, bloodA, bloodB);
    if (base.toLowerCase().includes("unknown") || base === "Same person") {
      return "Related by marriage";
    }
    return `${base} (by marriage)`;
  }

  // Walk each person's ancestor chain up to the root.
  function ancestorChain(entry) {
    const chain = [entry];
    let cur = entry;
    while (cur.parentId != null) {
      cur = index.get(cur.parentId);
      if (!cur) break;
      chain.push(cur);
    }
    return chain; // chain[0] = self, last = root
  }

  const chainA = ancestorChain(a);
  const chainB = ancestorChain(b);
  const idsB = new Map(chainB.map((e, i) => [e.person.id, i]));

  let depthA = -1;
  let depthB = -1;
  for (let i = 0; i < chainA.length; i++) {
    const match = idsB.get(chainA[i].person.id);
    if (match != null) {
      depthA = i;
      depthB = match;
      break;
    }
  }

  if (depthA === -1) return "No known blood relationship found.";

  // Result describes A's relationship to B.
  if (depthA === 0) return describeAncestor(depthB); // A is an ancestor of B
  if (depthB === 0) return describeDescendant(depthA); // A is a descendant of B

  if (depthA === 1 && depthB === 1) return "Sibling";

  // A is a sibling of one of B's ancestors → A is B's aunt/uncle (elder line).
  if (depthA === 1 && depthB > 1) return describeAuntUncleSide(depthB - 1, "Aunt/Uncle");
  // B is a sibling of one of A's ancestors → A is B's niece/nephew.
  if (depthB === 1 && depthA > 1) return describeAuntUncleSide(depthA - 1, "Niece/Nephew");

  const cousinLevel = Math.min(depthA, depthB) - 1;
  const removed = Math.abs(depthA - depthB);
  let label = `${ordinal(cousinLevel)} cousin`;
  if (removed > 0) label += ` ${removed} time${removed > 1 ? "s" : ""} removed`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function describeDescendant(depth) {
  if (depth === 1) return "Child";
  if (depth === 2) return "Grandchild";
  const greats = depth - 2;
  return `${"Great-".repeat(greats)}Grandchild`;
}

function describeAncestor(depth) {
  if (depth === 1) return "Parent";
  if (depth === 2) return "Grandparent";
  const greats = depth - 2;
  return `${"Great-".repeat(greats)}Grandparent`;
}

// levelsDown: how many generations separate the sibling from the other
// person; label: "Aunt/Uncle" or "Niece/Nephew" depending on direction.
function describeAuntUncleSide(levelsDown, label) {
  if (levelsDown === 1) return label;
  const greats = levelsDown - 1;
  return `${"Great-".repeat(greats)}${label}`;
}
