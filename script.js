/* ════════════════════════════════════════════════
   디지털영상처리 시험 대비 — script.js
   showTab / 퀴즈 / 진행도 모든 기능 포함
════════════════════════════════════════════════ */

/* ── 탭 전환 ── */
function showTab(id, clickedBtn) {
  /* 모든 섹션 숨기기 */
  document.querySelectorAll('.section').forEach(function(s) {
    s.classList.remove('active');
  });
  /* 모든 탭 버튼 비활성화 */
  document.querySelectorAll('.tab').forEach(function(b) {
    b.classList.remove('active');
  });
  /* 선택된 섹션·탭 활성화 */
  var target = document.getElementById('tab-' + id);
  if (target) target.classList.add('active');
  if (clickedBtn) clickedBtn.classList.add('active');
}

/* ════════════════════════════════════════════════
   퀴즈 데이터 (Week 2~6 시험 예상 문제)
════════════════════════════════════════════════ */
var quizData = [
  /* Week 2 */
  {
    week: 'w2',
    q: 'OpenCV에서 이미지를 읽을 때 채널 순서는?',
    opts: ['RGB', 'BGR', 'GBR', 'RBG'],
    ans: 1,
    explain: 'OpenCV는 BGR 순서로 이미지를 읽습니다. Matplotlib으로 출력할 때는 cv2.cvtColor(img, cv2.COLOR_BGR2RGB)로 변환해야 합니다.'
  },
  {
    week: 'w2',
    q: 'Python 리스트의 인덱스는 몇 번부터 시작하나요?',
    opts: ['1', '0', '-1', '2'],
    ans: 1,
    explain: 'Python 리스트 인덱스는 0부터 시작합니다. a = [10,20,30]이면 a[0]=10, a[1]=20입니다.'
  },
  {
    week: 'w2',
    q: 'NumPy에서 행렬 곱(Matrix multiplication)을 수행하는 연산자는?',
    opts: ['*', '**', '@', '//'],
    ans: 2,
    explain: '@ 또는 np.matmul()이 행렬 곱입니다. *는 성분별(element-wise) 곱셈입니다.'
  },
  {
    week: 'w3',
    q: '이미지를 흑백으로 읽는 OpenCV 코드는?',
    opts: [
      "cv2.imread('img.jpg', cv2.IMREAD_COLOR)",
      "cv2.imread('img.jpg', cv2.IMREAD_GRAYSCALE)",
      "cv2.imread('img.jpg', 1)",
      "cv2.imread('img.jpg', 'gray')"
    ],
    ans: 1,
    explain: 'cv2.IMREAD_GRAYSCALE 플래그를 사용합니다. 결과 shape는 (H, W) — 채널 없음.'
  },
  /* Week 4 */
  {
    week: 'w4',
    q: '이미지 서브샘플링 시 stride가 Nyquist frequency보다 크면?',
    opts: [
      '이미지가 선명해진다',
      '앨리어싱(aliasing) 발생 — 정보 왜곡',
      '파일 크기만 줄어든다',
      '색상이 변한다'
    ],
    ans: 1,
    explain: 'Nyquist 정리: 샘플링 주파수가 신호 최고 주파수의 2배 이상이어야 정보 손실 없이 복원 가능합니다. 그보다 크게 stride를 잡으면 앨리어싱이 발생합니다.'
  },
  {
    week: 'w4',
    q: 'cv2.resize에서 Bilinear 보간을 사용하는 상수는?',
    opts: ['cv2.INTER_NEAREST', 'cv2.INTER_LINEAR', 'cv2.INTER_CUBIC', 'cv2.INTER_AREA'],
    ans: 1,
    explain: 'cv2.INTER_LINEAR이 Bilinear 보간입니다. INTER_NEAREST는 최근접, INTER_CUBIC은 Bicubic 보간입니다.'
  },
  /* Week 5 */
  {
    week: 'w5',
    q: '히스토그램 평활화에서 사용하는 함수는?',
    opts: [
      'PDF (확률 밀도 함수)',
      'CDF (누적 분포 함수)',
      '평균 함수',
      '분산 함수'
    ],
    ans: 1,
    explain: 'h(v) = round((cdf(v)-cdf_min)/(cdf_max-cdf_min)×(L-1)). CDF(누적 분포 함수)를 사용합니다.'
  },
  {
    week: 'w5',
    q: '히스토그램 평활화 구현 시 cdf_min을 구하는 올바른 코드는?',
    opts: [
      'cdf.min()',
      'cdf[cdf > 0].min()',
      'cdf[0]',
      'hist.min()'
    ],
    ans: 1,
    explain: 'cdf[cdf > 0].min() — 픽셀이 없는 구간(CDF=0)을 제외해야 공식이 올바르게 동작합니다.'
  },
  /* Week 6 */
  {
    week: 'w6',
    q: '주파수 도메인 필터링에서 Zero-padding의 목적은?',
    opts: [
      '이미지 밝기 조절',
      '경계 블러링 및 링잉(ringing) 현상 방지',
      '이미지 압축',
      '색상 채널 분리'
    ],
    ans: 1,
    explain: 'Zero-padding은 이미지를 2M×2N으로 확장해서 IDFT 후 발생하는 경계 블러링과 링잉 현상을 줄입니다.'
  },
  {
    week: 'w6',
    q: 'Laplacian 필터로 샤프닝(sharpening)하는 수식은?',
    opts: [
      'f(x,y) + g(x,y)',
      'f(x,y) - g(x,y)',
      'g(x,y) - f(x,y)',
      'f(x,y) × g(x,y)'
    ],
    ans: 1,
    explain: '샤프닝: f(x,y) - g(x,y) (원본에서 필터 결과를 뺌). 블러링: f(x,y) + g(x,y) (더함).'
  }
];

/* ════════════════════════════════════════════════
   퀴즈 렌더링
════════════════════════════════════════════════ */
var answered = {};
var correctCount = 0;

function buildQuiz() {
  var container = document.getElementById('quiz-container');
  if (!container) return;

  quizData.forEach(function(q, i) {
    var div = document.createElement('div');
    div.className = 'quiz-item';
    div.id = 'quiz-item-' + i;

    var optsHtml = q.opts.map(function(o, j) {
      return '<button class="quiz-opt" id="opt-' + i + '-' + j + '" onclick="answer(' + i + ',' + j + ')">' + o + '</button>';
    }).join('');

    div.innerHTML =
      '<div class="quiz-q">Q' + (i + 1) + '. <span class="quiz-week">' + q.week.toUpperCase() + '</span> ' + q.q + '</div>' +
      '<div class="quiz-options">' + optsHtml + '</div>' +
      '<div class="quiz-explain" id="explain-' + i + '">' + q.explain + '</div>';

    container.appendChild(div);
  });
}

function answer(qi, oi) {
  if (answered[qi] !== undefined) return;
  answered[qi] = oi;

  var isCorrect = (oi === quizData[qi].ans);
  if (isCorrect) correctCount++;

  /* 정답/오답 표시 */
  document.getElementById('opt-' + qi + '-' + oi).className =
    'quiz-opt ' + (isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) {
    document.getElementById('opt-' + qi + '-' + quizData[qi].ans).className = 'quiz-opt correct';
  }

  /* 해설 표시 */
  var exp = document.getElementById('explain-' + qi);
  if (exp) exp.classList.add('show');

  /* 점수판 업데이트 */
  var total = Object.keys(answered).length;
  var scoreEl = document.getElementById('score-display');
  var labelEl = document.getElementById('score-label');
  if (scoreEl) scoreEl.textContent = correctCount + ' / ' + total;
  if (labelEl) {
    var pct = Math.round(correctCount / total * 100);
    if (pct >= 90)      labelEl.textContent = '완벽해요! 시험 준비 완료 🎉';
    else if (pct >= 70) labelEl.textContent = '잘 하고 있어요! 조금만 더 💪';
    else if (pct >= 50) labelEl.textContent = '절반 정도 맞았어요. 틀린 문제 복습해보세요.';
    else                labelEl.textContent = '더 공부가 필요해요. 각 주차 탭을 다시 확인하세요!';
  }

  /* 진행도 바 업데이트 */
  updateProgress(total);
}

/* ════════════════════════════════════════════════
   진행도 바
════════════════════════════════════════════════ */
function updateProgress(total) {
  var prog = document.getElementById('prog');
  var label = document.getElementById('prog-label');
  var max = quizData.length;
  if (prog)  prog.style.width = (total / max * 100) + '%';
  if (label) label.textContent = total + ' / ' + max;
}

/* ════════════════════════════════════════════════
   초기화
════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  buildQuiz();
});
