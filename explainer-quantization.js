function drawCanvases(levels) {
  const co = document.getElementById('c-orig');
  const cq = document.getElementById('c-quant');
  const w = co.offsetWidth || 300;
  co.width = w; co.height = 160;
  cq.width = w; cq.height = 160;
  const go = co.getContext('2d');
  const gq = cq.getContext('2d');

  for (let x = 0; x < w; x++) {
    const val = Math.round((x / (w - 1)) * 255);
    const gs = Math.floor(256 / levels);
    const group = Math.floor(val / gs);
    const qval = Math.round(group * (255 / Math.max(levels - 1, 1)));

    go.fillStyle = `rgb(${val},${val},${val})`;
    go.fillRect(x, 0, 1, 160);

    gq.fillStyle = `rgb(${qval},${qval},${qval})`;
    gq.fillRect(x, 0, 1, 160);
  }

  const desc = document.getElementById('quant-desc');
  if (levels >= 128)      desc.textContent = '거의 차이가 없어요! 단계가 많을수록 원본에 가깝습니다.';
  else if (levels >= 32)  desc.textContent = '살짝 경계가 보이기 시작해요.';
  else if (levels >= 8)   desc.textContent = '계단 현상(banding)이 뚜렷하게 보여요!';
  else                    desc.textContent = '단계가 너무 적어서 원본과 많이 달라졌어요!';
}

function calcPixel() {
  const v = parseInt(document.getElementById('px-val').value);
  const l = parseInt(document.getElementById('px-lvl').value);
  document.getElementById('px-val-out').textContent = v;
  document.getElementById('px-lvl-out').textContent = l;

  const gs = Math.floor(256 / l);
  const group = Math.floor(v / gs);
  const step = Math.round(255 / Math.max(l - 1, 1));
  const qv = Math.min(group * step, 255);

  document.getElementById('calc-result').innerHTML =
    `그룹 크기: 256 ÷ ${l} = <b style="color:var(--accent-dark)">${gs}</b><br>` +
    `픽셀 ${v} → 그룹 번호: ${v} ÷ ${gs} = <b style="color:var(--accent-dark)">${group}</b>번 그룹<br>` +
    `변환 후 픽셀 값: ${group} × ${step} = <b style="color:var(--accent-dark)">${qv}</b>`;

  document.getElementById('orig-px').style.background = `rgb(${v},${v},${v})`;
  document.getElementById('quant-px').style.background = `rgb(${qv},${qv},${qv})`;
}

document.getElementById('lvl').addEventListener('input', function () {
  document.getElementById('lvl-out').textContent = this.value;
  drawCanvases(parseInt(this.value));
});
document.getElementById('px-val').addEventListener('input', calcPixel);
document.getElementById('px-lvl').addEventListener('input', calcPixel);

setTimeout(() => { drawCanvases(256); calcPixel(); }, 100);
window.addEventListener('resize', () => {
  drawCanvases(parseInt(document.getElementById('lvl').value));
});
