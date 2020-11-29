// ==Bookmarklet==
// @name Team-Life Balancer
// @author Simon Roth <code@simonroth.ch> (https://simonroth.ch)
// ==/Bookmarklet==

const minAvailablePeople = Number(
  // eslint-disable-next-line no-alert
  window.prompt('Minimal number of people to be available', 10)
);
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
today.forEach(today => {
  today.classList.remove(selectors.today.slice(1));
});

const tfoot = document.createElement('tfoot');
const totalRow = document.createElement('tr');
table.append(tfoot);
tfoot.append(totalRow);

function balance() {
  while (totalRow.lastChild) {
    totalRow.lastChild.remove();
  }

  const totalCell = document.createElement('th');
  totalRow.append(totalCell);
  totalCell.append(document.createTextNode('Total'));

  const cols = thead.querySelectorAll('th');
  const rows = tbody.querySelectorAll('tr');

  for (let i = 1; i < cols.length; i++) {
    const balanceCell = document.createElement('th');
    totalRow.append(balanceCell);

    if (cols.item(i).classList.contains(selectors.startOfWeek.slice(1))) {
      balanceCell.classList.add(selectors.startOfWeek.slice(1));
    }

    if (cols.item(i).classList.contains(selectors.weekend.slice(1))) {
      balanceCell.classList.add(selectors.weekend.slice(1));

      continue;
    }

    let publicHoliday = false;
    const balance = {
      'first-half': 0,
      'second-half': 0
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
        balance['first-half']++;
      }

      if (!cell.matches(selectors.lifeDaySecondHalf)) {
        balance['second-half']++;
      }
    }

    if (publicHoliday) {
      continue;
    }

    const balanceFirstHalf = document.createElement('sup');
    const balanceSecondHalf = document.createElement('sub');
    balanceCell.append(balanceFirstHalf);
    balanceCell.append(document.createTextNode(' '));
    balanceCell.append(balanceSecondHalf);
    balanceFirstHalf.append(document.createTextNode(balance['first-half']));
    balanceSecondHalf.append(document.createTextNode(balance['second-half']));

    if (
      balance['first-half'] <= minAvailablePeople ||
      balance['second-half'] <= minAvailablePeople
    ) {
      const criticalCells = table.querySelectorAll(
        `th:nth-child(${i + 1}), td:nth-child(${i + 1})`
      );

      criticalCells.forEach(cell => {
        cell.classList.add('critical');
      });
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
