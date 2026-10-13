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

/* JUXO PS library extension: search, hosted HTML5 games and ZIP packages */
const JUXO_GAMES_KEY='juxoExternalGamesV1';
let importMode='url';
function getExternalGames(){try{return JSON.parse(localStorage.getItem(JUXO_GAMES_KEY)||'[]')}catch{return []}}
function saveExternalGames(list){localStorage.setItem(JUXO_GAMES_KEY,JSON.stringify(list))}
function safeGameId(){return 'ext-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function showImportMessage(msg){const el=$('#importMessage');if(el)el.textContent=msg}
function openImport(){const panel=$('#importPanel');if(panel){panel.hidden=false;panel.scrollIntoView({behavior:'smooth',block:'start'})}}
$('#addGameButton')?.addEventListener('click',openImport);
$('#closeImport')?.addEventListener('click',()=>$('#importPanel').hidden=true);
$$('[data-import-tab]').forEach(btn=>btn.addEventListener('click',()=>{
 importMode=btn.dataset.importTab;
 $$('[data-import-tab]').forEach(b=>b.classList.toggle('active',b===btn));
 $('#urlImport').hidden=importMode!=='url';$('#zipImport').hidden=importMode!=='zip';showImportMessage('');
}));
function addExternalCard(game){
 if($('#gameGrid').querySelector(`[data-game="${game.id}"]`))return;
 const card=document.createElement('article');card.className='game-card external-card';card.dataset.game=game.id;card.dataset.orientation=game.orientation||'auto';
 const art=document.createElement('div');art.className='game-art';
 const tag=document.createElement('span');tag.className='external-tag';tag.textContent=game.kind==='zip'?'IMPORTED HTML5':'HOSTED GAME';
 const glyph=document.createElement('span');glyph.className='external-art-icon';glyph.textContent='▶';art.append(tag,glyph);
 const info=document.createElement('div');info.className='game-info';const copy=document.createElement('div');const h=document.createElement('h3');h.textContent=game.name;const desc=document.createElement('p');desc.textContent=game.orientation==='landscape'?'Landscape · HTML5':game.orientation==='portrait'?'Portrait · HTML5':'HTML5 · External';copy.append(h,desc);
 const play=document.createElement('button');play.className='play-button';play.textContent='▶';play.setAttribute('aria-label','Play '+game.name);play.dataset.launch=game.id;play.addEventListener('click',()=>openGame(game.id));
 info.append(copy,play);card.append(art,info);$('#gameGrid').append(card);
}
function renderExternalGames(){getExternalGames().forEach(addExternalCard)}
function filterGames(){const q=($('#gameSearch')?.value||'').trim().toLowerCase();$$('.game-card').forEach(card=>{card.hidden=!!q&&!card.textContent.toLowerCase().includes(q)})}
$('#gameSearch')?.addEventListener('input',filterGames);
function registerGame(game){const list=getExternalGames().filter(g=>g.id!==game.id);list.push(game);saveExternalGames(list);addExternalCard(game);filterGames()}
$('#saveUrlGame')?.addEventListener('click',()=>{
 const raw=$('#gameUrl').value.trim(),name=$('#gameName').value.trim()||'Web Game',orientation=$('#gameOrientation').value;
 let u;try{u=new URL(raw)}catch{showImportMessage('Enter a valid full URL starting with https://');return}
 if(!['https:'].includes(u.protocol)){showImportMessage('For safety, use an HTTPS game URL.');return}
 registerGame({id:safeGameId(),name,url:u.href,orientation,kind:'url'});$('#gameUrl').value='';$('#gameName').value='';showImportMessage('Game added to your library. Try Play; some sites block embedding.');toast('Game added ✦');
});
function fileToDataURL(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}
function guessMime(path){const ext=(path.split('.').pop()||'').toLowerCase();return ({html:'text/html',htm:'text/html',css:'text/css',js:'text/javascript',mjs:'text/javascript',json:'application/json',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',mp3:'audio/mpeg',ogg:'audio/ogg',wav:'audio/wav',mp4:'video/mp4',webm:'video/webm',woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf'})[ext]||'application/octet-stream'}
function replaceZipRefs(html,files){
 // Convert common relative asset links to data URLs so a ZIP can run without a web server.
 for(const [path,data] of Object.entries(files)){
  const base=path.split('/').pop();
  const escaped=path.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const uri=data;
  html=html.replace(new RegExp("((?:src|href)\\s*=\\s*[\"'])"+escaped+"([\"'])",'gi'),`$1${uri}$2`);
  if(base!==path.split('/')[0])html=html.replace(new RegExp("((?:src|href)\\s*=\\s*[\"'])"+base.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')+"([\"'])",'gi'),`$1${uri}$2`);
 }
 return html;
}
$('#importZipGame')?.addEventListener('click',async()=>{
 const file=$('#gameZip').files?.[0];if(!file){showImportMessage('Choose a ZIP file first.');return}if(file.size>15*1024*1024){showImportMessage('This ZIP is over the 15 MB limit.');return}if(!window.JSZip){showImportMessage('The ZIP reader could not load. Check your internet connection and try again.');return}
 const btn=$('#importZipGame');btn.disabled=true;btn.textContent='Importing…';
 try{
  const zip=await JSZip.loadAsync(file);const entries=Object.values(zip.files).filter(x=>!x.dir&&!x.name.startsWith('__MACOSX/')&&!x.name.split('/').some(part=>part==='..'));
  const htmlEntry=entries.find(x=>x.name.toLowerCase()==='index.html')||entries.find(x=>x.name.toLowerCase().endsWith('/index.html'))||entries.find(x=>/\.html?$/i.test(x.name));
  if(!htmlEntry)throw new Error('No HTML entry page found. Include index.html in the ZIP.');
  if(entries.length>250)throw new Error('This ZIP contains too many files (limit: 250).');
  const data={};let total=0;
  for(const entry of entries){const blob=await entry.async('blob');total+=blob.size;if(total>20*1024*1024)throw new Error('Expanded game exceeds 20 MB.');data[entry.name]=await fileToDataURL(new File([blob],entry.name,{type:guessMime(entry.name)}));}
  let source=await htmlEntry.async('string');source=replaceZipRefs(source,data);
  const id=safeGameId();const game={id,name:$('#gameName').value.trim()||file.name.replace(/\.zip$/i,''),orientation:$('#gameOrientation').value,kind:'zip',html:source,files:data};
  // Keep package data in IndexedDB, metadata in localStorage to avoid localStorage size limits.
  await idbPut(game);const meta={id,name:game.name,orientation:game.orientation,kind:'zip'};const list=getExternalGames();list.push(meta);saveExternalGames(list);addExternalCard(meta);filterGames();$('#gameZip').value='';$('#gameName').value='';showImportMessage('ZIP imported. Open its card to test the game.');toast('HTML5 game imported ✦');
 }catch(err){showImportMessage(err.message||'Could not import this ZIP. Check the package and try again.')}finally{btn.disabled=false;btn.innerHTML='Import ZIP <span>＋</span>'}
});
function openGameDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open('juxo-ps-games',1);req.onupgradeneeded=()=>req.result.createObjectStore('packages',{keyPath:'id'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function idbPut(game){const db=await openGameDB();return new Promise((resolve,reject)=>{const tx=db.transaction('packages','readwrite');tx.objectStore('packages').put(game);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
async function idbGet(id){const db=await openGameDB();return new Promise((resolve,reject)=>{const req=db.transaction('packages','readonly').objectStore('packages').get(id);req.onsuccess=()=>{db.close();resolve(req.result)};req.onerror=()=>{db.close();reject(req.error)}})}
const originalOpenGame=openGame;
openGame=async function(id){
 const ext=getExternalGames().find(g=>g.id===id);
 if(!ext){document.body.classList.remove('landscape-game');$('#restartGame').hidden=false;return originalOpenGame(id)}
 currentGame=id;cleanupGame();stage.innerHTML='';modal.hidden=false;document.body.style.overflow='hidden';$('#modalTitle').textContent=ext.name;statusLine.textContent='External HTML5 game';$('#startGame').hidden=true;$('#restartGame').hidden=true;
 document.body.classList.toggle('landscape-game',ext.orientation==='landscape');
 const wrap=document.createElement('div');wrap.className='external-stage';const hint=document.createElement('div');hint.className='orientation-hint';hint.textContent=ext.orientation==='landscape'?'Landscape game · rotate your phone for a wider view':ext.orientation==='portrait'?'Portrait game':'External HTML5 game';
 const frame=document.createElement('iframe');frame.className='external-game-frame';frame.title=ext.name;frame.allow='fullscreen; autoplay; gamepad';frame.setAttribute('allowfullscreen','');frame.referrerPolicy='no-referrer';
 if(ext.kind==='url'){frame.sandbox='allow-scripts allow-forms allow-pointer-lock allow-popups';frame.src=ext.url;}
 else {try{const full=await idbGet(id);if(!full)throw new Error('Imported package not found on this device. Please import the ZIP again.');frame.sandbox='allow-scripts allow-forms allow-pointer-lock';frame.srcdoc=full.html;}catch(err){closeGame();toast(err.message||'Could not open imported game');return}}
 wrap.append(hint,frame);stage.append(wrap);cleanupGame=()=>{frame.src='about:blank';document.body.classList.remove('landscape-game')};
};
const originalCloseGame=closeGame;
closeGame=function(){originalCloseGame();$('#restartGame').hidden=false;document.body.classList.remove('landscape-game')};
// Make the restart control available again for built-in games after an external session.
const originalBuiltInOpen=openGame;
// Replace static Coming Soon card with an honest placeholder; render imported library.
renderExternalGames();filterGames();
