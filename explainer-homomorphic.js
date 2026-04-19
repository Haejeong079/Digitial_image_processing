var STEP = 0;
var stepDescs = [
  '사진을 찍을 때 조명이 한쪽만 밝으면, 밝은 쪽은 너무 하얗고 어두운 쪽은 너무 까매서 세부 내용이 안 보여요. 이게 바로 "조명 불균일" 문제예요. Homomorphic Filtering은 이 문제를 해결해줘요!',
  '이미지는 사실 두 가지가 곱해진 거예요. 조명(i) = 햇빛이나 전등처럼 환경에서 오는 빛, 반사율(r) = 물체 표면이 얼마나 빛을 반사하느냐. f(x,y) = i(x,y) × r(x,y). 조명은 저주파(천천히 변함), 반사율은 고주파(빠르게 변함)이에요!',
  '곱셈이면 따로 분리가 안 되죠? 그래서 log를 씌워요! ln(f) = ln(i) + ln(r). 곱셈이 덧셈으로 바뀌어서, 주파수 도메인에서 저주파(조명)와 고주파(반사율)를 따로따로 건드릴 수 있게 돼요!',
  '주파수 도메인에서 특별한 필터 H(u,v)를 적용해요. 저주파(조명)는 γL로 약하게 → 과도한 조명 억제. 고주파(반사율)는 γH로 강하게 → 물체 디테일 선명하게. γL < 1, γH > 1 이어야 해요!',
  '마지막으로 IDFT로 다시 공간 도메인으로 가져온 뒤, exp()로 log 변환을 되돌려요. 결과적으로 조명이 균일해지고 물체 디테일이 선명한 이미지가 완성돼요!'
];

/* ── 색상 팔레트 (style.css 기반) ── */
var C = {
  accent:  '#534AB7',
  accent2: '#3C3489',
  text:    '#1a1a1a',
  muted:   '#888',
  grid:    '#e0ddd5',
  bg2:     '#f7f6f2',
  red:     '#E24B4A',
  green:   '#3B6D11',
  orange:  '#C07A20'
};

function setStep(i) {
  STEP = i;
  for (var k = 0; k < 5; k++) {
    document.getElementById('sb' + k).className = 'sbtn' + (k === i ? ' on' : '');
  }
  document.getElementById('step-desc').textContent = stepDescs[i];
  drawMain();
}

function drawMain() {
  var canvas = document.getElementById('main-canvas');
  canvas.width = canvas.offsetWidth || 600;
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  /* 캔버스 배경 */
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, W, H);
  if      (STEP === 0) drawProblem(ctx, W, H);
  else if (STEP === 1) drawSeparation(ctx, W, H);
  else if (STEP === 2) drawLog(ctx, W, H);
  else if (STEP === 3) drawFilterStep(ctx, W, H);
  else                 drawResult(ctx, W, H);
}

/* ── Step 0: 문제 상황 ── */
function drawProblem(ctx, W, H) {
  var imgW = Math.min(W - 40, 480), imgH = H - 60;
  var ox = (W - imgW) / 2, oy = 30;

  /* 그라데이션 이미지 (왼쪽 어둡고 오른쪽 밝음) */
  for (var x = 0; x < imgW; x++) {
    var t = x / imgW;
    var illum = 20 + t * 210;
    var objBase = 80 + 35 * Math.sin(x / imgW * Math.PI * 3);
    var pix = Math.min(illum * 0.6 + objBase * 0.4, 255);
    ctx.fillStyle = 'rgb(' + Math.round(pix) + ',' + Math.round(pix) + ',' + Math.round(pix) + ')';
    ctx.fillRect(ox + x, oy, 1, imgH);
  }
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.strokeRect(ox, oy, imgW, imgH);

  /* 라벨 */
  ctx.font = '600 12px sans-serif'; ctx.textBaseline = 'top';
  ctx.fillStyle = C.red;
  ctx.textAlign = 'left';  ctx.fillText('← 너무 어두움', ox + 6, oy + 6);
  ctx.textAlign = 'right'; ctx.fillText('너무 밝음 →', ox + imgW - 6, oy + 6);

  /* 하단 설명 */
  ctx.fillStyle = C.muted; ctx.font = '12px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('조명이 한쪽에서 비춰 → 왼쪽은 어둡고 오른쪽은 과노출', W / 2, H - 4);
}

/* ── Step 1: 이미지 분리 ── */
function drawSeparation(ctx, W, H) {
  var half = Math.floor(W / 2) - 14;
  var imgH = H - 62, oy = 32;

  /* 제목 */
  ctx.font = '600 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillStyle = C.muted;
  ctx.fillText('조명 i(x,y) — 저주파', half / 2 + 8, oy - 6);
  ctx.fillText('반사율 r(x,y) — 고주파', half + 20 + half / 2, oy - 6);

  /* 조명 */
  for (var x = 0; x < half; x++) {
    var illum = Math.round(20 + (x / half) * 210);
    ctx.fillStyle = 'rgb(' + illum + ',' + illum + ',' + illum + ')';
    ctx.fillRect(8 + x, oy, 1, imgH);
  }
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.strokeRect(8, oy, half, imgH);

  /* 반사율 */
  for (var x2 = 0; x2 < half; x2++) {
    var refl = Math.round(100 + 75 * Math.sin((x2 / half) * Math.PI * 6));
    ctx.fillStyle = 'rgb(' + refl + ',' + refl + ',' + refl + ')';
    ctx.fillRect(half + 20 + x2, oy, 1, imgH);
  }
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.strokeRect(half + 20, oy, half, imgH);

  /* × 기호 */
  ctx.fillStyle = C.accent; ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('×', half + 12, oy + imgH / 2);

  ctx.fillStyle = C.muted; ctx.font = '11px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('f = i × r  →  곱셈이라서 주파수 도메인에서 바로 분리 불가!', W / 2, H - 4);
}

/* ── Step 2: log 변환 ── */
function drawLog(ctx, W, H) {
  var pad = 44, plotW = W - pad * 2, plotH = H - 72, oy = 32;

  /* 축 */
  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad, oy); ctx.lineTo(pad, oy + plotH); ctx.lineTo(pad + plotW, oy + plotH); ctx.stroke();

  /* 3개 선 */
  var lines = [
    { col: C.red,    dash: [],   label: '조명 ln(i) — 저주파', fn: function(t){ return 0.18 + t * 0.48; } },
    { col: '#185FA5', dash: [5,3], label: '반사율 ln(r) — 고주파', fn: function(t){ return 0.38 + 0.18 * Math.sin(t * Math.PI * 5); } },
    { col: C.accent, dash: [],   label: '합 ln(f) = ln(i)+ln(r)', fn: function(t){ return 0.56 + t * 0.48 + 0.18 * Math.sin(t * Math.PI * 5); } }
  ];

  lines.forEach(function(l, idx) {
    ctx.beginPath();
    ctx.strokeStyle = l.col; ctx.lineWidth = idx === 2 ? 2.5 : 1.5;
    ctx.setLineDash(l.dash);
    for (var px = 0; px < plotW; px++) {
      var t = px / plotW;
      var py = oy + plotH - l.fn(t) * plotH * 0.82;
      if (px === 0) ctx.moveTo(pad + px, py); else ctx.lineTo(pad + px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    /* 범례 */
    ctx.fillStyle = l.col; ctx.font = '11px sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillRect(pad + 8, oy + 16 + idx * 18 - 4, 14, 3);
    ctx.fillText(l.label, pad + 26, oy + 16 + idx * 18);
  });

  ctx.fillStyle = C.accent; ctx.font = '600 11px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('log를 씌우면 곱셈 → 덧셈! 이제 저주파/고주파를 따로 처리할 수 있어요', W / 2, H - 4);
  ctx.fillStyle = C.muted; ctx.font = '10px sans-serif';
  ctx.fillText('← 이미지 위치 (x)                                    y축: ln 값 →', W / 2, H - 18);
}

/* ── Step 3: 필터 ── */
function drawFilterStep(ctx, W, H) {
  var pad = 44, plotW = W - pad * 2, plotH = H - 72, oy = 28;

  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad, oy); ctx.lineTo(pad, oy + plotH); ctx.lineTo(pad + plotW, oy + plotH); ctx.stroke();

  var gL = 0.5, gH = 2.0, c = 1, D0 = 0.3;
  ctx.beginPath(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5;
  for (var px = 0; px < plotW; px++) {
    var d = px / plotW;
    var h = (gH - gL) * (1 - Math.exp(-c * d * d / (D0 * D0))) + gL;
    var py = oy + plotH - (h / 2.5) * plotH * 0.85;
    if (px === 0) ctx.moveTo(pad + px, py); else ctx.lineTo(pad + px, py);
  }
  ctx.stroke();

  /* 기준선 */
  var yL = oy + plotH * (1 - gL / 2.5) * 0.85;
  var yH = oy + plotH * (1 - gH / 2.5) * 0.85;
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = C.red; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad, yL); ctx.lineTo(pad + plotW * 0.5, yL); ctx.stroke();
  ctx.strokeStyle = C.green;
  ctx.beginPath(); ctx.moveTo(pad, yH); ctx.lineTo(pad + plotW * 0.5, yH); ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = '600 11px sans-serif'; ctx.textBaseline = 'middle';
  ctx.fillStyle = C.red;   ctx.textAlign = 'left'; ctx.fillText('γL=0.5 (저주파 억제 — 조명 균일화)', pad + 8, yL + 1);
  ctx.fillStyle = C.green; ctx.textAlign = 'left'; ctx.fillText('γH=2.0 (고주파 강조 — 디테일 선명)', pad + 8, yH - 12);

  ctx.fillStyle = C.muted; ctx.font = '11px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('← 저주파 (조명)                         고주파 (반사율, 디테일) →', W / 2, H - 18);
  ctx.fillStyle = C.accent2; ctx.font = '600 11px sans-serif';
  ctx.fillText('H(u,v) = (γH - γL)(1 - e^(-cD²/D₀²)) + γL', W / 2, H - 4);
}

/* ── Step 4: 결과 ── */
function drawResult(ctx, W, H) {
  var n = 3;
  var third = Math.floor((W - 24) / n), imgH = H - 58, oy = 36;
  var titles = ['원본 (조명 불균일)', '처리 중 (log+필터)', '결과 (균일+선명)'];
  var borders = [C.red, C.orange, C.green];

  for (var img = 0; img < n; img++) {
    var ox = 8 + img * (third + 4);
    for (var x = 0; x < third; x++) {
      var t = x / third, pix;
      if (img === 0) {
        pix = Math.min((20 + t * 210) * 0.6 + (80 + 35 * Math.sin(t * Math.PI * 4)) * 0.4, 255);
      } else if (img === 1) {
        var lv = Math.log(Math.max(20 + t * 210, 1)) * 0.6;
        var lr = Math.log(Math.max(80 + 35 * Math.sin(t * Math.PI * 4), 1)) * 0.4;
        pix = Math.min((lv + lr) * 28, 255);
      } else {
        pix = Math.min(Math.max(115 + 55 * Math.sin(t * Math.PI * 4), 0), 255);
      }
      ctx.fillStyle = 'rgb(' + Math.round(pix) + ',' + Math.round(pix) + ',' + Math.round(pix) + ')';
      ctx.fillRect(ox + x, oy, 1, imgH);
    }
    ctx.strokeStyle = borders[img]; ctx.lineWidth = 2;
    ctx.strokeRect(ox, oy, third, imgH);
    ctx.fillStyle = borders[img]; ctx.font = '600 11px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(titles[img], ox + third / 2, oy - 5);
  }

  /* 화살표 */
  ctx.fillStyle = C.accent; ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('→', 8 + third + 2, oy + imgH / 2);
  ctx.fillText('→', 8 + third * 2 + 6, oy + imgH / 2);

  ctx.fillStyle = C.muted; ctx.font = '11px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('조명이 균일해지고 물체 디테일이 선명해졌어요!', W / 2, H - 4);
}

/* ── 필터 그래프 (슬라이더) ── */
function updateFilter() {
  var gL = parseInt(document.getElementById('gl-slider').value) / 100;
  var gH = parseInt(document.getElementById('gh-slider').value) / 100;
  document.getElementById('gl-out').textContent = gL.toFixed(1);
  document.getElementById('gh-out').textContent = gH.toFixed(1);
  drawFilterGraph(gL, gH);
}

function drawFilterGraph(gL, gH) {
  var canvas = document.getElementById('filter-canvas');
  canvas.width = canvas.offsetWidth || 600;
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#fafafa'; ctx.fillRect(0, 0, W, H);

  var pad = 44, plotW = W - pad * 2, plotH = H - 32, oy = 10;
  var c = 1, D0 = 0.3, maxH = Math.max(gH, 2.5);

  ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad, oy); ctx.lineTo(pad, oy + plotH); ctx.lineTo(pad + plotW, oy + plotH); ctx.stroke();

  ctx.beginPath(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
  for (var px = 0; px < plotW; px++) {
    var d = px / plotW;
    var h = (gH - gL) * (1 - Math.exp(-c * d * d / (D0 * D0))) + gL;
    var py = oy + plotH - (h / maxH) * plotH * 0.9;
    if (px === 0) ctx.moveTo(pad + px, py); else ctx.lineTo(pad + px, py);
  }
  ctx.stroke();

  var yL = oy + plotH * (1 - gL / maxH) * 0.9;
  var yH = oy + plotH * (1 - gH / maxH) * 0.9;
  if (yH < oy + 12) yH = oy + 12;

  ctx.font = '600 11px sans-serif'; ctx.textBaseline = 'middle';
  ctx.fillStyle = C.red;   ctx.textAlign = 'left'; ctx.fillText('γL=' + gL.toFixed(1) + ' (저주파)', pad + 6, yL + 1);
  ctx.fillStyle = C.green; ctx.textAlign = 'left'; ctx.fillText('γH=' + gH.toFixed(1) + ' (고주파)', pad + 6, yH);

  ctx.fillStyle = C.muted; ctx.font = '10px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('← 저주파                         고주파 →', W / 2, H - 1);
}

document.getElementById('gl-slider').addEventListener('input', updateFilter);
document.getElementById('gh-slider').addEventListener('input', updateFilter);

function init() { setStep(0); updateFilter(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else setTimeout(init, 80);

window.addEventListener('resize', function () {
  drawMain();
  drawFilterGraph(
    parseInt(document.getElementById('gl-slider').value) / 100,
    parseInt(document.getElementById('gh-slider').value) / 100
  );
});
