/* Age Calculator: reads the dates, asks age.js for the numbers, and keeps the clock ticking. */
(function () {
  const { say } = window.Tool;
  const { age, wallNow } = window.Age;
  const $ = s => document.querySelector(s);
  const dob = $('#dob'), tob = $('#tob'), on = $('#on'), msg = $('#msg'), result = $('#result');
  const fmt = n => n.toLocaleString('en-IN');
  const plural = (n, word) => `${fmt(n)} ${word}${n === 1 ? '' : 's'}`;
  const isoToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  let timer = null, lastText = '';

  dob.max = on.value = isoToday();

  function target() {
    // Today means "right now", so the seconds tick. Any other day is counted from its start.
    if (!on.value || on.value === isoToday()) return { t: wallNow(), live: true };
    const [y, m, d] = on.value.split('-').map(Number);
    return { t: Date.UTC(y, m - 1, d), live: false };
  }

  function render() {
    clearTimeout(timer);
    if (!dob.value) { result.hidden = true; say(msg, ''); return; }
    const [y, m, d] = dob.value.split('-').map(Number);
    const [h, min] = tob.value ? tob.value.split(':').map(Number) : [0, 0];
    if (!(y >= 1900)) { result.hidden = true; say(msg, 'Please enter a full date of birth.'); return; }
    const { t, live } = target();
    const a = age({ y, m, d, h, min }, t);
    if (!a) { result.hidden = true; say(msg, 'The date of birth is after the "Age on" date. Please check both dates.'); return; }
    say(msg, '');
    result.hidden = false;

    $('#resultLabel').textContent = live ? 'Age right now' : `Age on ${new Date(t).toLocaleDateString('en-IN', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' })}`;
    $('#ageMain').textContent = `${plural(a.years, 'year')}, ${plural(a.months, 'month')}, ${plural(a.days, 'day')}`;
    $('#ageClock').textContent = `and ${plural(a.hours, 'hour')}, ${plural(a.minutes, 'minute')}, ${plural(a.seconds, 'second')}` + (tob.value ? '' : ' (counted from midnight, add a time of birth to be exact)');
    $('#tMonths').textContent = fmt(a.total.months);
    $('#tWeeks').textContent = fmt(a.total.weeks) + (a.total.weekDays ? ` + ${a.total.weekDays}d` : '');
    $('#tDays').textContent = fmt(a.total.days);
    $('#tHours').textContent = fmt(a.total.hours);
    $('#tMinutes').textContent = fmt(a.total.minutes);
    $('#tSeconds').textContent = fmt(a.total.seconds);
    $('#bornOn').textContent = a.bornOn;
    if (a.next.isToday) {
      $('#nextLabel').textContent = 'Birthday';
      $('#nextIn').textContent = 'Today! 🎉';
      $('#nextOn').textContent = `Turning ${a.next.turns}`;
    } else {
      $('#nextLabel').textContent = 'Next birthday in';
      $('#nextIn').textContent = a.next.months ? `${plural(a.next.months, 'month')}, ${plural(a.next.days, 'day')}` : plural(a.next.days, 'day');
      $('#nextOn').textContent = `${plural(a.next.totalDays, 'day')} · a ${a.next.weekday} · turning ${a.next.turns}`;
    }
    lastText = `Age: ${$('#ageMain').textContent} ${$('#ageClock').textContent.replace(/ \(.*\)$/, '')}. Total days: ${fmt(a.total.days)}.`;
    if (live) timer = setTimeout(render, 1000 - (Date.now() % 1000) + 5);
  }

  [dob, tob, on].forEach(el => el.addEventListener('input', render));
  $('#todayBtn').addEventListener('click', () => { on.value = isoToday(); render(); });
  $('#clearBtn').addEventListener('click', () => { dob.value = tob.value = ''; on.value = isoToday(); render(); dob.focus(); });
  $('#copyBtn').addEventListener('click', () => {
    const btn = $('#copyBtn');
    navigator.clipboard?.writeText(lastText).then(() => { btn.textContent = 'Copied ✓'; setTimeout(() => { btn.textContent = 'Copy result'; }, 1500); }, () => {});
  });
  // Stop ticking while the tab is hidden; pick up again when it comes back.
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); else render(); });
  render();
})();
