let symbolFontSize = 1.8;

function Char (i) {
  this.codePoint = i;
  this.size = symbolFontSize;
  this.utfSymbol = String.fromCodePoint(i);
  this.node = this.node ? this.node : this.createNode();
}

Char.prototype.createNode = function () {
    let charNode = document.createElement('button');
    charNode.classList.add('char');
    charNode.setAttribute('title', `Dec code is ${this.codePoint}`);
    charNode.textContent = this.utfSymbol;
    charNode.style.fontSize = `${this.size}em`

    return charNode;
  };

Char.prototype.render = function (parent) {
  parent.appendChild(this.node)
}

Char.prototype.renderIcon = function () {
  let symbol = this.utfSymbol
  this.node.addEventListener('click', function () {
    updateFavicon(symbol)
  })
}

Char.prototype.resize = function (up) {
  this.size = up? (this.size < 4 ? this.size + 0.2 : 4)
  : (this.size > 1 ? this.size - 0.2 : 1);
  this.node.style.fontSize = `${this.size}em`;
  symbolFontSize = this.size;
}

Char.prototype.copyToClipboard = function () {
  let symbol = this.utfSymbol;
  let decCode = this.codePoint;
  this.node.addEventListener('click', function (evt) {
    let copied = evt.shiftKey ?
        `\\u${decToHexWithPad(decCode)}`
        : symbol;
    typeCopiedSymbol(copied);
    navigator.clipboard.writeText(copied)
    .then (() => {
      console.log(copied + ' скопировано в буфер')
    })
    .catch (err => {
      console.log('Ошибка', err)
    })
  });
};

Char.prototype.playKeySound = function () {
  this.node.addEventListener('click', function () {
    playClickSound();
  });
};

function decToHexWithPad (n) {
  let str = Number(n).toString(16);
  return n <= 9999 ? `000${str}`.substr(-4) : str;
}


  // Отрисовка коллекций кнопок, переключение впред/назад

let lastSetEnd, lastSetStart, charList = [];

function createSet (start, end, set) {
  let setFragment = new DocumentFragment();
  charList = [];
  function addChar (codePoint) {
    let char = new Char(codePoint);
    char.copyToClipboard();
    char.playKeySound();
    char.renderIcon();
    charList.push(char);
    char.render(setFragment);
  }
  if (!set) {
    for (let i = start; i <= end; i++) {
      addChar(i)
    }
    lastSetStart = start;
    lastSetEnd = end;
  } else {
    for (let codePoint of set) {
      addChar(codePoint)
    }
  }
  return setFragment;
};

const charsField = document.querySelector('.chars');

function drawSet (start, end, set) {
  startWindow.hidden = true;
  charsField.appendChild(createSet(start, end, set))
}
function removeChars () {
  document.querySelectorAll('.char').forEach(function (it) {
    it.remove();
  })
};

function newSet () {
  let setLength = getButtonsAmount() ? getButtonsAmount() : 300;
  removeChars();
  let previousIndex = lastSetEnd ? lastSetEnd : 0;
  let firstIndex = +prompt('С индекса', previousIndex);

  let lastIndex = +prompt('По индекс', firstIndex + setLength);
  drawSet(firstIndex, lastIndex)
}

let nextSet = throttle(() => {
  let setLength = getButtonsAmount();
  removeChars();
  let firstIndex = lastSetEnd ? lastSetEnd : 0;
  let lastIndex = setLength ? firstIndex + setLength : firstIndex + 300;
  drawSet(firstIndex, lastIndex)
}, 150)

let prevSet = throttle(() => {
  if (!lastSetStart) return false;
  let setLength = getButtonsAmount();
  removeChars();
  let firstIndex = lastSetStart - setLength > 0 ? lastSetStart - setLength : 0;
  let lastIndex = lastSetStart;
  drawSet(firstIndex, lastIndex)
}, 150)

function getButtonsAmount () {
  let square = charsField.offsetHeight * charsField.offsetWidth;
  let someButtons = document.querySelectorAll('.char:nth-child(3n)');
  let buttonSquare = Array.from(someButtons).reduce((a, b) =>
  (a + ((b.offsetHeight + 20) * (b.offsetWidth + 30))), 0) / someButtons.length;
  return Math.floor(square / buttonSquare);
}

let newSetButton = document.querySelector('.buttons__new-set');
newSetButton.addEventListener('click', newSet);

window.addEventListener('keydown', function (evt) {
  switch (evt.which) {
    case 68:
    case 39:
      nextSet();
      break;
    case 65:
    case 37:
      prevSet();
      break;
    case 87:
    case 38:
      charList.forEach(function (it) {
        it.resize('up')
      });
      break;
    case 83:
    case 40:
      charList.forEach(function (it) {
        it.resize()
      });
      break;
  }
});


 // Проигрывание звука нажатия клавиши


let clickAudio = new Audio();
clickAudio.src = 'media/click.mp3';
clickAudio.preload = 'auto';

function playClickSound () {
  let click = clickAudio.cloneNode();
  click.currentTime = 0.2;
  click.volume = 0.2;
  click.play();
  click.loop = false;
}


  // Вывод в лог скопированного символа/кода. Размер лога

const log = document.querySelector('.log');
let maxSymbols = 30;

function typeCopiedSymbol (symbol) {
  if (symbol.startsWith('\\u')) {
    showCopiedCode(symbol);
    return;
  }
  log.textContent += `${symbol} `;
  if (log.textContent.split(' ').length > maxSymbols) {
    log.textContent = log.textContent.split(' ').slice(-1 - maxSymbols).join(' ');
  }
}

const copiedCodeContainer = document.querySelector('.log__current-code');
const copiedCode = document.querySelector('.log__unicode');
let lastTimeout;

function showCopiedCode (code) {
  copiedCode.textContent = code;
  copiedCodeContainer.classList.add('visible');
  clearTimeout(lastTimeout);
  lastTimeout = setTimeout(() => {copiedCodeContainer.classList.remove('visible')}, 2000)
}

const logLength = document.querySelector('#log-length');
const setLogLengthButton = document.querySelector('#log-length-set');

setLogLengthButton.addEventListener('click', function () {
  maxSymbols = logLength.value
})

// Сохранить свой сет

const createSetFromLogButton = document.querySelector('#create-set-from-log');
createSetFromLogButton.addEventListener('click', () => drawOwnSet(getSetFromTyped()));

function getSetFromTyped () {
  let set = new Set;
  let arr = log.textContent
  .split(' ')
  .slice(0, -1)  // Последний пробел добавляет "" в массив
  .map((it) => it.codePointAt(0));
  for (let symbol of arr) {
    set.add(symbol)
  }
  return set
}

function drawOwnSet (ownSet) {
  removeChars();
  drawSet(null, null, ownSet);
  addSaveButton(ownSet);
};

function addSaveButton (set) {
  let saveButton = new Char(128190);
  saveButton.playKeySound();
  saveButton.node.style.marginLeft = 'auto';
  saveButton.render(charsField);
  charList.push(saveButton);
  saveButton.node.addEventListener('click', function () {
    addSetToLocalStorage(set)
  })
};

let saved = JSON.parse(localStorage.getItem('saved'));
let numberOfSaves = saved ? Object.keys(saved).length + 1 : 1;

function addSetToLocalStorage (set) {
  let str = Array.from(set)
  .reduce((a, b) => a + ' ' + String.fromCodePoint(b), '')
  .slice(1);
  let name = prompt('Укажите название сэта', `My set ${numberOfSaves}`);
  if (name === null) {
    return false
  }
  if (!saved) {
    saved = {};
  }
  if (saved.hasOwnProperty(name)) {
    if (!confirm('Сэт с таким именем уже существует. Заменить сэт?')) {
    return false;
    }
  }
  let nameKey = Object.keys(saved).find(key => saved[key] === str);
  if (nameKey) {
    if (confirm('Такой сэт уже существует. Переименовать?')) {
    delete saved[nameKey]
    }
  }
  saved[name] = str;
  localStorage.setItem('saved', JSON.stringify(saved));
  numberOfSaves++;
};

// Загрузка из localStorage

const startWindow = document.querySelector('.start-window');
const savesCardsContainer = document.querySelector('.start-window__saves')
const saveCardTemplate = document.querySelector('#save-card').content.querySelector('.save-card');

startWindow.hidden = false;

function SaveCard (entrie) {
  this.saveName = entrie[0];
  this.symbolsString = entrie[1];
  this.symbolsCodes = this.symbolsString.split(' ').map((it) => it.codePointAt(0));
  this.node = this.node ? this.node : this.createNode();
}

SaveCard.prototype.createNode = function () {
    let saveNode = saveCardTemplate.cloneNode(true);
    saveNode.querySelector('.save-card__name').textContent = this.saveName;
    let symbolsList = saveNode.querySelector('.save-card__symbols');
    let iconsFragment = new DocumentFragment();
    for (let symbol of this.symbolsString.split(' ')) {
      let symbolIcon = document.createElement('span');
      symbolIcon.classList.add('symbol-icon');
      symbolIcon.textContent = symbol;
      iconsFragment.appendChild(symbolIcon);
    }
    symbolsList.appendChild(iconsFragment);

    return saveNode;
};

SaveCard.prototype.load = function () {
  this.node.addEventListener('click', () => drawOwnSet(this.symbolsCodes))
}



if (saved) {
  let savesFragment = new DocumentFragment();
  for (let entrie of Object.entries(saved)) {
    let saveCard = new SaveCard(entrie);
    saveCard.load();
    savesFragment.appendChild(saveCard.node)
  }
  savesCardsContainer.appendChild(savesFragment);
}

document.querySelector('.start-window').hidden = false;

// Динамический фавикон

const canvas = document.querySelector('#iconCanvas');
const ctx = canvas.getContext('2d');
const link = document.querySelector('link[rel="icon"]');

ctx.font = "14px Arial";
ctx.textAlign = "center";
ctx.fillText("🚳", canvas.width / 2, canvas.height - 3);

link.href = canvas.toDataURL('image/png');

function updateFavicon (symbol) {
  ctx.clearRect(0, 0, 16, 16);
  ctx.fillText(String(symbol), canvas.width/2, canvas.height - 3);

  link.href = canvas.toDataURL('image/png');
}

// throttle

function throttle(func, ms) {

  let isThrottled = false,
    savedArgs,
    savedThis;

  function wrapper() {

    if (isThrottled) {
      savedArgs = arguments;
      savedThis = this;
      return;
    }

    func.apply(this, arguments);

    isThrottled = true;

    setTimeout(function() {
      isThrottled = false;
      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }
    }, ms);
  }

  return wrapper;
}
