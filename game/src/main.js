// V7 "Blueprint" — game loop, state machine, input, HUD state, sound.
// States: title -> plan (draw your route) -> play -> caught | levelclear |
// win. A ?shot= query jumps straight into a staged play pose.
const game = {
  state: 'title',
  levelIndex: 0,
  level: null,
  guards: [],
  cameras: [],
  player: null,
  solids: [],
  alarm: 0,
  lockdown: false,
  route: [],
  planBonus: false,
  time: 0,
  muted: false,
  audio: null,
  msg: '',
  msgT: 0,
};

function beep(freq, dur, type) {
  if (game.muted) return;
  try {
    if (!game.audio) game.audio = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = game.audio;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch (e) { /* audio unavailable: play silent */ }
}

function loadLevel(i) {
  const def = LEVELS[i];
  game.levelIndex = i;
  game.level = JSON.parse(JSON.stringify(def));
  game.level.quotaMet = false;
  game.guards = def.guards.map((g) => new Guard(g));
  game.cameras = def.cameras.map((c) => new Camera(c));
  game.player = new Player(def.spawn);
  if (i > 0) {
    // Carry coins forward between levels.
    game.player.coins = game.carryCoins || 60;
  }
  game.solids = [...game.level.walls, ...game.level.cover];
  game.alarm = 0;
  game.lockdown = false;
  game.route = [];
  game.planBonus = false;
  game.state = 'plan';
}

function startPlay() {
  game.state = 'play';
  game.msg = game.route.length > 1
    ? 'PLAN LOCKED — follow the white line for a bonus!'
    : 'NO PLAN — improvise!';
  game.msgT = 2.5;
}

function update(dt) {
  game.time += dt;
  if (game.msgT > 0) game.msgT -= dt;
  if (game.state !== 'play') return;
  const p = game.player;
  // Movement.
  let dx = 0, dy = 0;
  if (keys['w'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['arrowdown']) dy += 1;
  if (keys['a'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;
  p.move(dx, dy, dt, game.solids, game.level.vents);
  // Loot.
  const got = p.grabLoot(game.level.loot);
  if (got > 0) {
    beep(880, 0.12, 'triangle');
    game.msg = 'LOOT SECURED +' + (25 * got) + ' coins';
    game.msgT = 1.6;
  }
  game.level.quotaMet = p.lootGot >= game.level.quota;
  // Guards + cameras.
  let spotted = false;
  for (const g of game.guards) {
    const s = g.update(dt, p, game.solids, game.lockdown);
    if (s > 50) spotted = true;
    if (g.catches(p)) return caught();
  }
  for (const c of game.cameras) {
    c.update(dt);
    if (c.sees(p, game.solids)) {
      spotted = true;
      game.alarm = Math.min(100, game.alarm + 22 * dt);
    }
  }
  // Alarm.
  if (spotted) game.alarm = Math.min(100, game.alarm + CFG.ALARM_RISE * dt);
  else game.alarm = Math.max(0, game.alarm - CFG.ALARM_FALL * dt);
  if (game.alarm >= 100 && !game.lockdown) {
    game.lockdown = true;
    game.msg = 'LOCKDOWN! Guards move faster!';
    game.msgT = 2.5;
    beep(180, 0.4, 'sawtooth');
  }
  // Plan bonus: visited every waypoint, then exit.
  if (game.route.length > 1 && !game.planBonus) {
    const allHit = game.route.every((w) => w.hit || Math.hypot(p.x - w.x, p.y - w.y) < 34);
    game.route.forEach((w) => { if (Math.hypot(p.x - w.x, p.y - w.y) < 34) w.hit = true; });
    if (allHit) {
      game.planBonus = true;
      p.coins += 25;
      game.msg = 'PLAN BONUS +25 coins — the blueprint pays off!';
      game.msgT = 2.5;
      beep(660, 0.15, 'triangle');
    }
  }
  // Exit.
  if (p.atExit(game.level.exit, game.level.quotaMet)) {
    game.carryCoins = p.coins;
    beep(523, 0.12, 'triangle');
    setTimeout(() => beep(784, 0.2, 'triangle'), 120);
    if (game.levelIndex + 1 >= LEVELS.length) {
      game.state = 'win';
    } else {
      game.state = 'levelclear';
    }
  }
}

function caught() {
  game.state = 'caught';
  beep(140, 0.5, 'sawtooth');
}

const keys = {};
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (k === 'm') { game.muted = !game.muted; return; }
  if (game.state === 'title' && k === 'enter') { loadLevel(0); return; }
  if (game.state === 'plan') {
    if (k === 'enter' || k === ' ') { e.preventDefault(); startPlay(); }
    if (k === 's') { game.route = []; startPlay(); }
    return;
  }
  if (game.state === 'play') {
    if (k === '1') {
      const ok = game.player.throwDecoy(
        game.player.x + Math.cos(game.player.facing) * 150,
        game.player.y + Math.sin(game.player.facing) * 150, game.guards);
      if (ok) { beep(300, 0.1, 'square'); game.msg = 'DECOY thrown!'; game.msgT = 1.2; }
      else { game.msg = 'Not enough coins for DECOY'; game.msgT = 1.2; }
    }
    if (k === '2') {
      const ok = game.player.fireEMP(game.cameras);
      if (ok) { beep(1200, 0.2, 'sawtooth'); game.msg = 'EMP! Cameras frozen 5s'; game.msgT = 1.6; }
      else { game.msg = 'Not enough coins for EMP'; game.msgT = 1.2; }
    }
    if (k === 'r') { loadLevel(game.levelIndex); game.state = 'play'; }
    return;
  }
  if (game.state === 'caught' && k === 'r') { loadLevel(game.levelIndex); game.state = 'play'; }
  if (game.state === 'levelclear' && k === 'enter') { loadLevel(game.levelIndex + 1); }
  if (game.state === 'win' && k === 'enter') { loadLevel(0); }
});
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (CFG.W / r.width),
    y: (e.clientY - r.top) * (CFG.H / r.height),
  };
}
let canvas;
window.addEventListener('load', () => {
  canvas = document.getElementById('game');
  canvas.addEventListener('click', (e) => {
    if (game.state !== 'plan') return;
    const pos = canvasPos(e);
    if (pos.y > CFG.HUD && game.route.length < 8) {
      game.route.push({ x: Math.round(pos.x), y: Math.round(pos.y) });
      beep(700, 0.06, 'sine');
    }
  });
});

function drawOverlay(title, sub, hint) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(4,12,38,0.82)';
  ctx.fillRect(0, 0, CFG.W, CFG.H);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 54px sans-serif';
  ctx.fillText(title, CFG.W / 2, 280);
  ctx.font = '22px sans-serif';
  ctx.fillStyle = '#cdd9ff';
  sub.split('\n').forEach((line, i) => ctx.fillText(line, CFG.W / 2, 330 + i * 32));
  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = PAL.loot;
  ctx.fillText(hint, CFG.W / 2, 480);
}

function draw() {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, CFG.W, CFG.H);
  if (game.state === 'title') {
    ctx.fillStyle = PAL.paper;
    ctx.fillRect(0, 0, CFG.W, CFG.H);
    ctx.strokeStyle = PAL.grid;
    for (let x = 0; x <= CFG.W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CFG.H); ctx.stroke();
    }
    drawOverlay('BLUEPRINT',
      'The heist, drawn in lines.\nPlan your route on the blueprint — then run it.\nDodge cones, grab the gold, reach the getaway van.',
      'Press ENTER to start');
    return;
  }
  drawRoom(ctx, game.level);
  drawRoute(ctx, game.route);
  drawLoot(ctx, game.level.loot, game.time);
  drawGuards(ctx, game.guards);
  drawCameras(ctx, game.cameras);
  drawPlayer(ctx, game.player);
  // Active decoys.
  for (const d of game.player.decoys) {
    if (d.t <= 0) continue;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(d.x, d.y, 12 + (4 - d.t) * 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  drawHUD(ctx, game);
  if (game.msgT > 0) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(game.msg, CFG.W / 2, CFG.HUD + 34);
  }
  if (game.state === 'plan') {
    drawOverlay('PLAN PHASE — ' + game.level.name,
      'Click the blueprint to draw your route (up to 8 points).\nFollow the white line during the run for a +25 coin bonus.\nVents hide you. Cones are danger. Gold is the goal.',
      'ENTER to execute  ·  S to skip planning');
  } else if (game.state === 'caught') {
    drawOverlay('CAUGHT!',
      'The guard got you. The blueprint had a hole in it.\nStudy the cones, use the vents, try a new route.',
      'Press R to retry the level');
  } else if (game.state === 'levelclear') {
    drawOverlay('CLEAN GETAWAY',
      'Level clear! The van is rolling.\nCoins carried to the next floor: ' + game.player.coins,
      'Press ENTER for the next level');
  } else if (game.state === 'win') {
    drawOverlay('THE BLUEPRINT JOB — COMPLETE',
      'Three floors, every vault emptied, no alarm left ringing.\nTotal coins: ' + game.player.coins,
      'Press ENTER to run it again');
  }
}

let last = 0;
function loop(t) {
  const dt = Math.min(0.05, (t - last) / 1000 || 0);
  last = t;
  // Staged screenshots freeze the simulation: the pose stays exactly as
  // staged instead of playing forward into a caught/game-over state.
  if (!game.frozen) update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('load', () => {
  loadLevel(0);
  game.state = 'title';
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (shot) {
    document.body.classList.add('shot');
    loadLevel(0);
    applyShot(game, shot);
    game.frozen = true;
  }
  requestAnimationFrame(loop);
});
