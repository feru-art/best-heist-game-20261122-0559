// Vaultlight — guard_patrol.js: guards that walk, watch, doubt and chase.
// A guard patrols its waypoints, grows suspicious when the thief crosses
// its cone, gives chase when sure, and investigates the last noise it
// heard. Suspicion always decays out of sight, so patience beats panic.

function makeGuard(def) {
  const start = def.waypoints[0];
  return {
    x: start[0], y: start[1],
    waypoints: def.waypoints,
    wpIndex: 1,
    facing: 0,
    state: 'patrol',
    suspicion: 0,
    pauseT: 0,
    loseT: 0,
    lastSeen: null,
    investigate: null,
    hearT: 0
  };
}

// A guard hears a fresh noise ring and turns to investigate it.
function guardHearNoise(guard, ring) {
  const d = distanceHeist(guard.x, guard.y, ring.x, ring.y);
  if (d > HEIST.noiseHearRadius) return;
  if (guard.state === 'chase') return;
  guard.investigate = { x: ring.x, y: ring.y };
  guard.suspicion = Math.min(70, Math.max(guard.suspicion, d < 120 ? 55 : 30));
  guard.state = 'investigate';
  guard.hearT = 0;
}

function guardTick(guard, dt, thief, walls, smokes, noiseRings) {
  const seen = guardSeesThief(guard, thief, walls, smokes);
  if (seen) {
    guard.suspicion += HEIST.guardSuspicionRate * dt;
    guard.lastSeen = { x: thief.x, y: thief.y };
    guard.loseT = 0;
  } else {
    guard.suspicion -= HEIST.suspicionDecayRate * dt;
    guard.loseT += dt;
  }
  guard.suspicion = clampHeist(guard.suspicion, 0, 100);

  if (guard.suspicion >= 100) guard.state = 'chase';
  else if (guard.state === 'chase' && guard.suspicion < 55) guard.state = 'investigate';
  else if (guard.state === 'chase' && guard.loseT > 3) {
    guard.state = 'investigate';
    guard.investigate = guard.lastSeen ? { x: guard.lastSeen.x, y: guard.lastSeen.y } : null;
  } else if (guard.state === 'investigate' && guard.suspicion < 20 && !guard.investigate) {
    guard.state = 'patrol';
  } else if (guard.state === 'suspicious' && guard.suspicion < 20) {
    guard.state = 'patrol';
  } else if (guard.state === 'patrol' && guard.suspicion >= 55) {
    guard.state = 'suspicious';
  } else if (guard.state === 'suspicious' && guard.suspicion >= 55 && !seen && guard.loseT > 2) {
    guard.state = 'patrol';
  }

  for (const ring of noiseRings) {
    if (ring.fresh) guardHearNoise(guard, ring);
  }

  if (guard.state === 'patrol') guardWalkPatrol(guard, dt, walls);
  else if (guard.state === 'suspicious') guardFacePoint(guard, thief, dt);
  else if (guard.state === 'chase') guardChaseThief(guard, dt, thief, walls);
  else if (guard.state === 'investigate') guardWalkInvestigate(guard, dt, walls);
}

function guardSeesThief(guard, thief, walls, smokes) {
  if (thief.inVent) return false;
  if (!pointInsideCone(guard.x, guard.y, guard.facing, HEIST.coneRange, HEIST.coneHalfAngle, thief.x, thief.y)) return false;
  return lineOfSightClear(guard.x, guard.y, thief.x, thief.y, walls, smokes);
}

function guardWalkPatrol(guard, dt, walls) {
  if (guard.pauseT > 0) {
    guard.pauseT -= dt;
    return;
  }
  const target = guard.waypoints[guard.wpIndex];
  const d = distanceHeist(guard.x, guard.y, target[0], target[1]);
  if (d < 6) {
    guard.wpIndex = (guard.wpIndex + 1) % guard.waypoints.length;
    guard.pauseT = 0.8;
    return;
  }
  const want = angleToHeist(guard.x, guard.y, target[0], target[1]);
  guard.facing = turnToward(guard.facing, want, dt * 6);
  guardMove(guard, Math.cos(guard.facing) * HEIST.guardPatrolSpeed * dt,
    Math.sin(guard.facing) * HEIST.guardPatrolSpeed * dt, walls);
}

function guardFacePoint(guard, thief, dt) {
  const want = angleToHeist(guard.x, guard.y, thief.x, thief.y);
  guard.facing = turnToward(guard.facing, want, dt * 5);
}

function guardChaseThief(guard, dt, thief, walls) {
  const want = angleToHeist(guard.x, guard.y, thief.x, thief.y);
  guard.facing = turnToward(guard.facing, want, dt * 8);
  guardMove(guard, Math.cos(guard.facing) * HEIST.guardChaseSpeed * dt,
    Math.sin(guard.facing) * HEIST.guardChaseSpeed * dt, walls);
}

function guardWalkInvestigate(guard, dt, walls) {
  const target = guard.investigate;
  if (!target) { guard.state = 'patrol'; return; }
  const d = distanceHeist(guard.x, guard.y, target.x, target.y);
  if (d < 10) {
    guard.investigate = null;
    guard.state = 'patrol';
    guard.pauseT = 1.2;
    return;
  }
  const want = angleToHeist(guard.x, guard.y, target.x, target.y);
  guard.facing = turnToward(guard.facing, want, dt * 6);
  guardMove(guard, Math.cos(guard.facing) * HEIST.guardPatrolSpeed * 1.4 * dt,
    Math.sin(guard.facing) * HEIST.guardPatrolSpeed * 1.4 * dt, walls);
}

function guardMove(guard, dx, dy, walls) {
  const solids = walls;
  let nx = guard.x + dx;
  for (const wall of solids) {
    if (circleHitsRect(nx, guard.y, HEIST.guardRadius, wall)) { nx = guard.x; break; }
  }
  let ny = guard.y + dy;
  for (const wall of solids) {
    if (circleHitsRect(nx, ny, HEIST.guardRadius, wall)) { ny = guard.y; break; }
  }
  guard.x = clampHeist(nx, 24 + HEIST.guardRadius, 1256 - HEIST.guardRadius);
  guard.y = clampHeist(ny, 88 + HEIST.guardRadius, 696 - HEIST.guardRadius);
}

function turnToward(angle, want, maxStep) {
  const diff = angleDiffHeist(want, angle);
  if (Math.abs(diff) <= maxStep) return want;
  return angle + Math.sign(diff) * maxStep;
}

function guardIsChasing(guard) {
  return guard.state === 'chase';
}
