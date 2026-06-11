var MG = (typeof LANG !== 'undefined' && LANG.MINIGAME) ? LANG.MINIGAME : null;

var shroomGame = {
  phase: 1,
  active: false,
  charge: 0,
  charging: false,
  rhythm: 0,
  rhythmDir: 1,
  chances: 3,
  onSuccess: null,
  onFail: null,
  interval: null,
  shroomType: null,
};

var SHROOM_TYPES = [
  { id:'gear',    icon:'⚙️', name: MG ? MG.shroomGear    : '태엽 버섯',     color:'#b0a060', effect: MG ? MG.shroomGearEffect    : '틱톡 소리가 납니다!' },
  { id:'steam',   icon:'💨', name: MG ? MG.shroomSteam   : '증기 버섯',     color:'#90c0d0', effect: MG ? MG.shroomSteamEffect   : '증기가 칙칙 나옵니다!' },
  { id:'magnet',  icon:'🧲', name: MG ? MG.shroomMagnet  : '자석 버섯',     color:'#6080c0', effect: MG ? MG.shroomMagnetEffect  : '금속이 끌려옵니다!' },
  { id:'glitter', icon:'✨', name: MG ? MG.shroomGlitter : '반짝 꼬리 버섯', color:'#d0a0d0', effect: MG ? MG.shroomGlitterEffect : '갓이 꼬리처럼 흔들립니다!' },
];

function openShroomMiniGame(successCb, failCb) {
  shroomGame.onSuccess = successCb;
  shroomGame.onFail = failCb;
  shroomGame.phase = 1;
  shroomGame.active = true;
  shroomGame.charge = 0;
  shroomGame.chances = 3;
  shroomGame.shroomType = SHROOM_TYPES[Math.floor(Math.random() * SHROOM_TYPES.length)];

  var popup = document.getElementById('shroom-minigame-popup');
  popup.style.display = 'flex';
  renderShroomPhase1();
}

function closeShroomMinigame() {
  clearInterval(shroomGame.interval);
  shroomGame.active = false;
  document.getElementById('shroom-minigame-popup').style.display = 'none';
}

function renderShroomPhase1() {
  var c = document.getElementById('shroom-game-content');
  c.innerHTML = `
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-size:.9rem;color:#f0d080;margin-bottom:4px">${MG ? MG.shroomPhase1Title : '1단계 — 발톱 충전'}</div>
      <div style="font-size:.75rem;color:#a0906a">${MG ? MG.shroomPhase1Desc : '스크래치 포스트를 긁어 마법 정전기를 충전하세요!'}</div>
    </div>
    <div style="text-align:center;margin-bottom:16px;font-size:3rem">${shroomGame.shroomType.icon}</div>
    <div style="margin-bottom:14px">
      <div style="font-size:.72rem;color:#a0906a;margin-bottom:6px">${MG ? MG.shroomPhase1Gauge : '⚡ 충전량'}</div>
      <div style="position:relative;height:28px;background:rgba(0,0,0,.3);border-radius:14px;overflow:hidden;border:1px solid rgba(180,130,50,.3)">
        <div id="shroom-charge-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#6040c0,#a060f0);border-radius:14px;transition:width .1s"></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#fff;font-weight:bold">⚡ <span id="shroom-charge-val">0</span>%</div>
      </div>
    </div>
    <div style="text-align:center;margin-bottom:12px">
      <div id="shroom-scratch-post" onclick="scratchPost()" style="display:inline-block;padding:16px 32px;border-radius:12px;background:rgba(80,50,20,.4);border:2px solid rgba(150,100,50,.5);color:#d4a830;font-size:1rem;cursor:pointer;user-select:none;transition:transform .1s" onmousedown="this.style.transform='scale(.95)'" onmouseup="this.style.transform='scale(1)'">
        ${MG ? MG.shroomPhase1Btn : '🪵 긁기!'}
      </div>
    </div>
    <div id="shroom-phase1-msg" style="text-align:center;font-size:.75rem;color:#a0906a">${MG ? MG.shroomPhase1Msg : '스크래치 포스트를 빠르게 클릭하세요!'}</div>
  `;
  shroomGame.charge = 0;
}

function scratchPost() {
  shroomGame.charge = Math.min(100, shroomGame.charge + 12);
  document.getElementById('shroom-charge-bar').style.width = shroomGame.charge + '%';
  document.getElementById('shroom-charge-val').textContent = Math.floor(shroomGame.charge);

  var post = document.getElementById('shroom-scratch-post');
  post.style.boxShadow = '0 0 12px rgba(160,96,240,.8)';
  setTimeout(function(){ if(post) post.style.boxShadow = 'none'; }, 150);

  if(shroomGame.charge >= 100) {
    document.getElementById('shroom-phase1-msg').textContent = MG ? MG.shroomPhase1Done : '⚡ 충전 완료! 버섯 뿌리를 클릭하세요!';
    document.getElementById('shroom-phase1-msg').style.color = '#a060f0';
    setTimeout(function(){ renderShroomPhase1b(); }, 600);
  } else if(shroomGame.charge >= 60) {
    document.getElementById('shroom-phase1-msg').textContent = MG ? MG.shroomPhase1Almost : '⚡ 거의 다 됐어요!';
    document.getElementById('shroom-phase1-msg').style.color = '#c0a0f0';
  }
}

function renderShroomPhase1b() {
  var c = document.getElementById('shroom-game-content');
  var tx = 20 + Math.random() * 60;
  var ty = 20 + Math.random() * 60;
  c.innerHTML = `
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-size:.9rem;color:#f0d080;margin-bottom:4px">${MG ? MG.shroomPhase1bTitle : '1단계 — 뿌리 정밀 타격'}</div>
      <div style="font-size:.75rem;color:#a0906a">${MG ? MG.shroomPhase1bDesc : '버섯 뿌리(🎯)를 정확히 클릭하세요!'}</div>
    </div>
    <div id="shroom-target-area" style="position:relative;width:100%;height:200px;background:rgba(30,50,20,.4);border-radius:12px;border:1.5px solid rgba(80,120,50,.4);overflow:hidden">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(40,80,20,.4) 0%,transparent 70%)"></div>
      <div id="shroom-root-target" onclick="clickRoot()" style="position:absolute;left:${tx}%;top:${ty}%;transform:translate(-50%,-50%);font-size:1.6rem;cursor:crosshair;animation:pulse 1s infinite">🎯</div>
    </div>
    <div id="shroom-phase1b-msg" style="text-align:center;margin-top:10px;font-size:.75rem;color:#a0906a">${MG ? MG.shroomPhase1bMsg : '⚡ 충전된 발톱으로 뿌리를 타격!'}</div>
  `;
}

function clickRoot() {
  document.getElementById('shroom-phase1b-msg').textContent = MG ? MG.shroomPhase1bDone : '✅ 뿌리 타격 성공!';
  document.getElementById('shroom-phase1b-msg').style.color = '#80d080';
  document.getElementById('shroom-root-target').textContent = '💥';
  setTimeout(function(){ renderShroomPhase2(); }, 600);
}

function renderShroomPhase2() {
  shroomGame.rhythm = 0;
  shroomGame.rhythmDir = 1;
  shroomGame.chances = 3;
  var beatCount = 0;
  var totalBeats = 3;

  var c = document.getElementById('shroom-game-content');
  c.innerHTML = `
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-size:.9rem;color:#f0d080;margin-bottom:4px">${MG ? MG.shroomPhase2Title : '2단계 — 꼬리 살랑 교감'}</div>
      <div style="font-size:.75rem;color:#a0906a">${MG ? MG.shroomPhase2Desc : '포자가 퍼질 때 박자에 맞춰 탭하세요!'}</div>
    </div>
    <div style="text-align:center;margin-bottom:10px">
      <div id="shroom-emoji" style="font-size:3rem;transition:transform .15s">${shroomGame.shroomType.icon}</div>
      <div id="shroom-spore-ring" style="margin:8px auto;width:80px;height:80px;border-radius:50%;border:3px solid rgba(180,130,50,.3);display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#a0906a;transition:all .2s">${MG ? MG.shroomPhase2Wait : '대기 중...'}</div>
    </div>
    <div style="position:relative;height:20px;background:rgba(0,0,0,.3);border-radius:10px;overflow:hidden;border:1px solid rgba(180,130,50,.3);margin-bottom:14px">
      <div style="position:absolute;left:40%;width:20%;height:100%;background:rgba(50,200,50,.25);border-left:2px solid #50c050;border-right:2px solid #50c050"></div>
      <div id="shroom-rhythm-bar" style="position:absolute;top:0;left:0%;width:6px;height:100%;background:#f0d080;border-radius:3px;box-shadow:0 0 6px rgba(240,208,128,.8)"></div>
    </div>
    <div style="text-align:center;margin-bottom:10px">
      <button onclick="shroomTap()" style="padding:14px 36px;border-radius:16px;background:rgba(80,50,20,.4);border:2px solid rgba(180,130,50,.5);color:#f0d080;font-size:1rem;cursor:pointer">${MG ? MG.shroomPhase2Btn : '🐾 살랑!'}</button>
    </div>
    <div id="shroom-phase2-msg" style="text-align:center;font-size:.75rem;color:#a0906a">${MG ? MG.confirm : '성공'}: <span id="shroom-beat-count">0</span>/${totalBeats} | ${MG ? MG.mossPhase3Remain : '기회: '}<span id="shroom-chances">3</span></div>
  `;

  shroomGame.beatCount = 0;
  shroomGame.totalBeats = totalBeats;

  shroomGame.interval = setInterval(function(){
    shroomGame.rhythm += shroomGame.rhythmDir * 2;
    if(shroomGame.rhythm >= 100) shroomGame.rhythmDir = -1;
    if(shroomGame.rhythm <= 0) shroomGame.rhythmDir = 1;

    var bar = document.getElementById('shroom-rhythm-bar');
    if(bar) bar.style.left = shroomGame.rhythm + '%';

    var inZone = shroomGame.rhythm >= 40 && shroomGame.rhythm <= 60;
    var ring = document.getElementById('shroom-spore-ring');
    var emoji = document.getElementById('shroom-emoji');
    if(ring) {
      ring.style.borderColor = inZone ? 'rgba(50,200,50,.8)' : 'rgba(180,130,50,.3)';
      ring.style.boxShadow = inZone ? '0 0 12px rgba(50,200,50,.4)' : 'none';
      ring.textContent = inZone ? (MG ? MG.shroomPhase2Now : '✨ 지금!') : (MG ? MG.shroomPhase2Wait : '대기 중...');
      ring.style.color = inZone ? '#80d080' : '#a0906a';
    }
    if(emoji) emoji.style.transform = inZone ? 'scale(1.15)' : 'scale(1)';
  }, 30);
}

function shroomTap() {
  var inZone = shroomGame.rhythm >= 40 && shroomGame.rhythm <= 60;
  if(inZone) {
    shroomGame.beatCount++;
    document.getElementById('shroom-beat-count').textContent = shroomGame.beatCount;
    document.getElementById('shroom-phase2-msg').style.color = '#80d080';
    if(shroomGame.beatCount >= shroomGame.totalBeats) {
      clearInterval(shroomGame.interval);
      setTimeout(shroomSuccess, 400);
    }
  } else {
    shroomGame.chances--;
    document.getElementById('shroom-chances').textContent = shroomGame.chances;
    document.getElementById('shroom-phase2-msg').style.color = '#f06040';
    if(shroomGame.chances <= 0) {
      clearInterval(shroomGame.interval);
      setTimeout(shroomFail, 400);
    }
  }
}

function shroomSuccess() {
  var c = document.getElementById('shroom-game-content');
  c.innerHTML = `
    <div style="text-align:center;padding:20px">
      <div style="font-size:2.5rem;margin-bottom:12px">${shroomGame.shroomType.icon}</div>
      <div style="font-size:1rem;color:#f0d080;margin-bottom:6px">${shroomGame.shroomType.name} ${MG ? MG.confirm : '채집 성공!'}</div>
      <div style="font-size:.8rem;color:#c0a0d0;margin-bottom:4px">${shroomGame.shroomType.effect}</div>
      <div style="font-size:.75rem;color:#a0d080;margin-bottom:16px">${MG ? MG.shroomSuccessMsg : '버섯이 기분 좋게 쏙 튀어 올랐습니다!'}</div>
      <button onclick="closeShroomMinigame()" style="padding:10px 24px;border-radius:10px;background:rgba(50,150,50,.3);border:1px solid #50c050;color:#80d080;cursor:pointer">${MG ? MG.confirm : '확인'}</button>
    </div>
  `;
  if(shroomGame.onSuccess) shroomGame.onSuccess();
}

function shroomFail() {
  var c = document.getElementById('shroom-game-content');
  c.innerHTML = `
    <div style="text-align:center;padding:20px">
      <div style="font-size:2.5rem;margin-bottom:12px">🍄</div>
      <div style="font-size:1rem;color:#f06040;margin-bottom:8px">${MG ? MG.retry : '교감 실패...'}</div>
      <div style="font-size:.8rem;color:#a0906a;margin-bottom:16px">${MG ? MG.shroomFailMsg : '버섯이 땅속으로 쏙 숨어버렸어요. 다시 도전!'}</div>
      <button onclick="closeShroomMinigame()" style="padding:10px 24px;border-radius:10px;background:rgba(150,50,50,.3);border:1px solid #c05050;color:#f08080;cursor:pointer">${MG ? MG.close : '닫기'}</button>
    </div>
  `;
  if(shroomGame.onFail) shroomGame.onFail();
}