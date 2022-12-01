'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

let currentAccount;
let sorted = false;

const createUsernames = function (accounts) {
  accounts.forEach(account => {
    const user = account.owner;
    const userName = user
      .toLowerCase()
      .split(' ')
      .map(name => {
        return name[0];
      })
      .join('');
    account.userName = userName;
  });
};
createUsernames(accounts);

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';
  const mov = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  mov.forEach(function (mov, i, arr) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">3 days ago</div>
    <div class="movements__value">${mov.toFixed(2)}</div>
  </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (account) {
  const balance = account.movements.reduce((balance, currentBalance) => {
    return balance + currentBalance;
  }, 0);
  account.balance = balance;
  labelBalance.textContent = `${account.balance.toFixed(2)}$`;
};

const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter(value => {
      return value > 0;
    })
    .reduce((acc, value) => {
      return acc + value;
    }, 0);
  const out = account.movements
    .filter(value => {
      return value < 0;
    })
    .reduce((acc, value) => {
      return acc + value;
    }, 0);

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);

  account.labelSumIn = incomes;
  account.labelSumOut = out;
  account.interest = interest;
  labelSumIn.textContent = `${account.labelSumIn.toFixed(2)}`;
  labelSumOut.textContent = `${-account.labelSumOut.toFixed(2)}`;
  labelSumInterest.textContent = `${account.interest.toFixed(2)}`;
};

const updateUI = function () {
  calcDisplaySummary(currentAccount);
  calcDisplayBalance(currentAccount);
  displayMovements(currentAccount);
};

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    }`;
    updateUI();
  }
  inputLoginUsername.value = inputLoginPin.value = '';
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  if (currentAccount.balance >= Number(inputTransferAmount.value)) {
    accounts.forEach(acc => {
      if (acc.userName === inputTransferTo.value) {
        acc.movements.push(Number(inputTransferAmount.value));
        currentAccount.movements.push(-Number(inputTransferAmount.value));
        updateUI();
      }
    });
  }
  inputTransferTo.value = inputTransferAmount.value = '';
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(Number(inputLoanAmount.value));

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);
    updateUI();
    inputLoanAmount.value = '';
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (inputCloseUsername?.value === currentAccount.userName) {
    if (Number(inputClosePin?.value) === currentAccount.pin) {
      const index = accounts.findIndex(
        acc => acc.userName === inputCloseUsername.value
      );
      accounts.splice(index, 1);
      containerApp.style.opacity = 0;
    }
  }
  inputCloseUsername.value = '';
  inputClosePin.value = '';
});

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
