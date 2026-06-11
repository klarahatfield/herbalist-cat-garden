// ╔══════════════════════════════════════════════════════╗
// ║  game-action.js                                       ║
// ║  약초사의 비밀정원 — 행동·전투1                             ║
// ║                                                      ║
// ║  포함: 장소별 특수행동, INTRO/LOGIN/CHAR, HP SYSTEM,
// ╚══════════════════════════════════════════════════════╝

// ══ ══ INTRO/LOGIN/CHAR JS ══
let selectedChar=null, storyStep=0, currentStories=[];

const RACES={
  cat:{name:'고양이 약초사',icon:'🐱',maxHp:80,gatherBonus:1,luckBonus:2,mineBonus:0,defBonus:0,
    story:[
      {type:'narr',text:'Aethel Cataria의 안개 낀 아침. 당신은 지원서를 손에 쥐고 움직이는 약초실 앞에 섰습니다.'},
      {type:'baba',text:'"고양이군. 수염 좀 보자... 좋아. 감각이 살아있어. 들어와."'},
      {type:'baba',text:'"첫 번째 규칙: 내 Earl Grey에 손대지 마라. 두 번째: 엉겅퀴 짓이기기 전에 5분 쓰다듬기."'},
      {type:'locpick',text:'자, 내 정원을 봐. 어디서부터 시작하고 싶나? 첫 발을 내디딜 곳을 골라라.'},
    ]},
  dog:{name:'개 탐험가',icon:'🐶',maxHp:120,gatherBonus:0,luckBonus:0,mineBonus:3,defBonus:1,
    story:[
      {type:'narr',text:'기계 백팩을 멘 당신이 움직이는 집 앞에 도착했습니다.'},
      {type:'baba',text:'"...개로군. 덩치가 크네. 다리 기름칠 담당이 필요했는데. 잘 됐어."'},
      {type:'baba',text:'"시끄럽게 짖지만 마. 약초들이 놀란다고."'},
      {type:'locpick',text:'내 정원을 봐. 탐험가라면 어디든 시작할 수 있겠지? 첫 번째 현장을 골라라.'},
    ]},
  bunny:{name:'토끼 연금술사',icon:'🐰',maxHp:70,gatherBonus:0,luckBonus:0,mineBonus:0,defBonus:0,
    story:[
      {type:'narr',text:'기계식 헤드셋을 쓴 당신이 귀를 쫑긋 세우며 약초실 문을 두드렸습니다.'},
      {type:'baba',text:'"토끼... 귀가 크군. 저 멀리 기계 소리도 듣겠네?"'},
      {type:'baba',text:'"약탕기 불 조절 담당. 귀가 내 청진기보다 더 정확하겠어."'},
      {type:'locpick',text:'내 정원이야. 세밀하게 보려면 어디서 시작하는 게 좋겠나? 귀로 들려오는 곳으로 가거라.'},
    ]},
};

function initIntroStars(){
  const c=document.getElementById('intro-stars');
  if(!c)return;
  for(let i=0;i<60;i++){
    const s=document.createElement('div');
    s.className='intro-star';
    const sz=Math.random()*2.5+.5;
    s.style.cssText='width:'+sz+'px;height:'+sz+'px;left:'+Math.random()*100+'%;top:'+Math.random()*100+'%;animation-delay:'+Math.random()*3+'s;animation-duration:'+(1.5+Math.random()*2)+'s';
    c.appendChild(s);
  }
}

function showLoginScreen(){
  document.getElementById('intro-title-screen').style.display='none';
  document.getElementById('login-screen').style.display='block';
  // 저장된 아이디 불러오기
  try{
    const saved=localStorage.getItem('hcsg_remember');
    if(saved){
      const obj=JSON.parse(saved);
      document.getElementById('li-id').value=obj.id||'';
      document.getElementById('li-remember').checked=true;
    }
  }catch(e){}
}
function switchLoginTab(tab){
  document.querySelectorAll('.login-tab').forEach(function(t){t.classList.remove('active');});
  document.getElementById('lt-'+tab).classList.add('active');
  const pw2=document.getElementById('li-pw2');
  const btn=document.getElementById('login-submit-btn');
  const emailEl=document.getElementById('li-email');
  if(tab==='signup'){
    pw2.style.display='block';
    if(emailEl)emailEl.style.display='block';
    btn.textContent='🌱 새 모험가 등록';
  } else {
    pw2.style.display='none';
    if(emailEl)emailEl.style.display='none';
    btn.textContent='🌿 입장하기';
  }
}
function submitLogin(){
  const id=document.getElementById('li-id').value.trim();
  const pw=document.getElementById('li-pw').value;
  const pw2=document.getElementById('li-pw2').value;
  const msg=document.getElementById('login-msg');
  const isSignup=document.getElementById('lt-signup').classList.contains('active');
  if(!id||!pw){msg.textContent='이름과 비밀 열쇠를 입력해주세요.';return;}
  if(pw.length<6){msg.textContent='비밀 열쇠는 6자 이상이어야 합니다.';return;}

  // 이메일 형식으로 변환 (Firebase는 이메일 필요)
  // 아이디 기억하기
  const rememberEl=document.getElementById('li-remember');
  if(rememberEl&&rememberEl.checked){
    try{localStorage.setItem('hcsg_remember',JSON.stringify({id:id}));}catch(e){}
  } else {
    try{localStorage.removeItem('hcsg_remember');}catch(e){}
  }
  const emailInput = document.getElementById('li-email');
  const realEmail = emailInput ? emailInput.value.trim() : '';
  const email = realEmail && realEmail.includes('@') ? realEmail : id+'@herbalist.garden';
  msg.textContent='⏳ 처리 중...';

  if(isSignup){
    if(pw!==pw2){msg.textContent='비밀 열쇠가 일치하지 않습니다.';return;}
    // Firebase 회원가입
    if(!window._fbAuth||!window._fbFns){
      // Firebase 미연결 시 로컬 폴백
      try{localStorage.setItem('hcsg_u_'+id,btoa(pw));}catch(e){}
      G.playerName=id; msg.textContent=''; showCharScreen(); return;
    }
    window._fbFns.createUserWithEmailAndPassword(window._fbAuth, email, pw)
      .then(function(cred){
        G.playerName=id;
        G.uid=cred.user.uid;
        msg.textContent='';
        // Firestore에 유저 기본 정보 저장
        const userRef=window._fbFns.doc(window._fbDb,'users',cred.user.uid);
        window._fbFns.setDoc(userRef,{
          nickname:id, email:realEmail||email, displayEmail:realEmail||'',
          createdAt:new Date().toISOString(),
          charType:null, lastLogin:new Date().toISOString()
        });
        showCharScreen();
      })
      .catch(function(err){
        if(err.code==='auth/email-already-in-use') msg.textContent='이미 존재하는 이름입니다.';
        else if(err.code==='auth/weak-password') msg.textContent='비밀 열쇠가 너무 짧습니다.';
        else msg.textContent='오류: '+err.message;
      });
  } else {
    // Firebase 로그인
    if(!window._fbAuth||!window._fbFns){
      let saved=''; try{saved=localStorage.getItem('hcsg_u_'+id)||'';}catch(e){}
      if(!saved||saved!==btoa(pw)){msg.textContent='이름 또는 비밀 열쇠가 틀렸습니다.';return;}
      G.playerName=id; msg.textContent='';
      let raw=''; try{raw=localStorage.getItem('hcsg_save_'+id)||'';}catch(e){}
      if(raw){try{const sv=JSON.parse(raw);G=sv.G;patchState();closeIntro();return;}catch(e){}}
      showCharScreen(); return;
    }
    window._fbFns.signInWithEmailAndPassword(window._fbAuth, email, pw)
      .then(function(cred){
        G.playerName=id;
        G.charName=G.charName||id;
        G.uid=cred.user.uid;
        msg.textContent='';
        // Firestore에서 저장 데이터 불러오기
        const saveRef=window._fbFns.doc(window._fbDb,'saves',cred.user.uid);
        return window._fbFns.getDoc(saveRef).then(function(snap){
          if(snap.exists()){
            const data=snap.data();
            if(data.gameState){
              try{G=JSON.parse(data.gameState);patchState();closeIntro();return;}catch(e){}
            }
          }
          // 저장 데이터 없으면 캐릭터 선택
          showCharScreen();
        });
      })
      .catch(function(err){
        if(err.code==='auth/user-not-found'||err.code==='auth/wrong-password'||err.code==='auth/invalid-credential')
          msg.textContent='이름 또는 비밀 열쇠가 틀렸습니다.';
        else msg.textContent='오류: '+err.message;
      });
  }
}
function patchState(){
  // 이름 복구: charName 없으면 playerName으로
  if(!G.charName || G.charName==='') {
    G.charName = G.playerName || '';
  }
  // Firebase 유저에서 닉네임 가져오기
  if((!G.charName||G.charName==='') && window._fbUser){
    const email = window._fbUser.email||'';
    const nick = email.replace('@herbalist.garden','').replace(/@.*$/,'');
    G.charName = nick;
    G.playerName = nick;
  }
  if(!G.forgeQueue)G.forgeQueue=[];
  if(!G.refined)G.refined={};
  if(!G.crystals)G.crystals={sapphire:0,amethyst:0,emerald:0,ruby:0,mooncrys:0,stardust:0};
  if(!G.potionInv)G.potionInv={healing:0,moon:0,forest:0,dream:0,legendary:0};
  if(!G.unlockedApps)G.unlockedApps=[];
  if(!G.herbCollected)G.herbCollected={herb:0,lotus:0,shroom:0,moss:0,resin:0,rare:0};
  if(!G.hp)G.hp=G.maxHp||100;
  if(G.energy===undefined||G.energy===null)G.energy=G.maxEnergy||5;
  if(!G.houseMods)G.houseMods={};
  if(!G.crystalMined)G.crystalMined={sapphire:0,amethyst:0,emerald:0,ruby:0,mooncrys:0,stardust:0};
  // 성배 퀘스트 상태
  if(G.grailQuestStage===undefined)G.grailQuestStage=0;
  if(G.grailMemoRead===undefined)G.grailMemoRead=false;
  if(G.grailAssembled===undefined)G.grailAssembled=false;
  if(G.grailChoice===undefined)G.grailChoice=null;
  // 정수 허브 기본값
  if(G.herbs){
    ['spring_essence','summer_essence','autumn_essence','winter_essence'].forEach(k=>{
      if(G.herbs[k]===undefined)G.herbs[k]=0;
    });
  }
  // 야간허브 보유이력 기본값
  if(!G.herbMaxHeld)G.herbMaxHeld={};
}

var selectedCharName='';
function selectChar(type){
  selectedChar=type;
  document.querySelectorAll('.race-card').forEach(function(c){c.classList.remove('selected');});
  var el=document.getElementById('cc-'+type);
  if(el)el.classList.add('selected');
  document.getElementById('char-confirm-btn').disabled=false;
  // 이름 미리보기 업데이트
  var nm = G.playerName || '약초사';
  var prev = document.getElementById('charscreen-name-preview');
  if(prev) prev.textContent = '" + nm + '님의 비밀정원"';
}
function confirmChar(){
  if(!selectedChar)return;
  G.charType=selectedChar;
  const nameInput=document.getElementById('char-name-input');
  const typedName=(nameInput&&nameInput.value.trim())||'';
  G.charName=typedName||G.playerName||'약초사';
  G.playerName=G.playerName||G.charName;
  selectedCharName=G.charName;
  console.log('[확인] charName:', G.charName);
  const R=RACES[selectedChar];
  G.hp=R.maxHp; G.maxHp=R.maxHp;
  if(R.gatherBonus)G.upg.gatherBonus=(G.upg.gatherBonus||0)+R.gatherBonus;
  if(R.luckBonus)G.upg.luckBonus=(G.upg.luckBonus||0)+R.luckBonus;
  document.getElementById('char-screen').style.display='none';
  document.getElementById('story-screen').style.display='block';
  currentStories=R.story; storyStep=0; renderStoryStep();
}
function renderStoryStep(){
  const box=document.getElementById('story-content');
  box.innerHTML='';
  const s=currentStories[storyStep];
  if(!s)return;
  const btn=document.getElementById('story-next-btn');

  if(s.type==='locpick'){
    // 장소 선택 UI
    btn.style.display='none';
    const babaEl=document.createElement('div');
    babaEl.className='story-baba-say';
    babaEl.innerHTML='<span style="font-size:.7rem;color:rgba(212,168,48,.6);display:block;margin-bottom:3px">Baba 🐱</span>'+s.text;
    box.appendChild(babaEl);

    // 튜토리얼 박스
    const tutBox=document.createElement('div');
    tutBox.style.cssText='margin:10px 0;padding:10px 12px;background:rgba(74,122,50,.1);border-radius:10px;border:1px solid rgba(74,122,50,.3);font-size:.75rem;color:rgba(245,233,204,.8);line-height:1.7';
    tutBox.innerHTML='<div style="font-family:Cinzel,serif;font-size:.72rem;color:#d4a830;margin-bottom:6px">📖 정원 안내</div>' +
      '🌿 <b>채집</b> — Activity 1 소모, 약초 획득<br>' +
      '✨ <b>특수 행동</b> — Activity 2 소모, 희귀 재료<br>' +
      '🔍 <b>정밀탐색</b> — Activity 2 소모, 확률 업<br>' +
      '🌙 <b>하루마감</b> — 다음 날로 넘어가며 Activity 회복<br>' +
      '🏠 <b>오두막</b> — 언제든 방문 가능';
    box.appendChild(tutBox);

    // 장소 선택 버튼
    const locLabel=document.createElement('div');
    locLabel.style.cssText='font-size:.72rem;color:rgba(245,233,204,.5);text-align:center;margin:8px 0 2px;font-family:Cinzel,serif';
    locLabel.textContent='첫 번째 약초밭을 선택하세요';
    box.appendChild(locLabel);

    const locSub=document.createElement('div');
    locSub.style.cssText='font-size:.63rem;color:rgba(200,168,80,.45);text-align:center;margin-bottom:7px;font-style:italic';
    locSub.textContent='선택한 장소가 Day 1 시작 위치가 됩니다. 이후 날이 지나면 다른 장소도 해금됩니다.';
    box.appendChild(locSub);

    const PICK_LOCS=[
      {key:'bloom', icon:'🌸', name:'Dreaming Bloom-Beds', desc:'꽃잎과 약초', drops:'🌿 약초 · 🌸 달빛꽃잎(밤)'},
      {key:'pond',  icon:'🪷', name:'Lunar Lure Lagoon',   desc:'연꽃과 이끼', drops:'🪷 수초 · ⭐ 별빛풀(밤)'},
      {key:'hills', icon:'🪨', name:'Velvet Moss Hills',   desc:'이끼와 바위', drops:'🌿 이끼 · 🔮 수지'},
      {key:'mushroom',icon:'🍄',name:'Tail-Wag Mushroom',  desc:'버섯 군락', drops:'🍄 버섯 · 💡 발광버섯(밤)'},
    ];
    const grid=document.createElement('div');
    grid.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:4px';
    PICK_LOCS.forEach(function(lc){
      const b=document.createElement('button');
      b.style.cssText='padding:10px 6px;border-radius:10px;border:1.5px solid rgba(200,150,42,.3);background:rgba(255,255,255,.04);color:#f5e9cc;;font-size:.82rem;cursor:pointer;text-align:center;transition:all .2s';
      b.innerHTML='<div style="font-size:1.5rem">'+lc.icon+'</div><div style="font-size:.7rem;font-family:Cinzel,serif;color:#d4a830;margin:2px 0">'+lc.name+'</div><div style="font-size:.6rem;color:rgba(245,233,204,.5);margin-bottom:3px">'+lc.desc+'</div><div style="font-size:.58rem;color:rgba(180,220,150,.55);line-height:1.4">'+lc.drops+'</div>';
      b.onmouseover=function(){this.style.borderColor='#d4a830';this.style.background='rgba(200,150,42,.1)';};
      b.onmouseout=function(){this.style.borderColor='rgba(200,150,42,.3)';this.style.background='rgba(255,255,255,.04)';};
      b.onclick=function(){
        G.startLoc=lc.key;
        // Baba 반응
        box.innerHTML='';
        const resp=document.createElement('div');
        resp.className='story-baba-say';
        resp.style.animationDelay='0s';
        var locTip={bloom:'꽃잎과 약초가 많아. 연금술 재료로 딱이지.',pond:'달빛라군엔 달빛이 고여. 수초와 이끼를 찾아봐.',hills:'벨벳이끼언덕은 조용한 곳이야. 수지도 나오거든.',mushroom:'버섯 군락은 독특한 재료 보고야. 밤엔 더 진귀한 게 자라지.'}[lc.key]||'좋은 선택이야.';
        resp.innerHTML='<span style="font-size:.7rem;color:rgba(212,168,48,.6);display:block;margin-bottom:3px">Baba 🐱</span>"좋아. <b style="color:#d4a830">'+lc.name+'</b>. '+locTip+' 오두막(🏠)은 언제든 들러도 되고, 날이 지나면 더 많은 장소가 열릴 거야. 어서 시작하자."';
        box.appendChild(resp);
        btn.style.display='block';
        btn.textContent='🌿 모험 시작!';
        btn.onclick=function(){closeIntro();};
      };
      grid.appendChild(b);
    });
    box.appendChild(grid);
    return;
  }

  const el=document.createElement('div');
  el.style.animationDelay='0s';
  if(s.type==='baba'){
    el.className='story-baba-say';
    el.innerHTML='<span style="font-size:.7rem;color:rgba(212,168,48,.6);display:block;margin-bottom:3px">Baba 🐱</span>'+s.text;
  } else {
    el.className='story-line';
    el.textContent=s.text;
  }
  box.appendChild(el);
  btn.style.display='block';
  btn.textContent=storyStep>=currentStories.length-1?'🌿 모험 시작!':'다음 ▶';
  btn.onclick=function(){nextStory();};
}
function nextStory(){
  storyStep++;
  if(storyStep>=currentStories.length){closeIntro();}
  else{renderStoryStep();}
}
function skipIntro(){
  // Firebase 로그인 상태면 클라우드에서 불러오기 시도
  // 자동저장 시각 업데이트
  lastSaveTime = new Date();
  if(window._fbUser&&window._fbDb&&window._fbFns){
    const saveRef=window._fbFns.doc(window._fbDb,'saves',window._fbUser.uid);
    window._fbFns.getDoc(saveRef).then(function(snap){
      if(snap.exists()&&snap.data().gameState){
        try{G=JSON.parse(snap.data().gameState);patchState();}catch(e){}
      } else {
        try{const raw=localStorage.getItem('herbcat_save');if(raw){const sv=JSON.parse(raw);if(sv.G)Object.assign(G,sv.G);else Object.assign(G,sv);patchState();}}catch(e){}
      }
      closeIntro();
    }).catch(function(){
      try{const raw=localStorage.getItem('herbcat_save');if(raw){const sv=JSON.parse(raw);G=sv.G;patchState();}}catch(e){}
      closeIntro();
    });
    return;
  }
  try{
    const raw=localStorage.getItem('herbcat_save');
    if(raw){const sv=JSON.parse(raw);G=sv.G;patchState();}
  }catch(e){}
  closeIntro();
}
function closeIntro(){
  var intro=document.getElementById('intro-screen');
  intro.style.transition='opacity .8s';
  intro.style.opacity='0';
  setTimeout(function(){intro.style.display='none';},800);
  // patchState 한 번 더 실행해서 이름 복구
  patchState();
  // 에너지가 0이면 maxEnergy로 복구
  if(!G.energy || G.energy <= 0) G.energy = G.maxEnergy || 5;
  // startLoc 없으면 bloom 기본값
  if(!G.startLoc) G.startLoc = 'bloom';
  init();
  initHp();
  // 약간 딜레이 후 타이틀 업데이트 (데이터 로드 완료 후)
  setTimeout(function(){
    updateTitle();
    updateUI();
  }, 300);
  startBgm();
  startAutoSave();
  startNaturalHeal();
}
// saveGame 확장
const _origSave=typeof saveGame==='function'?saveGame:null;
function saveGame(){
  const sv=JSON.stringify(G);
  // 로컬 저장 (항상)
  try{localStorage.setItem('herbcat_save',JSON.stringify(G));}catch(e){}
  const msgEl=document.getElementById('save-msg');

  // Firebase 저장 (로그인 시)
  if(window._fbUser&&window._fbDb&&window._fbFns){
    const saveRef=window._fbFns.doc(window._fbDb,'saves',window._fbUser.uid);
    window._fbFns.setDoc(saveRef,{
      gameState:sv,
      savedAt:new Date().toISOString(),
      nickname:G.playerName||'',
      day:G.day||1,
      nyang:totalNyang()
    }).then(function(){
      if(msgEl) msgEl.textContent='☁️ 클라우드 저장 완료! ('+new Date().toLocaleTimeString()+')';
    }).catch(function(e){
      if(msgEl) msgEl.textContent='로컬 저장 완료 (클라우드 저장 실패)';
    });
  } else {
    if(msgEl) msgEl.textContent='💾 로컬 저장 완료! ('+new Date().toLocaleTimeString()+')';
  }
}

// ══ HP SYSTEM ══
function initHp(){
  if(!G.hp)G.hp=G.maxHp||100;
  if(!G.maxHp)G.maxHp=100;
  updateHpBar();
  var hpCont=document.getElementById('hp-bar-container');
  if(hpCont){
    hpCont.style.display='flex';
    hpCont.style.flexDirection='column';
  }
}
function updateHpBar(){
  const pct=Math.max(0,Math.round(((G.hp||0)/G.maxHp)*100));
  const fill=document.getElementById('hp-fill');
  const val=document.getElementById('hp-val');
  const container=document.getElementById('hp-bar-container');
  if(fill){
    fill.style.width=pct+'%';
    if(pct>60) fill.className='hp-fill high';
    else if(pct>30) fill.className='hp-fill medium';
    else { fill.className='hp-fill'; if(pct<=10) fill.classList.add('danger'); }
  }
  if(val){
    val.textContent=(G.hp||0)+'/'+G.maxHp;
    val.style.color=pct<=20?'#ff4040':pct<=50?'#ffaa00':'var(--parch)';
  }
  // 물약 버튼 상태 업데이트
  var potN2=(G.potionInv&&G.potionInv.healing)||0;
  var potBtn2=document.getElementById('hp-potion-btn');
  if(potBtn2){
    potBtn2.style.opacity=potN2>0?'1':'0.35';
    potBtn2.title='치유 물약 사용 (보유: '+potN2+'개)';
  }
  // HP 라벨 변경
  const label=document.querySelector('#hp-bar-container .hp-label');
  if(label){
    if(pct<=20) label.textContent='😵 HP';
    else if(pct<=50) label.textContent='😟 HP';
    else label.textContent='💚 Vitality';
  }
  // 하루마감 버튼 스타일
  const restBtn=document.querySelector('.bot-btn.rest-btn, button[onclick*="rest"]');
  if(restBtn){
    if(pct<=0){
      restBtn.style.opacity='.4';
      restBtn.title='Vitality를 회복하세요';
    } else if(pct<=20){
      restBtn.style.background='rgba(200,80,40,.2)';
      restBtn.style.borderColor='rgba(200,80,40,.5)';
      restBtn.title='Vitality가 매우 낮습니다!';
    } else {
      restBtn.style.opacity='1';
      restBtn.style.background='';
      restBtn.style.borderColor='';
      restBtn.title='';
    }
  }
}
function healHp(amt, usePotion){
  if(usePotion){
    if(!G.potionInv||!(G.potionInv.healing>0)){
      showResult('🧪 치유 물약이 없습니다! 연금술로 제조하세요.',true);return;
    }
    G.potionInv.healing--;
    updateUI();
  }
  G.hp=Math.min(G.maxHp,(G.hp||0)+amt);
  updateHpBar();
  spawnFloat('❤️ +'+amt+' HP');
  if(typeof showBabaComment==='function') showBabaComment('Baba: Good. Better now.');
}
function useHealingPotion(){
  const heal=Math.floor(G.maxHp*0.4);
  healHp(heal, true);
  log('[회복] 치유 물약 사용 → +'+heal+'HP');
}
function takeDamage(amt){
  const R=RACES[G.charType]||{};
  const def=R.defBonus?R.defBonus*0.1:0;
  const actual=Math.max(1,Math.round(amt*(1-def)));
  G.hp=Math.max(0,(G.hp||0)-actual);
  updateHpBar();
  spawnFloat('-'+actual+' HP');
  if(G.hp<=0){showResult('HP가 바닥났습니다! 오두막에서 쉬세요.',true);G.hp=Math.floor(G.maxHp*0.3);updateHpBar();}
  return actual;
}

// ══ BATTLE SYSTEM ══
const MONSTERS=[
  {name:'기계 두더지',icon:'🦔',hp:20,atk:8, reward:{bronze:5, herb:'herb', herbN:2}},
  {name:'증기 골렘', icon:'🤖',hp:35,atk:12,reward:{bronze:10,herb:'resin',herbN:1}},
  {name:'태엽 거미', icon:'🕷',hp:25,atk:15,reward:{silver:1, herb:'rare', herbN:1}},
  {name:'용암 도마뱀',icon:'🦎',hp:50,atk:20,reward:{silver:1, bronze:5, herb:'ruby', herbN:1, isCrystal:true}},
  {name:'크리스탈 골렘',icon:'💠',hp:60,atk:18,reward:{golden:1,herb:'stardust',herbN:1,isCrystal:true}},
];
let curBattle=null;
function tryStartBattle(zone){
  const chance={shallow:.2,deep:.35,star:.5}[zone]||.15;
  if(Math.random()<chance){
    const pool=zone==='star'?MONSTERS.slice(3):zone==='deep'?MONSTERS.slice(1,4):MONSTERS.slice(0,2);
    const m=Object.assign({},pool[Math.floor(Math.random()*pool.length)]);
    m.curHp=m.hp;
    startBattle(m);
    return true;
  }
  return false;
}
function startBattle(m){
  curBattle=m;
  document.getElementById('battle-monster-icon').textContent=m.icon;
  document.getElementById('battle-monster-name').textContent=m.name;
  document.getElementById('battle-log').textContent=m.icon+' '+m.name+'이(가) 나타났습니다!';
  document.getElementById('battle-result-btn').style.display='none';
  document.querySelectorAll('.battle-btn').forEach(function(b){b.disabled=false;});
  updateBattleHp();
  document.getElementById('battle-overlay').classList.add('show');
}
function updateBattleHp(){
  if(!curBattle)return;
  const pct=Math.round(curBattle.curHp/curBattle.hp*100);
  document.getElementById('battle-monster-hp').textContent='HP: '+curBattle.curHp+'/'+curBattle.hp;
  document.getElementById('monster-hp-fill').style.width=pct+'%';
}
function battleAction(type){
  if(!curBattle)return;
  let msg='';
  if(type==='attack'){
    const atk=8+Math.floor(Math.random()*8);
    curBattle.curHp=Math.max(0,curBattle.curHp-atk);
    msg='⚔️ '+atk+' 데미지!';
    if(curBattle.curHp>0){const d=takeDamage(curBattle.atk);msg+=' 반격 -'+d+'HP';}
  } else if(type==='potion'){
    if(!G.potionInv||(G.potionInv.healing||0)<1){document.getElementById('battle-log').textContent='치유 물약이 없습니다!';return;}
    G.potionInv.healing--;
    const h=Math.floor(G.maxHp*.4);
    healHp(h); msg='치유 물약! +'+h+'HP';
  } else if(type==='tool'){
    const d=12+Math.floor(Math.random()*10);
    curBattle.curHp=Math.max(0,curBattle.curHp-d);
    msg='도구 공격! '+d+' 데미지';
  } else if(type==='flee'){
    if(Math.random()<.6){document.getElementById('battle-log').textContent='도망쳤습니다!';setTimeout(closeBattle,1000);document.querySelectorAll('.battle-btn').forEach(function(b){b.disabled=true;});return;}
    const d=takeDamage(curBattle.atk);msg='도망 실패! -'+d+'HP';
  }
  document.getElementById('battle-log').textContent=msg;
  updateBattleHp();
  if(curBattle.curHp<=0){
    const r=curBattle.reward;
    let rMsg='';
    if(r.bronze){addCoins('bronze',r.bronze);rMsg+='🪙+'+r.bronze+' ';}
    if(r.silver){addCoins('silver',r.silver);rMsg+='🔘+'+r.silver+' ';}
    if(r.golden){addCoins('golden',r.golden);rMsg+='⭐+'+r.golden+' ';}
    if(r.herb&&r.herbN){
      if(r.isCrystal&&G.crystals&&r.herb in G.crystals){G.crystals[r.herb]=(G.crystals[r.herb]||0)+r.herbN;if(typeof trackCrystalMined==='function')trackCrystalMined(r.herb,r.herbN);}
      else addHerb(r.herb,r.herbN);
      rMsg+=iN(r.herb)+'×'+r.herbN;
    }
    document.getElementById('battle-log').textContent='승리! '+rMsg;
    document.getElementById('battle-result-btn').style.display='block';
    document.getElementById('battle-result-btn').textContent='전리품 수령!';
    document.querySelectorAll('.battle-btn').forEach(function(b){b.disabled=true;});
    spawnFloat('전투 승리!');
    G.reputation=(G.reputation||0)+1;
    updateUI();
  } else if(G.hp<=0){
    document.getElementById('battle-log').textContent='쓰러졌습니다...';
    document.getElementById('battle-result-btn').style.display='block';
    document.getElementById('battle-result-btn').textContent='오두막으로...';
    document.querySelectorAll('.battle-btn').forEach(function(b){b.disabled=true;});
  }
}
function closeBattle(){document.getElementById('battle-overlay').classList.remove('show');curBattle=null;updateUI();}

// ══ HOUSE CUSTOMIZATION ══
const HOUSE_MODS={
  legs:{name:'공룡뼈 다리',icon:'🦴',desc:'집의 이동력과 안정성.',mods:[
    {id:'legs-basic', name:'기본 공룡뼈',     icon:'🦴',  price:0,  owned:true, equipped:true, effect:'기본 이동력', baba:'"이 다리로도 충분히 걸어다닌다고!"'},
    {id:'legs-brass', name:'황동 관절 다리',  icon:'⚙️',  price:50, owned:false,equipped:false,effect:'워킹하우스 +10%', baba:'"덜그럭 소리가 10% 줄었군."'},
    {id:'legs-crystal',name:'크리스탈 공명 다리',icon:'💎',price:150,owned:false,equipped:false,effect:'워킹하우스 보상 2배', baba:'"집이 기지개를 켜는 소리가 났다."'},
    {id:'legs-dragon',name:'티라노 업그레이드',icon:'🦕',price:300,owned:false,equipped:false,effect:'새 지역 탐험', baba:'"...집이 너무 커졌어."'},
  ]},
  lab:{name:'연구실 내부',icon:'⚗️',desc:'약초 가공 효율.',mods:[
    {id:'lab-basic', name:'기본 작업대',    icon:'🪵', price:0,  owned:true, equipped:true, effect:'기본 속도', baba:'"이 작업대에서 500년간 약을 만들었어."'},
    {id:'lab-copper',name:'구리 파이프',    icon:'🔧', price:40, owned:false,equipped:false,effect:'제련 -1일', baba:'"파이프 소리에 리듬감이 있군."'},
    {id:'lab-crystal',name:'크리스탈 분쇄기',icon:'💎',price:120,owned:false,equipped:false,effect:'물약 보너스 +1', baba:'"자동화라... 효율은 좋아."'},
    {id:'lab-gold',  name:'황금 작업대',   icon:'⭐', price:250,owned:false,equipped:false,effect:'명성 +5, 고급 손님↑', baba:'"사치스럽군. 하지만 나쁘진 않아."'},
  ]},
  roof:{name:'연구 장비',icon:'🔭',desc:'탐색 범위와 연구 효율.',mods:[
    {id:'roof-basic', name:'기본 창문',    icon:'🪟', price:0,  owned:true, equipped:true, effect:'기본 탐색', baba:'"창문으로 정원이 다 보여."'},
    {id:'roof-scope', name:'증기 망원경',  icon:'🔭', price:35, owned:false,equipped:false,effect:'희귀초 +10%', baba:'"저 먼 곳의 희귀초가 보이는군."'},
    {id:'roof-glass', name:'스테인드글라스',icon:'🌈',price:80, owned:false,equipped:false,effect:'명성 +3/Day', baba:'"예상외로 마음에 들어."'},
    {id:'roof-antenna',name:'크리스탈 안테나',icon:'📡',price:180,owned:false,equipped:false,effect:'날씨 예보 1일 전', baba:'"내일 날씨를 안다는 건 큰 이점이지."'},
  ]},
  wall:{name:'외벽',icon:'🏠',desc:'명성과 상인 방문.',mods:[
    {id:'wall-basic',name:'기본 외벽',      icon:'🪨', price:0,  owned:true, equipped:true, effect:'기본 명성', baba:'"남들 눈에 띄고 싶지 않아."'},
    {id:'wall-vine', name:'약초 덩굴 외벽', icon:'🌿', price:30, owned:false,equipped:false,effect:'상인 +15%', baba:'"덩굴이 창문을 막았어."'},
    {id:'wall-metal',name:'황동 장식 외벽', icon:'⚙️', price:90, owned:false,equipped:false,effect:'명성 +2/납품', baba:'"번쩍이는 황동..."'},
    {id:'wall-flag', name:'약초사 깃발',    icon:'🚩', price:60, owned:false,equipped:false,effect:'특별 손님↑', baba:'"깃발이 펄럭이는 소리가 위엄 있군."'},
  ]},
};
craft:{name:'마법 공방',icon:'✨',desc:'물약과 크리스탈로 제작.',mods:[
  {id:'craft-moonlight', name:'달빛 정원등', icon:'🌙', price:0, owned:false, equipped:false,
   effect:'밤 채집량 +1', baba:'"달빛이 정원을 밝히는군."',
   need:{moon_honey:1, mooncrys:2}},
  {id:'craft-distiller', name:'황금 증류기', icon:'⚗️', price:0, owned:false, equipped:false,
   effect:'물약 제조 보너스 +1', baba:'"이 증류기... 냄새가 좋군."',
   need:{golden_honey:1, ruby:1}},
  {id:'craft-greenhouse', name:'크리스탈 온실', icon:'💎', price:0, owned:false, equipped:false,
   effect:'특별 손님 확률 +', baba:'"손님들이 더 자주 올 것 같아."',
   need:{healing:2, sapphire:2}},
  {id:'craft-vane', name:'꿀빛 풍향계', icon:'🌀', price:0, owned:false, equipped:false,
   effect:'날씨 예보', baba:'"내일 날씨를 알 수 있겠군."',
   need:{honey_syrup:2, amethyst:1}},
  {id:'craft-herbstand', name:'에메랄드 약초대', icon:'🌿', price:0, owned:false, equipped:false,
   effect:'약초 채집량 +1', baba:'"약초가 더 잘 자랄 것 같아."',
   need:{forest:1, emerald:2}},
]},
function renderHouseTab(){
  var sec=document.getElementById('house-sections');
  if(!sec)return;
  if(!G.houseMods)G.houseMods={};
  sec.innerHTML='';

  var tabDefs=[
    {id:'outer', label:'🏠 외부', parts:['wall','legs']},
    {id:'inner', label:'⚗️ 내부', parts:['lab','roof']},
  ];

  var tabBar=document.createElement('div');
  tabBar.style.cssText='display:flex;gap:6px;margin-bottom:14px;';
  var panels={};

  tabDefs.forEach(function(td,ti){
    var btn=document.createElement('button');
    btn.textContent=td.label;
    btn.style.cssText='flex:1;padding:8px 0;border-radius:8px;border:1px solid var(--gold);background:'+(ti===0?'var(--gold)':'transparent')+';color:'+(ti===0?'#fff':'var(--ink2)')+';font-size:.8rem;cursor:pointer;font-family:Cinzel,serif;';
    btn.onclick=(function(tid,b){
      return function(){
        tabBar.querySelectorAll('button').forEach(function(x){
          x.style.background='transparent';
          x.style.color='var(--ink2)';
        });
        b.style.background='var(--gold)';
        b.style.color='#fff';
        Object.values(panels).forEach(function(p){p.style.display='none';});
        panels[tid].style.display='block';
      };
    })(td.id,btn);
    tabBar.appendChild(btn);

    var panel=document.createElement('div');
    panel.style.display=ti===0?'block':'none';
    panels[td.id]=panel;

    td.parts.forEach(function(partId){
      var part=HOUSE_MODS[partId];
      if(!part)return;
      var wrap=document.createElement('div');
      wrap.style.marginBottom='16px';
      var ph=document.createElement('div');
      ph.className='house-part-header';
      ph.innerHTML='<span class="hp-part-icon">'+part.icon+'</span><div><div class="hp-part-name">'+part.name+'</div><div class="hp-part-desc">'+part.desc+'</div></div>';
      wrap.appendChild(ph);

      part.mods.forEach(function(mod){
        var isOwned=mod.owned||(G.houseMods[mod.id]==='owned'||G.houseMods[mod.id]==='equipped');
        var isEquip=false;
        if(G.houseMods[mod.id]==='equipped'){isEquip=true;}
        else if(mod.price===0){
          var anyEquipped=part.mods.some(function(m){return m.id!==mod.id&&G.houseMods[m.id]==='equipped';});
          isEquip=!anyEquipped;
        }
        var card=document.createElement('div');
        card.className='house-mod-card'+(isEquip?' equipped':isOwned?' owned':'');
        var priceStr=mod.price===0?'기본':mod.price+'냥';
        var actionEl=document.createElement('div');
        if(isEquip){
          actionEl.innerHTML='<span class="hmc-owned">장착중</span>';
        } else if(isOwned){
          var btn2=document.createElement('button');
          btn2.style.cssText='padding:4px 10px;border-radius:6px;border:1px solid var(--moss);font-size:.72rem;cursor:pointer';
          btn2.textContent='장착';
          (function(pid,mid){btn2.onclick=function(e){e.stopPropagation();equipMod(pid,mid);};})(partId,mod.id);
          actionEl.appendChild(btn2);
        } else {
          actionEl.innerHTML='<span class="hmc-price">'+priceStr+'</span>';
        }
        card.innerHTML='<span class="hmc-icon">'+mod.icon+'</span><div style="flex:1"><div class="hmc-name">'+mod.name+'</div><div class="hmc-desc" style="font-size:.7rem;color:var(--ink2);margin-top:2px">'+mod.effect+'</div></div>';
        card.appendChild(actionEl);
        if(!isOwned&&mod.price>0){
          (function(p,m){card.onclick=function(){buyMod(p,m);};})(partId,mod);
        }
        wrap.appendChild(card);
      });
      panel.appendChild(wrap);
    });
    sec.appendChild(panel);
  });
  sec.insertBefore(tabBar,sec.firstChild);
}

function buyMod(partId,mod){
  if(G.coins.bronze<mod.price){showHouseMsg('냥코인이 부족합니다!');return;}
  G.coins.bronze-=mod.price;
  if(!G.houseMods)G.houseMods={};
  G.houseMods[mod.id]='owned';
  showHouseMsg('Baba: '+mod.baba);
  spawnFloat(mod.name+' 구매!');
  updateUI();renderHouseTab();
}
function equipMod(partId,modId){
  if(!G.houseMods)G.houseMods={};
  HOUSE_MODS[partId].mods.forEach(function(m){if(G.houseMods[m.id]==='equipped')G.houseMods[m.id]='owned';});
  G.houseMods[modId]='equipped';
  var mod=HOUSE_MODS[partId].mods.find(function(m){return m.id===modId;});
  if(mod)showHouseMsg('Baba: '+mod.baba);
  spawnFloat('장착 완료!');
  renderHouseTab();
}
function showHouseMsg(msg){
  var el=document.getElementById('house-baba-reaction');
  if(el){el.textContent=msg;el.style.display='block';setTimeout(function(){el.style.display='none';},4000);}
}

// ══ MINE CODEX ══
const MINE_CODEX = [
  {
    id:'clockwork', icon:'⚙️', reqCrystal:'sapphire', reqAmt:3,
    name:'태엽 태동석', engName:'Clockwork Pulse-Crystal',
    look:'황동 파편이 박힌 톱니 모양의 노란 결정.',
    use:'약탕기의 온도와 시간을 일정하게 유지하는 자동 조절 장치로 사용.',
    note:'지하 1층에서 캤는데, 이놈은 도무지 멈출 줄을 모른다. 탕기에 넣으면 보글보글 끓는 소리가 마치 심장 박동처럼 규칙적이다. 너무 정확해서 가끔은 이놈이 나보다 시간을 더 잘 지키는 게 아닌가 싶어 분하다. 덩치 큰 놈은 집 다리 관절에 끼워놨는데, 덕분에 우리 집이 덜그럭거리는 소리가 10% 줄었다.',
    gameEffect:'⚗️ 제련 시간 단축',
  },
  {
    id:'steam', icon:'💧', reqCrystal:'amethyst', reqAmt:2,
    name:'증기 응축 수정', engName:'Steam-Condense Prism',
    look:'반투명한 푸른색, 만지면 항상 서늘하고 습기가 맺혀 있음.',
    use:'공기 중의 증기를 뽑아내어 순수한 증류수를 얻는 정수용 결정.',
    note:'이 결정 근처는 항상 축축하다. 증류수 얻으려고 탕기 옆에 뒀다가, 이놈이 근처의 습기까지 다 빨아들이는 바람에 내 콧수염에 이슬이 맺혔다. 실험하다가 털 젖는 걸 극도로 싫어하는 나로서는 계륵 같은 존재다. 그래도 이놈이 뽑아낸 증류수로 탄 약차는 맛이 깔끔해서 봐준다.',
    gameEffect:'💧 달빛 물약 수초 소모 -1',
  },
  {
    id:'dino', icon:'🦴', reqCrystal:'ruby', reqAmt:2,
    name:'공룡 골수 결정', engName:'Dino-Marrow Core',
    look:'붉은 빛이 도는 뼈 화석 형태, 아주 묵직함.',
    use:'집(공룡뼈 다리)과 약초 실험실을 연결하는 마력 공명기.',
    note:'광산 깊은 곳, 오래된 뼈 틈바구니에서 찾아냈다. 집에 이 결정을 끼워 넣었더니 집이 갑자기 기지개를 켜듯 으드득거리는 소리를 냈다. 이 녀석은 근처 약초들의 생명력을 끌어올린다. 덕분에 텃밭의 약초들이 밤사이 쑥쑥 자라는데, 아침에 일어나면 덩굴이 침대까지 침범해 있다.',
    gameEffect:'🌿 하루 마감 시 약초 +2',
  },
  {
    id:'magnet', icon:'🧲', reqCrystal:'emerald', reqAmt:2,
    name:'자석 흡착 광석', engName:'Magnetite Spark-Stone',
    look:'검고 매끄러운 바위인데, 주변에 철가루가 달라붙어 고슴도치처럼 보임.',
    use:'약초 분쇄 시 섞인 금속 불순물을 골라내는 선별기.',
    note:'이놈을 다루는 날에는 내 기계 장갑이 가만히 있질 못한다. 자꾸 벽이나 책상에 달라붙어서 떼어내느라 하루 에너지를 다 쓴다. 어제 실수로 주머니에 넣고 다녔더니, 광산 입구 철제 문에 몸이 통째로 붙어버려서 30분 동안 못 나왔다. 지나가던 쥐들이 비웃고 가더라.',
    gameEffect:'💎 크리스탈 채굴 성공률 +20%',
  },
];

function getMineCodexUnlocked(c){
  // crystals 보유량으로 직접 체크 (가장 확실)
  if(!G.crystals) G.crystals={sapphire:0,amethyst:0,emerald:0,ruby:0,mooncrys:0,stardust:0};
  if(!G.crystalMined) G.crystalMined={sapphire:0,amethyst:0,emerald:0,ruby:0,mooncrys:0,stardust:0};
  const total = (G.crystals[c.reqCrystal]||0) + (G.crystalMined[c.reqCrystal]||0);
  return total >= c.reqAmt;
}

function renderMineCodex(){
  var grid=document.getElementById('mine-codex-grid');
  if(!grid)return;
  grid.innerHTML='';
  var unlocked=0;
  var cnames={sapphire:'사파이어',amethyst:'자수정',emerald:'에메랄드',ruby:'루비',mooncrys:'문스톤',stardust:'스타더스트'};
  for(var i=0;i<MINE_CODEX.length;i++){
    var c=MINE_CODEX[i];
    var isUnlocked=getMineCodexUnlocked(c);
    if(isUnlocked)unlocked++;
    var card=document.createElement('div');
    card.style.cssText='border-radius:10px;border:1.5px solid '+(isUnlocked?'#5533aa':'#2a1050')+';background:#0e0820;margin-bottom:10px;overflow:hidden';
    if(isUnlocked){
      var hdr=document.createElement('div');
      hdr.style.cssText='display:flex;align-items:center;gap:10px;padding:11px 13px;cursor:pointer;background:linear-gradient(135deg,#120a28,#1a0e35);border-bottom:1px solid #2a1050';
      hdr.innerHTML='<span style="font-size:2rem;flex-shrink:0">'+c.icon+'</span>'
        +'<div style="flex:1"><div style="font-family:Cinzel,serif;font-size:.88rem;color:#cc88ff">'+c.name+'</div>'
        +'<div style="font-size:.65rem;color:#7755aa;margin-top:1px">'+c.engName+'</div></div>'
        +'<span style="font-size:.7rem;color:#7755aa" id="arr-'+c.id+'">▼</span>';
      var bodyId='mcb-'+c.id;
      (function(bid){hdr.onclick=function(){toggleMineCard(bid);};})(bodyId);
      var body=document.createElement('div');
      body.id=bodyId;
      body.style.display='none';
      body.style.padding='11px 13px';
      body.innerHTML='<div style="font-size:.78rem;color:#9966cc;margin-bottom:7px">🔍 '+c.look+'</div>'
        +'<div style="font-size:.8rem;color:#c0a0e0;line-height:1.55;padding:7px 9px;background:rgba(120,60,220,.1);border-radius:6px;border-left:3px solid #7744cc;margin-bottom:8px">⚗️ '+c.use+'</div>'
        +'<div style="font-size:.78rem;color:#9977bb;line-height:1.65;padding:8px 10px;background:rgba(100,50,180,.08);border-radius:6px;border-left:3px solid #5533aa;font-style:italic;margin-bottom:7px">📝 바바의 노트:<br>'+c.note+'</div>'
        +'<div style="font-size:.72rem;color:#9966cc;background:rgba(100,50,180,.1);border-radius:5px;padding:5px 8px">🎮 '+c.gameEffect+'</div>';
      card.appendChild(hdr);
      card.appendChild(body);
    } else {
      var have=Math.max((G.crystalMined&&G.crystalMined[c.reqCrystal]||0),(G.crystals&&G.crystals[c.reqCrystal]||0));
      card.innerHTML='<div style="display:flex;align-items:center;gap:10px;padding:11px 13px">'
        +'<span style="font-size:2rem;flex-shrink:0;filter:grayscale(1)">💎</span>'
        +'<div style="flex:1"><div style="font-family:Cinzel,serif;font-size:.88rem;color:#442266">??? 미발견 결정</div>'
        +'<div style="font-size:.65rem;color:#331155;margin-top:2px">'+cnames[c.reqCrystal]+' '+c.reqAmt+'개 채굴 시 해금</div></div>'
        +'<span style="font-size:.7rem;color:#5533aa">'+have+'/'+c.reqAmt+'</span></div>';
    }
    grid.appendChild(card);
  }
  var pct=Math.round(unlocked/MINE_CODEX.length*100);
  var fill=document.getElementById('mcodex-prog-fill');
  var lbl=document.getElementById('mcodex-prog-label');
  if(fill)fill.style.width=pct+'%';
  if(lbl)lbl.textContent=unlocked+' / '+MINE_CODEX.length+' 해금';
}

function toggleMineCard(id){
  const el=document.getElementById(id);
  if(!el) return;
  const isOpen=el.style.display!=='none';
  el.style.display=isOpen?'none':'block';
  // 화살표
  const cardId=id.replace('mcb-','');
  const arr=document.getElementById('arr-'+cardId);
  if(arr) arr.textContent=isOpen?'▼':'▲';
}

function trackCrystalMined(item, n){
  if(!G.crystalMined) G.crystalMined={sapphire:0,amethyst:0,emerald:0,ruby:0,mooncrys:0,stardust:0};
  if(item in G.crystalMined) G.crystalMined[item]=(G.crystalMined[item]||0)+n;
  // 도감 해금 체크
  if(!G.mineCodexUnlocked) G.mineCodexUnlocked=[];
  MINE_CODEX.forEach(function(c){
    if(!G.mineCodexUnlocked.includes(c.id) && getMineCodexUnlocked(c)){
      G.mineCodexUnlocked.push(c.id);
      spawnFloat('💎 크리스탈 도감 해금!');
      log('[도감] '+c.name+' 해금!');
      const tb=document.getElementById('tb-herb');
      if(tb){tb.textContent='!';tb.parentElement.classList.add('has-badge');}
    }
  });
  // 도감이 열려있으면 갱신
  if(document.getElementById('pg-herb').classList.contains('active')){
    renderMineCodex();
  }
}

function fbLogout(){
  saveGame();
  function goToLogin(){
    G=freshState();
    // 모든 intro 하위 화면 숨기기
    var screens=['intro-title-screen','login-screen','char-screen','story-screen','reset-screen'];
    screens.forEach(function(id){
      var el=document.getElementById(id);
      if(el)el.style.display='none';
    });
    // 인트로 타이틀 화면 표시 (모험 시작하기 버튼)
    var titleEl=document.getElementById('intro-title-screen');
    if(titleEl)titleEl.style.display='flex';
    var loginEl=document.getElementById('login-screen');
    if(loginEl)loginEl.style.display='none';
    // 입력창 초기화
    var idEl=document.getElementById('li-id');
    var pwEl=document.getElementById('li-pw');
    var pw2El=document.getElementById('li-pw2');
    var msgEl=document.getElementById('login-msg');
    if(idEl)idEl.value='';
    if(pwEl)pwEl.value='';
    if(pw2El)pw2El.value='';
    if(msgEl)msgEl.textContent='';
    if(typeof switchLoginTab==='function')switchLoginTab('login');
    // 인트로 화면 표시
    var intro=document.getElementById('intro-screen');
    if(intro){
      intro.style.display='flex';
      intro.style.opacity='1';
      intro.style.transition='';
    }
    // 설정 오버레이 닫기
    var settings=document.getElementById('settings-overlay');
    if(settings)settings.classList.remove('show');
    log('로그아웃 완료');
  }
  if(window._fbAuth&&window._fbFns){
    window._fbFns.signOut(window._fbAuth).then(function(){
      window._fbUser=null;
      goToLogin();
    }).catch(function(){goToLogin();});
  } else {
    goToLogin();
  }
}

function updateFbStatus(){
  const el=document.getElementById('fb-status');
  if(!el) return;
  if(window._fbUser){
    el.textContent='☁️ '+(G.playerName||window._fbUser.email)+' 로그인 중';
    el.style.color='var(--moss)';
  } else {
    el.textContent='💾 로컬 저장 모드';
    el.style.color='var(--ink2)';
  }
}

// ══ SETTINGS SYSTEM ══
function openSettings(){
  const overlay=document.getElementById('settings-overlay');
  if(!overlay)return;
  overlay.classList.add('show');
  const nameEl=document.getElementById('settings-username');
  const roleEl=document.getElementById('settings-userrole');
  if(nameEl) nameEl.textContent=(G.charName||G.playerName||'약초사')+'님';
  if(roleEl){const R=RACES[G.charType];roleEl.textContent=R?R.name:'종족 미선택';}
  const bgmStatus=document.getElementById('settings-bgm-status');
  const bgmToggle=document.getElementById('settings-bgm-toggle');
  updateBgmUI();
}
function closeSettings(){
  const el=document.getElementById('settings-overlay');
  if(el)el.classList.remove('show');
}
function closeSettingsBg(e){
  if(e.target.id==='settings-overlay')closeSettings();
}
function openProfileFromSettings(){
  closeSettings();
  // 설정 닫힌 후 프로필 열기
  setTimeout(function(){
    openProfile();
  },300);
}
function openNoticeFromSettings(){closeSettings();setTimeout(()=>switchTab('notice'),200);}
function openContactFromSettings(){closeSettings();setTimeout(()=>switchTab('contact'),200);}
function showDeleteConfirm(){
  document.getElementById('delete-input').value='';
  document.getElementById('delete-confirm').classList.add('show');
}
function hideDeleteConfirm(){
  document.getElementById('delete-confirm').classList.remove('show');
}
function confirmDeleteAccount(){
  const val=document.getElementById('delete-input').value.trim();
  if(val!=='삭제'){alert('"삭제"를 정확히 입력해주세요.');return;}
  if(!window._fbUser){
    try{localStorage.clear();}catch(e){}
    location.reload();return;
  }
  const uid=window._fbUser.uid;
  Promise.all([
    window._fbFns.setDoc(window._fbFns.doc(window._fbDb,'saves',uid),{}),
    window._fbFns.setDoc(window._fbFns.doc(window._fbDb,'users',uid),{}),
  ]).then(()=>window._fbUser.delete())
  .then(()=>{try{localStorage.clear();}catch(e){}alert('계정이 삭제됐습니다.');location.reload();})
  .catch((err)=>alert('삭제 실패: 재로그인 후 다시 시도해주세요.'));
}

// ══ NATURAL HP RECOVERY ══
let naturalHealTimer = null;
function startNaturalHeal(){
  if(naturalHealTimer) clearInterval(naturalHealTimer);
  // 30초마다 HP 2% 자연 회복 (5분에 약 20% 회복)
  naturalHealTimer = setInterval(function(){
    if(!G||!G.maxHp) return;
    const hp=G.hp||0;
    if(hp < G.maxHp){
      const heal=Math.ceil(G.maxHp*0.02);
      G.hp=Math.min(G.maxHp, hp+heal);
      updateHpBar();
      // 회복 중 표시 (조용히)
      if(hp < G.maxHp*0.5){
        const el=document.getElementById('hp-val');
        if(el){
          el.style.transition='color .5s';
          el.style.color='#60dd60';
          setTimeout(()=>{el.style.color='';},1000);
        }
      }
    }
  }, 30*1000); // 30초마다
}

// ══ EQUIPMENT SYSTEM ══
const EQUIPMENT = {
  tool: [
    {id:'basic-pot',  icon:'🪴', name:'기본 화분',    effect:'기본 채집',          bonus:{}},
    {id:'herb-basket',icon:'🧺', name:'약초 바구니',  effect:'채집량 +1',          bonus:{gather:1}},
    {id:'silver-hoe', icon:'🔨', name:'은빛 호미',    effect:'Vitality 소모 -1',         bonus:{hpSave:1}},
    {id:'gold-shovel',icon:'⛏️', name:'황금 삽',      effect:'채집량 +2, HP소모-1', bonus:{gather:2,hpSave:1}},
  ],
  outfit: [
    {id:'basic-shirt', icon:'👕', name:'기본 옷',     effect:'효과 없음',          bonus:{}},
    {id:'apron',       icon:'🥼', name:'린넨 앞치마', effect:'에너지 최대 +1',     bonus:{energy:1}},
    {id:'adventurer',  icon:'🧥', name:'모험가 코트', effect:'에너지 최대 +2',     bonus:{energy:2}},
    {id:'alchemist',   icon:'✨', name:'연금술사 가운',effect:'물약 효과 +20%',    bonus:{potion:20}},
  ],
  acc: [
    {id:'none',       icon:'🎀', name:'없음',         effect:'슬롯 비어있음',      bonus:{}},
    {id:'ribbon',     icon:'🎀', name:'리본 머리띠',  effect:'운 +5%',             bonus:{luck:5}},
    {id:'goggles',    icon:'🥽', name:'황동 고글',    effect:'희귀초 발견 +10%',  bonus:{rare:10}},
    {id:'medal',      icon:'🏅', name:'공로 메달',    effect:'명성 +1/납품',      bonus:{rep:1}},
  ],
};

function updateEquipSlots(){
  if(!G.equipment) G.equipment={tool:'basic-pot',outfit:'basic-shirt',acc:'none'};
  ['tool','outfit','acc'].forEach(function(type){
    const equipped=EQUIPMENT[type].find(function(e){return e.id===G.equipment[type];})||EQUIPMENT[type][0];
    const iconEl=document.getElementById('equip-'+type+'-icon');
    const nameEl=document.getElementById('equip-'+type+'-name');
    const effEl=document.getElementById('equip-'+type+'-effect');
    if(iconEl)iconEl.textContent=equipped.icon;
    if(nameEl)nameEl.textContent=equipped.name;
    if(effEl)effEl.textContent=equipped.effect;
  });
}

function openEquipMenu(type){
  const items=EQUIPMENT[type];
  if(!G.equipment)G.equipment={tool:'basic-pot',outfit:'basic-shirt',acc:'none'};
  const typeNames={tool:'도구',outfit:'의상',acc:'악세서리'};
  var msg=typeNames[type]+' 선택:\n';
  items.forEach(function(item,i){
    const owned=i===0||(G.unlockedEquip&&G.unlockedEquip.includes(item.id));
    msg+=(i+1)+'. '+item.icon+' '+item.name+(owned?' ('+item.effect+')':' [미해금]')+'\n';
  });
  const choice=prompt(msg+'\n번호를 입력하세요:');
  if(!choice)return;
  const idx=parseInt(choice)-1;
  if(idx<0||idx>=items.length)return;
  const selected=items[idx];
  const owned=idx===0||(G.unlockedEquip&&G.unlockedEquip.includes(selected.id));
  if(!owned){showResult('아직 해금되지 않은 장비입니다!',true);return;}
  G.equipment[type]=selected.id;
  updateEquipSlots();
  spawnFloat(selected.icon+' '+selected.name+' 장착!');
  if(typeof showBabaComment==='function') showBabaComment('Baba: Nice equipment choice.');
}

function profileRest(){
  // 치유 물약 없어도 HP 소량 회복
  const heal=Math.ceil(G.maxHp*0.2);
  G.hp=Math.min(G.maxHp,(G.hp||0)+heal);
  G.energy=Math.max(0,(G.energy||0)-1); // 에너지 1 소모
  updateHpBar(); updateUI();
  spawnFloat('😴 +'+heal+'HP');
  openProfile(); // 갱신
}

function profileSnack(){
  // 치유 물약 사용
  if(!G.potionInv||(G.potionInv.healing||0)<1){
    showResult('치유 물약이 없어요! 연금술로 만들어보세요.',true);
    return;
  }
  const heal=Math.ceil(G.maxHp*0.4);
  G.potionInv.healing--;
  G.hp=Math.min(G.maxHp,(G.hp||0)+heal);
  updateHpBar(); updateUI();
  spawnFloat('🧪 +'+heal+'HP 회복!');
  openProfile();
}

// ══ RACE RESELECT ══
function showRaceReselect(){
  var msg = '종족을 재선택합니다.\n\n1. 🐱 고양이 약초사 (채집/희귀초 특화, HP80)\n2. 🐶 개 탐험가 (광산/전투 특화, HP120)\n3. 🐰 토끼 연금술사 (물약/상점 특화, HP70)\n\n번호를 입력하세요:';
  var choice = prompt(msg);
  if(!choice) return;
  var types = ['cat','dog','bunny'];
  var icons = {cat:'🐱',dog:'🐶',bunny:'🐰'};
  var idx = parseInt(choice)-1;
  if(idx<0||idx>2){alert('올바른 번호를 입력해주세요.');return;}
  var newType = types[idx];
  var R = RACES[newType];
  if(!R){alert('오류가 발생했습니다.');return;}
  G.charType = newType;
  G.maxHp = R.maxHp;
  G.hp = Math.min(G.hp||R.maxHp, R.maxHp);
  updateHpBar();
  updateUI();
  spawnFloat(R.icon+' 종족 변경 완료!');
  log('[종족변경] '+R.name+' 선택');
  saveGame();
  // 기록 탭 갱신
  if(typeof updateStatsPage==='function')updateStatsPage();
  alert(R.icon+' '+R.name+'(으)로 변경됐습니다!');
}

// ══ SECRET COMBINATION SYSTEM ══
