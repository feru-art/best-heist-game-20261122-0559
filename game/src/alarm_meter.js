// Vaultlight — alarm_meter.js: the alarm that ends the heist.
// The meter only climbs while a guard is chasing or a camera is alarmed,
// and it falls again the moment the thief breaks line of sight —
// so a caught moment is always fair: the thief had time to vanish.

function makeAlarm() {
  return { value: 0, caught: false };
}

function alarmTick(alarm, dt, chasing, cameraAlarmed) {
  if (alarm.caught) return;
  let rate = 0;
  if (chasing) rate += HEIST.alarmChaseRate;
  if (cameraAlarmed) rate += HEIST.alarmCameraRate;
  if (rate > 0) {
    alarm.value += rate * dt;
  } else {
    alarm.value -= HEIST.alarmDecayRate * dt;
  }
  alarm.value = clampHeist(alarm.value, 0, 100);
  if (alarm.value >= 100) alarm.caught = true;
}

function alarmLevel(alarm) {
  if (alarm.value >= 75) return 'critical';
  if (alarm.value >= 40) return 'rising';
  return 'quiet';
}
