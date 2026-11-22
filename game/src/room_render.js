// Vaultlight — room_render.js: everything the thief sees in a room.
// Contrast first: a mid-tone floor, deep-blue shadow, saturated amber
// cones with a hard edge, gold loot that glows, a green exit beacon —
// so safe cover, danger and loot read at a glance, even shrunk small.

function roomDrawFloor(ctx, level) {
  ctx.fillStyle = HEIST.palette.floor;
  ctx.fillRect(0, HEIST.hudH, HEIST.viewW, HEIST.viewH - HEIST.hudH);
  ctx.fillStyle = HEIST.palette.floorAlt;
  const tile = 64;
  for (let y = HEIST.hudH; y < HEIST.viewH; y += tile) {
    for (let x = 0; x < HEIST.viewW; x += tile) {
      if (((x / tile) + (y / tile)) % 2 === 0) ctx.fillRect(x, y, tile, tile);
    }
  }
  for (const rug of level.rugs) {
    ctx.fillStyle = HEIST.palette.carpet;
    ctx.fillRect(rug.x, rug.y, rug.w, rug.h);
    ctx.strokeStyle = 'rgba(201,162,39,0.7)';
    ctx.lineWidth = 3;
    ctx.strokeRect(rug.x + 6, rug.y + 6, rug.w - 12, rug.h - 12);
  }
  for (const shadow of level.shadows) {
    ctx.fillStyle = HEIST.palette.shadow;
    ctx.fillRect(shadow.x, shadow.y, shadow.w, shadow.h);
  }
  roomDrawDecor(ctx, level);
}

// V2 richness, kept in the merge: wall paintings, potted plants,
// stanchion ropes and warm lamp glow — the room reads as a place.
function roomDrawDecor(ctx, level) {
  const paintings = [
    { x: 420, y: 92, w: 70, h: 44, hue: '#7fb3d5' },
    { x: 900, y: 92, w: 70, h: 44, hue: '#d58a7f' },
    { x: 1120, y: 92, w: 70, h: 44, hue: '#8fd5a8' }
  ];
  for (const p of paintings) {
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(p.x - 4, p.y - 4, p.w + 8, p.h + 8);
    ctx.fillStyle = p.hue;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = 'rgba(20,24,34,0.5)';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + p.h);
    ctx.lineTo(p.x + p.w / 2, p.y + 6);
    ctx.lineTo(p.x + p.w, p.y + p.h);
    ctx.closePath();
    ctx.fill();
  }
  const plants = [
    { x: 60, y: 640 }, { x: 1220, y: 640 }, { x: 60, y: 120 }
  ];
  for (const plant of plants) {
    ctx.fillStyle = '#8d5a2b';
    ctx.fillRect(plant.x - 10, plant.y - 8, 20, 16);
    ctx.fillStyle = '#3f7d44';
    ctx.beginPath();
    ctx.arc(plant.x, plant.y - 16, 14, 0, Math.PI * 2);
    ctx.arc(plant.x - 10, plant.y - 8, 9, 0, Math.PI * 2);
    ctx.arc(plant.x + 10, plant.y - 8, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  const lamps = [
    { x: 320, y: 300 }, { x: 960, y: 300 }, { x: 640, y: 600 }
  ];
  for (const lamp of lamps) {
    const glow = ctx.createRadialGradient(lamp.x, lamp.y, 4, lamp.x, lamp.y, 130);
    glow.addColorStop(0, 'rgba(255,214,130,0.20)');
    glow.addColorStop(1, 'rgba(255,214,130,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, 130, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd682';
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const c of level.cases) {
    ctx.strokeStyle = 'rgba(201,162,39,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.x - 14, c.y + c.h + 14);
    ctx.quadraticCurveTo(c.x + c.w / 2, c.y + c.h + 26, c.x + c.w + 14, c.y + c.h + 14);
    ctx.stroke();
    ctx.fillStyle = '#c9a227';
    ctx.beginPath();
    ctx.arc(c.x - 14, c.y + c.h + 14, 4, 0, Math.PI * 2);
    ctx.arc(c.x + c.w + 14, c.y + c.h + 14, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function roomDrawPatrolPaths(ctx, guards) {
  ctx.save();
  ctx.strokeStyle = 'rgba(242,234,216,0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 10]);
  for (const guard of guards) {
    ctx.beginPath();
    guard.waypoints.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
    for (const [x, y] of guard.waypoints) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(242,234,216,0.55)';
      ctx.fill();
    }
  }
  ctx.restore();
}

function roomDrawVents(ctx, vents) {
  for (const vent of vents) {
    ctx.save();
    ctx.strokeStyle = HEIST.palette.ventSteel;
    ctx.lineWidth = 16;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    vent.path.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(20,24,34,0.9)';
    ctx.beginPath();
    vent.path.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    for (const p of [vent.path[0], vent.path[vent.path.length - 1]]) {
      ctx.fillStyle = '#5d6779';
      ctx.fillRect(p.x - 14, p.y - 14, 28, 28);
      ctx.strokeStyle = HEIST.palette.text;
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x - 14, p.y - 14, 28, 28);
      ctx.fillStyle = HEIST.palette.text;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VENT', p.x, p.y - 20);
    }
    ctx.restore();
  }
}

function roomDrawLoot(ctx, lootList, time) {
  for (const item of lootList) {
    if (item.taken) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = HEIST.palette.textDim;
      ctx.lineWidth = 2;
      ctx.strokeRect(item.x - 16, item.y - 12, 32, 24);
      ctx.restore();
      continue;
    }
    const pulse = 0.5 + 0.25 * Math.sin(time * 3 + item.x);
    ctx.save();
    ctx.shadowColor = HEIST.palette.lootGlow;
    ctx.shadowBlur = 28 * pulse;
    if (item.kind === 'painting') {
      ctx.fillStyle = '#c9a227';
      ctx.fillRect(item.x - 22, item.y - 16, 44, 32);
      ctx.fillStyle = '#7fb3d5';
      ctx.fillRect(item.x - 18, item.y - 12, 36, 24);
      ctx.fillStyle = '#2c4a63';
      ctx.beginPath();
      ctx.moveTo(item.x - 18, item.y + 12);
      ctx.lineTo(item.x, item.y - 8);
      ctx.lineTo(item.x + 18, item.y + 12);
      ctx.closePath();
      ctx.fill();
    } else if (item.kind === 'statue') {
      ctx.fillStyle = '#8d97a8';
      ctx.fillRect(item.x - 12, item.y + 4, 24, 10);
      ctx.fillStyle = HEIST.palette.lootGold;
      ctx.beginPath();
      ctx.moveTo(item.x, item.y - 16);
      ctx.lineTo(item.x + 9, item.y + 4);
      ctx.lineTo(item.x - 9, item.y + 4);
      ctx.closePath();
      ctx.fill();
    } else if (item.kind === 'gold') {
      ctx.fillStyle = HEIST.palette.lootGold;
      ctx.fillRect(item.x - 14, item.y - 6, 28, 12);
      ctx.fillRect(item.x - 10, item.y - 14, 20, 9);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(item.x - 14, item.y - 6, 28, 3);
    } else if (item.kind === 'diamond') {
      ctx.fillStyle = '#9be8ff';
      ctx.beginPath();
      ctx.moveTo(item.x, item.y - 16);
      ctx.lineTo(item.x + 13, item.y - 2);
      ctx.lineTo(item.x, item.y + 12);
      ctx.lineTo(item.x - 13, item.y - 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.moveTo(item.x, item.y - 16);
      ctx.lineTo(item.x + 6, item.y - 2);
      ctx.lineTo(item.x - 6, item.y - 2);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = '#f2ead8';
      ctx.fillRect(item.x - 13, item.y - 10, 26, 20);
      ctx.strokeStyle = '#5d6779';
      ctx.lineWidth = 1;
      ctx.strokeRect(item.x - 13, item.y - 10, 26, 20);
      ctx.beginPath();
      ctx.moveTo(item.x - 8, item.y - 3);
      ctx.lineTo(item.x + 8, item.y - 3);
      ctx.moveTo(item.x - 8, item.y + 3);
      ctx.lineTo(item.x + 8, item.y + 3);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = HEIST.palette.text;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.name.toUpperCase(), item.x, item.y - 24);
  }
}

function roomDrawExit(ctx, level, quotaMet, time) {
  const exit = level.exit;
  const glow = quotaMet ? 0.6 + 0.3 * Math.sin(time * 4) : 0.15;
  ctx.save();
  ctx.shadowColor = HEIST.palette.exitGreen;
  ctx.shadowBlur = 30 * glow;
  ctx.fillStyle = quotaMet ? HEIST.palette.exitGreen : '#2c5c40';
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
  ctx.restore();
  ctx.fillStyle = '#0b1f14';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  if (exit.label === 'VAN') {
    ctx.save();
    ctx.translate(exit.x + exit.w / 2, exit.y + exit.h / 2);
    ctx.fillStyle = quotaMet ? '#e9e4d6' : '#5d6779';
    ctx.fillRect(-26, -14, 52, 28);
    ctx.fillStyle = '#1d212b';
    ctx.fillRect(-20, -8, 12, 10);
    ctx.fillRect(4, -8, 12, 10);
    ctx.restore();
  }
  ctx.fillStyle = quotaMet ? HEIST.palette.exitGreen : HEIST.palette.textDim;
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(exit.label, exit.x + exit.w / 2, exit.y - 10);
  if (quotaMet) {
    ctx.fillStyle = HEIST.palette.exitGreen;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('◀ GETAWAY', exit.x - 12, exit.y + exit.h / 2 + 5);
    ctx.textAlign = 'center';
  }
}

// V4 feel, kept in the merge: a red vignette pulsing as the alarm climbs.
function roomDrawAlarmVignette(ctx, alarm, time) {
  if (alarm.value < 60) return;
  const pulse = 0.25 + 0.2 * Math.sin(time * 5);
  const grad = ctx.createRadialGradient(
    HEIST.viewW / 2, HEIST.viewH / 2, HEIST.viewH * 0.35,
    HEIST.viewW / 2, HEIST.viewH / 2, HEIST.viewH * 0.75);
  grad.addColorStop(0, 'rgba(255,40,20,0)');
  grad.addColorStop(1, 'rgba(255,40,20,' + pulse + ')');
  ctx.fillStyle = grad;
  ctx.fillRect(0, HEIST.hudH, HEIST.viewW, HEIST.viewH - HEIST.hudH);
}

function roomDrawCases(ctx, level) {
  for (const c of level.cases) {
    ctx.fillStyle = '#2c3442';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = 'rgba(160,200,230,0.35)';
    ctx.fillRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8);
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = HEIST.palette.lootGold;
    ctx.beginPath();
    ctx.arc(c.x + c.w / 2, c.y + c.h / 2, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function roomDrawWalls(ctx, level) {
  for (const wall of level.walls) {
    ctx.fillStyle = HEIST.palette.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.strokeStyle = HEIST.palette.wallTrim;
    ctx.lineWidth = 1;
    ctx.strokeRect(wall.x + 0.5, wall.y + 0.5, wall.w - 1, wall.h - 1);
  }
}

function roomDrawCone(ctx, points, fill, edge) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function roomDrawGuards(ctx, guards, walls) {
  for (const guard of guards) {
    const alert = guard.state === 'chase';
    const cone = computeVisionCone(guard.x, guard.y, guard.facing, HEIST.coneRange, HEIST.coneHalfAngle, walls);
    roomDrawCone(ctx, cone, alert ? HEIST.palette.coneAlert : HEIST.palette.cone,
      alert ? 'rgba(255,90,70,0.95)' : HEIST.palette.coneEdge);
    ctx.save();
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, HEIST.guardRadius, 0, Math.PI * 2);
    ctx.fillStyle = HEIST.palette.guardBody;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = HEIST.palette.guardOutline;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(guard.x + Math.cos(guard.facing) * 8, guard.y + Math.sin(guard.facing) * 8, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#1d212b';
    ctx.fill();
    ctx.restore();
    if (guard.state === 'suspicious' || guard.state === 'investigate') {
      roomDrawMark(ctx, guard.x, guard.y - 30, '?', '#ffd24a');
    } else if (guard.state === 'chase') {
      roomDrawMark(ctx, guard.x, guard.y - 30, '!', '#ff4530');
    }
    if (guard.suspicion > 5 && guard.suspicion < 100) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(guard.x - 18, guard.y + 20, 36, 6);
      ctx.fillStyle = guard.suspicion >= 55 ? '#ff9a3d' : '#ffd24a';
      ctx.fillRect(guard.x - 18, guard.y + 20, 36 * guard.suspicion / 100, 6);
    }
  }
}

function roomDrawMark(ctx, x, y, text, color) {
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function roomDrawCameras(ctx, cameras, walls, empTimer, time) {
  for (const camera of cameras) {
    const disabled = empTimer > 0;
    const cone = computeVisionCone(camera.x, camera.y, camera.facing, HEIST.cameraRange, HEIST.cameraHalfAngle, walls);
    if (disabled) {
      roomDrawCone(ctx, cone, 'rgba(120,130,145,0.18)', 'rgba(160,170,185,0.6)');
    } else {
      roomDrawCone(ctx, cone, camera.alarmed ? 'rgba(255,64,48,0.4)' : HEIST.palette.cameraCone,
        camera.alarmed ? 'rgba(255,90,70,0.95)' : HEIST.palette.cameraEdge);
    }
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.rotate(camera.facing);
    ctx.fillStyle = disabled ? '#5d6779' : '#1d212b';
    ctx.fillRect(-4, -7, 18, 14);
    ctx.fillStyle = camera.alarmed ? '#ff4530' : disabled ? '#8d97a8' : '#9be8ff';
    ctx.beginPath();
    ctx.arc(14, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (disabled) {
      ctx.fillStyle = HEIST.palette.text;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OFF ' + Math.ceil(empTimer) + 's', camera.x, camera.y - 18);
    } else if (camera.alarmed) {
      roomDrawMark(ctx, camera.x, camera.y - 18, '!', '#ff4530');
    }
  }
}

function roomDrawThief(ctx, thief, carrying) {
  ctx.save();
  if (thief.inVent) ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, HEIST.thiefRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#232833';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffd24a';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(thief.x + Math.cos(thief.facing) * 7, thief.y + Math.sin(thief.facing) * 7, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#f2ead8';
  ctx.fill();
  if (carrying > 0) {
    ctx.fillStyle = HEIST.palette.lootGold;
    ctx.beginPath();
    ctx.arc(thief.x - Math.cos(thief.facing) * 12, thief.y - Math.sin(thief.facing) * 12, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  for (const ring of thief.rings) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ring.t / 0.7) * 0.6;
    ctx.strokeStyle = '#ffb23a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function roomDrawSmoke(ctx, smokes) {
  for (const smoke of smokes) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, smoke.t / 1.5) * 0.85;
    ctx.fillStyle = HEIST.palette.smokeFill;
    ctx.beginPath();
    ctx.arc(smoke.x, smoke.y, smoke.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(smoke.x - 30, smoke.y + 10, smoke.r * 0.6, 0, Math.PI * 2);
    ctx.arc(smoke.x + 28, smoke.y - 12, smoke.r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
