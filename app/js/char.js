let symbolFontSize = 1.8;

const Char = function (i) {
  this.codePoint = i;
  this.size = symbolFontSize;
  this.utfSymbol = String.fromCodePoint(i);
  this.node = this.createNode();
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

function createSet (start, end) {
  let set = new DocumentFragment();
  charList = [];
  for (let i = start; i <= end; i++) {
    let char = new Char(i);
    charList.push(char);
    char.render(set);
    char.copyToClipboard();
    char.playKeySound();
    char.renderIcon();
  }
  lastSetStart = start;
  lastSetEnd = end;
  return set;
};

const charsField = document.querySelector('.chars');

function drawSet (start, end) {
  charsField.appendChild(createSet(start, end))
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

let newSetButton = document.querySelector('.new-set');
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
clickAudio.src = '../media/click.mp3';
clickAudio.preload = 'auto';

function playClickSound () {
  let click = clickAudio.cloneNode();
  click.currentTime = 0.2;
  click.volume = 0.2;
  click.play();
  click.loop = false;
}


  // Вывод в лог скопированного символа/кода

const log = document.querySelector('.log');


function typeCopiedSymbol (symbol) {
  log.textContent += `${symbol} `;
  if (log.textContent.split(' ').length > 30) {
    log.textContent = log.textContent.split(' ').slice(-30).join(' ');
  }
}


// Динамический фавикон

const canvas = document.querySelector('#iconCanvas');
const ctx = canvas.getContext('2d');
const link = document.querySelector('link[rel="icon"]');

ctx.font = "14px Arial";
ctx.textAlign = "center";
ctx.fillText("🚳", canvas.width/2, canvas.height - 3);

link.href = canvas.toDataURL('image/png');

function updateFavicon (symbol) {
  console.log(symbol)
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

    if (isThrottled) { // (2)
      savedArgs = arguments;
      savedThis = this;
      return;
    }

    func.apply(this, arguments); // (1)

    isThrottled = true;

    setTimeout(function() {
      isThrottled = false; // (3)
      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }
    }, ms);
  }

  return wrapper;
}
