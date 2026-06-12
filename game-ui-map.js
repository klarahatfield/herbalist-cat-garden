// ╔══════════════════════════════════════════════════════╗
// ║  game-ui-map.js                                       ║
// ║  약초사의 비밀정원 — UI 렌더링 (맵/도감)                      ║
// ║                                                      ║
// ║  포함: renderHerbarium, renderMine (일부), renderAero, renderCustomer,
// ╚══════════════════════════════════════════════════════╝

//  APPRENTICE UNLOCK SYSTEM
// ══════════════════════════════════════
const APP_UNLOCK_CONDITIONS = [
  {
    id:'aqua', repNeeded:5,
    unlockStory:{
      title:'💙 Aqua가 찾아왔습니다!',
      scene:'연못 옆에서 파란 눈의 고양이가 수초를 구경하고 있습니다.',
      dialogue:[
        {speaker:'aqua', text:'"저... 여기가 Baba 선생님 정원 맞죠? 수초가 정말 예뻐요!"'},
        {speaker:'baba', text:'"그래. 누군가?"'},
        {speaker:'aqua', text:'"저는 Aqua예요. 물과 이끼에 관심이 많아서요... 혹시 제자로 받아주실 수 있나요?"'},
        {speaker:'baba', text:'"...수초 냄새를 맡아봐. 제대로 설명할 수 있으면 생각해보지."'},
        {speaker:'aqua', text:'"달빛을 머금은 듯한 향이에요. 여기선 달이 뜨기 전에 채집해야 해요!"'},
        {speaker:'baba', text:'"...합격. 내일부터 출근해."'},
      ]
    }
  },
  {
    id:'ink', repNeeded:15,
    unlockStory:{
      title:'🖤 Ink가 찾아왔습니다!',
      scene:'오두막 창문 너머로 검은 고양이가 노트에 뭔가를 열심히 적고 있습니다.',
      dialogue:[
        {speaker:'ink', text:'"저기... Baba 선생님이시죠? 선생님 연구가 궁금해서 직접 왔습니다."'},
        {speaker:'baba', text:'"그 노트는 뭔가?"'},
        {speaker:'ink', text:'"지금까지 관찰한 약초 기록이에요. 벌써 47권째예요."'},
        {speaker:'baba', text:'"...47권? 몇 살이지?"'},
        {speaker:'ink', text:'"열일곱이요."'},
        {speaker:'baba', text:'"들어와. Journal 115권 옆에 네 자리를 만들어주지."'},
      ]
    }
  },
  {
    id:'luna', repNeeded:30,
    unlockStory:{
      title:'🌙 Luna가 찾아왔습니다!',
      scene:'보름달이 뜬 밤, 라군 옆에서 황금빛 눈의 고양이가 연꽃을 바라보고 있습니다.',
      dialogue:[
        {speaker:'luna', text:'"별이 이 정원을 가리키고 있었어요. 그래서 왔어요."'},
        {speaker:'baba', text:'"...별이?"'},
        {speaker:'luna', text:'"네. 희귀초가 어디 있는지도요. 저기 Whisker Sense Garden 북쪽 구석에 숨어있죠?"'},
        {speaker:'baba', text:'"본 적이 없는데."'},
        {speaker:'luna', text:'"달빛이 있으면 보여요. 저한테는요."'},
        {speaker:'baba', text:'"...내일부터 그 눈이 필요하겠어. 라군 옆 자리 써."'},
      ]
    }
  },
];

function checkAppUnlock(){
  if(!G.unlockedApps) G.unlockedApps=[];
  const rep = G.reputation||0;
  APP_UNLOCK_CONDITIONS.forEach(cond => {
    if(!G.unlockedApps.includes(cond.id) && rep >= cond.repNeeded){
      G.unlockedApps.push(cond.id);
      showAppUnlockCinematic(cond);
    }
  });
}

function showAppUnlockCinematic(cond){
  const s = cond.unlockStory;
  const el = document.getElementById('ignis-cinematic');
  // 도제 합류 시에도 이그니스 시네마틱 UI 재활용
  el.classList.add('show');
  el.scrollTop=0;

  // 배경 바꾸기
  const scene = el.querySelector('.ignis-scene');
  scene.style.background = 'linear-gradient(180deg,#0a1520,#0d2030,#0a1520)';
  el.querySelector('.ignis-volcano-bg').textContent = {
    aqua:'🌊', ink:'🌙', luna:'⭐'
  }[cond.id]||'🌿';
  el.querySelector('.ignis-cat-big').textContent = {
    aqua:'💙🐱', ink:'🖤🐱', luna:'🌙🐱'
  }[cond.id]||'🐱';

  document.getElementById('ignis-reward-div2').innerHTML =
    `<div style="padding:8px 10px;border-radius:7px;background:rgba(100,180,100,.1);border:1px solid #3a6a30;font-size:.82rem;color:#a0e090;margin-bottom:10px">
      🎉 새 도제 합류! 도제 탭에서 임무를 부여할 수 있어요.
    </div>`;

  const box = document.getElementById('ignis-dialogue-box');
  box.innerHTML = `<div style="font-size:.8rem;color:#a0c0a0;font-style:italic;margin-bottom:10px;line-height:1.6">${s.scene}</div>`;

  s.dialogue.forEach((d,i)=>{
    const avatars={aqua:'💙🐱',ink:'🖤🐱',luna:'🌙🐱',baba:'🐱'};
    const names={aqua:'Aqua',ink:'Ink',luna:'Luna',baba:'Baba'};
    const isBaba = d.speaker==='baba';
    const line=document.createElement('div');
    line.className='dialogue-line'+(isBaba?' baba':'');
    line.style.animationDelay=`${i*.4}s`;
    line.innerHTML=`
      <span class="dl-avatar">${avatars[d.speaker]||'🐱'}</span>
      <div class="dl-bubble">
        <div class="dl-name">${names[d.speaker]||d.speaker}</div>
        ${d.text}
      </div>`;
    box.appendChild(line);
  });

  document.getElementById('ignis-forge-section2').innerHTML='';
  spawnFloat(`${s.title.slice(0,4)} 도제 합류!`);
  log(`[도제] ${s.title}`);

  // 닫기 버튼을 정원 텍스트로 변경
  const closeBtn = document.getElementById('ignis-cinematic-close-btn');
  if(closeBtn){
    closeBtn.innerHTML = '🐾 정원으로 돌아가기';
    closeBtn.style.borderColor = '#4a7a32';
    closeBtn.style.background = 'rgba(74,122,50,.25)';
    closeBtn.style.color = '#c0e090';
  }
}

// ══════════════════════════════════════
//  CONTACT SYSTEM
// ══════════════════════════════════════
const BABA_CONTACT_MSGS = [
  '"방문자여, 이 편지함은 내가 Earl Grey를 마시는 시간을 제외하고 항상 열려있소."',
  '"버그를 발견했다면 즉시 알려주시오. Ink가 또 잉크를 엎지른 것은 아닐 테니..."',
  '"제안은 언제나 환영이오. 단, 엉겅퀴를 짓이기는 방법을 바꾸자는 제안은 사절이오."',
  '"오늘 날씨가 85% 습도군. 편지 쓰기에 좋은 날씨는 아니지만, 읽기엔 괜찮소."',
];
const CONTACT_TYPES = {
  bug:'🐛 버그 제보', suggest:'💡 게임 제안',
  story:'📖 스토리 아이디어', art:'🎨 아트/디자인',
  collab:'🤝 협업 문의', other:'💬 기타'
};

function renderContact(){
  const msg = BABA_CONTACT_MSGS[G.day % BABA_CONTACT_MSGS.length];
  const el = document.getElementById('baba-contact-msg');
  if(el) el.innerHTML = msg + '<br><br>"평화로운 Tuesday를 방해한 것들이 많지만, 좋은 편지는 언제나 환영이오."';
}

function submitContact(){
  const type    = document.getElementById('cf-type').value;
  const name    = document.getElementById('cf-name').value.trim() || '익명의 모험가';
  const contact = document.getElementById('cf-contact').value.trim();
  const message = document.getElementById('cf-message').value.trim();
  if(!message){ spawnFloat('내용을 입력해주세요!'); return; }

  const typeLabel = CONTACT_TYPES[type] || type;
  const gameInfo = `[Day ${G.day} | 총 ${totalNyang()}₦ | 퀘스트 ${G.questsCompleted}개 완료]`;
  const fullMsg = `📬 Baba에게 편지

유형: ${typeLabel}
이름: ${name}
연락처: ${contact||'없음'}

내용:
${message}

${gameInfo}`;

  // 클립보드 복사
  if(navigator.clipboard){
    navigator.clipboard.writeText(fullMsg).then(()=>{
      showContactResult(name, type);
    }).catch(()=>{
      showContactResult(name, type);
    });
  } else {
    showContactResult(name, type);
  }
}

function showContactResult(name, type){
  document.getElementById('contact-form').style.display='none';
  const result = document.getElementById('contact-result');
  result.style.display='block';
  const responses = {
    bug: '버그 제보 감사하오. Ink에게 즉시 기록하도록 명령했소. 아마 잉크를 엎지르며 메모하겠지만...',
    suggest: '흥미로운 제안이군. Earl Grey를 마시며 신중히 검토해보겠소.',
    story: '스토리 아이디어라! Aethel Cataria의 역사는 아직 쓰이지 않은 페이지가 많소.',
    art: '예술적 감각이 있군. Luna가 보면 좋아하겠소.',
    collab: '협업이라... 나는 혼자 일하는 것을 좋아하지만, 좋은 동반자는 언제나 환영이오.',
    other: '무엇이든 좋소. 조용한 Tuesday를 함께 나눠주니 감사하오.',
  };
  document.getElementById('cr-body-text').innerHTML =
    `"${name}의 편지가 도착했소.<br>${responses[type]||responses.other}<br><br>메시지가 클립보드에 복사됐습니다.<br>인스타그램 DM 또는 이메일로 붙여넣기 해주세요!"`;
  spawnFloat('📬 편지 전송!');
  log('[문의] 편지가 클립보드에 복사됐습니다.');
}

// ══════════════════════════════════════
//  LAUNCH CINEMATIC
// ══════════════════════════════════════
function createStars(count, container){
  container.innerHTML='';
  for(let i=0;i<count;i++){
    const s=document.createElement('div');
    s.className='star';
    const size=Math.random()*3+1;
    s.style.cssText=`width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*2}s;animation-duration:${1.5+Math.random()*2}s`;
    container.appendChild(s);
  }
}

function showLaunchCinematic(isVolcano, destName, days, onDone){
  const el = document.getElementById('launch-cinematic');
  const title = document.getElementById('cinematic-title');
  const sub   = document.getElementById('cinematic-sub');
  const emoji = document.getElementById('mortar-emoji');
  const flame = document.getElementById('mortar-flame');
  const smoke = document.getElementById('smoke-layer');
  const lava  = document.getElementById('lava-bg');
  const bubbles = document.getElementById('lava-bubbles');
  const vehicle = document.getElementById('mortar-vehicle');

  // 테마 설정
  el.className = isVolcano ? 'show theme-volcano' : 'show theme-pink';
  createStars(isVolcano?30:50, document.getElementById('star-field'));

  if(isVolcano){
    emoji.textContent = '🪄';
    flame.textContent = '🔥💨🔥💨🔥';
    smoke.innerHTML = '<span class="smoke-puff">🔥</span><span class="smoke-puff">💨</span><span class="smoke-puff">🔥</span><span class="smoke-puff">💨</span><span class="smoke-puff">🔥</span><span class="smoke-puff">💨</span>';
    lava.style.display='block'; bubbles.style.display='flex';
    title.textContent = '🌋 화산섬으로 출발!';
    sub.innerHTML = '"이그니스를 처음 만나는군.<br>뜨거운 환대를 각오해야겠어."<br><br>🔥 용암 연기를 따라 날아갑니다...';
  } else {
    emoji.textContent = '🪄';
    flame.textContent = '🌸💨🌸💨🌸';
    smoke.innerHTML = '<span class="smoke-puff">🌸</span><span class="smoke-puff">💨</span><span class="smoke-puff">🌸</span><span class="smoke-puff">💨</span><span class="smoke-puff">🌸</span><span class="smoke-puff">💨</span>';
    lava.style.display='none'; bubbles.style.display='none';
    title.textContent = `✈️ ${destName} 출발!`;
    sub.innerHTML = `분홍 연기와 함께 하늘로 솟아오릅니다!<br>📅 ${days}일 후 귀환 예정`;
  }

  // title/sub 애니메이션 리셋
  title.style.animation='none'; title.offsetHeight;
  title.style.animation='fadeInUp .8s ease forwards';
  sub.style.animation='none'; sub.offsetHeight;
  sub.style.animation='fadeInUp .8s ease .4s forwards';
  vehicle.classList.remove('launching');

  // 2초 후 발사
  setTimeout(()=>{
    vehicle.classList.add('launching');
    // 연기 커짐
    smoke.querySelectorAll('.smoke-puff').forEach(p=>{
      p.style.fontSize='4rem';
      p.style.animationDuration='.8s';
    });
  }, 1800);

  // 3.5초 후 종료
  setTimeout(()=>{
    el.classList.remove('show');
    if(onDone) onDone();
  }, 3500);
}

// ══════════════════════════════════════
//  IGNIS CINEMATIC
// ══════════════════════════════════════
function showIgnisCinematic(isFirst, rewardMsg){
  const el = document.getElementById('ignis-cinematic');
  el.classList.add('show');
  el.scrollTop = 0;
  // body 스크롤을 ignis 내부로만 제한 (배경 고정)
  document.body.style.overflow = 'hidden';

  // 보상 표시
  const rDiv = document.getElementById('ignis-reward-div2');
  rDiv.innerHTML = rewardMsg
    ? `<div style="padding:8px 10px;border-radius:7px;background:rgba(255,144,64,.1);border:1px solid #5a2a10;font-size:.82rem;color:#f0c080;margin-bottom:10px">📦 수확: ${rewardMsg}</div>`
    : '';

  // 대화 렌더링
  const box = document.getElementById('ignis-dialogue-box');
  box.innerHTML = '';
  const dialogues = isFirst ? [
    {speaker:'narrator', text:'Aero-Mortar가 용암이 흐르는 섬 위에 내려앉았습니다.'},
    {speaker:'narrator', text:'섬 중앙의 대장간에서 망치 소리가 멈추고, 거대한 체구의 검은 고양이가 천천히 돌아섰습니다.'},
    {speaker:'ignis',    text:'"...오랜만에 손님이군. Baba, 그 모르타르는 여전히 잘 날아다니는 모양이야."'},
    {speaker:'narrator', text:'이그니스. 화산섬의 장인묘. 용암 속에서도 눈썹 하나 까딱 않는 그가 집게를 내려놓으며 말했습니다.'},
    {speaker:'ignis',    text:'"재료 가져와. 내가 정제해줄게. 대신 — 잘 골라서 가져와라. 나는 시간 낭비를 싫어하거든."'},
    {speaker:'baba',     text:'"알겠네. 그런데 자네... 이 섬에 혼자 사는 건가?"'},
    {speaker:'ignis',    text:'"화산이 있는데 외로울 이유가 없지. 이 녀석은 말은 안 해도 항상 뜨겁거든."'},
  ] : [
    {speaker:'ignis',    text:`"${IGNIS_ISLAND_QUOTES[G.day % IGNIS_ISLAND_QUOTES.length].replace(/"/g,'')}"` },
    {speaker:'baba',     text:'"왔네. 재료 가져왔어."'},
    {speaker:'ignis',    text:'"보여봐. 내가 직접 확인하겠어."'},
  ];

  dialogues.forEach((d, i) => {
    const line = document.createElement('div');
    if(d.speaker === 'narrator'){
      line.style.cssText=`font-size:.8rem;color:#a07040;font-style:italic;margin-bottom:10px;padding:6px 0;opacity:0;animation:dialogueFadeIn .5s ease ${i*.4}s forwards;line-height:1.6`;
      line.textContent = d.text;
    } else {
      line.className = 'dialogue-line' + (d.speaker==='baba'?' baba':'');
      line.style.animationDelay = `${i*.4}s`;
      const avatar = d.speaker==='ignis' ? '🐱' : '🐱';
      const nameLabel = d.speaker==='ignis' ? 'Ignis' : 'Baba';
      line.innerHTML = `
        <span class="dl-avatar">${avatar}</span>
        <div class="dl-bubble">
          <div class="dl-name">${nameLabel}</div>
          ${d.text}
        </div>`;
    }
    box.appendChild(line);
  });

  // 제련 UI (재료 의뢰 + 무기 제작)
  renderIgnisForge();
  log(isFirst ? '[이그니스] 첫 만남!' : '[이그니스] 화산섬 방문');
  spawnFloat(isFirst ? '🌋 이그니스 해금!' : '🌋 이그니스 방문!');

  // 버튼 텍스트를 화산섬으로 원상복구
  const closeBtn = document.getElementById('ignis-cinematic-close-btn');
  if(closeBtn){
    closeBtn.innerHTML = '🌋 화산섬 떠나기';
    closeBtn.style.borderColor = '#c05020';
    closeBtn.style.background = 'rgba(180,60,20,.25)';
    closeBtn.style.color = '#f0a060';
  }
}

function closeIgnisCinematic(){
  const el = document.getElementById('ignis-cinematic');
  el.classList.remove('show');
  // 스크롤/오버레이 잔여 방지
  document.body.style.overflow = '';
  document.body.style.position = '';
  // ignis-island-overlay도 함께 닫기
  const ov = document.getElementById('ignis-island-overlay');
  if(ov) { ov.classList.remove('show'); ov.style.display=''; }
  updateUI();
}

// ══════════════════════════════════════
//  IGNIS ISLAND SYSTEM
// ══════════════════════════════════════
const IGNIS_ISLAND_QUOTES = [
  '"화염이 재료를 정제하고, 정제된 재료가 전설을 만들지."',
  '"별빛 수지는 내가 제일 좋아하는 재료야. 향이 끝내주거든."',
  '"서두르지 마. 화덕은 천천히 달궈야 제맛이지."',
  '"용골 분말은 화산 깊은 곳에서 찾은 비법 재료야."',
  '"달빛석을 만들 때는 달이 밝은 날 더 잘 되더라고."',
  '"고급 물약 하나가 브론즈 열 개보다 가치 있어."',
  '"심연 이끼는 쉽게 구하기 힘들지만... 그게 또 매력이지."',
];
const FORGE_RECIPES_ISLAND = {
  purified:  {name:'정제 약초',    icon:'🌿✨', needHerb:{herb:5},  needCoin:{bronze:2}, days:1, out:'purified',   outN:2},
  crystal:   {name:'화염 크리스탈',icon:'💎🔥', needHerb:{rare:2},  needCoin:{silver:1}, days:2, out:'crystal',    outN:1},
  moonstone: {name:'달빛석',       icon:'🌙⚡', needHerb:{lotus:4,moss:2}, needCoin:{silver:1}, days:2, out:'moonstone', outN:1},
  dragonbone:{name:'용골 분말',    icon:'🦴🔥', needHerb:{resin:3,shroom:3}, needCoin:{silver:2}, days:2, out:'dragonbone',outN:1},
  voidmoss:  {name:'심연 이끼',    icon:'🌑🍄', needHerb:{moss:5,shroom:3},  needCoin:{silver:2}, days:3, out:'voidmoss',  outN:1},
  starresin: {name:'별빛 수지',    icon:'⭐🌳', needHerb:{resin:4,rare:1},   needCoin:{silver:3}, days:3, out:'starresin', outN:1},
};

function showIgnisMeetOverlay(isFirst, rewardMsg){
  // 시네마틱 버전으로 교체
  showIgnisCinematic(isFirst, rewardMsg);
  // 기존 오버레이는 사용 안 함
  return;
  const overlay = document.getElementById('ignis-island-overlay');
  const title   = document.getElementById('ignis-island-title');
  const story   = document.getElementById('ignis-island-story');
  const forgeSection = document.getElementById('ignis-forge-section');
  const rewardDiv    = document.getElementById('ignis-reward-div');

  if(rewardMsg) rewardDiv.innerHTML = `<div style="font-size:.82rem;color:#f0c080;margin-bottom:8px">📦 수확: ${rewardMsg}</div>`;
  else rewardDiv.innerHTML='';

  if(isFirst){
    title.textContent = '🌋 이그니스와의 첫 만남';
    story.innerHTML = `
      <p>Aero-Mortar가 용암이 흐르는 섬 위에 내려앉았습니다.</p>
      <p>섬 중앙의 대장간에서 망치 소리가 멈추고, 거대한 체구의 검은 고양이가 천천히 돌아섰습니다.</p>
      <p style="margin-top:8px;padding:8px 10px;background:rgba(255,144,64,.1);border-radius:6px;border-left:3px solid #ff9040;font-style:italic">
        "...오랜만에 손님이군. Baba, 그 모르타르는 여전히 잘 날아다니는 모양이야."
      </p>
      <p>이그니스. 화산섬의 장인묘. 용암 속에서도 눈썹 하나 까딱 않는 그가 집게를 내려놓으며 말했습니다.</p>
      <p style="margin-top:8px;padding:8px 10px;background:rgba(255,144,64,.1);border-radius:6px;border-left:3px solid #ff9040;font-style:italic">
        "재료 가져와. 내가 정제해줄게. 대신 — 잘 골라서 가져와라. 나는 시간 낭비를 싫어하거든."
      </p>
      <p>제련소가 열렸습니다. 이제 이그니스에게 재료를 맡길 수 있어요.</p>
    `;
  } else {
    const quote = IGNIS_ISLAND_QUOTES[G.day % IGNIS_ISLAND_QUOTES.length];
    title.textContent = '🌋 이그니스의 화산 대장간';
    story.innerHTML = `
      <p>섬에 내려서자 이그니스가 집게를 들고 화덕 앞에 서 있습니다.</p>
      <p style="margin-top:8px;padding:8px 10px;background:rgba(255,144,64,.1);border-radius:6px;border-left:3px solid #ff9040;font-style:italic">
        ${quote}
      </p>
    `;
  }

  // 제련 의뢰 UI 렌더링
  renderIgnisForgeUI(forgeSection);
  overlay.classList.add('show');
  log(isFirst ? '[이그니스] 첫 만남! 제련소가 해금됐습니다.' : '[이그니스] 화산섬 방문');
  spawnFloat(isFirst ? '🌋 이그니스 해금!' : '🌋 이그니스 방문!');
}

function renderIgnisForgeUI(container){
  if(!container) return;
  let html = `
    
  `;
  // Active queue
  if(G.forgeQueue && G.forgeQueue.length > 0){
    html += `<div style="margin-bottom:10px">`;
    G.forgeQueue.forEach((job,idx)=>{
      const R = FORGE_RECIPES_ISLAND[job.recipe];
      const remain = job.endDay - G.day;
      const done = remain <= 0;
      html += `<div style="display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:7px;background:#2a1208;border:1px solid ${done?'#ff9040':'#4a2010'};margin-bottom:5px">
        <span style="font-size:1.2rem">${R?R.icon:'🔥'}</span>
        <div style="flex:1;font-size:.78rem;color:#f0c080">${R?R.name:'?'}</div>
        <div style="font-size:.72rem;color:${done?'#ff9040':'#805030'}">${done?'✅ 완성!':remain+'일 후'}</div>
        ${done?`<button onclick="collectForge(${idx})" style="padding:3px 8px;border-radius:5px;border:1px solid #ff9040;background:rgba(255,144,64,.15);color:#ff9040;font-size:.7rem;cursor:pointer">수령</button>`:''}
      </div>`;
    });
    html += `</div>`;
  }
  // Recipe list
  html += `<div style="display:flex;flex-direction:column;gap:6px">`;
  const queueFull = (G.forgeQueue||[]).length >= 2;
  Object.entries(FORGE_RECIPES_ISLAND).forEach(([id,R])=>{
    const herbOk = Object.entries(R.needHerb||{}).every(([k,v])=>(G.herbs[k]||0)>=v);
    const coinOk = Object.entries(R.needCoin||{}).every(([k,v])=>(G.coins[k]||0)>=v);
    const canDo = !queueFull && herbOk && coinOk;
    const needStr = [
      ...Object.entries(R.needHerb||{}).map(([k,v])=>`${iN(k)}×${v}`),
      ...Object.entries(R.needCoin||{}).map(([k,v])=>`${k==='bronze'?'🪙':k==='silver'?'🔘':'⭐'}${v}`)
    ].join(' + ');
    html += `<div onclick="${canDo?`islandForge('${id}')`:'null'}"
      style="display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:8px;
      border:1.5px solid ${canDo?'#5a2010':'#2a1008'};background:#200e06;
      cursor:${canDo?'pointer':'default'};opacity:${canDo?1:.38};transition:all .2s;position:relative;overflow:hidden">
      <span style="font-size:1.3rem">${R.icon}</span>
      <div style="flex:1">
        <div style="font-size:.85rem;font-weight:700;color:#f0d090">${R.name}</div>
        <div style="font-size:.65rem;color:#a07040;margin-top:2px">${needStr}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:.78rem;color:#ff9040">${R.icon} ×${R.outN}</div>
        <div style="font-size:.62rem;color:#805030">⏳${R.days}일</div>
      </div>
    </div>`;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function islandForge(id){
  if(!G.forgeQueue) G.forgeQueue=[];
  if(G.forgeQueue.length>=2){ spawnFloat('화덕 가득!'); return; }
  const R = FORGE_RECIPES_ISLAND[id];
  for(const[k,v] of Object.entries(R.needHerb||{})){
    if((G.herbs[k]||0)<v){ spawnFloat(`${iN(k)} 부족!`); return; }
  }
  for(const[k,v] of Object.entries(R.needCoin||{})){
    if((G.coins[k]||0)<v){ spawnFloat('코인 부족!'); return; }
  }
  for(const[k,v] of Object.entries(R.needHerb||{})) G.herbs[k]-=v;
  for(const[k,v] of Object.entries(R.needCoin||{})) G.coins[k]-=v;
  G.forgeQueue.push({recipe:id, endDay:G.day+R.days, startDay:G.day});
  spawnFloat(`⚒️ ${R.name} 의뢰!`);
  log(`[이그니스] ${R.name} 제련 의뢰 → ${R.days}일 후 완성`);
  updateUI();
  // re-render forge UI in both overlays
  renderIgnisForgeUI(document.getElementById('ignis-forge-section'));
  renderIgnisForge();
}

function collectForge(idx){
  if(!G.forgeQueue) return;
  const job = G.forgeQueue[idx];
  if(!job || G.day < job.endDay) return;
  const R = FORGE_RECIPES_ISLAND[job.recipe];
  if(!G.refined) G.refined={};
  G.refined[R.out]=(G.refined[R.out]||0)+R.outN;
  G.forgeQueue.splice(idx,1);
  spawnFloat(`${R.icon} ${R.name} 수령!`);
  log(`[이그니스] ${R.name} ×${R.outN} 수령 완료!`);
  updateUI();
  renderIgnisForgeUI(document.getElementById('ignis-forge-section'));
  renderIgnisForge();
}

function showExpeditionReturn(opt){
  // 기존 오버레이 제거
  const old = document.getElementById('expedition-return-overlay');
  if(old) old.remove();

  const div = document.createElement('div');
  div.id = 'expedition-return-overlay';
  div.style.cssText = `position:fixed;inset:0;z-index:250;background:${opt.bgColor};
    display:flex;flex-direction:column;overflow-y:auto;padding:20px;
    font-family:'Nanum Myeongjo',serif;`;

  // 날씨/특수 이벤트 미리 적용
  let weatherHTML = '';
  if(opt.weatherEvent){
    opt.weatherEvent.effect();
    weatherHTML = `<div style="padding:10px 14px;border-radius:9px;background:rgba(255,255,255,.05);
      border:1px solid ${opt.borderColor};margin-bottom:12px;font-size:.82rem;color:${opt.color}">
      <span style="font-size:1.3rem">${opt.weatherEvent.icon}</span>
      <b style="font-family:Cinzel,serif"> ${opt.weatherEvent.name}</b><br>
      <span style="color:rgba(255,255,255,.7);font-size:.78rem">${opt.weatherEvent.desc}</span>
    </div>`;
  }

  // 수확물
  const rewardHTML = opt.rewards
    ? `<div style="padding:10px 14px;border-radius:9px;background:rgba(255,255,255,.06);
        border:1px solid ${opt.borderColor};margin-bottom:12px;font-size:.82rem;color:#f0e0a0">
        📦 수확: ${opt.rewards}
      </div>`
    : '';

  div.innerHTML = `
    <div style="text-align:center;padding:16px 0 10px">
      <div style="font-size:2.5rem;margin-bottom:6px">${opt.title.split(' ')[0]}</div>
      <div style="font-family:Cinzel,serif;font-size:1.05rem;color:${opt.color}">${opt.title.replace(/^.\S+\s/,'')}</div>
    </div>
    <div style="padding:12px 0;margin-bottom:12px;border-top:1px solid ${opt.borderColor};border-bottom:1px solid ${opt.borderColor}">
      ${opt.story.map(s=>`<p style="font-size:.83rem;color:rgba(255,255,255,.75);line-height:1.7;margin-bottom:6px;font-style:italic">${s}</p>`).join('')}
    </div>
    ${rewardHTML}
    ${weatherHTML}
    <div id="exp-return-mob-area"></div>
    <button id="exp-return-btn" onclick="closeExpeditionReturn(${opt.mob?`'${opt.mob}','${opt.zone}'`:'null,null'})"
      style="width:100%;padding:13px;border-radius:10px;border:1.5px solid ${opt.borderColor};
      background:rgba(255,255,255,.08);color:${opt.color};font-family:'Nanum Myeongjo',serif;
      font-size:.95rem;cursor:pointer;margin-top:8px">
      ${opt.mob ? `⚔️ 전투 준비 — ${BATTLE_MOBS[opt.mob]?.name||'적'} 출현!` : '🏠 정원으로 돌아가기'}
    </button>
  `;
  document.body.appendChild(div);
}

function closeExpeditionReturn(mobId, zone){
  const ov = document.getElementById('expedition-return-overlay');
  if(ov) ov.remove();
  if(mobId && BATTLE_MOBS[mobId]){
    setTimeout(()=>startBattle2(mobId, zone), 400);
  }
  updateUI();
}

function closeIgnisIsland(){
  document.getElementById('ignis-island-overlay').classList.remove('show');
}

// 고급 연금술 (정제 재료 사용) - 연금술 탭에 추가
const ADV_RECIPES_ISLAND = {
  ignisfire: {name:'이그니스의 불꽃 물약', icon:'🔥', need:{purified:1,crystal:1},   nyangVal:150},
  moonblaze: {name:'달불꽃 정수',          icon:'🌙', need:{moonstone:1,purified:2},  nyangVal:180},
  dragonbrew:{name:'용골 강화약',          icon:'🦴', need:{dragonbone:1,voidmoss:1}, nyangVal:200},
  stardust:  {name:'별빛 만능약 ✨',       icon:'🌟', need:{starresin:1,crystal:1,moonstone:1}, nyangVal:500},
};

function advCraftIsland(id){
  if(!G.refined) G.refined={};
  const R = ADV_RECIPES_ISLAND[id];
  for(const[k,v] of Object.entries(R.need)){
    if((G.refined[k]||0)<v){ showResult(`❌ ${k} 부족!`, true); return; }
  }
  for(const[k,v] of Object.entries(R.need)) G.refined[k]-=v;
  let ny=R.nyangVal;
  const g=Math.floor(ny/100);ny-=g*100;G.coins.golden+=g;
  const s=Math.floor(ny/10);ny-=s*10;G.coins.silver+=s;
  G.coins.bronze+=ny;
  G.potions++;G.stats.totalCraft++;checkTitleUpgrade();
  showResult(`✨ ${R.name} 완성! +${R.nyangVal}₦`);
  spawnFloat(`🔥 +${R.nyangVal}₦`);
  log(`[고급연금술] ${R.name} → +${R.nyangVal}₦`);
  updateUI();
}

// ══════════════════════════════════════
//  CRYSTAL MINE SYSTEM
// ══════════════════════════════════════
const MINE_TIPS = [
  '얕은 광맥부터 시작해서 깊은 곳으로 내려가세요.',
  '비 오는 날엔 지하수로 크리스탈이 더 빛난다고요.',
  '스타더스트는 별이 쏟아지는 밤에만 나와요.',
  '사파이어와 에메랄드를 조합하면 특별한 약이 돼요.',
  '루비는 희귀하지만 에메랄드와 함께면 강력해요.',
];
const MINE_ZONES = {
  shallow:{name:'얕은 광맥', cost:1, unlockDay:0,
    drops:[{item:'sapphire',min:1,max:3},{item:'amethyst',min:0,max:2}]},
  deep:   {name:'깊은 광맥', cost:2, unlockDay:5,
    drops:[{item:'emerald',min:1,max:2},{item:'ruby',min:0,max:1}]},
  star:   {name:'별빛 심층부',cost:3, unlockDay:10,
    drops:[{item:'mooncrys',min:0,max:1},{item:'stardust',min:0,max:1,rate:.3}]},
};
const CRYS_RECIPES = {
  'sapphire-pot':{name:'사파이어 물약',  need:{sapphire:3},  needHerb:{herb:2},    nyangVal:150},
  'amethyst-pot':{name:'자수정 정수',    need:{amethyst:2},  needHerb:{lotus:2},   nyangVal:200},
  'emerald-pot': {name:'에메랄드 생명수',need:{emerald:2,ruby:1}, needHerb:{},     nyangVal:350},
  'stardust-pot':{name:'스타더스트 초월약',need:{stardust:1,mooncrys:2,ruby:1},needHerb:{}, nyangVal:800},
};
const CRYS_NAMES={sapphire:'사파이어',amethyst:'자수정',emerald:'에메랄드',ruby:'루비',mooncrys:'문스톤',stardust:'스타더스트'};

function renderMinePage(){
  const unlocked = G.ignisUnlocked;
  document.getElementById('mine-locked-view').style.display = unlocked?'none':'block';
  document.getElementById('mine-unlocked-view').style.display = unlocked?'block':'none';
  if(!unlocked) return;
  // tips
  const tip = document.getElementById('mine-tip');
  if(tip) tip.textContent = MINE_TIPS[G.day % MINE_TIPS.length];
  // zone locks
  const deep = document.getElementById('mz-deep');
  const star = document.getElementById('mz-star');
  if(deep) deep.classList.toggle('locked', G.day < 5);
  if(star) star.classList.toggle('locked', G.day < 10);
  updateMineUI();
}

function mineZone(id){
  if(!G.ignisUnlocked){ mineMsg('🔒 광산은 이그니스 화산섬 방문 후 해금됩니다. Aero-Mortar로 화산섬을 방문하세요!'); return; }
  const Z = MINE_ZONES[id];
  if(G.day < Z.unlockDay){ mineMsg(`Day ${Z.unlockDay} 이후 해금됩니다!`); return; }
  if(G.energy < Z.cost){ mineMsg(`⚡ Activity ${Z.cost} 필요!`); showResult(`⚡ Activity 부족!`, true); return; }
  G.energy -= Z.cost;
  // 전투 트리거 체크
  if(tryTriggerBattle('mine'))return;
  let results = [];
  Z.drops.forEach(d => {
    const n = d.rate ? (Math.random()<d.rate?1:0) : Math.floor(Math.random()*(d.max-d.min+1))+d.min;
    if(n > 0){
      G.crystals[d.item] = (G.crystals[d.item]||0) + n;
      if(typeof trackCrystalMined==='function') trackCrystalMined(d.item, n);
      results.push(`${crystalIcon(d.item)}×${n}`);
    }
  });
  const msg = results.length ? results.join(' ') + ' 채굴!' : '이번엔 아무것도 없었습니다...';
  mineMsg('⛏️ ' + msg);
  spawnFloat('⛏️ ' + (results[0]||'빈 광맥'));
  log(`[광산] ${Z.name}: ${msg}`);
  updateUI();
  updateMineUI();
  updateCrysCraftUI();
}

function crystalCraft(id){
  if(!G.ignisUnlocked){ mineMsg('🔒 제련소 해금 후 이용 가능합니다.'); return; }
  const R = CRYS_RECIPES[id];
  for(const[k,v] of Object.entries(R.need)){
    if((G.crystals[k]||0)<v){ mineMsg(`❌ ${CRYS_NAMES[k]||k} ${v}개 부족!`); return; }
  }
  for(const[k,v] of Object.entries(R.needHerb||{})){
    if((G.herbs[k]||0)<v){ mineMsg(`❌ ${iN(k)} ${v}개 부족!`); return; }
  }
  for(const[k,v] of Object.entries(R.need)) G.crystals[k] -= v;
  for(const[k,v] of Object.entries(R.needHerb||{})) G.herbs[k] -= v;
  // distribute nyang as bronze/silver/golden
  let ny = R.nyangVal;
  const g = Math.floor(ny/100); ny -= g*100; G.coins.golden += g;
  const s = Math.floor(ny/10);  ny -= s*10;  G.coins.silver  += s;
  G.coins.bronze += ny;
  G.potions++; G.stats.totalCraft++;
  if(!G.potionInv) G.potionInv={healing:0,moon:0,forest:0,dream:0,legendary:0};
  G.potionInv[id]=(G.potionInv[id]||0)+1;
  mineMsg(`✨ ${R.name} 완성! +${R.nyangVal}₦`);
  spawnFloat(`💎 +${R.nyangVal}₦`);
  log(`[광산] ${R.name} 완성 → +${R.nyangVal}₦`);
  updateUI(); updateMineUI(); updateCrysCraftUI();
}

function updateMineUI(){
  const keys=['sapphire','amethyst','emerald','ruby','mooncrys','stardust'];
  keys.forEach(k=>{ const el=document.getElementById('ci-'+k); if(el) el.textContent=G.crystals[k]||0; });
}
function updateCrysCraftUI(){
  Object.entries(CRYS_RECIPES).forEach(([id,R])=>{
    const el=document.getElementById('ccr-'+id);
    if(!el) return;
    const crystOk=Object.entries(R.need).every(([k,v])=>(G.crystals[k]||0)>=v);
    const herbOk=Object.entries(R.needHerb||{}).every(([k,v])=>(G.herbs[k]||0)>=v);
    el.classList.toggle('disabled',!crystOk||!herbOk);
  });
}
function crystalIcon(k){return{sapphire:'🔵',amethyst:'🟣',emerald:'🟢',ruby:'🔴',mooncrys:'⚪',stardust:'🌟'}[k]||'💎';}
function mineMsg(msg){ const el=document.getElementById('mine-msg'); if(el){el.textContent=msg;setTimeout(()=>{el.textContent='바닥에서 크리스탈이 반짝입니다. 조심히 채굴하세요.';},3000);} log('[광산] '+msg); }

// ══════════════════════════════════════
//  AERO-MORTAR SYSTEM
// ══════════════════════════════════════
const AERO_DESTS = [
  {id:'volcano', name:'이그니스의 화산섬', icon:'🌋',
   desc:'이그니스가 사는 화산섬. 제련 의뢰가 가능합니다.',
   days:1, cost:{bronze:8}, unlockDay:3,
   reward:()=>({ruby:1+Math.floor(Math.random()*2), resin:2+Math.floor(Math.random()*2), stardust:Math.random()<.3?1:0}),
   isIgnisIsland:true},
  {id:'harvest', name:'Harvest Village', icon:'🏘️',
   desc:'약초사들의 교역 마을. 방어구와 특산품을 구매할 수 있습니다.',
   days:1, cost:{bronze:5}, unlockDay:5,
   isVillage:true,
   reward:()=>({})},
  {id:'deepforest', name:'깊은 숲', icon:'🌲',
   desc:'아무도 모르는 고대의 숲. 수지와 버섯이 넘칩니다.',
   days:2, cost:{bronze:3}, unlockDay:7,
   reward:()=>({resin:4+Math.floor(Math.random()*4), shroom:3+Math.floor(Math.random()*3)})},
  {id:'northmtn', name:'북쪽 설산', icon:'🏔️',
   desc:'눈 덮인 설산. 크리스탈과 희귀 광물이 있습니다.',
   days:4, cost:{bronze:8}, unlockDay:10,
   reward:()=>({sapphire:2+Math.floor(Math.random()*2), mooncrys:1+Math.floor(Math.random()*2), rare:1})},
];

function openAero(){
  const overlay = document.getElementById('aero-overlay');
  overlay.classList.add('show');
  const list = document.getElementById('aero-dest-list');
  const status = document.getElementById('aero-status');
  if(G.aeroMission){
    list.innerHTML='';
    status.style.display='block';
    const remain = G.aeroMission.endDay - G.day;
    const isVolcanoMission = G.aeroMission.isIgnisIsland;
    const isVillageMission = G.aeroMission.isVillage;
    status.innerHTML=isVolcanoMission
      ? `🌋 <b>${G.aeroMission.name}</b> 비행 중!<br>🔥 용암 연기를 따라 날아가고 있어요...<br>🌙 <b>오늘 하루마감</b>하면 이그니스를 만납니다!`
      : isVillageMission
      ? `🏘️ <b>${G.aeroMission.name}</b> 비행 중!<br>🌿 초록 들판이 보이기 시작해요...<br>🌙 <b>오늘 하루마감</b>하면 마을에 도착합니다!`
      : `✈️ <b>${G.aeroMission.name}</b> 원정 중!<br>📅 귀환까지 ${remain>0?remain+'일':'오늘 마감 후 귀환'}<br>🌸 분홍 연기를 따라 날아가고 있어요...`;
    return;
  }
  status.style.display='none';
  list.innerHTML='';
  AERO_DESTS.forEach(d=>{
    const locked = (d.unlockDay||0) > G.day;
    const canAfford = !locked && Object.entries(d.cost).every(([k,v])=>(G.coins[k]||0)>=v);
    const costStr = Object.entries(d.cost).map(([k,v])=>`${k==='bronze'?'🪙':k==='silver'?'🔘':'⭐'}${v}`).join('');
    const btn = document.createElement('button');
    btn.className='aero-dest-btn'+(!canAfford?' disabled':'');
    const lockNote = locked
      ? `<div style="font-size:.62rem;color:#cc8844;margin-top:3px">🔒 Day ${d.unlockDay} 해금</div>`
      : '';
    const affordNote = (!locked && !canAfford)
      ? `<div style="font-size:.62rem;color:#cc6644;margin-top:3px">냥코인 부족</div>`
      : '';
    btn.innerHTML=`<span class="ad-icon">${d.icon}</span><div class="ad-info"><div class="ad-name">${d.name}</div><div class="ad-req">${d.desc}</div>${lockNote}${affordNote}</div><div class="ad-days">${costStr}<br>${locked?'🔒':''}${d.days}일</div>`;
    btn.onclick=()=>{ if(canAfford) launchAero(d); };
    list.appendChild(btn);
  });
}

function launchAero(dest){
  // unlockDay 이중 체크 (혹시 UI 우회 방어)
  if((dest.unlockDay||0) > G.day){
    showResult(`🔒 Day ${dest.unlockDay} 이후 해금됩니다!`, true);
    return;
  }
  Object.entries(dest.cost).forEach(([k,v])=>G.coins[k]-=v);
  const isVolcano = dest.isIgnisIsland;
  closeAero();

  const isVillage = dest.isVillage;
  if(isVillage){
    spawnFloat('🏘️ Harvest Village!');
    showLaunchCinematic(false, dest.name, dest.days, ()=>{
      G.aeroMission={id:'harvest', name:'Harvest Village', icon:'🏘️', endDay:G.day+dest.days, reward:dest.reward, isVillage:true};
      log('[Aero-Mortar] Harvest Village 출발! 하루마감 후 도착');
      updateUI();
    });
    return;
  }
  if(isVolcano){
    spawnFloat('🌋 화산섬으로!');
    showLaunchCinematic(true, dest.name, dest.days, ()=>{
      // 도착! 바로 이그니스 만남
      const rewards = dest.reward();
      let rLines=[];
      Object.entries(rewards).forEach(([k,v])=>{
        if(v<=0) return;
        if(G.herbs[k]!==undefined){ addHerb(k,v); rLines.push(iN(k)+'×'+v); }
        else if(G.crystals&&G.crystals[k]!==undefined){ G.crystals[k]=(G.crystals[k]||0)+v; rLines.push(crystalIcon(k)+'×'+v); }
      });
      const msg = rLines.join(', ');
      const isFirst = !G.ignisMetFlag;
      G.ignisMetFlag = true;
      G.ignisUnlocked = true;
      // aeroMission은 이미 완료 처리
      G.aeroMission = null;
      showIgnisMeetOverlay(isFirst, msg);
      log('[화산섬] 이그니스 방문! 수확: '+msg);
    });
  } else {
    // 일반 원정: 기존처럼 며칠 후 귀환
    G.aeroMission={id:dest.id, name:dest.name, icon:dest.icon, endDay:G.day+dest.days, reward:dest.reward, isIgnisIsland:false};
    showLaunchCinematic(false, dest.name, dest.days, ()=>{
      log('[Aero-Mortar] '+dest.name+' 원정 출발! '+dest.days+'일 후 귀환');
    });
    spawnFloat('🌸✈️ 출발!');
  }
  updateUI();
}

function closeAero(){ document.getElementById('aero-overlay').classList.remove('show'); }

function checkAeroReturn(){
  if(!G.aeroMission) return;
  if(G.day >= G.aeroMission.endDay){
    const isIgnis = G.aeroMission.isIgnisIsland;
    const isVillageReturn = G.aeroMission.isVillage;
    // reward 함수가 저장/불러오기로 사라졌을 때 AERO_DESTS에서 복원
    if(typeof G.aeroMission.reward !== 'function'){
      const dest = AERO_DESTS.find(d => d.id === G.aeroMission.id);
      G.aeroMission.reward = dest ? dest.reward : ()=>({});
    }
    const rewards = G.aeroMission.reward();
    let rLines=[];
    Object.entries(rewards).forEach(([k,v])=>{
      if(v<=0) return;
      if(G.herbs[k]!==undefined){ addHerb(k,v); rLines.push(`${iN(k)}×${v}`); }
      else if(G.crystals[k]!==undefined){ G.crystals[k]=(G.crystals[k]||0)+v; rLines.push(`${crystalIcon(k)}×${v}`); }
    });
    const msg = rLines.join(', ');
    if(isIgnis){
      // 화산섬은 이미 즉시 처리됨 - 여기선 스킵
      log('[화산섬] 귀환 처리 스킵 (이미 처리됨)');
    } else if(isVillageReturn){
      // Harvest Village 도착!
      G.aeroMission=null;
      G.villageUnlocked=true;
      log('[Harvest Village] 도착!');
      spawnFloat('🏘️ 마을 도착!');
      showHarvestVillage();
      updateUI(); updateMineUI();
      return;
    } else {
      const missionId = G.aeroMission.id;
      if(missionId==='northmtn'){
        showExpeditionReturn({
          title:'🏔️ 북쪽 설산 귀환!',
          color:'#a0d0ff',
          bgColor:'rgba(10,20,40,.97)',
          borderColor:'#3a6aaa',
          story:[
            '설산의 차가운 공기가 코끝을 스칩니다.',
            'Baba는 크리스탈 광맥을 발견하고 단단히 챙겨왔습니다.',
          ],
          rewards: msg,
          weatherEvent: Math.random()<0.5 ? {
            icon:'❄️', name:'눈보라',
            desc:'귀환 중 눈보라가 몰아쳤습니다! Activity -1, 하지만 희귀 크리스탈을 발견했어요.',
            effect:()=>{ G.energy=Math.max(0,G.energy-1); if(!G.crystals)G.crystals={}; G.crystals.mooncrys=(G.crystals.mooncrys||0)+1; }
          } : null,
          mob: Math.random()<0.45 ? (Math.random()<0.5?'snow_golem':'snow_wolf') : null,
          zone:'snowfield',
        });
      } else if(missionId==='deepforest'){
        showExpeditionReturn({
          title:'🌲 깊은 숲 귀환!',
          color:'#80d080',
          bgColor:'rgba(5,15,5,.97)',
          borderColor:'#2a6a2a',
          story:[
            '고요한 숲 속, 이름 모를 버섯들이 빛을 내고 있었습니다.',
            'Baba는 수백 년 된 나무 아래에서 심연 이끼를 찾아냈습니다.',
          ],
          rewards: msg,
          weatherEvent: Math.random()<0.4 ? {
            icon:'🌑', name:'어둠 속 특수 약초 발견',
            desc:'숲 깊숙이서 달빛에만 보이는 약초를 찾았습니다!',
            effect:()=>{ addHerb('rare',1); addHerb('moss',2); }
          } : null,
          mob: Math.random()<0.4 ? (Math.random()<0.5?'forest_spirit':'forest_spider') : null,
          zone:'deepforest',
        });
      } else {
        showResult('✈️ Aero-Mortar 귀환! 라군 수문을 통해 돌아왔습니다! '+msg);
      }
      log('[Aero-Mortar] '+G.aeroMission.name+' 귀환! 수확: '+msg);
      spawnFloat('✈️ 귀환! '+(rLines[0]||''));
    }
    document.getElementById('tb-garden').textContent='!';
    document.getElementById('tb-garden').parentElement.classList.add('has-badge');
    G.aeroMission=null;
    updateUI(); updateMineUI();
  }
}

// ══════════════════════════════════════
