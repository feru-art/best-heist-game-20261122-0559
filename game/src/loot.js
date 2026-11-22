// Vaultlight — loot.js: the treasures and the quota that opens the exit.
// Each loot has a kind, a name and a value; grabbing one pays coins too,
// so a good thief can afford the tools that keep the next room quiet.

function makeLoot(def) {
  return {
    x: def.x, y: def.y, kind: def.kind, name: def.name, value: def.value,
    taken: false, grabT: 0
  };
}

function lootTakenCount(lootList) {
  let n = 0;
  for (const item of lootList) if (item.taken) n++;
  return n;
}

function lootTotalValue(lootList) {
  let sum = 0;
  for (const item of lootList) if (item.taken) sum += item.value;
  return sum;
}

// Nearest untaken loot within grab reach of (x,y), or null.
function lootNearestGrabbable(lootList, x, y) {
  let best = null, bestD = 52;
  for (const item of lootList) {
    if (item.taken) continue;
    const d = distanceHeist(x, y, item.x, item.y);
    if (d < bestD) { best = item; bestD = d; }
  }
  return best;
}

// Grab it: mark taken, start the pickup sparkle, pay the thief in coins.
function lootGrab(item) {
  item.taken = true;
  item.grabT = 0.6;
  return item.value;
}

function lootTick(lootList, dt) {
  for (const item of lootList) {
    if (item.grabT > 0) item.grabT -= dt;
  }
}
