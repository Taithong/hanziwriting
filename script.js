const vocabularyList = [
  { word: '谢', pinyin: 'xiè', meaning: 'ขอบคุณ' },
  { word: '好', pinyin: 'hǎo', meaning: 'ดี' },
  { word: '学', pinyin: 'xué', meaning: 'เรียน' },
  { word: '吃', pinyin: 'chī', meaning: 'กิน' },
  { word: '走', pinyin: 'zǒu', meaning: 'เดิน' },
  { word: '爱', pinyin: 'ài', meaning: 'รัก' },
  { word: '家', pinyin: 'jiā', meaning: 'บ้าน' },
  { word: '书', pinyin: 'shū', meaning: 'หนังสือ' },
  { word: '水', pinyin: 'shuǐ', meaning: 'น้ำ' },
  { word: '猫', pinyin: 'māo', meaning: 'แมว' },
  { word: '狗', pinyin: 'gǒu', meaning: 'หมา' },
  { word: '人', pinyin: 'rén', meaning: 'คน' }
];

let questions = [];
let currentQuestion = 0;
let correctCount = 0;
let writer = null;

// ฟังก์ชันเสริม: รองรับ Apple Pencil และป้องกันหน้าเลื่อน
function enablePointerEventsForWriter(writer) {
  const canvas = writer.canvas;
  let isDrawing = false;

  canvas.style.touchAction = 'none'; // ปิด gesture เลื่อน, pinch zoom บน canvas

  canvas.addEventListener('pointerdown', function(event) {
    if (event.pointerType === 'pen' || event.pointerType === 'touch') {
      event.preventDefault(); // ป้องกันหน้าเว็บเลื่อน
      isDrawing = true;
      const point = { x: event.offsetX, y: event.offsetY };
      writer.startUserStroke(point);
    }
  });

  canvas.addEventListener('pointermove', function(event) {
    if (!isDrawing) return;
    if (event.pointerType === 'pen' || event.pointerType === 'touch') {
      event.preventDefault();
      const point = { x: event.offsetX, y: event.offsetY };
      writer.continueUserStroke(point);
    }
  });

  canvas.addEventListener('pointerup', function(event) {
    if (!isDrawing) return;
    if (event.pointerType === 'pen' || event.pointerType === 'touch') {
      event.preventDefault();
      isDrawing = false;
      const point = { x: event.offsetX, y: event.offsetY };
      writer.endUserStroke(point);
    }
  });

  canvas.addEventListener('pointercancel', function(event) {
    isDrawing = false;
  });
}

// ฟังก์ชันสุ่มคำ
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// เซ็ตคำถามใหม่
function setupQuestion() {
  document.getElementById('result').innerText = '';
  document.getElementById('next-btn').disabled = true;

  const target = questions[currentQuestion];
  document.getElementById('target-word').innerText = target.word;
  document.getElementById('question-number').innerText = currentQuestion + 1;

  if (writer) {
    writer.hideCharacter();
    writer.cancelQuiz();
  }

  writer = HanziWriter.create('writer', target.word, {
    width: 300,
    height: 300,
    showOutline: true,
    showCharacter: false,
    strokeAnimationSpeed: 1,
    delayBetweenStrokes: 200,
    strokeFadeDuration: 300,
    radicalColor: '#1685a9'
  });

  // เชื่อมต่อ pointer events
  enablePointerEventsForWriter(writer);

  writer.quiz({
    onComplete: function(summaryData) {
      correctCount++;
      document.getElementById('result').innerText = `เยี่ยมมาก! เขียน "${target.word}" ถูกต้องแล้ว! (${target.pinyin}: ${target.meaning})`;
      document.getElementById('next-btn').disabled = false;
    },
    onMistake: function(strokeData) {
      console.log('ผิดขีดหนึ่ง', strokeData);
    }
  });
}

// ไปข้อถัดไป
function nextQuestion() {
  currentQuestion++;
  if (currentQuestion >= 10) {
    showFinalResult();
  } else {
    setupQuestion();
  }
}

// แสดงคะแนน
function showFinalResult() {
  document.getElementById('writer').classList.add('hidden');
  document.getElementById('result').classList.add('hidden');
  document.getElementById('next-btn').classList.add('hidden');
  document.getElementById('target-word').classList.add('hidden');
  document.getElementById('question-number').classList.add('hidden');
  document.getElementById('final-result').classList.remove('hidden');
  document.getElementById('score').innerText = `คุณได้ ${correctCount} คะแนนจาก 10 คะแนน`;
}

// เริ่มใหม่
function restart() {
  document.location.reload();
}

// เริ่ม Quiz ทันทีที่เข้าเว็บ
function startQuiz() {
  questions = shuffleArray(vocabularyList).slice(0, 10);
  currentQuestion = 0;
  correctCount = 0;
  setupQuestion();
}

startQuiz();
