const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('menu');
const screens = document.querySelectorAll('.screen');
const menuItems = document.querySelectorAll('#menu button');

// open and close the menu
menuBtn.addEventListener('click', () => {
  menu.classList.toggle('hidden');
});

// show one screen and hide the rest
function showScreen(name) {
  screens.forEach(s => s.classList.remove('active'));
  const target = document.getElementById(name);
  if (target) target.classList.add('active');

  menuItems.forEach(b => {
    b.classList.toggle('current', b.dataset.screen === name);
  });

  menu.classList.add('hidden');
}

// every element with data-screen goes to that screen
document.querySelectorAll('[data-screen]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    showScreen(el.dataset.screen);
    if (el.dataset.scroll) {
      document.getElementById(el.dataset.scroll).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

showScreen('home');

// ----- trip total -----
const items = document.querySelectorAll('.trip-item');
const tripTotal = document.getElementById('trip-total');
const tripLines = document.getElementById('trip-lines');
const emptyMsg = document.getElementById('empty-msg');
let selected = {};   // what is in the trip: id -> {label, price, group}

items.forEach(box => {
  box.addEventListener('change', () => {
    const id = box.dataset.id;
    if (box.checked) {
      // only one room and one restaurant at a time
      const oneOnly = ['room', 'dining'];
      if (oneOnly.includes(box.dataset.group)) {
        Object.keys(selected).forEach(k => {
          if (selected[k].group === box.dataset.group) delete selected[k];
        });
      }
      selected[id] = {
        label: box.dataset.label,
        price: Number(box.dataset.price),
        group: box.dataset.group
      };
    } else {
      delete selected[id];
    }
    updateTrip();
  });
});

function updateTrip() {
  // keep every checkbox in sync with the trip
  items.forEach(b => { b.checked = b.dataset.id in selected; });

  const total = Object.values(selected).reduce((sum, i) => sum + i.price, 0);
  tripTotal.textContent = '$' + total.toLocaleString('en-US', { minimumFractionDigits: 2 });

  // list what is in the trip
  tripLines.innerHTML = '';
  Object.values(selected).forEach(i => {
    const li = document.createElement('li');
    li.textContent = i.label + ' – $' + i.price.toLocaleString('en-US');
    tripLines.appendChild(li);
  });
  emptyMsg.classList.toggle('hidden', Object.keys(selected).length > 0);
}

// ----- sort lists (Booking, Lodging, Dining) -----
document.querySelectorAll('.sort-select').forEach(sel => {
  sel.addEventListener('change', () => {
    const list = document.getElementById(sel.dataset.list);
    const key = sel.value;
    const cards = Array.from(list.children);
    cards.sort((a, b) => {
      if (key === 'type')  return a.dataset.type.localeCompare(b.dataset.type);
      if (key === 'price') return a.dataset.price - b.dataset.price;
      return b.dataset[key] - a.dataset[key];
    });
    cards.forEach(c => list.appendChild(c));
  });
});

// ----- trip panel and checkout -----
const tripPanel = document.getElementById('trip-panel');
const expandBtn = document.getElementById('expand-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const payBtn = document.getElementById('pay-btn');
const thanks = document.getElementById('thanks');

function setPanel(open) {
  tripPanel.classList.toggle('hidden', !open);
  expandBtn.innerHTML = open ? '&#9660;' : '&#9650;';
}

expandBtn.addEventListener('click', () => {
  setPanel(tripPanel.classList.contains('hidden'));
});

checkoutBtn.addEventListener('click', () => setPanel(true));

payBtn.addEventListener('click', () => {
  thanks.textContent = Object.keys(selected).length === 0
    ? 'Please choose a room or option first.'
    : 'Thank you for your Payment!';
  thanks.classList.remove('hidden');
});

// ----- events calendar (November 2026) -----
// Sample events: write your own. The source document lists no real event dates.
const events = {
  7:  ['Sample event: Beach morning walk – 8 a.m.'],
  14: ['Sample event: Local history museum open house – 10 a.m.'],
  21: ['Sample event: Live music night – 7 p.m.'],
  27: ['Sample event: Rainforest guided hike – 9 a.m.']
};

const calendarEl = document.getElementById('calendar');
const detailsEl = document.getElementById('event-details');
let checkIn = 26;
let checkOut = 30;

function pad(n) { return String(n).padStart(2, '0'); }

function renderCalendar() {
  const first = new Date(2026, 10, 1).getDay();   // 0 = Sunday
  let html = '<div class="cal-grid">';
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
    html += '<div class="cal-head">' + d + '</div>';
  });
  for (let i = 0; i < first; i++) html += '<div></div>';
  for (let d = 1; d <= 30; d++) {
    let cls = 'cal-day';
    if (events[d]) cls += ' has-event';
    if (d >= checkIn && d <= checkOut) cls += ' in-trip';
    html += '<button type="button" class="' + cls + '" data-day="' + d + '">' + d + '</button>';
  }
  html += '</div>';
  calendarEl.innerHTML = html;
}

function updateDates() {
  const text = '11/' + pad(checkIn) + ' – 11/' + pad(checkOut);
  document.querySelectorAll('.trip-dates').forEach(el => el.textContent = text);
  renderCalendar();
}

function showDay(d) {
  const list = events[d] || [];
  let html = '<h4>November ' + d + '</h4>';
  html += list.length
    ? '<ul>' + list.map(e => '<li>' + e + '</li>').join('') + '</ul>'
    : '<p>No events listed.</p>';
  html += '<button type="button" id="set-in">Set as check-in</button> ';
  html += '<button type="button" id="set-out">Set as check-out</button>';
  detailsEl.innerHTML = html;

  document.getElementById('set-in').addEventListener('click', () => {
    checkIn = d;
    if (checkOut < checkIn) checkOut = checkIn;
    updateDates();
  });
  document.getElementById('set-out').addEventListener('click', () => {
    checkOut = d;
    if (checkIn > checkOut) checkIn = checkOut;
    updateDates();
  });
}

calendarEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.cal-day');
  if (btn) showDay(Number(btn.dataset.day));
});

updateDates();   // draws the calendar the first time