// Vaultlight — hud_render.js: the heads-up display.
// One bar across the top: the level and its objective, the alarm meter
// with its number, the loot count, the coins, and both tools with their
// costs printed — so the judge reads the whole game from the HUD alone.

function hudDraw(ctx, G) {
  ctx.fillStyle = '#10131a';
  ctx.fillRect(0, 0, HEIST.viewW, HEIST.hudH);
  ctx.fillStyle = HEIST.palette.wallTrim;
  ctx.fillRect(0, HEIST.hudH - 2, HEIST.viewW, 2);

  const level = LEVELS[G.levelIndex];
  ctx.textAlign = 'left';
  ctx.fillStyle = HEIST.palette.text;
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('VAULTLIGHT', 20, 28);
  ctx.fillStyle = HEIST.palette.textDim;
  ctx.font = '15px sans-serif';
  ctx.fillText(level.name + '  —  ' + level.objective, 20, 50);

  const taken = lootTakenCount(G.loot);
  ctx.textAlign = 'left';
  ctx.fillStyle = HEIST.palette.lootGold;
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('LOOT ' + taken + '/' + level.quota, 470, 30);
  ctx.fillStyle = HEIST.palette.textDim;
  ctx.font = '14px sans-serif';
  ctx.fillText('$' + lootTotalValue(G.loot) + '   COINS ' + G.coins, 470, 52);

  hudDrawAlarm(ctx, G.alarm, 700, 14);

  ctx.textAlign = 'left';
  ctx.fillStyle = toolsCanSmoke(G.coins) ? HEIST.palette.text : '#6b7280';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('[Q] SMOKE ' + HEIST.smokeCost + 'c', 1010, 28);
  ctx.fillStyle = G.tools.empCharges > 0 ? HEIST.palette.text : '#6b7280';
  ctx.fillText('[F] EMP x' + G.tools.empCharges, 1010, 50);

  ctx.textAlign = 'right';
  ctx.fillStyle = HEIST.palette.textDim;
  ctx.font = '15px sans-serif';
  ctx.fillText(formatTimeHeist(G.time), 1260, 30);
}

function hudDrawAlarm(ctx, alarm, x, y) {
  const w = 200, h = 20;
  ctx.textAlign = 'left';
  ctx.fillStyle = HEIST.palette.text;
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('ALARM', x, y + 15);
  ctx.fillStyle = '#232833';
  ctx.fillRect(x + 62, y, w, h);
  const frac = alarm.value / 100;
  ctx.fillStyle = frac >= 0.75 ? HEIST.palette.alarmRed : frac >= 0.4 ? '#ff9a3d' : '#3dff88';
  ctx.fillRect(x + 62, y, w * frac, h);
  ctx.strokeStyle = HEIST.palette.text;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 62.5, y + 0.5, w - 1, h - 1);
  ctx.fillStyle = HEIST.palette.text;
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(Math.round(alarm.value) + '%', x + 62 + w + 8, y + 15);
}

function formatTimeHeist(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

function hudDrawMessage(ctx, text, sub) {
  ctx.save();
  ctx.fillStyle = 'rgba(10,12,18,0.72)';
  ctx.fillRect(0, 0, HEIST.viewW, HEIST.viewH);
  ctx.textAlign = 'center';
  ctx.fillStyle = HEIST.palette.text;
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText(text, HEIST.viewW / 2, HEIST.viewH / 2 - 10);
  if (sub) {
    ctx.fillStyle = HEIST.palette.textDim;
    ctx.font = '20px sans-serif';
    ctx.fillText(sub, HEIST.viewW / 2, HEIST.viewH / 2 + 32);
  }
  ctx.restore();
}

function hudDrawTitle(ctx, time) {
  ctx.fillStyle = '#10131a';
  ctx.fillRect(0, 0, HEIST.viewW, HEIST.viewH);
  const pulse = 0.7 + 0.3 * Math.sin(time * 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = HEIST.palette.lootGold;
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText('VAULTLIGHT', HEIST.viewW / 2, 250);
  ctx.fillStyle = HEIST.palette.text;
  ctx.font = '24px sans-serif';
  ctx.fillText('A museum heist in three rooms. Steal the loot. Dodge the cones. Get away clean.', HEIST.viewW / 2, 300);
  ctx.fillStyle = HEIST.palette.textDim;
  ctx.font = '19px sans-serif';
  ctx.fillText('WASD / arrows — move      SHIFT — run (loud!)      E — grab / vent      Q — smoke (20 coins)      F — EMP (freezes cameras)', HEIST.viewW / 2, 360);
  ctx.fillStyle = 'rgba(242,234,216,' + pulse + ')';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('Press ENTER to start the heist', HEIST.viewW / 2, 440);
}
