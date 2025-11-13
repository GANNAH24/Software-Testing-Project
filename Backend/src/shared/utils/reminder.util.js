const { addHours, addMinutes, isWithinInterval } = require('date-fns');

/**
 * Compute reminder windows around now for 24h and 2h before appointment time.
 * We use a small sweep window to avoid duplicate sends on frequent job runs.
 */
function computeReminderWindows(now = new Date(), sweepMinutes = 15) {
  const twentyFourHoursAhead = addHours(now, 24);
  const twoHoursAhead = addHours(now, 2);
  const windowEnd = addMinutes(now, sweepMinutes);

  return {
    windowStart: now,
    windowEnd,
    target24h: { start: twentyFourHoursAhead, end: addMinutes(twentyFourHoursAhead, sweepMinutes) },
    target2h: { start: twoHoursAhead, end: addMinutes(twoHoursAhead, sweepMinutes) },
  };
}

/**
 * Returns true if ts (Date or ISO string) is within [start, end)
 */
function inWindow(ts, start, end) {
  const d = typeof ts === 'string' ? new Date(ts) : ts;
  return isWithinInterval(d, { start, end });
}

module.exports = { computeReminderWindows, inWindow };
