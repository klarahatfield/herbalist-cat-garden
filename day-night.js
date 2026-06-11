
// ══════════════════════════════════════════════
//  낮밤 전환 시각 효과 — 황혼/새벽 시퀀스
// ══════════════════════════════════════════════
(function(){
  // ── 종족별 아침 메시지 ──
  var MORNING_MSG = {
    cat:   ['햇살이 수염을 간질입니다... 😺', '"5분만 더..."', '눈을 가늘게 뜨고 기지개를 폅니다.'],
    dog:   ['꼬리가 절로 흔들립니다! 🐶', '"오늘도 파이팅!"', '힘차게 앞발을 뻗으며 일어납니다!'],
    bunny: ['귀를 쫑긋, 새날이에요! 🐰', '코가 실룩실룩.', '폴짝 뛰어 침대에서 내려옵니다.'],
  };

  // ── CSS 주입 ──
  var st = document.createElement('style');
  st.textContent = `
    #_dn-ov {
      display:none; position:fixed; inset:0; z-index:19999;
      pointer-events:none; overflow:hidden;
    }
    #_dn-bg {
      position:absolute; inset:0;
      transition:background 0s;
    }
    #_dn-stars { position:absolute; inset:0; opacity:0; transition:opacity 1s ease; }
    .dn-star {
      position:absolute; border-radius:50%; background:#fff;
      animation:_dnStarTwinkle 1.5s ease-in-out infinite alternate;
    }
    @keyframes _dnStarTwinkle { from{opacity:.2} to{opacity:.9} }
    #_dn-sun {
      position:absolute; font-size:4rem;
      transition:transform 2s cubic-bezier(.2,.8,.3,1), opacity .8s ease;
    }
    #_dn-moon {
      position:absolute; font-size:3.5rem;
      transition:transform 2s cubic-bezier(.2,.8,.3,1), opacity .8s ease;
    }
    #_dn-msg {
      position:absolute; bottom:22%; left:50%; transform:translateX(-50%);
      font-family:Cinzel,serif; font-size:1rem; letter-spacing:.08em;
      white-space:nowrap; opacity:0;
      transition:opacity .5s ease;
      text-shadow:0 0 16px currentColor, 0 2px 8px rgba(0,0,0,.6);
    }
    #_dn-sub {
      position:absolute; bottom:17%; left:50%; transform:translateX(-50%);
      font-size:.78rem; letter-spacing:.04em; white-space:nowrap;
      opacity:0; transition:opacity .5s ease;
      text-shadow:0 0 10px currentColor, 0 2px 6px rgba(0,0,0,.5);
    }
  `;
  document.head.appendChild(st);

  // ── DOM 생성 ──
  var ov   = document.createElement('div'); ov.id='_dn-ov';
  var bg   = document.createElement('div'); bg.id='_dn-bg';
  var stars= document.createElement('div'); stars.id='_dn-stars';
  var sun  = document.createElement('div'); sun.id='_dn-sun';  sun.textContent='☀️';
  var moon = document.createElement('div'); moon.id='_dn-moon'; moon.textContent='🌙';
  var msg  = document.createElement('div'); msg.id='_dn-msg';
  var sub  = document.createElement('div'); sub.id='_dn-sub';
  ov.appendChild(bg); ov.appendChild(stars);
  ov.appendChild(sun); ov.appendChild(moon);
  ov.appendChild(msg); ov.appendChild(sub);
  document.body.appendChild(ov);

  // 별 생성
  for(var i=0;i<45;i++){
    var s=document.createElement('div'); s.className='dn-star';
    var sz=Math.random()*2.5+1;
    s.style.cssText='width:'+sz+'px;height:'+sz+'px;left:'+Math.random()*100+'%;top:'+Math.random()*85+'%;animation-delay:'+Math.random()*2+'s;animation-duration:'+(1+Math.random())+'s';
    stars.appendChild(s);
  }

  // ── 헬퍼 ──
  function showMsg(text, color, subText, subColor, delay){
    setTimeout(function(){
      msg.textContent=text; msg.style.color=color; msg.style.opacity='1';
      if(subText){ sub.textContent=subText; sub.style.color=subColor||color; sub.style.opacity='1'; }
    }, delay||0);
  }
  function hideMsg(delay){
    setTimeout(function(){ msg.style.opacity='0'; sub.style.opacity='0'; }, delay||0);
  }
  function setBg(color, duration){
    bg.style.transition='background '+(duration||0)+'ms ease';
    bg.style.background=color;
  }
  function setSun(bottom, right, opacity){
    sun.style.transition='none';
    sun.style.bottom=bottom; sun.style.right=right; sun.style.opacity=opacity;
  }
  function setMoon(bottom, left, opacity){
    moon.style.transition='none';
    moon.style.bottom=bottom; moon.style.left=left; moon.style.opacity=opacity;
  }
  function animateSun(bottom, right, opacity, dur){
    sun.style.transition='bottom '+dur+'ms cubic-bezier(.2,.8,.3,1), right '+dur+'ms ease, opacity 600ms ease';
    setTimeout(function(){ sun.style.bottom=bottom; sun.style.right=right; sun.style.opacity=opacity; }, 30);
  }
  function animateMoon(bottom, left, opacity, dur){
    moon.style.transition='bottom '+dur+'ms cubic-bezier(.2,.8,.3,1), left '+dur+'ms ease, opacity 600ms ease';
    setTimeout(function(){ moon.style.bottom=bottom; moon.style.left=left; moon.style.opacity=opacity; }, 30);
  }

  // ── 종족 메시지 가져오기 ──
  function getMorningMsgs(){
    var g = (typeof _G==='function') ? _G() : null;
    var type = (g && g.charType) || 'cat';
    var arr = MORNING_MSG[type] || MORNING_MSG.cat;
    return arr;
  }

  // ═══════════════════════════════════════════
  //  황혼 → 밤 애니메이션 (tonight)
  //  단계: 주황 노을 → 보라 황혼 → 깊은 밤 + 별
  // ═══════════════════════════════════════════
  function playDusk(onDone){
    ov.style.display='block';
    msg.style.opacity='0'; sub.style.opacity='0';
    stars.style.opacity='0';

    // 태양 — 화면 오른쪽 중간에서 시작
    setSun('-5%','8%','1');
    setMoon('-20%','10%','0');

    // 단계 1: 노을 (주황→분홍)
    setBg('rgba(20,10,5,0)', 0);
    setTimeout(function(){
      setBg('rgba(180,80,20,.45)', 1200);
      showMsg('🌇 황혼이 물듭니다...', '#ffaa44', '', '', 400);
      // 태양 지기
      animateSun('-30%','5%','0', 2000);
    }, 50);

    // 단계 2: 보라빛 황혼
    setTimeout(function(){
      hideMsg();
      setBg('rgba(60,20,90,.6)', 1500);
      showMsg('🌆 하늘이 보랏빛으로 물듭니다.', '#cc88ff', '', '', 600);
      // 달 떠오르기
      animateMoon('15%','12%','1', 2000);
      setTimeout(function(){ stars.style.opacity='0.5'; }, 800);
    }, 2400);

    // 단계 3: 깊은 밤
    setTimeout(function(){
      hideMsg();
      setBg('rgba(5,5,30,.78)', 1800);
      stars.style.opacity='1';
      showMsg('🌙 밤이 깊어갑니다...', '#a0b8ff', '야간 채집이 가능합니다!', '#80ddaa', 800);
    }, 4800);

    // 완료
    setTimeout(function(){
      hideMsg();
      setTimeout(function(){
        // 오버레이 페이드아웃
        bg.style.transition='background 1s ease';
        bg.style.background='rgba(0,0,0,0)';
        stars.style.opacity='0';
        moon.style.opacity='0';
        setTimeout(function(){
          ov.style.display='none';
          if(onDone) onDone();
        }, 800);
      }, 400);
    }, 6800);
  }

  // ═══════════════════════════════════════════
  //  새벽 → 일출 → 아침 애니메이션 (rest)
  //  단계: 새벽 인디고 → 분홍 여명 → 황금 일출 → 아침 + 캐릭터
  // ═══════════════════════════════════════════
  function playDawn(onDone){
    ov.style.display='block';
    msg.style.opacity='0'; sub.style.opacity='0';

    // 초기 상태 — 깊은 밤
    setBg('rgba(5,5,35,.8)', 0);
    stars.style.opacity='1';
    setMoon('20%','12%','1');
    setSun('-20%','5%','0');

    // 단계 1: 새벽빛 스며들기
    setTimeout(function(){
      setBg('rgba(30,15,70,.65)', 2000);
      showMsg('🌄 새벽빛이 스며듭니다...', '#9090dd', '', '', 500);
      stars.style.opacity='0.3';
      animateMoon('-20%','10%','0', 1800);
    }, 50);

    // 단계 2: 여명 (분홍)
    setTimeout(function(){
      hideMsg();
      setBg('rgba(160,60,80,.5)', 1800);
      showMsg('🌸 동쪽 하늘이 붉게 물듭니다.', '#ffaacc', '', '', 600);
      stars.style.opacity='0';
      // 태양 등장 준비
      setSun('-15%','8%','0.3');
    }, 3000);

    // 단계 3: 일출 (황금)
    setTimeout(function(){
      hideMsg();
      setBg('rgba(220,130,30,.4)', 2000);
      showMsg('☀️ 일출!', '#ffdd44', '황금빛 햇살이 정원을 채웁니다.', '#ffcc44', 500);
      animateSun('18%','10%','1', 2200);
    }, 5500);

    // 단계 4: 활기찬 아침 + 캐릭터 메시지
    setTimeout(function(){
      hideMsg();
      setBg('rgba(255,200,50,.15)', 1500);
      var msgs = getMorningMsgs();
      showMsg(msgs[0], '#ffaa44', msgs[1], '#cc8833', 500);
    }, 8000);

    // 완료 페이드아웃
    setTimeout(function(){
      hideMsg();
      setTimeout(function(){
        bg.style.transition='background 1s ease';
        bg.style.background='rgba(0,0,0,0)';
        sun.style.opacity='0';
        setTimeout(function(){
          ov.style.display='none';
          if(onDone) onDone();
        }, 800);
      }, 400);
    }, 10000);
  }

  // ── doAction 래핑 ──
  window.addEventListener('load', function(){
    var orig = window.doAction;
    if(!orig) return;

    window.doAction = function(type){
      if(type === 'tonight'){
        if(window._dnPlaying) return;
        window._dnPlaying = true;
        var btns = document.querySelectorAll('.act-btn');
        btns.forEach(function(b){ b.disabled=true; b.style.opacity='0.4'; b.style.cursor='auto'; });
        playDusk(function(){
          orig('tonight');
          setTimeout(function(){
            btns.forEach(function(b){ b.disabled=false; b.style.opacity=''; b.style.cursor='auto'; });
            window._dnPlaying = false;
          }, 100);
        });
        return;
      }
      if(type === 'rest'){
        if(window._dnPlaying) return;
        window._dnPlaying = true;
        var btns2 = document.querySelectorAll('.act-btn');
        btns2.forEach(function(b){ b.disabled=true; b.style.opacity='0.4'; b.style.cursor='auto'; });
        playDawn(function(){
          orig('rest');
          setTimeout(function(){
            btns2.forEach(function(b){ b.disabled=false; b.style.opacity=''; b.style.cursor='auto'; });
            window._dnPlaying = false;
          }, 300);
        });
        return;
      }
      orig(type);
    };
  });
})();