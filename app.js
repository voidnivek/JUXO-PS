const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const modal = $('#gameModal'), stage = $('#gameStage'), statusLine = $('#gameStatus');
let currentGame = null, cleanupGame = () => {}, toastTimer;

function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2200)}
function savePlayed(id){let list=JSON.parse(localStorage.getItem('juxoPlayed')||'[]');list=[id,...list.filter(x=>x!==id)].slice(0,10);localStorage.setItem('juxoPlayed',JSON.stringify(list))}
function openGame(id){currentGame=id;cleanupGame();stage.innerHTML='';modal.hidden=false;document.body.style.overflow='hidden';
  const titles={tap:'Tap Rush',memory:'Memory Mix',dodge:'Neon Dodge'};$('#modalTitle').textContent=titles[id]||'Quick Play';statusLine.textContent='Ready when you are.';$('#startGame').hidden=false;
  if(id==='tap') setupTap(false); if(id==='memory') setupMemory(false); if(id==='dodge') setupDodge(false);
}
function closeGame(){cleanupGame();modal.hidden=true;document.body.style.overflow='';currentGame=null}
$('#closeModal').addEventListener('click',closeGame);
modal.addEventListener('click',e=>{if(e.target===modal)closeGame()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeGame()});
$$('[data-launch]').forEach(b=>b.addEventListener('click',()=>openGame(b.dataset.launch)));
$('#startGame').addEventListener('click',()=>{if(currentGame==='tap')setupTap(true);if(currentGame==='memory')setupMemory(true);if(currentGame==='dodge')setupDodge(true)});
$('#restartGame').addEventListener('click',()=>{if(currentGame==='tap')setupTap(true);if(currentGame==='memory')setupMemory(true);if(currentGame==='dodge')setupDodge(true)});

function setupTap(start){
 cleanupGame();stage.innerHTML=`<div class="tap-game"><div><div class="eyebrow">YOUR SCORE</div><div class="big-score" id="tapScore">0</div></div><button class="tap-target" id="tapTarget">${start?'TAP!':'READY?'}</button><div class="eyebrow" id="tapTime">${start?'30 SECONDS':'HIT START TO BEGIN'}</div></div>`;
 let score=0, left=30, interval=null, active=start;const target=$('#tapTarget'), scoreEl=$('#tapScore'), timeEl=$('#tapTime');
 $('#startGame').hidden=start; statusLine.textContent=start?'Tap as fast as you can!':'Get ready to tap as many times as possible.';
 function finish(){active=false;clearInterval(interval);target.disabled=true;target.textContent='DONE!';statusLine.textContent=`Time! You scored ${score} taps. ${score>=30?'Nice reflexes! Run it back.':'Try again and beat your score!'}`;savePlayed('tap');}
 target.addEventListener('click',()=>{if(!active){toast('Tap Start game first');return}score++;scoreEl.textContent=score;target.animate([{transform:'scale(.94)'},{transform:'scale(1)'}],{duration:100})});
 if(start){interval=setInterval(()=>{left--;timeEl.textContent=`${left} SECONDS LEFT`;if(left<=0)finish()},1000)}
 cleanupGame=()=>{clearInterval(interval)};
}
const symbols=['✦','◈','●','▲','☾','✚','✿','⬟'];
function setupMemory(start){
 cleanupGame();let deck=[...symbols.slice(0,6),...symbols.slice(0,6)].sort(()=>Math.random()-.5),first=null,lock=false,matches=0,moves=0;
 stage.innerHTML=`<div style="width:100%"><div class="eyebrow" style="text-align:center;margin-bottom:12px">FIND ALL 6 PAIRS</div><div class="memory-game" id="memoryGrid">${deck.map((_,i)=>`<button class="memory-card" data-index="${i}" aria-label="Hidden card">?</button>`).join('')}</div><div style="text-align:center;margin-top:12px;font-size:11px;color:#a4aab7">Moves: <b id="memoryMoves">0</b></div></div>`;
 const grid=$('#memoryGrid');$('#startGame').hidden=start;statusLine.textContent=start?'Flip two cards at a time. Find every matching pair!':'Ready to test your memory?';
 if(!start){grid.querySelectorAll('button').forEach(b=>b.disabled=true);return}
 grid.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
   if(lock||btn.classList.contains('matched')||btn.classList.contains('revealed'))return;
   const i=+btn.dataset.index;btn.textContent=deck[i];btn.classList.add('revealed');btn.setAttribute('aria-label',deck[i]);
   if(!first){first=btn;return}moves++;$('#memoryMoves').textContent=moves;
   if(deck[+first.dataset.index]===deck[i]){first.classList.add('matched');btn.classList.add('matched');first.classList.remove('revealed');btn.classList.remove('revealed');first=null;matches++;if(matches===6){statusLine.textContent=`You cleared the board in ${moves} moves. Big brain energy!`;savePlayed('memory')}}else{lock=true;const old=first;setTimeout(()=>{old.textContent='?';btn.textContent='?';old.classList.remove('revealed');btn.classList.remove('revealed');old.setAttribute('aria-label','Hidden card');btn.setAttribute('aria-label','Hidden card');first=null;lock=false},650)}
 }));
 cleanupGame=()=>{};
}
function setupDodge(start){
 cleanupGame();stage.innerHTML=`<div class="dodge-game"><div style="font-size:11px;color:#a4aab7">Move left or right to avoid the falling stars.</div><div class="dodge-board" id="dodgeBoard"><span class="dodge-ship" id="dodgeShip">◆</span></div><div class="dodge-controls"><button id="leftMove" aria-label="Move left">← LEFT</button><button id="rightMove" aria-label="Move right">RIGHT →</button></div><div style="font-size:11px">Score: <b id="dodgeScore">0</b></div></div>`;
 $('#startGame').hidden=start;statusLine.textContent=start?'Avoid the falling obstacles for as long as you can.':'Ready to test your reflexes?';
 const board=$('#dodgeBoard'),ship=$('#dodgeShip');let pos=50,score=0,active=start,loop=null,spawn=null,obstacles=[];
 function move(n){pos=Math.max(8,Math.min(92,pos+n));ship.style.left=pos+'%'}
 $('#leftMove').addEventListener('click',()=>move(-12));$('#rightMove').addEventListener('click',()=>move(12));
 board.addEventListener('pointerdown',e=>{const r=board.getBoundingClientRect();move(e.clientX<r.left+r.width/2?-12:12)});
 if(start){
  function create(){if(!active)return;const o=document.createElement('span');o.className='dodge-obstacle';o.textContent='●';o.style.left=(5+Math.random()*88)+'%';board.append(o);obstacles.push({el:o,y:-25,x:parseFloat(o.style.left)})}
  spawn=setInterval(create,680);let last=0;
  function frame(t){if(!active)return;if(t-last>30){last=t;obstacles=obstacles.filter(o=>{o.y+=4.1;o.el.style.top=o.y+'px';const close=o.y>145&&o.y<180&&Math.abs(o.x-pos)<10;if(close){active=false;clearInterval(spawn);statusLine.textContent=`Game over! You scored ${score}. Try again?`;savePlayed('dodge');return false}if(o.y>200){o.el.remove();score++;$('#dodgeScore').textContent=score;return false}return true})}loop=requestAnimationFrame(frame)}
  loop=requestAnimationFrame(frame);
 }
 cleanupGame=()=>{active=false;clearInterval(spawn);cancelAnimationFrame(loop)};
}
$('#randomGame').addEventListener('click',()=>{const games=['tap','memory','dodge'];openGame(games[Math.floor(Math.random()*games.length)])});
$('#favoritesButton').addEventListener('click',()=>toast('Saved games are coming in the next update ✦'));
$('#installHint').addEventListener('click',()=>toast('After deployment, use your browser menu → Add to Home screen.'));
if('serviceWorker' in navigator && location.protocol.startsWith('http')){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}
let deferredPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e});
$('#installHint').addEventListener('click',async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null}});
