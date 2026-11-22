// Vaultlight — thief.js: the thief, their feet and their noise.
// Walk is silent, running is fast and loud: every few steps a noise
// ring spreads on the floor, and any guard close enough comes to look.
// The thief crawls through vents, invisible but slow.

function makeThief(x, y) {
  return {
    x, y,
    facing: 0,
    moving: false,
    running: false,
    inVent: false,
    vent: null,
    ventDist: 0,
    stepT: 0,
    rings: []
  };
}

function thiefTick(thief, dt, keys, walls, cases) {
  const solids = walls.concat(cases);
  if (thief.inVent) {
    thiefCrawlVent(thief, dt, keys);
    return;
  }
  let dx = 0, dy = 0;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;
  thief.moving = dx !== 0 || dy !== 0;
  if (thief.moving) {
    const len = Math.sqrt(dx * dx + dy * dy);
    dx /= len; dy /= len;
    thief.facing = Math.atan2(dy, dx);
    thief.running = !!keys.run;
    const speed = thief.running ? HEIST.runSpeed : HEIST.walkSpeed;
    thiefMove(thief, dx * speed * dt, dy * speed * dt, solids);
    if (thief.running) {
      thief.stepT -= dt;
      if (thief.stepT <= 0) {
        thief.stepT = 0.38;
        thief.rings.push({ x: thief.x, y: thief.y, r: 8, maxR: 70, t: 0.7, fresh: true });
      }
    }
  } else {
    thief.running = false;
  }
  for (const ring of thief.rings) {
    ring.t -= dt;
    ring.r += dt * 90;
  }
  thief.rings = thief.rings.filter((r) => r.t > 0);
}

function thiefMove(thief, dx, dy, solids) {
  let nx = thief.x + dx;
  for (const solid of solids) {
    if (circleHitsRect(nx, thief.y, HEIST.thiefRadius, solid)) { nx = thief.x; break; }
  }
  let ny = thief.y + dy;
  for (const solid of solids) {
    if (circleHitsRect(nx, ny, HEIST.thiefRadius, solid)) { ny = thief.y; break; }
  }
  thief.x = clampHeist(nx, 24 + HEIST.thiefRadius, 1256 - HEIST.thiefRadius);
  thief.y = clampHeist(ny, 88 + HEIST.thiefRadius, 696 - HEIST.thiefRadius);
}

function thiefCrawlVent(thief, dt, keys) {
  const vent = thief.vent;
  if (!vent) { thief.inVent = false; return; }
  let dir = 0;
  if (keys.left || keys.up) dir -= 1;
  if (keys.right || keys.down) dir += 1;
  thief.ventDist = clampHeist(thief.ventDist + dir * HEIST.ventSpeed * dt, 0, ventPathLength(vent));
  const p = ventPointAt(vent, thief.ventDist);
  thief.x = p.x; thief.y = p.y;
  thief.moving = dir !== 0;
  thief.running = false;
}

function thiefEnterVent(thief, grate) {
  thief.inVent = true;
  thief.vent = grate.vent;
  thief.ventDist = grate.dist;
  const p = ventPointAt(grate.vent, grate.dist);
  thief.x = p.x; thief.y = p.y;
}

function thiefExitVent(thief) {
  thief.inVent = false;
  thief.vent = null;
}
