// Vaultlight — tools.js: smoke and EMP, the thief's tools at a cost.
// Smoke hides the thief from every cone it stands between; EMP freezes
// every camera for a few seconds. Both cost something, so they are spent,
// never spammed: smoke costs coins, EMP costs a charge that only refills
// between levels.

function makeTools() {
  return {
    smokes: [],
    empTimer: 0,
    empCharges: HEIST.startEmp
  };
}

function toolsCanSmoke(coins) {
  return coins >= HEIST.smokeCost;
}

function toolsThrowSmoke(tools, x, y) {
  tools.smokes.push({ x, y, r: HEIST.smokeRadius, t: HEIST.smokeSeconds });
}

function toolsCanEmp(tools) {
  return tools.empCharges > 0 && tools.empTimer <= 0;
}

function toolsFireEmp(tools) {
  tools.empCharges -= 1;
  tools.empTimer = HEIST.empSeconds;
}

function toolsTick(tools, dt) {
  if (tools.empTimer > 0) tools.empTimer -= dt;
  for (const smoke of tools.smokes) smoke.t -= dt;
  tools.smokes = tools.smokes.filter((s) => s.t > 0);
}

// Every live smoke cloud, for line-of-sight checks in vision_cone.js.
function toolsLiveSmokes(tools) {
  return tools.smokes;
}
