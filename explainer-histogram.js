var STEP = 0;
var stepDescs = [
  '사진이 전체적으로 너무 어둡거나 밝으면 어떻게 될까요? 픽셀 값들이 한쪽에만 몰려서 세부 표현이 사라져버려요. 예를 들어 픽셀 값이 전부 50~80 사이에만 있다면, 어두운 부분 차이가 거의 안 보여요.',
  '히스토그램은 "픽셀 값별로 몇 개의 픽셀이 있는지" 막대 그래프로 나타낸 거예요. 왼쪽(어두움)에 막대가 몰려있으면 → 이미지가 전체적으로 어둡다는 뜻이에요!',
  'CDF(누적합)는 "이 값 이하인 픽셀이 총 몇 개냐?"를 쭉 더해가는 거예요. 막대기를 왼쪽부터 오른쪽으로 차례로 더해나가면 돼요. 마치 점수를 하나씩 합산하는 것처럼요!',
  '공식 h(v) = round((CDF(v) - CDF_min) / (CDF_max - CDF_min) × 255)를 적용하면, 한쪽에 몰린 픽셀들을 0~255 전체 범위로 균등하게 펼쳐줘요!',
  '평활화 전/후 히스토그램을 비교해보세요. 왼쪽에 몰려있던 막대들이 오른쪽 전체로 고르게 펼쳐졌어요. 이미지의 대비(contrast)가 높아져서 어두운 부분도 잘 보이게 됩니다!'
];

var pixels = [50, 50, 80, 80, 80, 120, 200, 200];
var uniqueVals = [50, 80, 120, 200];
var hist = { 50: 2, 80: 3, 120: 1, 200: 2 };
var cdf  = { 50: 2, 80: 5, 120: 6, 200: 8 };
var cdfMin = 2, cdfMax = 8;

function calcHV(v) { return Math.round((cdf[v] - cdfMin) / (cdfMax - cdfMin) * 255); }

var hvMap = {};
uniqueVals.forEach(function (v) { hvMap[v] = calcHV(v); });

function setStep(i) {
  STEP = i;
  for (var k = 0; k < 5; k++) {
    document.getElementById('sb' + k).className = 'sbtn' + (k === i ? ' on' : '');
  }
  document.getElementById('step-desc').textContent = stepDescs[i];
  drawMain();
}

function tc() { return '#5A4FB7'; }
function mc() { return '#9589B4'; }
function gc() { return '#DDD8F0'; }

function drawMain() {
  var canvas = document.getElementById('main-canvas');
  canvas.width = canvas.offsetWidth || 600;
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  if (STEP === 0) drawStep0(ctx, W, H);
  else if (STEP === 1) drawHistogram(ctx, W, H);
  else if (STEP === 2) drawCDF(ctx, W, H);
  else if (STEP === 3) drawFormula(ctx, W, H);
  else drawComparison(ctx, W, H);
}

function drawStep0(ctx, W, H) {
  var n = 16, cellW = Math.floor(W / n), cellH = H - 40;
  for (var i = 0; i < n; i++) {
    var gray = Math.round(30 + (i / (n - 1)) * 80);
    ctx.fillStyle = 'rgb(' + gray + ',' + gray + ',' + gray + ')';
    ctx.fillRect(i * cellW, 20, cellW, cellH);
  }
  ctx.fillStyle = mc(); ctx.font = '11px sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('픽셀 값 30 (어두움)', 4, 4);
  ctx.textAlign = 'right';
  ctx.fillText('픽셀 값 110 (아직도 어둡다)', W - 4, 4);
  ctx.fillStyle = '#E05555'; ctx.font = '700 11px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('0~255 범위 중 30~110에만 몰려있음 → 대비가 낮아 뿌옇게 보임', W / 2, H - 2);
}

function drawHistogram(ctx, W, H) {
  var barW = 50, gap = Math.floor((W - uniqueVals.length * barW) / (uniqueVals.length + 1));
  var maxH = H - 70, maxCount = 3;
  ctx.fillStyle = mc(); ctx.font = '700 11px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('히스토그램 (개수)', W / 2, 16);

  uniqueVals.forEach(function (v, i) {
    var count = hist[v], bh = Math.round((count / maxCount) * maxH);
    var bx = gap + i * (barW + gap), by = H - 40 - bh;
    ctx.fillStyle = 'rgba(139,127,212,0.5)'; ctx.fillRect(bx, by, barW, bh);
    ctx.strokeStyle = tc(); ctx.lineWidth = 1.5; ctx.strokeRect(bx, by, barW, bh);
    ctx.fillStyle = tc(); ctx.font = '700 12px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(count, bx + barW / 2, by - 2);
    ctx.fillStyle = mc(); ctx.font = '11px sans-serif'; ctx.textBaseline = 'top';
    ctx.fillText('v=' + v, bx + barW / 2, H - 36);
  });
  ctx.strokeStyle = gc(); ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(0, H - 40); ctx.lineTo(W, H - 40); ctx.stroke();
}

function drawCDF(ctx, W, H) {
  var barW = 50, gap = Math.floor((W - uniqueVals.length * barW) / (uniqueVals.length + 1));
  var maxH = H - 70;
  ctx.fillStyle = mc(); ctx.font = '700 11px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('CDF — 왼쪽부터 누적합산', W / 2, 16);

  var running = 0;
  uniqueVals.forEach(function (v, i) {
    running += hist[v];
    var bh = Math.round((running / cdfMax) * maxH);
    var bx = gap + i * (barW + gap), by = H - 40 - bh;
    ctx.fillStyle = 'rgba(139,127,212,0.25)'; ctx.fillRect(bx, by, barW, bh);
    ctx.strokeStyle = tc(); ctx.lineWidth = 1.5; ctx.strokeRect(bx, by, barW, bh);
    ctx.fillStyle = '#3C3489'; ctx.font = '700 13px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(running, bx + barW / 2, by - 2);
    ctx.fillStyle = mc(); ctx.font = '11px sans-serif'; ctx.textBaseline = 'top';
    ctx.fillText('v=' + v, bx + barW / 2, H - 36);
    if (i === 0) {
      ctx.fillStyle = '#993C1D'; ctx.font = '700 10px sans-serif';
      ctx.fillText('CDF_min=' + running, bx + barW / 2, H - 22);
    } else if (i === uniqueVals.length - 1) {
      ctx.fillStyle = '#2A5010'; ctx.font = '700 10px sans-serif';
      ctx.fillText('CDF_max=' + running, bx + barW / 2, H - 22);
    }
  });
  ctx.strokeStyle = gc(); ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(0, H - 40); ctx.lineTo(W, H - 40); ctx.stroke();
}

function drawFormula(ctx, W, H) {
  var barW = 50, gap = Math.floor((W - uniqueVals.length * barW) / (uniqueVals.length + 1));
  var maxH = H - 90;
  ctx.fillStyle = mc(); ctx.font = '700 11px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('공식 적용: 각 픽셀 값 → 새 픽셀 값', W / 2, 16);

  uniqueVals.forEach(function (v, i) {
    var bx = gap + i * (barW + gap), hv = hvMap[v];
    var oldBH = Math.round((v / 255) * maxH * 0.6 + 10);
    var newBH = Math.round((hv / 255) * maxH * 0.6 + 10);
    var oldY = H - 50 - oldBH, newY = H - 50 - newBH;
    var halfW = Math.floor(barW / 2) - 2;

    ctx.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',0.6)'; ctx.fillRect(bx, oldY, halfW, oldBH);
    ctx.strokeStyle = gc(); ctx.lineWidth = 0.5; ctx.strokeRect(bx, oldY, halfW, oldBH);

    ctx.fillStyle = 'rgba(139,127,212,0.35)'; ctx.fillRect(bx + halfW + 4, newY, halfW, newBH);
    ctx.strokeStyle = tc(); ctx.lineWidth = 1; ctx.strokeRect(bx + halfW + 4, newY, halfW, newBH);

    ctx.fillStyle = mc(); ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(v, bx + halfW / 2, oldY - 2);
    ctx.fillStyle = '#3C3489'; ctx.font = '700 10px sans-serif';
    ctx.fillText(hv, bx + halfW + 4 + halfW / 2, newY - 2);
    ctx.fillStyle = tc(); ctx.font = '11px sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillText('→', bx + halfW + 2, H - 50 - (Math.min(oldBH, newBH) / 2));
    ctx.fillStyle = mc(); ctx.font = '10px sans-serif'; ctx.textBaseline = 'top';
    ctx.fillText('v=' + v, bx + barW / 2, H - 46);
  });
  ctx.fillStyle = mc(); ctx.font = '10px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText('회색=원본 / 보라=평활화 후', 8, H - 2);
  ctx.strokeStyle = gc(); ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(0, H - 50); ctx.lineTo(W, H - 50); ctx.stroke();
}

function drawComparison(ctx, W, H) {
  var half = Math.floor(W / 2) - 8, barW = 20, gap2 = 4, maxH = H - 60;
  function drawHist(ox, vals2, counts, label, col) {
    var maxC = Math.max.apply(null, vals2.map(function (v) { return counts[v] || 0; }));
    ctx.fillStyle = mc(); ctx.font = '700 11px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(label, ox + half / 2, 16);
    var n = vals2.length, totalW = n * (barW + gap2), startX = ox + Math.floor((half - totalW) / 2);
    vals2.forEach(function (v, i) {
      var c = counts[v] || 0, bh = Math.round((c / maxC) * maxH * 0.8);
      var bx = startX + i * (barW + gap2), by = H - 40 - bh;
      ctx.fillStyle = col; ctx.fillRect(bx, by, barW, bh);
      ctx.strokeStyle = gc(); ctx.lineWidth = 0.5; ctx.strokeRect(bx, by, barW, bh);
      ctx.fillStyle = mc(); ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(v, bx + barW / 2, H - 36);
    });
    ctx.strokeStyle = gc(); ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(ox, H - 40); ctx.lineTo(ox + half, H - 40); ctx.stroke();
  }
  var afterVals = uniqueVals.map(function (v) { return hvMap[v]; });
  var afterCounts = {};
  uniqueVals.forEach(function (v) { afterCounts[hvMap[v]] = hist[v]; });
  drawHist(4, uniqueVals, hist, '평활화 전 (한쪽에 몰림)', 'rgba(100,100,100,0.5)');
  drawHist(half + 12, afterVals, afterCounts, '평활화 후 (고르게 펼쳐짐)', 'rgba(139,127,212,0.55)');
  ctx.strokeStyle = gc(); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(half + 8, 20); ctx.lineTo(half + 8, H - 10); ctx.stroke();
  ctx.fillStyle = tc(); ctx.font = '700 18px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('→', half + 8, H / 2);
}

function buildTable() {
  var t = document.getElementById('calc-table');
  var cdfRunning = 0;
  uniqueVals.forEach(function (v) {
    cdfRunning += hist[v];
    var hv = hvMap[v];
    var formula = '(' + cdfRunning + '-' + cdfMin + ')/(' + cdfMax + '-' + cdfMin + ')×255';
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + v + '</td><td>' + hist[v] + '개</td><td>' + cdfRunning + '</td>' +
      '<td style="font-family:var(--font-mono);font-size:0.72rem">' + formula + ' ≈ ' + hv + '</td>' +
      '<td style="font-weight:800;color:var(--accent-dark)">' + hv + '</td>';
    t.appendChild(tr);
  });
}

function buildPixelGrids() {
  var bef = document.getElementById('before-px');
  var aft = document.getElementById('after-px');
  pixels.forEach(function (v) {
    var d = document.createElement('div');
    d.className = 'px-cell';
    d.style.background = 'rgb(' + v + ',' + v + ',' + v + ')';
    d.style.color = v < 128 ? '#fff' : '#222';
    d.textContent = v;
    bef.appendChild(d);

    var hv = hvMap[v];
    var d2 = document.createElement('div');
    d2.className = 'px-cell';
    d2.style.background = 'rgb(' + hv + ',' + hv + ',' + hv + ')';
    d2.style.color = hv < 128 ? '#fff' : '#222';
    d2.textContent = hv;
    aft.appendChild(d2);
  });
}

function init() { setStep(0); buildTable(); buildPixelGrids(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else setTimeout(init, 80);
window.addEventListener('resize', drawMain);
