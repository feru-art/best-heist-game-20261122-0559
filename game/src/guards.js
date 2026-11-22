// V7 "Blueprint" — guard patrol AI, suspicion, cameras and line of sight.
// Guards walk waypoints, sweep their cones, grow suspicious when they see
// the thief, investigate the last seen spot, and chase only at high
// suspicion — a caught moment that is fair, never an instant fail.

function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function segmentBlocked(x0, y0, x1, y1, solids) {
  const dx = x1 - x0, dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist / 8));
  for (let i = 1; i < steps; i++) {
    const t = i / steps, px = x0 + dx * t, py = y0 + dy * t;
    for (const s of solids) if (pointInRect(px, py, s)) return true;
  }
  return false;
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Does a viewer at (vx,vy) facing `facing` see (tx,ty)?
function canSee(vx, vy, facing, range, half, tx, ty, solids) {
  const dx = tx - vx, dy = ty - vy;
  const d = Math.hypot(dx, dy);
  if (d > range) return false;
  if (Math.abs(angleDiff(Math.atan2(dy, dx), facing)) > half) return false;
  return !segmentBlocked(vx, vy, tx, ty, solids);
}

class Guard {
  constructor(def) {
    this.path = def.path;
    this.speed = def.speed || CFG.GUARD_SPEED;
    this.x = def.path[0][0]; this.y = def.path[0][1];
    this.wp = 1;
    this.facing = Math.atan2(def.path[1][1] - this.y, def.path[1][0] - this.x);
    this.state = 'patrol'; // patrol | investigate | chase
    this.suspicion = 0;
    this.lastSeen = null;
    this.loseTimer = 0;
    this.distract = null; // {x, y, t} decoy lure
  }

  update(dt, player, solids, alarmOn) {
    const speedMul = alarmOn ? 1.35 : 1;
    const hidden = player.inVent || player.smoked;
    const sees = !hidden && canSee(this.x, this.y, this.facing,
      CFG.CONE_RANGE, CFG.CONE_HALF, player.x, player.y, solids);
    if (sees) {
      this.suspicion = Math.min(100, this.suspicion + CFG.SUS_RISE * dt);
      this.lastSeen = { x: player.x, y: player.y };
      this.loseTimer = 0;
    } else {
      this.suspicion = Math.max(0, this.suspicion - CFG.SUS_FALL * dt);
      this.loseTimer += dt;
    }
    if (this.distract && this.distract.t > 0) {
      this.distract.t -= dt;
      this.moveToward(this.distract.x, this.distract.y, this.speed * speedMul, dt);
      if (this.distract.t <= 0) this.distract = null;
      return this.suspicion;
    }
    if (this.suspicion >= CFG.CHASE_AT && this.lastSeen) {
      this.state = 'chase';
      this.moveToward(this.lastSeen.x, this.lastSeen.y, CFG.CHASE_SPEED * speedMul, dt);
      if (this.loseTimer > 2.5) { this.state = 'investigate'; }
    } else if (this.suspicion > 25 && this.lastSeen) {
      this.state = 'investigate';
      this.moveToward(this.lastSeen.x, this.lastSeen.y, this.speed * 1.15 * speedMul, dt);
      if (Math.hypot(this.x - this.lastSeen.x, this.y - this.lastSeen.y) < 18) {
        this.lastSeen = null; this.state = 'patrol';
      }
    } else {
      this.state = 'patrol';
      const t = this.path[this.wp];
      this.moveToward(t[0], t[1], this.speed * speedMul, dt);
      if (Math.hypot(this.x - t[0], this.y - t[1]) < 10) {
        this.wp = (this.wp + 1) % this.path.length;
      }
    }
    return this.suspicion;
  }

  moveToward(tx, ty, speed, dt) {
    const dx = tx - this.x, dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 1) return;
    const step = Math.min(d, speed * dt);
    this.facing = Math.atan2(dy, dx);
    this.x += (dx / d) * step;
    this.y += (dy / d) * step;
  }

  catches(player) {
    return this.state === 'chase' &&
      Math.hypot(this.x - player.x, this.y - player.y) < CFG.GUARD_R + CFG.PLAYER_R - 2;
  }
}

class Camera {
  constructor(def) {
    this.x = def.x; this.y = def.y;
    this.a0 = def.a0; this.a1 = def.a1;
    this.speed = def.speed || 0.55;
    this.t = 0; this.frozen = 0;
    this.facing = (def.a0 + def.a1) / 2;
  }

  update(dt) {
    if (this.frozen > 0) { this.frozen -= dt; return; }
    this.t += dt * this.speed;
    const k = (Math.sin(this.t) + 1) / 2;
    this.facing = this.a0 + (this.a1 - this.a0) * k;
  }

  sees(player, solids) {
    if (this.frozen > 0) return false;
    if (player.inVent || player.smoked) return false;
    return canSee(this.x, this.y, this.facing,
      CFG.CAM_RANGE, CFG.CAM_HALF, player.x, player.y, solids);
  }
}
