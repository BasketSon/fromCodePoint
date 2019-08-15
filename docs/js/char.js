let symbolFontSize=1.8;function Char(e){this.codePoint=e,this.size=symbolFontSize,this.utfSymbol=String.fromCodePoint(e),this.node=this.node?this.node:this.createNode()}function decToHexWithPad(e){let t=Number(e).toString(16);return e<=9999?`000${t}`.substr(-4):t}Char.prototype.createNode=function(){let e=document.createElement("button");return e.classList.add("char"),e.setAttribute("title",`Dec code is ${this.codePoint}`),e.textContent=this.utfSymbol,e.style.fontSize=`${this.size}em`,e},Char.prototype.render=function(e){e.appendChild(this.node)},Char.prototype.renderIcon=function(){let e=this.utfSymbol;this.node.addEventListener("click",function(){updateFavicon(e)})},Char.prototype.resize=function(e){this.size=e?this.size<4?this.size+.2:4:this.size>1?this.size-.2:1,this.node.style.fontSize=`${this.size}em`,symbolFontSize=this.size},Char.prototype.copyToClipboard=function(){let e=this.utfSymbol,t=this.codePoint;this.node.addEventListener("click",function(o){let n=o.shiftKey?`\\u${decToHexWithPad(t)}`:e;typeCopiedSymbol(n),navigator.clipboard.writeText(n).then(()=>{console.log(n+" скопировано в буфер")}).catch(e=>{console.log("Ошибка",e)})})},Char.prototype.playKeySound=function(){this.node.addEventListener("click",function(){playClickSound()})};let lastSetEnd,lastSetStart,charList=[];function createSet(e,t,o){let n=new DocumentFragment;function r(e){let t=new Char(e);t.copyToClipboard(),t.playKeySound(),t.renderIcon(),charList.push(t),t.render(n)}if(charList=[],o)for(let e of o)r(e);else{for(let o=e;o<=t;o++)r(o);lastSetStart=e,lastSetEnd=t}return n}const charsField=document.querySelector(".chars");function drawSet(e,t,o){startWindow.hidden=!0,charsField.appendChild(createSet(e,t,o))}function removeChars(){document.querySelectorAll(".char").forEach(function(e){e.remove()})}function newSet(){let e=getButtonsAmount()?getButtonsAmount():300;removeChars();let t=+prompt("С индекса",lastSetEnd||0);drawSet(t,+prompt("По индекс",t+e))}let nextSet=throttle(()=>{let e=getButtonsAmount();removeChars();let t=lastSetEnd||0;drawSet(t,e?t+e:t+300)},150),prevSet=throttle(()=>{if(!lastSetStart)return!1;let e=getButtonsAmount();removeChars(),drawSet(lastSetStart-e>0?lastSetStart-e:0,lastSetStart)},150);function getButtonsAmount(){let e=charsField.offsetHeight*charsField.offsetWidth,t=document.querySelectorAll(".char:nth-child(3n)"),o=Array.from(t).reduce((e,t)=>e+(t.offsetHeight+20)*(t.offsetWidth+30),0)/t.length;return Math.floor(e/o)}let newSetButton=document.querySelector(".new-set");newSetButton.addEventListener("click",newSet),window.addEventListener("keydown",function(e){switch(e.which){case 68:case 39:nextSet();break;case 65:case 37:prevSet();break;case 87:case 38:charList.forEach(function(e){e.resize("up")});break;case 83:case 40:charList.forEach(function(e){e.resize()})}});let clickAudio=new Audio;function playClickSound(){let e=clickAudio.cloneNode();e.currentTime=.2,e.volume=.2,e.play(),e.loop=!1}clickAudio.src="media/click.mp3",clickAudio.preload="auto";const log=document.querySelector(".log");let maxSymbols=30;function typeCopiedSymbol(e){e.startsWith("\\u")?showCopiedCode(e):(log.textContent+=`${e} `,log.textContent.split(" ").length>maxSymbols&&(log.textContent=log.textContent.split(" ").slice(-1-maxSymbols).join(" ")))}const copiedCodeContainer=document.querySelector(".log__current-code"),copiedCode=document.querySelector(".log__unicode");let lastTimeout;function showCopiedCode(e){copiedCode.textContent=e,copiedCodeContainer.classList.add("visible"),clearTimeout(lastTimeout),lastTimeout=setTimeout(()=>{copiedCodeContainer.classList.remove("visible")},2e3)}const logLength=document.querySelector("#log-length"),setLogLengthButton=document.querySelector("#log-length-set");setLogLengthButton.addEventListener("click",function(){maxSymbols=logLength.value});const createSetFromLogButton=document.querySelector("#create-set-from-log");function getSetFromTyped(){let e=new Set,t=log.textContent.split(" ").slice(0,-1).map(e=>e.codePointAt(0));for(let o of t)e.add(o);return e}function drawOwnSet(e){removeChars(),drawSet(null,null,e),addSaveButton(e)}function addSaveButton(e){let t=new Char(128190);t.playKeySound(),t.node.style.marginLeft="auto",t.render(charsField),charList.push(t),t.node.addEventListener("click",function(){addSetToLocalStorage(e)})}createSetFromLogButton.addEventListener("click",()=>drawOwnSet(getSetFromTyped()));let saved=JSON.parse(localStorage.getItem("saved")),numberOfSaves=saved?Object.keys(saved).length+1:1;function addSetToLocalStorage(e){let t=Array.from(e).reduce((e,t)=>e+" "+String.fromCodePoint(t),"").slice(1),o=prompt("Укажите название сэта",`My set ${numberOfSaves}`);if(null===o)return!1;if(saved||(saved={}),saved.hasOwnProperty(o)&&!confirm("Сэт с таким именем уже существует. Заменить сэт?"))return!1;let n=Object.keys(saved).find(e=>saved[e]===t);n&&confirm("Такой сэт уже существует. Переименовать?")&&delete saved[n],saved[o]=t,localStorage.setItem("saved",JSON.stringify(saved)),numberOfSaves++}const startWindow=document.querySelector(".start-window"),savesCardsContainer=document.querySelector(".start-window__saves"),saveCardTemplate=document.querySelector("#save-card").content.querySelector(".save-card");function SaveCard(e){this.saveName=e[0],this.symbolsString=e[1],this.symbolsCodes=this.symbolsString.split(" ").map(e=>e.codePointAt(0)),this.node=this.node?this.node:this.createNode()}if(startWindow.hidden=!1,SaveCard.prototype.createNode=function(){let e=saveCardTemplate.cloneNode(!0);e.querySelector(".save-card__name").textContent=this.saveName;let t=e.querySelector(".save-card__symbols"),o=new DocumentFragment;for(let e of this.symbolsString.split(" ")){let t=document.createElement("span");t.classList.add("symbol-icon"),t.textContent=e,o.appendChild(t)}return t.appendChild(o),e},SaveCard.prototype.load=function(){this.node.querySelector(".save-card__symbols").addEventListener("click",()=>drawOwnSet(this.symbolsCodes))},saved){let e=new DocumentFragment;for(let t of Object.entries(saved)){let o=new SaveCard(t);o.load(),e.appendChild(o.node)}savesCardsContainer.appendChild(e)}document.querySelector(".start-window").hidden=!1;const canvas=document.querySelector("#iconCanvas"),ctx=canvas.getContext("2d"),link=document.querySelector('link[rel="icon"]');function updateFavicon(e){ctx.clearRect(0,0,16,16),ctx.fillText(String(e),canvas.width/2,canvas.height-3),link.href=canvas.toDataURL("image/png")}function throttle(e,t){let o,n,r=!1;return function i(){if(r)return o=arguments,void(n=this);e.apply(this,arguments),r=!0,setTimeout(function(){r=!1,o&&(i.apply(n,o),o=n=null)},t)}}ctx.font="14px Arial",ctx.textAlign="center",ctx.fillText("🚳",canvas.width/2,canvas.height-3),link.href=canvas.toDataURL("image/png");