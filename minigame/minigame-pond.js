var MG = (typeof LANG !== 'undefined' && LANG.MINIGAME) ? LANG.MINIGAME : null;

var pondGame = {
  active: false,
  phase: 1,
  onSuccess: null,
  onFail: null,
  interval: null,
  scissors: { x: 50, y: 50 },
  heat: 0,
  cut: 0,
  totalCut: 3,
  combo: 0,
  plants: [],
  obstacles: [],
};

var AQUA_TYPES = [
  { id:'gear',   icon:'⚙️', name: MG ? MG.aquaGear   : '태엽 줄기 수초', color:'#a0c080' },
  { id:'bubble', icon:'🫧', name: MG ? MG.aquaBubble : '거품 뿜는 수초', color:'#80c0d0' },
  { id:'lotus',  icon:'🌸', name: MG ? MG.aquaLotus  : '달빛 연꽃',      color:'#d0a0c0' },
];

function openPondMiniGame(successCb, failCb) {
  pondGame.onSuccess = successCb;
  pondGame.onFail = failCb;
  pondGame.phase = 1;
  pondGame.active = true;
  pondGame.heat = 0;
  pondGame.cut = 0;
  pondGame.combo = 0;

  document.getElementById('pond-minigame-popup').style.display = 'flex';
  renderPondPhase1();
}

function closePondMinigame() {
  clearInterval(pondGame.interval);
  pondGame.active = false;
  document.getElementById('pond-minigame-popup').style.display = 'none';
}

function renderPondPhase1() {
  var c = document.getElementById('pond-game-content');
  c.innerHTML = `
    <div style="text-align:center;padding:20px">
      <div style="font-size:2.5rem;margin-bottom:12px;animation:pondBubble 1s infinite">🤿</div>
      <div style="font-size:.9rem;color:#80c0d0;margin-bottom:8px">${MG ? MG.pondPhase2Title : '증기 구동 기계 가위 가동 중...'}</div>
      <div style="font-size:.75rem;color:#6090a0;line-height:1.6;margin-bottom:16px">
        ${MG ? MG.pondPhase1Desc : '수초 줄기를 따라 가위를 이동하세요<br>빛나는 매듭에서 클릭하면 절단!<br><span style="color:#ff9090">⚠️ 너무 빠르면 가위가 과열돼요</span>'}
      </div>
      <button onclick="renderPondPhase2()" style="padding:12px 28px;border-radius:12px;background:rgba(40,80,120,.4);border:2px solid rgba(80,150,200,.5);color:#80c0d0;font-size:.9rem;cursor:pointer">
        ${MG ? MG.pondPhase1Btn : '🌊 잠수 시작'}
      </button>
    </div>
  `;
}

function renderPondPhase2() {
  pondGame.heat = 0;
  pondGame.cut = 0;
  pondGame.combo = 0;

  pondGame.plants = [
    { x: 20, y: 30, type: AQUA_TYPES[0], cut: false, wobble: 0 },
    { x: 50, y: 50, type: AQUA_TYPES[1], cut: false, wobble: 0 },
    { x: 75, y: 25, type: AQUA_TYPES[2], cut: false, wobble: 0 },
    { x: 35, y: 70, type: AQUA_TYPES[0], cut: false, wobble: 0 },
  ];

  pondGame.obstacles = [
    { x: 40, y: 45 },
    { x: 65, y: 60 },
  ];

  var c = document.getElementById('pond-game-content');
  c.innerHTML = `
    <div style="text-align:center;margin-bottom:8px">
      <div style="font-size:.85rem;color:#80c0d0">${MG ? MG.pondPhase2Title : '2단계 — 수초 절단'}</div>
      <div style="font-size:.7rem;color:#6090a0;line-height:1.5">
        ${MG ? MG.pondPhase2Desc : '빛나는 매듭(✨)을 클릭해서 수초를 잘라요<br>⚙️ 톱니바퀴를 피하세요!'}
      </div>
    </div>
    <div style="margin-bottom:8px">
      <div style="font-size:.68rem;color:#6090a0;margin-bottom:3px">${MG ? MG.pondPhase2Heat : '🌡️ 가위 열기 '}<span id="pond-heat-val">0</span>%</div>
      <div style="height:8px;background:rgba(0,0,0,.3);border-radius:4px;overflow:hidden;border:1px solid rgba(80,150,200,.3)">
        <div id="pond-heat-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#4080c0,#ff4020);border-radius:4px;transition:width .1s"></div>
      </div>
    </div>
    <div id="pond-area" style="position:relative;width:100%;height:220px;background:radial-gradient(ellipse at center,rgba(20,60,100,.9) 0%,rgba(5,20,40,.95) 100%);border-radius:12px;border:1.5px solid rgba(80,150,200,.4);overflow:hidden;cursor:crosshair">
      <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(80,150,200,.05) 20px,rgba(80,150,200,.05) 21px)"></div>
      ${pondGame.plants.map(function(p,i){ return '<div id="pond-plant-'+i+'" onclick="cutPlant('+i+')" style="position:absolute;left:'+p.x+'%;top:'+p.y+'%;transform:translate(-50%,-50%);cursor:crosshair;text-align:center"><div style="font-size:1.4rem">'+p.type.icon+'</div><div style="font-size:.6rem;color:rgba(180,255,180,.8);margin-top:2px">✨</div></div>'; }).join('')}
      ${pondGame.obstacles.map(function(o){ return '<div style="position:absolute;left:'+o.x+'%;top:'+o.y+'%;transform:translate(-50%,-50%);font-size:1.4rem;animation:pondSpin 2s linear infinite;pointer-events:none">⚙️</div>'; }).join('')}
      <div id="pond-scissors" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:1.8rem;pointer-events:none;z-index:10;transition:left .05s,top .05s">✂️</div>
      <div style="position:absolute;top:6px;left:0;right:0;text-align:center;font-size:.6rem;color:rgba(80,150,200,.4)">${MG ? MG.pondPhase2Under : '~ 수중 작업 중 ~'}</div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
      <div style="font-size:.75rem;color:#80c0d0">${MG ? MG.pondPhase2Cut : '절단: '}<span id="pond-cut-count">0</span>/${pondGame.totalCut}</div>
      <div style="font-size:.75rem;color:#f0d080">${MG ? MG.pondPhase2Combo : '콤보: '}<span id="pond-combo">0</span></div>
      <button onclick="pondCool()" style="padding:5px 10px;border-radius:8px;background:rgba(20,60,100,.4);border:1px solid rgba(80,150,200,.4);color:#80c0d0;font-size:.68rem;cursor:pointer">${MG ? MG.pondPhase2Cool : '💧 냉각'}</button>
    </div>
    <div id="pond-msg" style="text-align:center;margin-top:6px;font-size:.72rem;color:#6090a0">${MG ? MG.pondPhase2Msg : '가위를 수초 위로 이동하세요'}</div>
  `;

  var area = document.getElementById('pond-area');
  var scissors = document.getElementById('pond-scissors');

  area.addEventListener('mousemove', function(e) {
    if(!pondGame.active) return;
    var rect = area.getBoundingClientRect();
    var px = (e.clientX - rect.left) / rect.width * 100;
    var py = (e.clientY - rect.top) / rect.height * 100;
    pondGame.scissors.x = Math.max(5, Math.min(95, px));
    pondGame.scissors.y = Math.max(5, Math.min(95, py));
    scissors.style.left = pondGame.scissors.x + '%';
    scissors.style.top = pondGame.scissors.y + '%';

    var hitObstacle = pondGame.obstacles.some(function(o) {
      return Math.sqrt(Math.pow(pondGame.scissors.x - o.x, 2) + Math.pow(pondGame.scissors.y - o.y, 2)) < 8;
    });

    if(hitObstacle) {
      pondGame.heat = Math.min(100, pondGame.heat + 5);
      updatePondHeat();
    } else {
      pondGame.heat = Math.max(0, pondGame.heat - 0.2);
      updatePondHeat();
    }

    if(pondGame.heat >= 100) { pondOverheat(); }
  });

  pondGame.interval = setInterval(function() {
    pondGame.plants.forEach(function(p, i) {
      if(p.cut) return;
      p.wobble += 0.1;
      var el = document.getElementById('pond-plant-' + i);
      if(el) {
        var wobbleX = Math.sin(p.wobble) * 3;
        el.style.transform = 'translate(calc(-50% + ' + wobbleX + 'px),-50%)';
      }
    });
  }, 50);
}

function updatePondHeat() {
  var bar = document.getElementById('pond-heat-bar');
  var val = document.getElementById('pond-heat-val');
  if(bar) bar.style.width = pondGame.heat + '%';
  if(val) val.textContent = Math.floor(pondGame.heat);
}

function pondCool() {
  pondGame.heat = Math.max(0, pondGame.heat - 40);
  updatePondHeat();
  var msg = document.getElementById('pond-msg');
  if(msg) { msg.textContent = MG ? MG.pondPhase2CoolDone : '💧 냉각 완료!'; msg.style.color = '#80c0d0'; }
}

function pondOverheat() {
  clearInterval(pondGame.interval);
  var msg = document.getElementById('pond-msg');
  if(msg) { msg.textContent = MG ? MG.pondPhase2Overheat : '🔥 과열! 잠시 대기...'; msg.style.color = '#ff6040'; }
  pondGame.heat = 70;
  setTimeout(function() {
    updatePondHeat();
    if(msg) { msg.textContent = MG ? MG.pondPhase2Msg : '가위를 수초 위로 이동하세요'; msg.style.color = '#6090a0'; }
    pondGame.interval = setInterval(function() {
      pondGame.plants.forEach(function(p, i) {
        if(p.cut) return;
        p.wobble += 0.1;
        var el = document.getElementById('pond-plant-' + i);
        if(el) {
          var wobbleX = Math.sin(p.wobble) * 3;
          el.style.transform = 'translate(calc(-50% + ' + wobbleX + 'px),-50%)';
        }
      });
    }, 50);
  }, 1500);
}

function cutPlant(idx) {
  if(!pondGame.active) return;
  var p = pondGame.plants[idx];
  if(p.cut) return;

  var dist = Math.sqrt(
    Math.pow(pondGame.scissors.x - p.x, 2) +
    Math.pow(pondGame.scissors.y - p.y, 2)
  );
  if(dist > 20) {
    var msg = document.getElementById('pond-msg');
    if(msg) { msg.textContent = MG ? MG.pondPhase2TooFar : '✂️ 가위를 더 가까이 대세요!'; msg.style.color = '#f0a030'; }
    return;
  }

  p.cut = true;
  pondGame.cut++;
  pondGame.combo++;
  pondGame.heat = Math.min(100, pondGame.heat + 8);
  updatePondHeat();

  var el = document.getElementById('pond-plant-' + idx);
  if(el) {
    el.innerHTML = '<div style="font-size:1.4rem;animation:pondPop .3s ease">💨</div>';
    setTimeout(function() { if(el) el.style.opacity = '0'; }, 300);
  }

  document.getElementById('pond-cut-count').textContent = pondGame.cut;
  document.getElementById('pond-combo').textContent = pondGame.combo;

  var msg = document.getElementById('pond-msg');
  if(pondGame.combo >= 2) {
    if(msg) { msg.textContent = (MG ? MG.pondPhase2ComboMsg : '🌟 콤보! ') + pondGame.combo + (MG ? '' : '연속!'); msg.style.color = '#f0d080'; }
  } else {
    if(msg) { msg.textContent = MG ? MG.pondPhase2CutDone : '✅ 치이익— 절단 성공!'; msg.style.color = '#80d080'; }
  }

  if(pondGame.cut >= pondGame.totalCut) {
    clearInterval(pondGame.interval);
    setTimeout(pondSuccess, 600);
  }
}

function pondSuccess() {
  var reward = pondGame.combo >= 4 ? 5 : pondGame.combo >= 2 ? 4 : 3;
  var c = document.getElementById('pond-game-content');
  c.innerHTML = `
    <div style="text-align:center;padding:20px">
      <div style="font-size:2.5rem;margin-bottom:12px">🌿</div>
      <div style="font-size:1rem;color:#80c0d0;margin-bottom:6px">${MG ? MG.confirm : '수초 채집 성공!'}</div>
      <div style="font-size:.85rem;color:#f0d080;margin-bottom:4px">×${reward}</div>
      ${pondGame.combo >= 2 ? '<div style="font-size:.75rem;color:#f0d080;margin-bottom:4px">'+(MG ? MG.pondComboBonus : '🌟 콤보 보너스!')+'</div>' : ''}
      <div style="font-size:.75rem;color:#6090a0;margin-bottom:16px">${MG ? MG.pondSuccessMsg : '치이익— 수초가 바구니로 이동했습니다!'}</div>
      <button onclick="closePondMinigame()" style="padding:10px 24px;border-radius:10px;background:rgba(40,80,120,.3);border:1px solid #80c0d0;color:#80c0d0;cursor:pointer">${MG ? MG.confirm : '확인'}</button>
    </div>
  `;
  if(pondGame.onSuccess) pondGame.onSuccess(reward);
}

function pondFail() {
  var c = document.getElementById('pond-game-content');
  c.innerHTML = `
    <div style="text-align:center;padding:20px">
      <div style="font-size:2.5rem;margin-bottom:12px">🌊</div>
      <div style="font-size:1rem;color:#f06040;margin-bottom:8px">${MG ? MG.retry : '채집 실패...'}</div>
      <div style="font-size:.8rem;color:#6090a0;margin-bottom:16px">${MG ? MG.pondFailMsg : '수초가 물속으로 가라앉았어요.'}</div>
      <button onclick="closePondMinigame()" style="padding:10px 24px;border-radius:10px;background:rgba(150,50,50,.3);border:1px solid #c05050;color:#f08080;cursor:pointer">${MG ? MG.close : '닫기'}</button>
    </div>
  `;
  if(pondGame.onFail) pondGame.onFail();
}