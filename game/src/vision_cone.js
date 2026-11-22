// Vaultlight — vision_cone.js: vision cones and line of sight.
// A watcher sees the thief only inside its cone AND with a clear line;
// walls and smoke clouds break the line, which is what makes cover work.

// Segment (ax,ay)-(bx,by) against rectangle: true when they touch.
function segmentHitsRect(ax, ay, bx, by, rect) {
  if (ax >= rect.x && ax <= rect.x + rect.w && ay >= rect.y && ay <= rect.y + rect.h) return true;
  if (bx >= rect.x && bx <= rect.x + rect.w && by >= rect.y && by <= rect.y + rect.h) return true;
  const edges = [
    [rect.x, rect.y, rect.x + rect.w, rect.y],
    [rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h],
    [rect.x + rect.w, rect.y + rect.h, rect.x, rect.y + rect.h],
    [rect.x, rect.y + rect.h, rect.x, rect.y]
  ];
  for (const [cx, cy, dx, dy] of edges) {
    if (segmentsCross(ax, ay, bx, by, cx, cy, dx, dy)) return true;
  }
  return false;
}

function segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = crossProduct(dx - cx, dy - cy, ax - cx, ay - cy);
  const d2 = crossProduct(dx - cx, dy - cy, bx - cx, by - cy);
  const d3 = crossProduct(bx - ax, by - ay, cx - ax, cy - ay);
  const d4 = crossProduct(bx - ax, by - ay, dx - ax, dy - ay);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
         ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function crossProduct(ax, ay, bx, by) {
  return ax * by - ay * bx;
}

// Segment against a smoke circle: true when the line passes through smoke.
function segmentHitsSmoke(ax, ay, bx, by, smoke) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((smoke.x - ax) * dx + (smoke.y - ay) * dy) / len2;
  t = clampHeist(t, 0, 1);
  const cx = ax + dx * t, cy = ay + dy * t;
  return distanceHeist(cx, cy, smoke.x, smoke.y) < smoke.r;
}

// True when nothing (wall or smoke) stands between watcher and target.
function lineOfSightClear(ax, ay, bx, by, walls, smokes) {
  for (const wall of walls) {
    if (segmentHitsRect(ax, ay, bx, by, wall)) return false;
  }
  for (const smoke of smokes) {
    if (segmentHitsSmoke(ax, ay, bx, by, smoke)) return false;
  }
  return true;
}

// True when (tx,ty) lies inside a cone of origin, facing, range and half-angle.
function pointInsideCone(ox, oy, facing, range, halfAngle, tx, ty) {
  const d = distanceHeist(ox, oy, tx, ty);
  if (d > range) return false;
  if (d < 4) return true;
  return Math.abs(angleDiffHeist(angleToHeist(ox, oy, tx, ty), facing)) <= halfAngle;
}

// Cast one cone edge: walk out until a wall stops the ray, return the hit point.
function castConeRay(ox, oy, angle, range, walls) {
  let lo = 0, hi = range;
  for (let i = 0; i < 10; i++) {
    const mid = (lo + hi) / 2;
    const x = ox + Math.cos(angle) * mid, y = oy + Math.sin(angle) * mid;
    let blocked = false;
    for (const wall of walls) {
      if (x >= wall.x && x <= wall.x + wall.w && y >= wall.y && y <= wall.y + wall.h) { blocked = true; break; }
    }
    if (blocked) hi = mid; else lo = mid;
  }
  return { x: ox + Math.cos(angle) * lo, y: oy + Math.sin(angle) * lo };
}

// Polygon of a vision cone, clipped by walls along 9 sample rays.
function computeVisionCone(ox, oy, facing, range, halfAngle, walls) {
  const points = [{ x: ox, y: oy }];
  const steps = 9;
  for (let i = 0; i <= steps; i++) {
    const a = facing - halfAngle + (2 * halfAngle * i) / steps;
    points.push(castConeRay(ox, oy, a, range, walls));
  }
  return points;
}
