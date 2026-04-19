/* ── Quiz Data ── */
const quizData = [
  {
    q: "OpenCV에서 이미지를 읽을 때 채널 순서는?",
    opts: ["RGB", "BGR", "GBR", "RBG"],
    ans: 1,
    explain: "OpenCV는 BGR 순서로 이미지를 읽습니다. Matplotlib으로 출력할 때는 cv2.cvtColor(img, cv2.COLOR_BGR2RGB)로 변환해야 합니다."
  },
  {
    q: "Python 리스트의 인덱스는 몇부터 시작하나요?",
    opts: ["1", "0", "-1", "2"],
    ans: 1,
    explain: "Python 리스트 인덱스는 0부터 시작합니다. a = [10,20,30]이면 a[0]=10, a[1]=20입니다."
  },
  {
    q: "NumPy에서 행렬 곱(Matrix multiplication)을 수행하는 연산자는?",
    opts: ["*", "**", "@", "//"],
    ans: 2,
    explain: "@ 또는 np.matmul()이 행렬 곱입니다. *는 성분별(element-wise) 곱셈입니다."
  },
  {
    q: "이미지를 흑백으로 읽는 OpenCV 코드는?",
    opts: [
      "cv2.imread('img.jpg', cv2.IMREAD_COLOR)",
      "cv2.imread('img.jpg', cv2.IMREAD_GRAYSCALE)",
      "cv2.imread('img.jpg', 1)",
      "cv2.imread('img.jpg', 'gray')"
    ],
    ans: 1,
    explain: "cv2.IMREAD_GRAYSCALE 플래그를 사용합니다. 결과 shape는 (H, W) — 채널 없음."
  },
  {
    q: "주파수 도메인 필터링에서 Zero-padding의 목적은?",
    opts: ["이미지 밝기 조절", "경계 블러링 및 링잉 현상 방지", "이미지 압축", "색상 채널 분리"],
    ans: 1,
    explain: "Zero-padding은 이미지를 2M×2N으로 확장해서 Inverse DFT 후 발생하는 경계 블러링과 링잉(ringing) 현상을 줄입니다."
  },
  {
    q: "Butterworth LPF에서 cutoff frequency D0에서의 H(u,v) 값은?",
    opts: ["0", "1", "0.5", "0.707"],
    ans: 2,
    explain: "Butterworth LPF의 정의에 따라 D(u,v) = D0일 때 H(u,v) = 1/(1+1) = 0.5입니다."
  },
  {
    q: "히스토그램 평활화에서 사용하는 함수는?",
    opts: ["PDF (확률 밀도 함수)", "CDF (누적 분포 함수)", "평균 함수", "분산 함수"],
    ans: 1,
    explain: "h(v) = round((cdf(v)-cdf_min)/(cdf_max-cdf_min)×(L-1)). CDF(누적 분포 함수)를 사용합니다."
  },
  {
    q: "Laplacian 필터로 샤프닝(sharpening)하는 수식은?",
    opts: ["f(x,y) + g(x,y)", "f(x,y) - g(x,y)", "g(x,y) - f(x,y)", "f(x,y) × g(x,y)"],
    ans: 1,
    explain: "샤프닝: f(x,y) - g(x,y) (원본에서 필터 결과 뺌). 블러링: f(x,y) + g(x,y)"
  },
  {
    q: "Homomorphic filtering에서 log transform을 사용하는 이유는?",
    opts: ["이미지 압축", "곱셈 모델을 덧셈으로 변환", "색상 강화", "노이즈 제거"],
    ans: 1,
    explain: "f = i × r에서 ln(f) = ln(i) + ln(r)으로 변환. 이렇게 하면 조명(i)과 반사율(r)을 주파수 도메인에서 독립적으로 처리 가능합니다."
  },
  {
    q: "이미지 서브샘플링 시 stride가 Nyquist frequency보다 크면?",
    opts: ["이미지가 선명해진다", "앨리어싱(aliasing) 발생 — 정보 왜곡", "파일 크기가 줄어든다", "색상이 변한다"],
    ans: 1,
    explain: "Nyquist 정리: 샘플링 주파수가 신호 최고 주파수의 2배 이상이어야 정보 손실 없이 복원 가능. 그보다 크게 stride를 잡으면 앨리어싱이 발생합니다."
  }
];

/* ── Quiz State ── */
let answered = {};
let correct = 0;

/* ── Build Quiz ── */
function buildQuiz() {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  quizData.forEach((q, i) => {
    const div = document.createElement('div');
    div.className = 'quiz-item';
    div.innerHTML = `
      <div class="quiz-q">Q${i + 1}. ${q.q}</div>
      <div class="quiz-options">
        ${q.opts.map((o, j) => `
          <button class="quiz-opt" onclick="answer(${i}, ${j})" id="opt-${i}-${j}">${o}</button>
        `).join('')}
      </div>
      <div class="quiz-explain" id="explain-${i}">${q.explain}</div>
    `;
    container.appendChild(div);
  });
}

/* ── Answer Handler ── */
function answer(qi, oi) {
  if (answered[qi] !== undefined) return;
  answered[qi] = oi;

  const isCorrect = oi === quizData[qi].ans;
  if (isCorrect) correct++;

  // Mark selected option
  const selectedBtn = document.getElementById(`opt-${qi}-${oi}`);
  selectedBtn.classList.add(isCorrect ? 'correct' : 'wrong');
  selectedBtn.disabled = true;

  // If wrong, also show correct answer
  if (!isCorrect) {
    const correctBtn = document.getElementById(`opt-${qi}-${quizData[qi].ans}`);
    correctBtn.classList.add('correct');
  }

  // Disable all options for this question
  quizData[qi].opts.forEach((_, j) => {
    const btn = document.getElementById(`opt-${qi}-${j}`);
    if (btn) btn.disabled = true;
  });

  // Show explanation
  const explain = document.getElementById(`explain-${qi}`);
  if (explain) explain.classList.add('show');

  // Update score and progress
  updateScore();
}

/* ── Score Update ── */
function updateScore() {
  const total = Object.keys(answered).length;
  const scoreEl = document.getElementById('score-display');
  const labelEl = document.getElementById('score-label');
  const fillEl = document.getElementById('prog');

  if (scoreEl) scoreEl.textContent = `${correct} / ${total}`;
  if (labelEl) {
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    labelEl.textContent = `정답률 ${pct}% · ${total}/${quizData.length}문제 완료`;
  }
  if (fillEl) {
    fillEl.style.width = `${(total / quizData.length) * 100}%`;
  }

  // Update progress label
  const progressLabelEl = document.getElementById('prog-label');
  if (progressLabelEl) {
    progressLabelEl.textContent = `퀴즈 진행: ${total} / ${quizData.length}`;
  }
}

/* ── Tab Switcher ── */
function showTab(id, el) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  // Deactivate all tabs
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  // Show selected section
  const section = document.getElementById('tab-' + id);
  if (section) section.classList.add('active');

  // Activate clicked tab
  if (el) el.classList.add('active');
}

/* ── Ask Button ── */
function sendPrompt(text) {
  if (typeof window.sendPrompt === 'function') {
    window.sendPrompt(text);
  }
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  buildQuiz();
  updateScore();
});
