// V7 "Blueprint" — the thief: movement, wall collision, vent stealth,
// loot pickup, tools (decoy lure and EMP camera freeze).
class Player {
  constructor(spawn) {
    this.x = spawn.x; this.y = spawn.y;
    this.r = CFG.PLAYER_R;
    this.facing = 0;
    this.inVent = false;
    this.smoked = false;
    this.coins = 60;
    this.lootGot = 0;
    this.decoys = []; // active lure points {x,y,t}
  }

  reset(spawn) {
    this.x = spawn.x; this.y = spawn.y;
    this.inVent = false; this.smoked = false;
    this.lootGot = 0; this.decoys = [];
  }

  move(dx, dy, dt, solids, vents) {
    const len = Math.hypot(dx, dy);
    if (len < 0.01) return;
    const speed = this.inVent ? CFG.VENT_SPEED : CFG.PLAYER_SPEED;
    const nx = this.x + (dx / len) * speed * dt;
    const ny = this.y + (dy / len) * speed * dt;
    this.facing = Math.atan2(dy, dx);
    if (!this.hits(nx, this.y, solids)) this.x = nx;
    if (!this.hits(this.x, ny, solids)) this.y = ny;
    this.x = Math.max(this.r, Math.min(CFG.W - this.r, this.x));
    this.y = Math.max(CFG.HUD + this.r, Math.min(CFG.H - this.r, this.y));
    this.inVent = vents.some((v) => pointInRect(this.x, this.y, v));
  }

  hits(x, y, solids) {
    for (const s of solids) {
      const cx = Math.max(s.x, Math.min(x, s.x + s.w));
      const cy = Math.max(s.y, Math.min(y, s.y + s.h));
      if (Math.hypot(x - cx, y - cy) < this.r) return true;
    }
    return false;
  }

  // Throw a decoy lure toward (tx,ty); every guard in earshot investigates it.
  throwDecoy(tx, ty, guards) {
    if (this.coins < CFG.TOOLS.decoy.cost) return false;
    this.coins -= CFG.TOOLS.decoy.cost;
    const d = { x: tx, y: ty, t: 4 };
    this.decoys.push(d);
    for (const g of guards) {
      if (Math.hypot(g.x - tx, g.y - ty) < 420) g.distract = { x: tx, y: ty, t: 3 };
    }
    return true;
  }

  fireEMP(cameras) {
    if (this.coins < CFG.TOOLS.emp.cost) return false;
    this.coins -= CFG.TOOLS.emp.cost;
    for (const c of cameras) c.frozen = 5;
    return true;
  }

  // Pick up loot within reach; returns how many were taken.
  grabLoot(loot) {
    let got = 0;
    for (const l of loot) {
      if (!l.taken && Math.hypot(this.x - l.x, this.y - l.y) < this.r + 20) {
        l.taken = true; got++;
        this.lootGot++;
        this.coins += 25;
      }
    }
    return got;
  }

  atExit(exit, quotaMet) {
    return quotaMet && pointInRect(this.x, this.y, exit);
  }
}
