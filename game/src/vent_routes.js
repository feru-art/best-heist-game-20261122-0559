// Vaultlight — vent_routes.js: the hidden way through a room.
// A vent is a steel duct along the floor with a grate at each end.
// Inside it the thief is invisible to every cone, but crawls slowly —
// the patient route, and the one that shows on the floor as a dashed line.

function makeVent(def) {
  return { path: def.path.map((p) => ({ x: p[0], y: p[1] })) };
}

// Total length of a vent path, in pixels.
function ventPathLength(vent) {
  let len = 0;
  for (let i = 1; i < vent.path.length; i++) {
    len += distanceHeist(vent.path[i - 1].x, vent.path[i - 1].y, vent.path[i].x, vent.path[i].y);
  }
  return len;
}

// Point at distance `d` along the path (clamped to the ends).
function ventPointAt(vent, d) {
  let rest = clampHeist(d, 0, ventPathLength(vent));
  for (let i = 1; i < vent.path.length; i++) {
    const a = vent.path[i - 1], b = vent.path[i];
    const seg = distanceHeist(a.x, a.y, b.x, b.y);
    if (rest <= seg) {
      const t = seg === 0 ? 0 : rest / seg;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    rest -= seg;
  }
  const last = vent.path[vent.path.length - 1];
  return { x: last.x, y: last.y };
}

// A grate (path end) within reach of (x,y), or null.
function ventGrateNear(vents, x, y) {
  for (const vent of vents) {
    for (let i = 0; i < vent.path.length; i += Math.max(1, vent.path.length - 1)) {
      const p = vent.path[i];
      if (distanceHeist(x, y, p.x, p.y) < 56) {
        return { vent, endIndex: i, dist: i === 0 ? 0 : ventPathLength(vent) };
      }
    }
  }
  return null;
}
