var STEP = 0;
var stepDescs = [
  '이미지를 2배로 키우면 기존 픽셀(A·B·C·D) 사이에 빈 픽셀(?)이 생겨요. Bilinear 보간은 이 빈 자리를 주변 4개 픽셀의 색을 거리에 따라 섞어서 채웁니다!',
  '먼저 가로 방향으로 2번 섞어요. 위쪽 A·B를 섞어 R1을, 아래쪽 C·D를 섞어 R2를 만들어요. 새 픽셀이 B에 더 가까우면 B 색을 더 많이 반영합니다!',
  '이제 R1과 R2를 세로로 한 번 더 섞으면 최종 픽셀 P가 완성돼요. 가로 섞기 + 세로 섞기 = 2번 섞기 = Bi-Linear 보간!',
  '완성! A·B·C·D 4개 원래 픽셀의 색이 거리에 따라 혼합되어 새 픽셀 P가 만들어졌어요. 이 과정을 새로 생긴 모든 픽셀에 반복하면 이미지 확대 완성!'
];

var COLS = [
  { r: 220, g: 60,  b: 60,  name: 'A' },
  { r: 60,  g: 80,  b: 220, name: 'B' },
  { r: 60,  g: 180, b: 60,  name: 'C' },
  { r: 220, g: 190, b: 30,  name: 'D' }
];

function lerp(a, b, t) { return Math.round(a * (1 - t) + b * t); }
function tc() { return '#5A4FB7'; }
function mc() { return '#9589B4'; }
function gc() { return '#DDD8F0'; }

function setStep(i) {
  STEP = i;
  for (var k = 0; k < 4; k++) {
    document.getElementById('sb' + k).className = 'sbtn' + (k === i ? ' on' : '');
  }
  document.getElementById('step-desc').textContent = stepDescs[i];
  drawStep();
}

function drawStep() {
  var canvas = document.getElementById('step-canvas');
  canvas.width = canvas.offsetWidth || 600;
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  var tx = 0.5, ty = 0.5, cx = W / 2, cy = H / 2;
  var gw = Math.min(160, W * 0.28), gh = Math.min(120, H * 0.35);
  var corners = [
    { x: cx - gw, y: cy - gh, c: COLS[0] },
    { x: cx + gw, y: cy - gh, c: COLS[1] },
    { x: cx - gw, y: cy + gh, c: COLS[2] },
    { x: cx + gw, y: cy + gh, c: COLS[3] }
  ];

  ctx.strokeStyle = gc(); ctx.lineWidth = 1; ctx.strokeRect(cx - gw, cy - gh, gw * 2, gh * 2);

  if (STEP >= 1) {
    var r1 = { r: lerp(COLS[0].r, COLS[1].r, tx), g: lerp(COLS[0].g, COLS[1].g, tx), b: lerp(COLS[0].b, COLS[1].b, tx) };
    var r2 = { r: lerp(COLS[2].r, COLS[3].r, tx), g: lerp(COLS[2].g, COLS[3].g, tx), b: lerp(COLS[2].b, COLS[3].b, tx) };

    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = tc(); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - gw, cy - gh); ctx.lineTo(cx + gw, cy - gh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - gw, cy + gh); ctx.lineTo(cx + gw, cy + gh); ctx.stroke();
    ctx.restore();

    [{ pt: { x: cx, y: cy - gh }, col: r1, label: 'R1' }, { pt: { x: cx, y: cy + gh }, col: r2, label: 'R2' }].forEach(function (item) {
      ctx.beginPath(); ctx.arc(item.pt.x, item.pt.y, 13, 0, Math.PI * 2);
      ctx.fillStyle = 'rgb(' + item.col.r + ',' + item.col.g + ',' + item.col.b + ')'; ctx.fill();
      ctx.strokeStyle = tc(); ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(item.label, item.pt.x, item.pt.y);
    });
    ctx.fillStyle = tc(); ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('가로 섞기', cx + gw * 0.55, cy - gh - 16);
    ctx.fillText('가로 섞기', cx + gw * 0.55, cy + gh + 16);
  }

  if (STEP >= 2) {
    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = '#1D9E75'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, cy - gh + 13); ctx.lineTo(cx, cy + gh - 13); ctx.stroke(); ctx.restore();
    ctx.fillStyle = '#1D9E75'; ctx.font = '11px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('세로 섞기', cx + 16, cy);
  }

  corners.forEach(function (corner) {
    ctx.beginPath(); ctx.arc(corner.x, corner.y, 18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgb(' + corner.c.r + ',' + corner.c.g + ',' + corner.c.b + ')'; ctx.fill();
    ctx.strokeStyle = gc(); ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(corner.c.name, corner.x, corner.y);
    var lx = corner.x < cx ? corner.x - 30 : corner.x + 30;
    var ly = corner.y < cy ? corner.y - 24 : corner.y + 24;
    ctx.fillStyle = mc(); ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('(' + corner.c.r + ',' + corner.c.g + ',' + corner.c.b + ')', lx, ly);
  });

  if (STEP >= 3) {
    var r1b = { r: lerp(COLS[0].r, COLS[1].r, tx), g: lerp(COLS[0].g, COLS[1].g, tx), b: lerp(COLS[0].b, COLS[1].b, tx) };
    var r2b = { r: lerp(COLS[2].r, COLS[3].r, tx), g: lerp(COLS[2].g, COLS[3].g, tx), b: lerp(COLS[2].b, COLS[3].b, tx) };
    var pr = lerp(r1b.r, r2b.r, ty), pg = lerp(r1b.g, r2b.g, ty), pb = lerp(r1b.b, r2b.b, ty);
    ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgb(' + pr + ',' + pg + ',' + pb + ')'; ctx.fill();
    ctx.strokeStyle = tc(); ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('P', cx, cy);
    ctx.fillStyle = mc(); ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('결과: (' + pr + ', ' + pg + ', ' + pb + ')', cx, cy + 28);
  } else {
    ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#EDE8FF'; ctx.fill();
    ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = tc(); ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    ctx.fillStyle = tc(); ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('?', cx, cy);
  }
}

function updateInterp() {
  var tx = parseInt(document.getElementById('sx').value) / 100;
  var ty = parseInt(document.getElementById('sy').value) / 100;
  document.getElementById('sx-out').textContent = Math.round(tx * 100) + '%';
  document.getElementById('sy-out').textContent = Math.round(ty * 100) + '%';

  var w00 = (1 - tx) * (1 - ty), w10 = tx * (1 - ty), w01 = (1 - tx) * ty, w11 = tx * ty;
  var weights = [w00, w10, w01, w11];
  var names = ['A (위-왼)', 'B (위-오른)', 'C (아래-왼)', 'D (아래-오른)'];

  var pr = lerp(lerp(COLS[0].r, COLS[1].r, tx), lerp(COLS[2].r, COLS[3].r, tx), ty);
  var pg = lerp(lerp(COLS[0].g, COLS[1].g, tx), lerp(COLS[2].g, COLS[3].g, tx), ty);
  var pb = lerp(lerp(COLS[0].b, COLS[1].b, tx), lerp(COLS[2].b, COLS[3].b, tx), ty);

  document.getElementById('result-box').style.background = 'rgb(' + pr + ',' + pg + ',' + pb + ')';
  document.getElementById('result-desc').textContent = 'RGB (' + pr + ', ' + pg + ', ' + pb + ') — 4가지 색이 거리에 따라 섞인 결과';

  var wc = document.getElementById('weight-cards');
  wc.innerHTML = '';
  COLS.forEach(function (c, i) {
    var d = document.createElement('div');
    d.className = 'fcard';
    d.innerHTML = '<div style="width:22px;height:22px;border-radius:5px;background:rgb(' + c.r + ',' + c.g + ',' + c.b + ');margin:0 auto 5px"></div>' +
      '<div class="fcard-num">' + Math.round(weights[i] * 100) + '%</div>' +
      '<div class="fcard-lbl">' + names[i] + '</div>';
    wc.appendChild(d);
  });
  drawInterp(tx, ty, pr, pg, pb);
}

function drawInterp(tx, ty, pr, pg, pb) {
  var canvas = document.getElementById('interp-canvas');
  canvas.width = canvas.offsetWidth || 600;
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  var bx = 60, by = 30, bw = Math.min(220, W * 0.55), bh = H - 60;
  var cs = [{ x: bx, y: by }, { x: bx + bw, y: by }, { x: bx, y: by + bh }, { x: bx + bw, y: by + bh }];
  var px = bx + tx * bw, py = by + ty * bh;

  ctx.strokeStyle = gc(); ctx.lineWidth = 0.5; ctx.strokeRect(bx, by, bw, bh);

  COLS.forEach(function (c, i) {
    ctx.save(); ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.6)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cs[i].x, cs[i].y); ctx.lineTo(px, py); ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.arc(cs[i].x, cs[i].y, 18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')'; ctx.fill();
    ctx.strokeStyle = gc(); ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(c.name, cs[i].x, cs[i].y);
  });

  ctx.beginPath(); ctx.arc(px, py, 15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgb(' + pr + ',' + pg + ',' + pb + ')'; ctx.fill();
  ctx.strokeStyle = tc(); ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('P', px, py);
}

function drawCompare() {
  var src = [
    [220, 60, 60], [60, 80, 220], [60, 180, 60], [220, 190, 30],
    [180, 130, 50], [140, 100, 200], [100, 160, 80], [200, 150, 40],
    [100, 200, 180], [160, 80, 180], [80, 200, 140], [180, 100, 180],
    [60, 160, 220], [200, 120, 80], [120, 200, 60], [160, 140, 160]
  ];
  var sw = 4, sh = 4;
  function getNN(fx, fy) {
    return src[Math.min(Math.round(fy * (sh - 1)), sh - 1) * sw + Math.min(Math.round(fx * (sw - 1)), sw - 1)];
  }
  function getBL(fx, fy) {
    var qx = fx * (sw - 1), qy = fy * (sh - 1);
    var x0 = Math.floor(qx), y0 = Math.floor(qy);
    var x1 = Math.min(x0 + 1, sw - 1), y1 = Math.min(y0 + 1, sh - 1);
    var tx2 = qx - x0, ty2 = qy - y0;
    var tl = src[y0 * sw + x0], tr = src[y0 * sw + x1], bl = src[y1 * sw + x0], br = src[y1 * sw + x1];
    return [
      Math.round(tl[0] * (1 - tx2) * (1 - ty2) + tr[0] * tx2 * (1 - ty2) + bl[0] * (1 - tx2) * ty2 + br[0] * tx2 * ty2),
      Math.round(tl[1] * (1 - tx2) * (1 - ty2) + tr[1] * tx2 * (1 - ty2) + bl[1] * (1 - tx2) * ty2 + br[1] * tx2 * ty2),
      Math.round(tl[2] * (1 - tx2) * (1 - ty2) + tr[2] * tx2 * (1 - ty2) + bl[2] * (1 - tx2) * ty2 + br[2] * tx2 * ty2)
    ];
  }
  ['nn', 'bl'].forEach(function (type) {
    var canvas = document.getElementById(type + '-canvas');
    canvas.width = canvas.offsetWidth || 280;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    var dw = sw * 8, dh = sh * 8, scale = Math.max(Math.min(Math.floor(W / dw), Math.floor(H / dh)), 1);
    var rw = dw * scale, rh = dh * scale, ox = Math.floor((W - rw) / 2), oy2 = Math.floor((H - rh) / 2);
    for (var dy = 0; dy < dh; dy++) {
      for (var dx = 0; dx < dw; dx++) {
        var fx = dx / (dw - 1), fy = dy / (dh - 1);
        var c = type === 'nn' ? getNN(fx, fy) : getBL(fx, fy);
        ctx.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
        ctx.fillRect(ox + dx * scale, oy2 + dy * scale, scale, scale);
      }
    }
  });
}

document.getElementById('sx').addEventListener('input', updateInterp);
document.getElementById('sy').addEventListener('input', updateInterp);

function init() { setStep(0); updateInterp(); drawCompare(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else setTimeout(init, 80);
window.addEventListener('resize', function () { drawStep(); updateInterp(); drawCompare(); });
