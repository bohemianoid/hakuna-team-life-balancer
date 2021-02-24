// ==Bookmarklet==
// @name Team-Life Balancer
// @author Simon Roth <code@simonroth.ch> (https://simonroth.ch)
// ==/Bookmarklet==

const minAvailablePeople = Number(
  // eslint-disable-next-line no-alert
  window.prompt('Minimal number of people to be available', 10)
);
const daily = new Set(['3', '21', '30', '35']);
const mover = new Set(['3', '21', '30', '51']);
const selectors = {
  table: '.c-a-team-calendar__table',
  today: '.today',
  startOfWeek: '.start-of-week',
  weekend: '.weekend',
  publicHoliday: '.public-holiday-bg, .public-holiday-bg-first-half, .public-holiday-bg-second-half',
  lifeDayFirstHalf: '.non-work-day-bg, .non-work-day-bg-first-half, .absence-bg, .absence-bg-first-half, .absence-request-bg, .absence-request-bg-first-half',
  lifeDaySecondHalf: '.non-work-day-bg, .non-work-day-bg-second-half, .absence-bg, .absence-bg-second-half, .absence-request-bg, .absence-request-bg-second-half'
};

const style = document.createElement('style');
document.head.append(style);

style.sheet.insertRule(
  `${selectors.table} tbody td:first-child:hover {
     cursor: pointer;
     text-decoration: line-through;
  }`,
  style.sheet.cssRules.length
);
style.sheet.insertRule(
  `${selectors.table} th.critical {
     background-color: #db5763;
     border-top-color: #db5763;
     color: #fff;
  }`,
  style.sheet.cssRules.length
);
style.sheet.insertRule(
  `${selectors.table} .critical {
     border-left-color: #db5763;
     border-left-width: 3px;
     border-right-color: #db5763;
     border-right-width: 3px;
  }`,
  style.sheet.cssRules.length
);
style.sheet.insertRule(
  `${selectors.table} tfoot th.critical {
     border-bottom-color: #db5763;
  }`,
  style.sheet.cssRules.length
);

const table = document.querySelectorAll(selectors.table).item(0);
const thead = table.querySelectorAll('thead').item(0);
const tbody = table.querySelectorAll('tbody').item(0);

const today = table.querySelectorAll(selectors.today);
for (const element of today) {
  element.classList.remove(selectors.today.slice(1));
}

const tfoot = document.createElement('tfoot');
const totalRow = document.createElement('tr');
const dailyRow = document.createElement('tr');
const moverRow = document.createElement('tr');
table.append(tfoot);
tfoot.append(totalRow);
tfoot.append(dailyRow);
tfoot.append(moverRow);

function addBalance(cell, firstHalf, secondHalf) {
  const sup = document.createElement('sup');
  const sub = document.createElement('sub');
  cell.append(sup);
  cell.append(document.createTextNode(' '));
  cell.append(sub);
  sup.append(document.createTextNode(firstHalf));
  sub.append(document.createTextNode(secondHalf));
}

function balance() {
  while (totalRow.lastChild) {
    totalRow.lastChild.remove();
    dailyRow.lastChild.remove();
    moverRow.lastChild.remove();
  }

  const totalHeader = document.createElement('th');
  totalRow.append(totalHeader);
  totalHeader.append(document.createTextNode('Total'));

  const dailyHeader = document.createElement('th');
  dailyRow.append(dailyHeader);
  dailyHeader.append(document.createTextNode('Daily'));

  const moverHeader = document.createElement('th');
  moverRow.append(moverHeader);
  moverHeader.append(document.createTextNode('Mover'));

  const cols = thead.querySelectorAll('th');
  const rows = tbody.querySelectorAll('tr');

  for (let i = 1; i < cols.length; i++) {
    const totalCell = document.createElement('th');
    totalRow.append(totalCell);

    const dailyCell = document.createElement('th');
    dailyRow.append(dailyCell);

    const moverCell = document.createElement('th');
    moverRow.append(moverCell);

    if (cols.item(i).classList.contains(selectors.startOfWeek.slice(1))) {
      totalCell.classList.add(selectors.startOfWeek.slice(1));
      dailyCell.classList.add(selectors.startOfWeek.slice(1));
      moverCell.classList.add(selectors.startOfWeek.slice(1));
    }

    if (cols.item(i).classList.contains(selectors.weekend.slice(1))) {
      totalCell.classList.add(selectors.weekend.slice(1));
      dailyCell.classList.add(selectors.weekend.slice(1));
      moverCell.classList.add(selectors.weekend.slice(1));

      continue;
    }

    let publicHoliday = false;
    const balance = {
      'total-first-half': 0,
      'daily-first-half': 0,
      'mover-first-half': 0,
      'total-second-half': 0,
      'daily-second-half': 0,
      'mover-second-half': 0
    };

    for (let j = 0; j < rows.length; j++) {
      const cell = rows.item(j).querySelectorAll(
        `td:nth-child(${i + 1})`
      ).item(0);

      if (cell.matches(selectors.publicHoliday)) {
        publicHoliday = true;

        continue;
      }

      if (!cell.matches(selectors.lifeDayFirstHalf)) {
        balance['total-first-half']++;

        if (daily.has(rows.item(j).dataset.user)) {
          balance['daily-first-half']++;
        }

        if (mover.has(rows.item(j).dataset.user)) {
          balance['mover-first-half']++;
        }
      }

      if (!cell.matches(selectors.lifeDaySecondHalf)) {
        balance['total-second-half']++;

        if (daily.has(rows.item(j).dataset.user)) {
          balance['daily-second-half']++;
        }

        if (mover.has(rows.item(j).dataset.user)) {
          balance['mover-second-half']++;
        }
      }
    }

    if (publicHoliday) {
      continue;
    }

    addBalance(
      totalCell,
      balance['total-first-half'],
      balance['total-second-half']
    );
    addBalance(
      dailyCell,
      balance['daily-first-half'],
      balance['daily-second-half']
    );
    addBalance(
      moverCell,
      balance['mover-first-half'],
      balance['mover-second-half']
    );

    if (
      balance['total-first-half'] <= minAvailablePeople ||
      balance['total-second-half'] <= minAvailablePeople
    ) {
      const criticalCells = table.querySelectorAll(
        `th:nth-child(${i + 1}), td:nth-child(${i + 1})`
      );

      for (const cell of criticalCells) {
        cell.classList.add('critical');
      }
    }
  }
}

tbody.addEventListener('click', event => {
  if (event.target.matches(selectors.table + ' td:first-child span')) {
    event.target.parentElement.parentElement.remove();
    balance();
  }

  if (event.target.matches(selectors.table + ' td:first-child')) {
    event.target.parentElement.remove();
    balance();
  }
});

balance();
