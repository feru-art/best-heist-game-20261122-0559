// V7 "Blueprint" — staged screenshot states (?shot=cover|routes|alarm|getaway).
// Each stage puts the game in a fixed, deterministic pose so the screenshots
// are real renders of the game's own code, reproducible every run.
function applyShot(game, name) {
  const level = game.level;
  const p = game.player;
  const resetGuards = () => {
    game.guards.forEach((g) => { g.suspicion = 0; g.state = 'patrol'; g.lastSeen = null; });
  };
  if (name === 'cover') {
    // HERO FRAME: thief centre, two big cones sweeping toward them, camera
    // cone, gold loot, exit and a 45% alarm — every C1 element in one frame.
    game.state = 'play';
    p.x = 700; p.y = 420; p.lootGot = 1; p.coins = 85;
    level.loot[0].taken = true;
    game.alarm = 45;
    const g0 = game.guards[0], g1 = game.guards[1];
    g0.x = 470; g0.y = 260; g0.facing = Math.atan2(p.y - g0.y, p.x - g0.x);
    g0.suspicion = 42;
    g1.x = 830; g1.y = 520; g1.facing = Math.atan2(p.y - g1.y, p.x - g1.x);
    g1.suspicion = 30;
    game.cameras[0].facing = 1.35;
    game.route = [
      { x: 90, y: 620 }, { x: 300, y: 480 }, { x: 470, y: 480 },
      { x: 640, y: 400 }, { x: 900, y: 420 }, { x: 1150, y: 600 },
    ];
    game.planBonus = false;
  } else if (name === 'routes') {
    // The thief inside the vent duct: the hidden second route.
    game.state = 'play';
    p.x = 640; p.y = 137; p.inVent = true; p.lootGot = 0; p.coins = 60;
    game.alarm = 12;
    resetGuards();
    game.guards[0].x = 420; game.guards[0].y = 400;
    game.guards[0].facing = Math.PI / 2;
    game.guards[1].x = 980; game.guards[1].y = 300;
    game.guards[1].facing = -Math.PI / 2;
    game.route = [ { x: 90, y: 620 }, { x: 200, y: 137 }, { x: 640, y: 137 } ];
  } else if (name === 'alarm') {
    // High alarm: EMP-frozen camera, chasing guard, red vignette.
    game.state = 'play';
    p.x = 760; p.y = 420; p.lootGot = 2; p.coins = 110;
    level.loot[0].taken = true; level.loot[1].taken = true;
    game.alarm = 82;
    game.cameras[0].frozen = 4;
    const g0 = game.guards[0];
    g0.x = 620; g0.y = 380; g0.suspicion = 100; g0.state = 'chase';
    g0.facing = Math.atan2(p.y - g0.y, p.x - g0.x);
    g0.lastSeen = { x: p.x, y: p.y };
    game.guards[1].x = 1000; game.guards[1].y = 300;
    game.guards[1].suspicion = 55;
    game.guards[1].facing = Math.atan2(p.y - 300, p.x - 1000);
  } else if (name === 'getaway') {
    // Quota met, exit open, thief at the getaway door.
    game.state = 'play';
    level.loot.forEach((l) => { l.taken = true; });
    p.lootGot = level.quota; p.coins = 135;
    p.x = 1130; p.y = 580;
    game.alarm = 58;
    resetGuards();
    game.guards[0].x = 700; game.guards[0].y = 500;
    game.guards[0].facing = Math.atan2(p.y - 500, p.x - 700);
    game.guards[1].x = 900; game.guards[1].y = 300;
    game.guards[1].facing = Math.PI / 2;
    game.route = [ { x: 90, y: 620 }, { x: 640, y: 400 }, { x: 1130, y: 580 } ];
  }
}
