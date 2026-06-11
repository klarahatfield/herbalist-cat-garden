
// ══════════════════════════════════════════════
//  집 개조 시각 미리보기 (A+C 방식)
//  외부: 오두막 이미지 + 이모지 레이어 합성
//  내부: 창문 빛 힌트 + 탭으로 작업실 표시
// ══════════════════════════════════════════════
(function(){

  // ── 각 부위별 이모지와 위치 정의 ──
  var MOD_OVERLAY = {
    // 다리: 이미지 하단
    'legs-basic':   { emoji:'🦴', style:'bottom:2%;left:50%;transform:translateX(-50%);font-size:1.2rem;opacity:0.6;' },
    'legs-brass':   { emoji:'⚙️', style:'bottom:2%;left:50%;transform:translateX(-50%);font-size:1.4rem;filter:drop-shadow(0 0 4px #d4a830);' },
    'legs-crystal': { emoji:'💎', style:'bottom:2%;left:50%;transform:translateX(-50%);font-size:1.5rem;filter:drop-shadow(0 0 6px #60ddff);' },
    'legs-dragon':  { emoji:'🦕', style:'bottom:1%;left:50%;transform:translateX(-50%);font-size:1.8rem;filter:drop-shadow(0 0 8px #80ff80);' },
    // 스크래치전망대/지붕: 상단
    'roof-basic':   { emoji:'🪟', style:'top:6%;right:8%;font-size:1rem;opacity:0.7;' },
    'roof-scope':   { emoji:'🔭', style:'top:4%;right:6%;font-size:1.3rem;filter:drop-shadow(0 0 4px #a0d0ff);' },
    'roof-glass':   { emoji:'🌈', style:'top:5%;right:5%;font-size:1.4rem;filter:drop-shadow(0 0 6px rgba(255,200,100,.8));' },
    'roof-antenna': { emoji:'📡', style:'top:2%;right:8%;font-size:1.4rem;filter:drop-shadow(0 0 8px #60ddff);' },
    // 외벽: 양옆
    'wall-basic':   { emoji:'🪨', style:'top:50%;left:5%;transform:translateY(-50%);font-size:1rem;opacity:0.5;' },
    'wall-vine':    { emoji:'🌿', style:'top:40%;left:4%;font-size:1.3rem;filter:drop-shadow(0 0 4px #60a040);' },
    'wall-metal':   { emoji:'⚙️', style:'top:50%;left:4%;transform:translateY(-50%);font-size:1.2rem;filter:drop-shadow(0 0 5px #d4a830);' },
    'wall-flag':    { emoji:'🚩', style:'top:15%;left:5%;font-size:1.3rem;filter:drop-shadow(0 0 4px rgba(255,100,100,.8));' },
  };

  // 연구실 → 창문 빛 색상 힌트
  var LAB_WINDOW_COLOR = {
    'lab-basic':   'rgba(255,180,60,.3)',
    'lab-copper':  'rgba(60,200,100,.4)',
    'lab-crystal': 'rgba(100,180,255,.5)',
    'lab-gold':    'rgba(255,210,50,.6)',
  };

  // 내부 작업실 이모지 배치 (이름 → 아이콘+설명)
  var LAB_INTERIOR = {
    'lab-basic':   { icon:'🪵', desc:'기본 작업대', color:'#c8a060' },
    'lab-copper':  { icon:'🔧', desc:'구리 파이프 시스템', color:'#b87040' },
    'lab-crystal': { icon:'💎', desc:'크리스탈 분쇄기', color:'#60ddff' },
    'lab-gold':    { icon:'⭐', desc:'황금 작업대', color:'#ffd060' },
  };

  // ── 현재 장착 상태 읽기 ──
  function getEquipped() {
    var g = (typeof _G === 'function') ? _G() : null;
    if (!g || !g.houseMods) return {};
    var result = {};
    var mods = g.houseMods;
    if (typeof HOUSE_MODS === 'undefined') return {};
    Object.keys(HOUSE_MODS).forEach(function(partId) {
      HOUSE_MODS[partId].mods.forEach(function(m) {
        if (mods[m.id] === 'equipped' || (m.price === 0 && !Object.values(mods).includes('equipped'))) {
          // 장착된 것만
          if (mods[m.id] === 'equipped') result[partId] = m.id;
        }
        // 기본(price=0)은 다른 장착이 없을 때 기본값
        if (m.price === 0 && !result[partId]) {
          var anyEquipped = HOUSE_MODS[partId].mods.some(function(mm) {
            return mm.id !== m.id && mods[mm.id] === 'equipped';
          });
          if (!anyEquipped) result[partId] = m.id;
        }
      });
    });
    return result;
  }

  // ── 미리보기 삽입 (pg-house 상단) ──
  function injectPreview() {
    var pgHouse = document.getElementById('pg-house');
    if (!pgHouse) return;
    if (document.getElementById('_house-preview')) return;

    var wrap = document.createElement('div');
    wrap.id = '_house-preview';
    wrap.style.cssText = 'margin-bottom:14px;border-radius:10px;overflow:hidden;border:1.5px solid var(--gold);background:rgba(0,0,0,.15);';

    // 탭 헤더
    var tabs = document.createElement('div');
    tabs.style.cssText = 'display:flex;border-bottom:1px solid rgba(200,160,60,.3);';
    ['🏠 외부', '⚗️ 내부'].forEach(function(label, i) {
      var t = document.createElement('button');
      t.textContent = label;
      t.dataset.tab = i;
      t.style.cssText = 'flex:1;padding:7px 0;border:none;background:' + (i===0?'rgba(212,168,48,.15)':'transparent') + ';cursor:pointer;font-family:Cinzel,serif;font-size:.75rem;color:' + (i===0?'var(--gold2)':'var(--ink2)') + ';border-bottom:2px solid ' + (i===0?'var(--gold)':'transparent') + ';transition:all .2s;';
      t.onclick = function() {
        document.querySelectorAll('#_house-preview [data-tab]').forEach(function(btn) {
          btn.style.background = 'transparent';
          btn.style.color = 'var(--ink2)';
          btn.style.borderBottom = '2px solid transparent';
        });
        t.style.background = 'rgba(212,168,48,.15)';
        t.style.color = 'var(--gold2)';
        t.style.borderBottom = '2px solid var(--gold)';
        document.getElementById('_house-ext').style.display = this.dataset.tab === '0' ? 'block' : 'none';
        document.getElementById('_house-int').style.display = this.dataset.tab === '1' ? 'block' : 'none';
      };
      tabs.appendChild(t);
    });
    wrap.appendChild(tabs);

    // 외부 뷰
    var ext = document.createElement('div');
    ext.id = '_house-ext';
    ext.style.cssText = 'position:relative;height:420px;overflow:hidden;';
    // 이미지는 렌더 시 채움
    var img = document.createElement('img');
    img.id = '_house-img';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    ext.appendChild(img);
    // 오버레이 컨테이너
    var overlayWrap = document.createElement('div');
    overlayWrap.id = '_house-overlay-wrap';
    overlayWrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
    ext.appendChild(overlayWrap);
    // 창문 빛 힌트 레이어
    var winLight = document.createElement('div');
    winLight.id = '_house-win-light';
    winLight.style.cssText = 'position:absolute;width:18%;height:20%;top:28%;right:12%;border-radius:4px;transition:background 1s ease;';
    ext.appendChild(winLight);
    wrap.appendChild(ext);

    // 내부 뷰
    var interior = document.createElement('div');
    interior.id = '_house-int';
    interior.style.cssText = 'display:none;padding:12px 14px;min-height:90px;';
    wrap.appendChild(interior);

    // house-baba-reaction 앞에 삽입
    var babaEl = document.getElementById('house-baba-reaction');
    if (babaEl) {
      pgHouse.insertBefore(wrap, babaEl);
    } else {
      var secEl = document.getElementById('house-sections');
      if (secEl) pgHouse.insertBefore(wrap, secEl);
    }
  }

  // ── 미리보기 렌더링 ──
  function renderPreview() {
    var ext = document.getElementById('_house-ext');
    var img = document.getElementById('_house-img');
    var overlayWrap = document.getElementById('_house-overlay-wrap');
    var winLight = document.getElementById('_house-win-light');
    var interior = document.getElementById('_house-int');
    if (!ext || !img) return;

    var g = (typeof _G === 'function') ? _G() : null;
    var isNight = g && g.isNight;
    var equipped = getEquipped();

    // 오두막 이미지 (낮/밤)
   var imgSrc = 'image/house/walkinghouse.png';
    img.src = imgSrc;

    // 오버레이 이모지 레이어
    overlayWrap.innerHTML = '';
    Object.keys(equipped).forEach(function(partId) {
      if (partId === 'lab') return; // 내부는 별도
      var modId = equipped[partId];
      var ov = MOD_OVERLAY[modId];
      if (!ov) return;
      var el = document.createElement('div');
      el.style.cssText = 'position:absolute;' + ov.style;
      el.textContent = ov.emoji;
      overlayWrap.appendChild(el);
    });

    // 창문 빛 (연구실 힌트)
    var labId = equipped['lab'] || 'lab-basic';
    var wc = LAB_WINDOW_COLOR[labId] || 'rgba(255,180,60,.3)';
    winLight.style.background = wc;

    // 내부 뷰
    var labInfo = LAB_INTERIOR[labId] || LAB_INTERIOR['lab-basic'];
    interior.innerHTML =
      '<div style="font-family:Cinzel,serif;font-size:.72rem;color:var(--gold2);margin-bottom:8px;">⚗️ 연구실 내부</div>'
      + '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.04);border:1px solid rgba(200,160,60,.2);">'
      + '<span style="font-size:2rem;filter:drop-shadow(0 0 6px ' + labInfo.color + ');">' + labInfo.icon + '</span>'
      + '<div>'
      + '<div style="font-size:.82rem;font-weight:700;color:var(--ink);">' + labInfo.desc + '</div>'
      + '<div style="font-size:.68rem;color:' + labInfo.color + ';margin-top:2px;">장착 중</div>'
      + '</div></div>';
  }

  // ── 구매/장착 후 갱신 연동 ──
  window.addEventListener('load', function() {
    // renderHouseTab 래핑
    var origRender = window.renderHouseTab;
    if (origRender) {
      window.renderHouseTab = function() {
        origRender();
        injectPreview();
        renderPreview();
      };
    }
    // pg-house 탭 클릭 시 초기화
    var houseTab = document.getElementById('tab-house');
    if (!houseTab) {
      // 탭 버튼 찾기
      document.querySelectorAll('[onclick]').forEach(function(el) {
        if (el.getAttribute('onclick') && el.getAttribute('onclick').includes("'house'")) {
          el.addEventListener('click', function() {
            setTimeout(function() { injectPreview(); renderPreview(); }, 80);
          });
        }
      });
    }
    // updateUI 래핑으로 야간/낮 전환 시 이미지 갱신
    var origUI = window.updateUI;
    if (origUI) {
      window.updateUI = function() {
        origUI();
        var ext = document.getElementById('_house-ext');
        if (ext && ext.offsetParent) renderPreview();
      };
    }
  });
})();



// ══════════════════════════════════════════════
//  집 개조 시각 미리보기 (A+C 방식)
//  외부: 오두막 이미지 + 이모지 레이어 합성
//  내부: 창문 빛 힌트 + 탭으로 작업실 표시
// ══════════════════════════════════════════════
(function(){

  // ── 각 부위별 이모지와 위치 정의 ──
  var MOD_OVERLAY = {
    // 다리: 이미지 하단
    'legs-basic':   { emoji:'🦴', style:'bottom:2%;left:50%;transform:translateX(-50%);font-size:1.2rem;opacity:0.6;' },
    'legs-brass':   { emoji:'⚙️', style:'bottom:2%;left:50%;transform:translateX(-50%);font-size:1.4rem;filter:drop-shadow(0 0 4px #d4a830);' },
    'legs-crystal': { emoji:'💎', style:'bottom:2%;left:50%;transform:translateX(-50%);font-size:1.5rem;filter:drop-shadow(0 0 6px #60ddff);' },
    'legs-dragon':  { emoji:'🦕', style:'bottom:1%;left:50%;transform:translateX(-50%);font-size:1.8rem;filter:drop-shadow(0 0 8px #80ff80);' },
    // 스크래치전망대/지붕: 상단
    'roof-basic':   { emoji:'🪟', style:'top:6%;right:8%;font-size:1rem;opacity:0.7;' },
    'roof-scope':   { emoji:'🔭', style:'top:4%;right:6%;font-size:1.3rem;filter:drop-shadow(0 0 4px #a0d0ff);' },
    'roof-glass':   { emoji:'🌈', style:'top:5%;right:5%;font-size:1.4rem;filter:drop-shadow(0 0 6px rgba(255,200,100,.8));' },
    'roof-antenna': { emoji:'📡', style:'top:2%;right:8%;font-size:1.4rem;filter:drop-shadow(0 0 8px #60ddff);' },
    // 외벽: 양옆
    'wall-basic':   { emoji:'🪨', style:'top:50%;left:5%;transform:translateY(-50%);font-size:1rem;opacity:0.5;' },
    'wall-vine':    { emoji:'🌿', style:'top:40%;left:4%;font-size:1.3rem;filter:drop-shadow(0 0 4px #60a040);' },
    'wall-metal':   { emoji:'⚙️', style:'top:50%;left:4%;transform:translateY(-50%);font-size:1.2rem;filter:drop-shadow(0 0 5px #d4a830);' },
    'wall-flag':    { emoji:'🚩', style:'top:15%;left:5%;font-size:1.3rem;filter:drop-shadow(0 0 4px rgba(255,100,100,.8));' },
  };

  // 연구실 → 창문 빛 색상 힌트
  var LAB_WINDOW_COLOR = {
    'lab-basic':   'rgba(255,180,60,.3)',
    'lab-copper':  'rgba(60,200,100,.4)',
    'lab-crystal': 'rgba(100,180,255,.5)',
    'lab-gold':    'rgba(255,210,50,.6)',
  };

  // 내부 작업실 이모지 배치 (이름 → 아이콘+설명)
  var LAB_INTERIOR = {
    'lab-basic':   { icon:'🪵', desc:'기본 작업대', color:'#c8a060' },
    'lab-copper':  { icon:'🔧', desc:'구리 파이프 시스템', color:'#b87040' },
    'lab-crystal': { icon:'💎', desc:'크리스탈 분쇄기', color:'#60ddff' },
    'lab-gold':    { icon:'⭐', desc:'황금 작업대', color:'#ffd060' },
  };

  // ── 현재 장착 상태 읽기 ──
  function getEquipped() {
    var g = (typeof _G === 'function') ? _G() : null;
    if (!g || !g.houseMods) return {};
    var result = {};
    var mods = g.houseMods;
    if (typeof HOUSE_MODS === 'undefined') return {};
    Object.keys(HOUSE_MODS).forEach(function(partId) {
      HOUSE_MODS[partId].mods.forEach(function(m) {
        if (mods[m.id] === 'equipped' || (m.price === 0 && !Object.values(mods).includes('equipped'))) {
          // 장착된 것만
          if (mods[m.id] === 'equipped') result[partId] = m.id;
        }
        // 기본(price=0)은 다른 장착이 없을 때 기본값
        if (m.price === 0 && !result[partId]) {
          var anyEquipped = HOUSE_MODS[partId].mods.some(function(mm) {
            return mm.id !== m.id && mods[mm.id] === 'equipped';
          });
          if (!anyEquipped) result[partId] = m.id;
        }
      });
    });
    return result;
  }

  // ── 미리보기 삽입 (pg-house 상단) ──
  function injectPreview() {
    var pgHouse = document.getElementById('pg-house');
    if (!pgHouse) return;
    if (document.getElementById('_house-preview')) return;

    var wrap = document.createElement('div');
    wrap.id = '_house-preview';
    wrap.style.cssText = 'margin-bottom:14px;border-radius:10px;overflow:hidden;border:1.5px solid var(--gold);background:rgba(0,0,0,.15);';

    // 탭 헤더
    var tabs = document.createElement('div');
    tabs.style.cssText = 'display:flex;border-bottom:1px solid rgba(200,160,60,.3);';
    ['🏠 외부', '⚗️ 내부'].forEach(function(label, i) {
      var t = document.createElement('button');
      t.textContent = label;
      t.dataset.tab = i;
      t.style.cssText = 'flex:1;padding:7px 0;border:none;background:' + (i===0?'rgba(212,168,48,.15)':'transparent') + ';cursor:pointer;font-family:Cinzel,serif;font-size:.75rem;color:' + (i===0?'var(--gold2)':'var(--ink2)') + ';border-bottom:2px solid ' + (i===0?'var(--gold)':'transparent') + ';transition:all .2s;';
      t.onclick = function() {
        document.querySelectorAll('#_house-preview [data-tab]').forEach(function(btn) {
          btn.style.background = 'transparent';
          btn.style.color = 'var(--ink2)';
          btn.style.borderBottom = '2px solid transparent';
        });
        t.style.background = 'rgba(212,168,48,.15)';
        t.style.color = 'var(--gold2)';
        t.style.borderBottom = '2px solid var(--gold)';
        document.getElementById('_house-ext').style.display = this.dataset.tab === '0' ? 'block' : 'none';
        document.getElementById('_house-int').style.display = this.dataset.tab === '1' ? 'block' : 'none';
      };
      tabs.appendChild(t);
    });
    wrap.appendChild(tabs);

    // 외부 뷰
    var ext = document.createElement('div');
    ext.id = '_house-ext';
    ext.style.cssText = 'position:relative;height:420px;overflow:hidden;';
    // 이미지는 렌더 시 채움
    var img = document.createElement('img');
    img.id = '_house-img';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    ext.appendChild(img);
    // 오버레이 컨테이너
    var overlayWrap = document.createElement('div');
    overlayWrap.id = '_house-overlay-wrap';
    overlayWrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
    ext.appendChild(overlayWrap);
    // 창문 빛 힌트 레이어
    var winLight = document.createElement('div');
    winLight.id = '_house-win-light';
    winLight.style.cssText = 'position:absolute;width:18%;height:20%;top:28%;right:12%;border-radius:4px;transition:background 1s ease;';
    ext.appendChild(winLight);
    wrap.appendChild(ext);

    // 내부 뷰
    var interior = document.createElement('div');
    interior.id = '_house-int';
    interior.style.cssText = 'display:none;padding:12px 14px;min-height:90px;';
    wrap.appendChild(interior);

    // house-baba-reaction 앞에 삽입
    var babaEl = document.getElementById('house-baba-reaction');
    if (babaEl) {
      pgHouse.insertBefore(wrap, babaEl);
    } else {
      var secEl = document.getElementById('house-sections');
      if (secEl) pgHouse.insertBefore(wrap, secEl);
    }
  }

  // ── 미리보기 렌더링 ──
  function renderPreview() {
    var ext = document.getElementById('_house-ext');
    var img = document.getElementById('_house-img');
    var overlayWrap = document.getElementById('_house-overlay-wrap');
    var winLight = document.getElementById('_house-win-light');
    var interior = document.getElementById('_house-int');
    if (!ext || !img) return;

    var g = (typeof _G === 'function') ? _G() : null;
    var isNight = g && g.isNight;
    var equipped = getEquipped();

    // 오두막 이미지 (낮/밤)
    var imgSrc = 'image/house/walkinghouse.png';
img.src = imgSrc;

    // 오버레이 이모지 레이어
    overlayWrap.innerHTML = '';
    Object.keys(equipped).forEach(function(partId) {
      if (partId === 'lab') return; // 내부는 별도
      var modId = equipped[partId];
      var ov = MOD_OVERLAY[modId];
      if (!ov) return;
      var el = document.createElement('div');
      el.style.cssText = 'position:absolute;' + ov.style;
      el.textContent = ov.emoji;
      overlayWrap.appendChild(el);
    });

    // 창문 빛 (연구실 힌트)
    var labId = equipped['lab'] || 'lab-basic';
    var wc = LAB_WINDOW_COLOR[labId] || 'rgba(255,180,60,.3)';
    winLight.style.background = wc;

    // 내부 뷰
    var labInfo = LAB_INTERIOR[labId] || LAB_INTERIOR['lab-basic'];
    interior.innerHTML =
      '<div style="font-family:Cinzel,serif;font-size:.72rem;color:var(--gold2);margin-bottom:8px;">⚗️ 연구실 내부</div>'
      + '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.04);border:1px solid rgba(200,160,60,.2);">'
      + '<span style="font-size:2rem;filter:drop-shadow(0 0 6px ' + labInfo.color + ');">' + labInfo.icon + '</span>'
      + '<div>'
      + '<div style="font-size:.82rem;font-weight:700;color:var(--ink);">' + labInfo.desc + '</div>'
      + '<div style="font-size:.68rem;color:' + labInfo.color + ';margin-top:2px;">장착 중</div>'
      + '</div></div>';
  }

  // ── 구매/장착 후 갱신 연동 ──
  window.addEventListener('load', function() {
    // renderHouseTab 래핑
    var origRender = window.renderHouseTab;
    if (origRender) {
      window.renderHouseTab = function() {
        origRender();
        injectPreview();
        renderPreview();
      };
    }
    // pg-house 탭 클릭 시 초기화
    var houseTab = document.getElementById('tab-house');
    if (!houseTab) {
      // 탭 버튼 찾기
      document.querySelectorAll('[onclick]').forEach(function(el) {
        if (el.getAttribute('onclick') && el.getAttribute('onclick').includes("'house'")) {
          el.addEventListener('click', function() {
            setTimeout(function() { injectPreview(); renderPreview(); }, 80);
          });
        }
      });
    }
    // updateUI 래핑으로 야간/낮 전환 시 이미지 갱신
    var origUI = window.updateUI;
    if (origUI) {
      window.updateUI = function() {
        origUI();
        var ext = document.getElementById('_house-ext');
        if (ext && ext.offsetParent) renderPreview();
      };
    }
  });
})();
