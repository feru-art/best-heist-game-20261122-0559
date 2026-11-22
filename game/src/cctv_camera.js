// Vaultlight — cctv_camera.js: the cameras that never blink.
// A camera sweeps its cone back and forth on a fixed mount. When it
// spots the thief its lens flashes red and the alarm climbs fast —
// unless an EMP froze it first, in which case its cone goes grey and
// a countdown shows how long the thief has left.

function makeCamera(def) {
  return {
    x: def.x, y: def.y,
    base: def.base,
    sweep: def.sweep,
    phase: Math.random() * Math.PI * 2,
    facing: def.base,
    suspicion: 0,
    alarmed: false,
    alarmT: 0
  };
}

function cameraTick(camera, dt, time, thief, walls, smokes, empTimer) {
  camera.facing = camera.base + Math.sin(time * 1.4 + camera.phase) * camera.sweep;
  if (empTimer > 0) {
    camera.suspicion = 0;
    camera.alarmed = false;
    camera.alarmT = 0;
    return;
  }
  const sees = cameraSeesThief(camera, thief, walls, smokes);
  if (sees) {
    camera.suspicion += HEIST.cameraSuspicionRate * dt;
  } else {
    camera.suspicion -= HEIST.suspicionDecayRate * dt;
  }
  camera.suspicion = clampHeist(camera.suspicion, 0, 100);
  if (camera.suspicion >= 100 && !camera.alarmed) {
    camera.alarmed = true;
    camera.alarmT = 4;
  }
  if (camera.alarmed) {
    camera.alarmT -= dt;
    if (camera.alarmT <= 0) {
      camera.alarmed = false;
      camera.suspicion = 40;
    }
  }
}

function cameraSeesThief(camera, thief, walls, smokes) {
  if (thief.inVent) return false;
  if (!pointInsideCone(camera.x, camera.y, camera.facing, HEIST.cameraRange, HEIST.cameraHalfAngle, thief.x, thief.y)) return false;
  return lineOfSightClear(camera.x, camera.y, thief.x, thief.y, walls, smokes);
}

function cameraIsAlarmed(camera) {
  return camera.alarmed;
}

function cameraIsDisabled(empTimer) {
  return empTimer > 0;
}
