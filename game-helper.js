
// G 접근 헬퍼 (let G는 window에 노출 안 됨 → game.js의 window._getG() 사용)
function _G(){ return typeof window._getG==='function' ? window._getG() : null; }

// ══════════════════════════════════════════════
//  채집 딜레이 시스템
// ══════════════════════════════════════════════
(function(){
 
  var L={gather:'🌿 채집 중',special:'🌸 수확 중',search:'🔍 탐색 중',nap:'😴 낮잠 중'};
  var specialLabels={lookout:'🔭 탐색 중', bloom:'🌸 수확 중', pond:'🌙 명상 중', forest:'🌲 추출 중', hills:'🪨 탐색 중', mushroom:'🍄 채집 중', whisker:'✨ 집중 중'};
  var busy=false;
  window.addEventListener('load',function(){
    var orig=window.doAction;if(!orig)return;
    window.doAction=function(type){
        if(type==='gather' && typeof G!=='undefined' && G.curLoc==='lookout'){
        orig(type); return;
        }
        if(type==='special' && typeof G!=='undefined' && G.curLoc==='forest'){
     
      
  busy=true;
  openResinMinigame(
    function(){
      busy=false;
      document.querySelectorAll('.act-btn').forEach(function(b){b.disabled=false;b.style.opacity='';b.style.cursor='auto';});
    },
    function(){
      busy=false;
      document.querySelectorAll('.act-btn').forEach(function(b){b.disabled=false;b.style.opacity='';b.style.cursor='auto';});
    }
  );
  return;
}
   if(busy)return;
      var W={gather:3000,special:5000,search:4000,nap:2000};
 if(type==='rest'||type==='tonight'||!W[type]){orig(type);return;}
   
      if(type==='special' && typeof G!=='undefined' && G.curLoc==='bloom'){
  openHoneyMinigame(
   function(){ // 성공
  busy=false;
  document.querySelectorAll('.act-btn').forEach(function(b){b.disabled=false;b.style.opacity='';b.style.cursor='auto';});
  if(typeof G!=='undefined') G.herbs.honey=(G.herbs.honey||0)+10;
  orig(type);
},
     function(){ // 실패
  busy=false;
  document.querySelectorAll('.act-btn').forEach(function(b){b.disabled=false;b.style.opacity='';b.style.cursor='auto';});
},
  );
  return;
}
if(type==='special' && typeof G!=='undefined' && G.curLoc==='forest'){
  openResinMinigame(
    function(){
      busy=false;
      document.querySelectorAll('.act-btn').forEach(function(b){b.disabled=false;b.style.opacity='';b.style.cursor='auto';});
      orig(type);
    },
    function(){
      busy=false;
      document.querySelectorAll('.act-btn').forEach(function(b){b.disabled=false;b.style.opacity='';b.style.cursor='auto';});
    }
  );
  return;
}
if(type==='gather' && typeof G!=='undefined' && G.curLoc==='bloom'){
  openPetalMinigame(
function(score){ // 성공
    busy=false;
    document.querySelectorAll('.act-btn').forEach
    (function(b){b.disabled=false;b.style.
    opacity='';b.style.cursor='auto';});
    addHerb('petal', score);
// 계절 재료 추가
var season = typeof getSeason==='function' ? getSeason().name : '';
if(season==='봄') addHerb('sakuradew', Math.max(1, Math.floor(score/5)));
if(season==='여름') addHerb('sunbloom', Math.max(1, Math.floor(score/5)));
if(season==='가을') addHerb('crimsonleaf', Math.max(1, Math.floor(score/5)));
if(season==='겨울') addHerb('snowcrystal', Math.max(1, Math.floor(score/5)));
if(G.isNight) addHerb('moonpetal', Math.max(1, Math.floor(score/5)));
orig(type);
},
    function(){ // 실패
      busy=false;
      document.querySelectorAll('.act-btn').forEach(function(b){b.disabled=false;b.style.opacity='';b.style.cursor='auto';});
    }
  );
  return;
}
if(type==='search' && typeof G!=='undefined'){
  openSearchMinigame(
    function(){ // 성공
      busy=false;
      document.querySelectorAll('.act-btn').forEach(function(b){b.disabled=false;b.style.opacity='';b.style.cursor='auto';});
      orig(type);
    },
    function(){ // 실패
      busy=false;
      document.querySelectorAll('.act-btn').forEach(function(b){b.disabled=false;b.style.opacity='';b.style.cursor='auto';});
    }
  );
  return;
}
if(type==='gather' && typeof G!=='undefined' && G.curLoc==='pond'){
  openPondMinigame(
    function(){
      busy=false;
      document.querySelectorAll('.act-btn').forEach(function(b){b.disabled=false;b.style.opacity='';b.style.cursor='auto';});
      orig(type);
    },
    function(){
      busy=false;
      document.querySelectorAll('.act-btn').forEach(function(b){b.disabled=false;b.style.opacity='';b.style.cursor='auto';});
    }
  );
  return;
}
if(type==='special' && typeof G!=='undefined' && G.curLoc==='pond'){
  openMeditationMinigame(
    function(){
      busy=false;
      document.querySelectorAll('.act-btn').forEach(function(b){b.disabled=false;b.style.opacity='';b.style.cursor='auto';});
      orig(type);
    },
    function(){
      busy=false;
      document.querySelectorAll('.act-btn').forEach(function(b){b.disabled=false;b.style.opacity='';b.style.cursor='auto';});
    }
  );
  return;
}

     var ms=W[type],lbl=(type==='special'&&specialLabels[typeof window._getG==='function'?window._getG().curLoc:''])||L[type]||'진행 중';
      busy=true;
      var btns=document.querySelectorAll('.act-btn'),data=[];
      btns.forEach(function(b){data.push({html:b.innerHTML,op:b.style.opacity});b.disabled=true;b.style.opacity='0.4';b.style.cursor='not-allowed';});
      var map={gather:'btn-gather',special:'btn-special',search:'btn-search',nap:'btn-nap'};
      var ab=document.getElementById(map[type]);
      if(ab){ab.style.opacity='1';ab.style.cursor='default';ab.innerHTML='<span class="a-icon">⏳</span>'+lbl+'<span class="a-cost" id="_gt">'+Math.ceil(ms/1000)+'s</span>';}

      var rem=Math.ceil(ms/1000);
      var iv=setInterval(function(){rem--;var t=document.getElementById('_gt');if(t)t.textContent=rem>0?rem+'s':'✔';if(rem<=0)clearInterval(iv);},1000);
      setTimeout(function(){clearInterval(iv);busy=false;document.querySelectorAll('.act-btn').forEach(function(b){b.disabled=false;b.style.opacity='';b.style.cursor='auto';});stopGatherAnim();orig(type);},ms);
    };
  });
})();

// ══════════════════════════════════════════════
//  광산 채굴 — 바위 직접 깨기 + 등급제 + 몬스터 대응
// ══════════════════════════════════════════════
(function(){
  var MINE={
    shallow:{clicks:3,icon:'🔵',name:'얕은 광맥',   color:'#6090d0',spark:'#90c0ff'},
    deep:   {clicks:5,icon:'🟢',name:'깊은 광맥',   color:'#4a9a5a',spark:'#a0e0a0'},
    star:   {clicks:8,icon:'🌟',name:'별빛 심층부', color:'#9944cc',spark:'#e0a0ff'},
  };

  // 등급별 바위 표현 [일반, 희귀, 전설]
  var GRADES=[
    {id:'normal',  label:'일반',  rock:'🪨', glow:'rgba(150,150,200,.4)', textColor:'#a0b0d0', chance:1.0},
    {id:'rare',    label:'✨ 희귀',   rock:'💠', glow:'rgba(80,200,255,.6)',  textColor:'#60ddff', chance:0.25},
    {id:'legend',  label:'🌟 전설',  rock:'💎', glow:'rgba(255,200,60,.8)',  textColor:'#ffd060', chance:0.07},
  ];

  // 등급별 보너스 배율 (원본 드롭량에 곱함)
  var GRADE_BONUS={normal:1, rare:2, legend:3};

  var CRACKS=['','·','··','···','····','💥'];
  var mineBusy=false;

  function rollGrade(zone){
    var r=Math.random();
    // 별빛 심층부는 희귀/전설 확률 상승
    var rareMul=zone==='star'?2:zone==='deep'?1.4:1;
    if(r < GRADES[2].chance*rareMul) return GRADES[2];
    if(r < GRADES[1].chance*rareMul) return GRADES[1];
    return GRADES[0];
  }

  function mkOv(){
    if(document.getElementById('_mine-ov'))return;
    var st=document.createElement('style');st.id='_mine-st';
    // z-index를 5000으로 낮춰서 battle2-overlay(보통 8000~9000)가 위에 뜨게 함
    st.textContent=`
      #_mine-ov{display:none;position:fixed;inset:0;z-index:5000;
        background:rgba(5,2,15,.88);backdrop-filter:blur(4px);
        align-items:center;justify-content:center;flex-direction:column;gap:12px;}
      #_mine-rock{font-size:5rem;cursor:pointer;user-select:none;
        transition:filter .2s;}
      #_mine-grade-badge{font-size:.72rem;font-family:Cinzel,serif;
        letter-spacing:.08em;padding:3px 10px;border-radius:99px;
        border:1px solid currentColor;margin-bottom:-4px;}
      @keyframes _mS{0%{transform:rotate(0)}25%{transform:rotate(-8deg) scale(.9)}75%{transform:rotate(8deg) scale(.9)}100%{transform:rotate(0)}}
      @keyframes _mB{0%{transform:scale(1)}30%{transform:scale(1.6) rotate(15deg)}60%{transform:scale(.05);opacity:.2}100%{transform:scale(0);opacity:0}}
      @keyframes _mGlow{0%,100%{opacity:.7}50%{opacity:1}}
    `;
    document.head.appendChild(st);
    var ov=document.createElement('div');ov.id='_mine-ov';
    ov.innerHTML=
      '<div id="_mzone" style="font-family:Cinzel,serif;font-size:.88rem;color:#cc88ff;letter-spacing:.08em"></div>'
      +'<div id="_mine-grade-badge">일반</div>'
      +'<div id="_mine-rock">🪨</div>'
      +'<div id="_mcracks" style="font-size:1.1rem;letter-spacing:5px;min-height:1.4rem;color:#f0e0ff"></div>'
      +'<div style="width:200px;height:6px;border-radius:99px;background:rgba(255,255,255,.1);overflow:hidden">'
      +'<div id="_mprog" style="height:100%;width:0%;border-radius:99px;transition:width .2s"></div></div>'
      +'<div id="_mcnt" style="font-size:.82rem;color:rgba(200,160,255,.8)">0 / 0</div>'
      +'<div id="_mhint" style="font-size:.65rem;color:rgba(200,160,255,.4);font-style:italic">⛏️ 바위를 클릭해서 깨세요!</div>';
    document.body.appendChild(ov);
  }

  function sparks(color){
    for(var i=0;i<12;i++){(function(){
      var p=document.createElement('div'),sz=Math.random()*7+4,a=Math.random()*360,d=Math.random()*90+30;
      p.style.cssText='position:fixed;z-index:5001;width:'+sz+'px;height:'+sz+'px;border-radius:3px;background:'+color
        +';left:50%;top:40%;transform:translate(-50%,-50%);pointer-events:none;transition:all .5s ease-out;opacity:1';
      document.body.appendChild(p);
      requestAnimationFrame(function(){requestAnimationFrame(function(){
        p.style.transform='translate(calc(-50% + '+(Math.cos(a*Math.PI/180)*d)+'px),calc(-50% + '+(Math.sin(a*Math.PI/180)*d)+'px))';
        p.style.opacity='0';
      });});
      setTimeout(function(){p.remove();},600);
    })();}
  }

  function unlockMineZones(){
    document.querySelectorAll('.mine-zone').forEach(function(z){z.style.pointerEvents='';z.style.opacity='';});
  }

  function openMine(zone,cfg,grade,origFn){
    mkOv();
    // 오버레이 먼저 숨기고 설정 후 표시
    document.getElementById('_mine-ov').style.display='none';
    // 바위 이벤트 리스너 초기화: 요소를 innerHTML로 교체
    var oldRock=document.getElementById('_mine-rock');
    var newRock=document.createElement('div');
    newRock.id='_mine-rock';
    newRock.style.cssText='font-size:5rem;cursor:pointer;user-select:none;transition:filter .2s;';
    oldRock.parentNode.replaceChild(newRock,oldRock);
    var rock=newRock;
    rock.textContent=grade.rock;
    rock.style.filter='drop-shadow(0 0 16px '+grade.glow+')';

    var badge=document.getElementById('_mine-grade-badge');
    badge.textContent=grade.label;
    badge.style.color=grade.textColor;
    badge.style.borderColor=grade.textColor;

    document.getElementById('_mzone').textContent=cfg.icon+' '+cfg.name;
    document.getElementById('_mcracks').textContent='';
    document.getElementById('_mprog').style.cssText='height:100%;width:0%;border-radius:99px;background:'+cfg.color+';transition:width .2s';
    document.getElementById('_mcnt').textContent='0 / '+cfg.clicks;

    // 전설 등급이면 힌트 변경
    if(grade.id==='legend'){
      document.getElementById('_mhint').textContent='🌟 전설급 광석 발견! 신중히 깨세요!';
      document.getElementById('_mhint').style.color=grade.textColor;
    } else if(grade.id==='rare'){
      document.getElementById('_mhint').textContent='✨ 희귀 광석입니다!';
      document.getElementById('_mhint').style.color=grade.textColor;
    } else {
      document.getElementById('_mhint').textContent='⛏️ 바위를 클릭해서 깨세요!';
      document.getElementById('_mhint').style.color='rgba(200,160,255,.4)';
    }

    document.getElementById('_mine-ov').style.display='flex';

    var hit=0,total=cfg.clicks;
    function onClick(){
      if(hit>=total)return;hit++;
      document.getElementById('_mcracks').textContent=CRACKS[Math.floor(hit/total*(CRACKS.length-1))];
      rock.style.animation='none';void rock.offsetWidth;rock.style.animation='_mS .15s ease';
      sparks(grade.id==='legend'?'#ffd060':grade.id==='rare'?'#60ddff':cfg.spark);
      document.getElementById('_mprog').style.width=(hit/total*100)+'%';
      document.getElementById('_mcnt').textContent=hit+' / '+total;
      if(hit>=total){
        rock.removeEventListener('click',onClick);
        rock.style.animation='_mB .5s ease forwards';
        setTimeout(function(){
          document.getElementById('_mine-ov').style.display='none';
          mineBusy=false;
          unlockMineZones();
          // 등급 보너스를 전역에 저장해두고 원본 실행
          window._mineGradeBonus=GRADE_BONUS[grade.id]||1;
          window._mineGradeLabel=grade.label;
          origFn(zone);
          window._mineGradeBonus=null;
          window._mineGradeLabel=null;
        },600);
      }
    }
    rock.addEventListener('click',onClick);

    // ESC 탈출 안전장치
    function onKey(e){
      if(e.key==='Escape'){
        document.removeEventListener('keydown',onKey);
        rock.removeEventListener('click',onClick);
        document.getElementById('_mine-ov').style.display='none';
        mineBusy=false;
        unlockMineZones();
      }
    }
    document.addEventListener('keydown',onKey);
  }

  window.addEventListener('load',function(){
    var orig=window.mineZone;if(!orig)return;

    window.mineZone=function(zone){
      if(mineBusy)return;
      var g = (typeof _G==='function') ? _G() : null;
if(!g) { orig(zone); return; }
if(!g.ignisUnlocked || g.day < (zone==='deep'?5:zone==='star'?10:0)) { orig(zone); return; }
      var cfg=MINE[zone];if(!cfg){orig(zone);return;}
      mineBusy=true;
      document.querySelectorAll('.mine-zone').forEach(function(z){z.style.pointerEvents='none';z.style.opacity='0.4';});
      var az=document.getElementById('mz-'+zone);if(az)az.style.opacity='1';

      // 등급 결정
      var grade=rollGrade(zone);
      openMine(zone,cfg,grade,orig);
    };

    // ── 등급 보너스 적용: 원본 mineZone이 crystals에 추가한 직후 처리 ──
    // game.js의 mineZone이 G.crystals에 쓴 뒤 updateMineUI를 부르므로
    // updateMineUI를 한번 더 래핑해서 보너스를 추가로 넣음
    var origUpdate=window.updateMineUI;
    if(origUpdate){
      window.updateMineUI=function(){
        // 보너스가 대기 중이면 적용
        if(window._mineGradeBonus&&window._mineGradeBonus>1){
          var g=_G();
          if(g&&g.crystals){
            // 직전 채굴에서 추가된 양만큼 (bonus-1)배 추가
            // 단순하게: 가장 최근 채굴 결과를 알 수 없으므로
            // _minePrevCrystals와 비교해서 차이분만 곱함
            if(window._minePrevCrystals){
              var keys=['sapphire','amethyst','emerald','ruby','mooncrys','stardust'];
              var mul=window._mineGradeBonus-1;
              keys.forEach(function(k){
                var diff=(g.crystals[k]||0)-(window._minePrevCrystals[k]||0);
                if(diff>0){
                  var extra=Math.floor(diff*mul);
                  if(extra>0){
                    g.crystals[k]=(g.crystals[k]||0)+extra;
                    if(typeof trackCrystalMined==='function')trackCrystalMined(k,extra);
                  }
                }
              });
              if(window._mineGradeLabel&&typeof spawnFloat==='function')
                spawnFloat(window._mineGradeLabel+' 보너스 ×'+window._mineGradeBonus+'!');
            }
          }
        }
        window._mineGradeBonus=null;
        window._minePrevCrystals=null;
        origUpdate();
      };
    }

    // crystals 스냅샷: mineZone 실행 직전에 저장
    var origMZ=window.mineZone;
    window.mineZone=function(zone){
      var g=_G();
      if(g&&g.crystals){
        var snap={};
        ['sapphire','amethyst','emerald','ruby','mooncrys','stardust'].forEach(function(k){snap[k]=g.crystals[k]||0;});
        window._minePrevCrystals=snap;
      }
      origMZ(zone);
    };
  });
})();

// ══════════════════════════════════════════════
//  물약 제조 — 도구 선택 시스템 (풀 버전)
// ══════════════════════════════════════════════
(function(){
  var TOOLS={
    mortar:[
      {id:'stone',  icon:'🪨',name:'돌 절구',      desc:'기본 추출',       cost:0,  qtyBonus:0},
      {id:'brass',  icon:'🔩',name:'황동 절구',    desc:'물약 수량 +1개',  cost:30, qtyBonus:1},
      {id:'crystal',icon:'💎',name:'크리스탈 절구',desc:'물약 수량 +2개',  cost:100,qtyBonus:2},
    ],
    cauldron:[
      {id:'iron',  icon:'🟫',name:'철 가마솥',  desc:'기본 제조',   cost:0,  mul:1.0},
      {id:'copper',icon:'🟡',name:'구리 가마솥',desc:'판매가 +20%', cost:50, mul:1.2},
      {id:'silver',icon:'🥈',name:'은 가마솥',  desc:'판매가 +50%', cost:120,mul:1.5},
    ],
    bottle:[
      {id:'small',icon:'🫙',name:'소형 병',desc:'기본 보관',          cost:0,  bonus:0,  dbl:0},
      {id:'large',icon:'🏺',name:'대형 병',desc:'판매가 +10₦',        cost:40, bonus:10, dbl:0},
      {id:'magic',icon:'✨',name:'마법 병', desc:'30% 확률 2배 수량', cost:90, bonus:0,  dbl:0.3},
    ],
  };
  var BASE={petal_brew:3,healing:5,moon:10,forest:12,dream:15,legendary:100,spring_essence:3,summer_essence:3,autumn_essence:3,winter_essence:3,ignisfire:20,moonblaze:20,dragonbrew:25,stardust:30};
  var CCFG={
    petal_brew: {ms:3000, label:'꽃잎 물약', icon:'🌸', 
    color:'#f0b0c0'},
    healing:       {ms:2000,label:'치유 물약',  icon:'🧪',color:'#7ec87e'},
    moon:          {ms:4000,label:'달빛 물약',  icon:'🌙',color:'#a0b8e8'},
    forest:        {ms:4000,label:'숲의 정수',  icon:'🌲',color:'#6aaa6a'},
    dream:         {ms:5000,label:'꿈의 물약',  icon:'🌸',color:'#d4a0d4'},
    legendary:     {ms:8000,label:'전설의 영약',icon:'⭐',color:'#f0c040'},
    spring_essence:{ms:5000,label:'봄의 정수',  icon:'🌸',color:'#f0b0c0'},
    summer_essence:{ms:5000,label:'여름의 정수',icon:'☀️',color:'#f0c040'},
    autumn_essence:{ms:5000,label:'가을의 정수',icon:'🍂',color:'#d4802a'},
    winter_essence:{ms:5000,label:'겨울의 정수',icon:'❄️',color:'#a0c8e8'},
    ignisfire:     {ms:7000,label:'불꽃 물약',  icon:'🔥',color:'#e06030'},
    moonblaze:     {ms:7000,label:'달불꽃 정수',icon:'🌙',color:'#8080e0'},
    dragonbrew:    {ms:8000,label:'용골 강화약',icon:'🦴',color:'#c0a060'},
    stardust:      {ms:9000,label:'별빛 만능약',icon:'✨',color:'#e8d060'},
  };

  // 저장
  var SK='_bSel',OK='_bOwn';
  function lSel(){try{return JSON.parse(localStorage.getItem(SK))||{mortar:'stone',cauldron:'iron',bottle:'small'};}catch(e){return{mortar:'stone',cauldron:'iron',bottle:'small'};}}
  function sSel(v){try{localStorage.setItem(SK,JSON.stringify(v));}catch(e){}}
  function lOwn(){try{return JSON.parse(localStorage.getItem(OK))||{mortar:['stone'],cauldron:['iron'],bottle:['small']};}catch(e){return{mortar:['stone'],cauldron:['iron'],bottle:['small']};}}
  function sOwn(v){try{localStorage.setItem(OK,JSON.stringify(v));}catch(e){}}

  // 냥 계산/차감
  function getNyang(){
    var g=_G();if(!g)return 0;
    var c=g.coins||{};return(c.bronze||0)+(c.silver||0)*10+(c.golden||0)*100;
  }
  function spendNyang(amt){
    var g=_G();if(!g||!g.coins)return;
    var c=g.coins,rem=amt;
    if(rem>=100&&c.golden>0){var gn=Math.min(Math.floor(rem/100),c.golden);c.golden-=gn;rem-=gn*100;}
    if(rem>=10&&c.silver>0){var sn=Math.min(Math.floor(rem/10),c.silver);c.silver-=sn;rem-=sn*10;}
    if(rem>0)c.bronze=Math.max(0,(c.bronze||0)-rem);
  }

  // 보너스
  function getB(sel){
    var m=TOOLS.mortar.find(function(t){return t.id===sel.mortar;})||TOOLS.mortar[0];
    var c=TOOLS.cauldron.find(function(t){return t.id===sel.cauldron;})||TOOLS.cauldron[0];
    var b=TOOLS.bottle.find(function(t){return t.id===sel.bottle;})||TOOLS.bottle[0];
    return{qty:m.qtyBonus,mul:c.mul,bonus:b.bonus,dbl:b.dbl,
      mIcon:m.icon,mName:m.name,cIcon:c.icon,cName:c.name,bIcon:b.icon,bName:b.name};
  }

  // 스타일
  function injectCSS(){
    if(document.getElementById('_bc'))return;
    var s=document.createElement('style');s.id='_bc';
    s.textContent=`
#_btov{display:none;position:fixed;inset:0;z-index:9998;background:rgba(8,4,18,.92);backdrop-filter:blur(6px);align-items:center;justify-content:center;}
#_btbox{background:linear-gradient(160deg,#1a0d30,#0e0820);border:1.5px solid rgba(180,130,255,.25);border-radius:18px;padding:22px 18px 18px;width:min(370px,94vw);max-height:92vh;overflow-y:auto;box-shadow:0 0 40px rgba(120,60,220,.3);}
.bt-title{font-family:Cinzel,serif;font-size:.95rem;color:#cc88ff;text-align:center;letter-spacing:.08em;margin-bottom:3px;}
.bt-sub{font-size:.68rem;color:rgba(200,160,255,.45);text-align:center;margin-bottom:14px;font-style:italic;}
.bt-sec{margin-bottom:12px;}
.bt-lbl{font-size:.68rem;color:rgba(200,160,255,.6);font-family:Cinzel,serif;letter-spacing:.06em;margin-bottom:6px;padding-left:2px;}
.bt-opts{display:flex;gap:6px;}
.bt-opt{flex:1;border-radius:10px;padding:9px 5px 8px;border:1.5px solid rgba(180,130,255,.18);background:rgba(255,255,255,.04);text-align:center;position:relative;transition:all .15s;}
.bt-sel{border-color:#b060ff!important;background:rgba(150,60,255,.18)!important;box-shadow:0 0 10px rgba(150,60,255,.25);}
.bt-buy{cursor:pointer;border-color:rgba(200,150,80,.5)!important;background:rgba(200,150,40,.1)!important;}
.bt-buy:hover{border-color:#d4a830!important;background:rgba(200,150,40,.2)!important;}
.bt-buy:active{transform:scale(.96);}
.bt-own{cursor:pointer;border-color:rgba(180,130,255,.3)!important;}
.bt-own:hover{border-color:rgba(180,130,255,.6)!important;background:rgba(150,60,255,.08)!important;}
.bt-own:active{transform:scale(.96);}
.bt-lock{opacity:.35;cursor:not-allowed;}
.bt-ic{font-size:1.5rem;margin-bottom:3px;}
.bt-nm{font-size:.67rem;color:#d4b0ff;font-weight:600;margin-bottom:2px;}
.bt-ds{font-size:.59rem;color:rgba(200,160,255,.55);line-height:1.3;}
.bt-ct{font-size:.59rem;color:#d4a830;margin-top:3px;}
.bt-badge{position:absolute;top:-5px;right:-5px;background:#b060ff;color:#fff;font-size:.5rem;border-radius:99px;padding:1px 5px;font-weight:700;}
.bt-prev{background:rgba(150,60,255,.08);border:1px solid rgba(150,60,255,.2);border-radius:10px;padding:9px 12px;margin:8px 0 12px;font-size:.72rem;color:rgba(220,190,255,.85);line-height:1.9;}
.bt-prev b{color:#cc88ff;}
.bt-row{display:flex;gap:8px;}
.bt-cancel{flex:1;padding:10px;border-radius:10px;border:1px solid rgba(180,130,255,.25);background:transparent;color:rgba(200,160,255,.6);font-size:.78rem;cursor:pointer;}
.bt-cancel:hover{background:rgba(180,130,255,.1);}
.bt-go{flex:2;padding:10px;border-radius:10px;border:none;background:linear-gradient(135deg,#7733bb,#9944dd);color:#f0e0ff;font-family:Cinzel,serif;font-size:.82rem;cursor:pointer;letter-spacing:.04em;box-shadow:0 2px 12px rgba(120,60,220,.4);}
.bt-go:hover{background:linear-gradient(135deg,#8844cc,#aa55ee);}
.bt-go:active{transform:scale(.97);}
@keyframes _bB2{from{transform:translateY(0)}to{transform:translateY(-8px) scale(1.08)}}
@keyframes _bD2{0%{transform:scale(1)}40%{transform:scale(1.4)}70%{transform:scale(.9)}100%{transform:scale(1)}}
#_bpov{display:none;position:fixed;inset:0;z-index:9999;background:rgba(10,6,20,.76);backdrop-filter:blur(3px);align-items:center;justify-content:center;flex-direction:column;gap:14px;}
    `;
    document.head.appendChild(s);
  }

  // 제조 진행 오버레이
  function mkPOv(){
    if(document.getElementById('_bpov'))return;
    var ov=document.createElement('div');ov.id='_bpov';
    ov.innerHTML='<div id="_bpi2" style="font-size:3rem">⚗️</div>'
      +'<div id="_bpl2" style="font-family:Cinzel,serif;font-size:.95rem;color:#f5e9cc;letter-spacing:.05em">제조 중…</div>'
      +'<div id="_bps2" style="font-size:.72rem;color:rgba(220,190,255,.6);font-style:italic;min-height:1.2em"></div>'
      +'<div style="width:220px;height:8px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden">'
      +'<div id="_bpb2" style="height:100%;width:0%;border-radius:99px;transition:width .25s linear"></div></div>'
      +'<div id="_bpt2" style="font-size:.82rem;color:rgba(245,233,204,.55)">0s</div>';
    document.body.appendChild(ov);
  }

  function runBrew(cfg,bon,ms,onDone){
    mkPOv();
    var ov=document.getElementById('_bpov');
    document.getElementById('_bpi2').textContent=cfg.icon;
    document.getElementById('_bpi2').style.animation='_bB2 .7s infinite alternate';
    document.getElementById('_bpl2').textContent=cfg.label+' 제조 중…';
    document.getElementById('_bpl2').style.color=cfg.color;
    document.getElementById('_bpb2').style.background=cfg.color;
    document.getElementById('_bpb2').style.width='0%';
    document.getElementById('_bpt2').textContent=Math.ceil(ms/1000)+'s';
    ov.style.display='flex';
    var steps=[bon.mIcon+' '+bon.mName+'으로 빻는 중…',bon.cIcon+' '+bon.cName+'에서 끓이는 중…','⏳ 여과 및 농축 중…',bon.bIcon+' '+bon.bName+'에 담는 중…'];
    var sms=ms/steps.length;
    steps.forEach(function(s,i){setTimeout(function(){document.getElementById('_bps2').textContent=s;},i*sms);});
    var start=Date.now();
    var iv=setInterval(function(){var el=Date.now()-start;document.getElementById('_bpb2').style.width=Math.min(100,el/ms*100)+'%';var l=Math.ceil((ms-el)/1000);document.getElementById('_bpt2').textContent=l>0?l+'s':'완성!';if(el>=ms)clearInterval(iv);},100);
    setTimeout(function(){clearInterval(iv);document.getElementById('_bpb2').style.width='100%';document.getElementById('_bpt2').textContent='✨ 완성!';document.getElementById('_bpi2').style.animation='_bD2 .5s ease forwards';
      if(cfg.label.includes('전설')||cfg.label.includes('별빛'))glitter(cfg.color);
      setTimeout(function(){ov.style.display='none';onDone();},700);
    },ms);
  }

  function glitter(color){for(var i=0;i<14;i++){(function(){var sp=document.createElement('div'),sz=Math.random()*8+5,a=Math.random()*360,d=Math.random()*120+60;sp.style.cssText='position:fixed;z-index:10000;width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:'+color+';left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;transition:all .7s ease-out;opacity:1';document.body.appendChild(sp);requestAnimationFrame(function(){requestAnimationFrame(function(){sp.style.transform='translate(calc(-50% + '+(Math.cos(a*Math.PI/180)*d)+'px),calc(-50% + '+(Math.sin(a*Math.PI/180)*d)+'px))';sp.style.opacity='0';});});setTimeout(function(){sp.remove();},800);})();}}

  // 현재 제조 상태
  var craftBusy=false,curId=null,curCfg=null,curFn=null;

  // 전역: 도구 선택 클릭
  window._bSel=function(cat,id){
    var sel=lSel(),own=lOwn();
    var tool=TOOLS[cat].find(function(t){return t.id===id;});
    if(!tool)return;
    var owned=own[cat].indexOf(id)>=0;
    if(owned){
      // 이미 보유 → 선택만
      sel[cat]=id;sSel(sel);renderUI();
    } else if(tool.cost>0){
      // 구매 시도
      var have=getNyang();
      if(have<tool.cost){
        // 냥 부족 알림
        var el=document.getElementById('_btop_'+cat+'_'+id);
        if(el){var ct=el.querySelector('.bt-ct');if(ct){var ot=ct.textContent;ct.textContent='💰 냥 부족!';ct.style.color='#ff6060';setTimeout(function(){ct.textContent=ot;ct.style.color='';},900);}}
        return;
      }
      spendNyang(tool.cost);
      own[cat].push(id);sel[cat]=id;
      sOwn(own);sSel(sel);
      if(typeof updateUI==='function')updateUI();
      renderUI();
    }
  };

  // 전역: 취소
  window._bCancel=function(){
    document.getElementById('_btov').style.display='none';
    craftBusy=false;
    document.querySelectorAll('.craft-row').forEach(function(r){r.style.pointerEvents='';r.style.opacity='';});
  };

  // 전역: 제조 시작
  window._bGo=function(){
    document.getElementById('_btov').style.display='none';
    var sel=lSel(),bon=getB(sel),id=curId,cfg=curCfg,fn=curFn;
    runBrew(cfg,bon,cfg.ms,function(){
      craftBusy=false;
      document.querySelectorAll('.craft-row').forEach(function(r){r.style.pointerEvents='';r.style.opacity='';});
      fn(id);
      var g=_G();
      if(g){
        if(bon.qty>0&&g.potionInv)g.potionInv[id]=(g.potionInv[id]||0)+bon.qty;
        if(bon.dbl>0&&Math.random()<bon.dbl&&g.potionInv){g.potionInv[id]=(g.potionInv[id]||0)+1;if(typeof spawnFloat==='function')spawnFloat('✨ 2배 수량!');}
        if(bon.bonus>0&&g.coins)g.coins.bronze=(g.coins.bronze||0)+bon.bonus;
        if(bon.mul>1.0&&g.coins){var ex=Math.round((BASE[id]||10)*(bon.mul-1.0));if(ex>0)g.coins.bronze=(g.coins.bronze||0)+ex;}
      }
      if(typeof updateUI==='function')updateUI();
    });
  };

  function renderUI(){
    injectCSS();
    if(!document.getElementById('_btov')){
      var ov=document.createElement('div');ov.id='_btov';
      ov.innerHTML='<div id="_btbox"></div>';
      document.body.appendChild(ov);
    }
    var sel=lSel(),own=lOwn(),bon=getB(sel);
    var base=BASE[curId]||10;
    var nyang=Math.round(base*bon.mul)+bon.bonus;
    var qTxt=bon.qty>0?' <b>+'+bon.qty+'개</b>':'';
    var dTxt=bon.dbl>0?'<br>✨ '+Math.round(bon.dbl*100)+'% 확률로 수량 2배':'';
    var lbl={mortar:'🔨 절구 — 재료 추출',cauldron:'🫕 가마솥 — 가열 및 혼합',bottle:'🫙 병 — 보관'};
    var html='<div class="bt-title">⚗️ 제조 도구 선택</div>'
      +'<div class="bt-sub">'+(curCfg?curCfg.icon+' '+curCfg.label:'')+'</div>';
    ['mortar','cauldron','bottle'].forEach(function(cat){
      html+='<div class="bt-sec"><div class="bt-lbl">'+lbl[cat]+'</div><div class="bt-opts">';
      TOOLS[cat].forEach(function(tool){
        var owned=own[cat].indexOf(tool.id)>=0;
        var isSel=sel[cat]===tool.id;
        var cls='bt-opt';
        if(isSel)cls+=' bt-sel';
        else if(owned)cls+=' bt-own';
        else if(tool.cost>0)cls+=' bt-buy';
        else cls+=' bt-lock';
        var badge=isSel?'<span class="bt-badge">사용중</span>':'';
        var costHtml=owned?'':('<div class="bt-ct">'+(tool.cost>0?'🪙 '+tool.cost+'₦ 구매':'🔒')+'</div>');
        var clickAttr=(owned||tool.cost>0)?'onclick="window._bSel(\''+cat+'\',\''+tool.id+'\')"':'';
        html+='<div class="'+cls+'" id="_btop_'+cat+'_'+tool.id+'" '+clickAttr+'>'
          +badge
          +'<div class="bt-ic">'+tool.icon+'</div>'
          +'<div class="bt-nm">'+tool.name+'</div>'
          +'<div class="bt-ds">'+tool.desc+'</div>'
          +costHtml+'</div>';
      });
      html+='</div></div>';
    });
    html+='<div class="bt-prev">📦 수량: 1'+qTxt+' &nbsp;|&nbsp; 💰 판매가: <b>'+nyang+'₦</b>'+dTxt+'</div>';
    html+='<div class="bt-row"><button class="bt-cancel" onclick="window._bCancel()">취소</button>'
      +'<button class="bt-go" onclick="window._bGo()">⚗️ 제조 시작</button></div>';
    document.getElementById('_btbox').innerHTML=html;
    document.getElementById('_btov').style.display='flex';
  }

  // 래핑
  window.addEventListener('load',function(){
    var oC=window.craft,oA=window.advCraftIsland;
    function wrap(fn,isAdv){
      return function(type){
        if(craftBusy)return;
       var g = (typeof _G==='function') ? _G() : null;
        if(!g) { fn(type); return; }
        if(typeof RECIPES !== 'undefined' && RECIPES[type] && RECIPES[type].need) {
            var need = RECIPES[type].need;
            for(var k in need){
                if((g.herbs[k]||0) < need[k]){ fn(type); return; }
            }
        }

        var cfg=CCFG[type];if(!cfg){fn(type);return;}
        craftBusy=true;curId=type;curCfg=cfg;curFn=fn;
        document.querySelectorAll('.craft-row').forEach(function(r){r.style.pointerEvents='none';r.style.opacity='0.45';});
        var row=document.getElementById((isAdv?'adv-':'cr-')+type);if(row)row.style.opacity='1';
        renderUI();
      };
    }
    if(oC)window.craft=wrap(oC,false);
    if(oA)window.advCraftIsland=wrap(oA,true);
  });
})();