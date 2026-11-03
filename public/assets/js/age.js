/* Pure age maths, kept apart from the page so it can be tested in Node.
   All times are "wall clock" milliseconds built with Date.UTC, so daylight-saving
   changes never add or lose an hour. */
(function (root) {
  const DAY = 86400000, HOUR = 3600000, MIN = 60000, SEC = 1000;
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const daysIn = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

  /** b plus `months` calendar months. A 31st (or 29 Feb) that doesn't exist becomes the month's last day. */
  function addMonths(b, months) {
    const total = b.m + months;
    const y = b.y + Math.floor(total / 12), m = ((total % 12) + 12) % 12;
    return Date.UTC(y, m, Math.min(b.d, daysIn(y, m)), b.h || 0, b.min || 0, b.s || 0);
  }

  /** Calendar difference from b (parts, month 0-11) to t (wall-clock ms): years, months, days, h, m, s. */
  function diff(b, t) {
    const start = Date.UTC(b.y, b.m, b.d, b.h || 0, b.min || 0, b.s || 0);
    if (t < start) return null;
    const tt = new Date(t);
    let months = (tt.getUTCFullYear() - b.y) * 12 + (tt.getUTCMonth() - b.m);
    while (months > 0 && addMonths(b, months) > t) months--;
    let rest = t - addMonths(b, months);
    const days = Math.floor(rest / DAY); rest -= days * DAY;
    const hours = Math.floor(rest / HOUR); rest -= hours * HOUR;
    const minutes = Math.floor(rest / MIN); rest -= minutes * MIN;
    return { years: Math.floor(months / 12), months: months % 12, days, hours, minutes, seconds: Math.floor(rest / SEC), totalMonths: months, totalMs: t - start };
  }

  /**
   * Everything the page shows. birth = { y, m (1-12), d, h, min }, t = wall-clock ms of "now" or the chosen date.
   * Returns null when the birth date is after t.
   */
  function age(birth, t) {
    const b = { y: birth.y, m: birth.m - 1, d: birth.d, h: birth.h || 0, min: birth.min || 0 };
    const exact = diff(b, t);
    if (!exact) return null;
    const ms = exact.totalMs;

    // Next birthday, counted in whole days from the start of t's day.
    const tt = new Date(t), today = Date.UTC(tt.getUTCFullYear(), tt.getUTCMonth(), tt.getUTCDate());
    const on = y => Date.UTC(y, b.m, Math.min(b.d, daysIn(y, b.m)));
    let y = tt.getUTCFullYear();
    if (on(y) < today) y++;
    const next = on(y), until = diff({ y: tt.getUTCFullYear(), m: tt.getUTCMonth(), d: tt.getUTCDate() }, next);

    return {
      ...exact,
      total: {
        months: exact.totalMonths,
        weeks: Math.floor(ms / (7 * DAY)), weekDays: Math.floor(ms / DAY) % 7,
        days: Math.floor(ms / DAY), hours: Math.floor(ms / HOUR), minutes: Math.floor(ms / MIN), seconds: Math.floor(ms / SEC),
      },
      bornOn: WEEKDAYS[new Date(Date.UTC(b.y, b.m, b.d)).getUTCDay()],
      next: {
        isToday: next === today, turns: y - b.y, weekday: WEEKDAYS[new Date(next).getUTCDay()],
        months: until.totalMonths, days: until.days, totalDays: Math.round((next - today) / DAY),
      },
    };
  }

  /** The visitor's local date and time as wall-clock ms (see note at the top). */
  function wallNow(d = new Date()) {
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
  }

  const api = { age, diff, wallNow };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Age = api;
})(this);
