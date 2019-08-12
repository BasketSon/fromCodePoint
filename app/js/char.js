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
    charNode.setAttribute('title', `code is ${this.codePoint}`);
    charNode.textContent = this.utfSymbol;
    charNode.style.fontSize = `${this.size}em`
    charNode.addEventListener('click', function (evt) {
      playClickSound();
      let copied = evt.shiftKey ?
          `\\u${padToFour(decToHex(this.textContent.codePointAt(0)))}`
          : this.textContent;
      typeCopiedSymbol(copied);
      navigator.clipboard.writeText(copied)
      .then (() => {
        console.log(copied + ' скопировано в буфер')
      })
      .catch (err => {
        console.log('Ошибка', err)
      })
    });
    return charNode;
  };

Char.prototype.render = function (parent) {
  parent.appendChild(this.node)
}

Char.prototype.resize = function (up) {
  this.size = up? (this.size < 4 ? this.size + 0.2 : 4)
  : (this.size > 1 ? this.size - 0.2 : 1);
  this.node.style.fontSize = `${this.size}em`;
  symbolFontSize = this.size;
}


let lastSet;
let charList = [];

function createSet (start, end) {
  let set = new DocumentFragment();
  charList = [];
  for (let i = start; i <= end; i++) {
    let char = new Char(i);
    charList.push(char);
    char.render(set);
  }
  lastSet = end;
  return set;
}
function removeChars () {
  document.querySelectorAll('.char').forEach(function (it) {
    it.remove();
  })
}

function newSet () {
  removeChars();
  let previousIndex = lastSet ? lastSet : 0;
  let firstIndex = +prompt('С индекса', previousIndex);
  let lastIndex = +prompt('По индекс', firstIndex + 300);
  document.querySelector('.chars').appendChild(createSet(firstIndex, lastIndex))
}

function nextSet () {
  removeChars();
  firstIndex = lastSet ? lastSet : 0;
  document.querySelector('.chars').appendChild(createSet(firstIndex, firstIndex + 300))
}

function prevSet () {
  removeChars();
  firstIndex = lastSet > 600 ? lastSet - 600 : 0;
  document.querySelector('.chars').appendChild(createSet(firstIndex, firstIndex + 300))
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

function decToHex (n) {
  return Number(n).toString(16);
};

function padToFour (str) {
  return parseInt(str, 16) <= 9999 ? `000${str}`.substr(-4) : str;
}


let clickAudio = new Audio();
clickAudio.src = 'https://www.fesliyanstudios.com/sp.php?i=/649.mp3';
clickAudio.preload = 'auto';

function playClickSound () {
  let click = clickAudio.cloneNode();
  // click.currentTime = 0.65;
  click.volume = 0.2;
  click.play();
  click.loop = false;
}

let table = document.createElement('div');
table.classList.add('show-unicode')
document.body.insertAdjacentElement('beforeend', table);

function typeCopiedSymbol (symbol) {
  table.textContent += `${symbol}`;
  if (table.textContent.length > 20) {
    table.textContent = table.textContent.slice(-20);
  }
}
