let video;
let faceapi;
let detections = [];

let flameOn = false;
let hasBlown = false;

let smokeParticles = [];

let messageDiv;
let inputBox;
let startBtn;

function setup() {
  createCanvas(windowWidth, windowHeight);

  video = createCapture(VIDEO);
  video.size(240, 180);
  video.hide();

  const options = {
    withLandmarks: true,
    withDescriptors: false,
    withExpressions: false,
  };
  faceapi = ml5.faceApi(video, options, () => {
    faceapi.detect(gotFace);
  });

  messageDiv = select('#message');
  inputBox = select('#wish');
  startBtn = select('#start-button');
  startBtn.mousePressed(startCandle);
}

function gotFace(err, result) {
  if (result) {
    detections = result;
  }
  setTimeout(() => faceapi.detect(gotFace), 150);
}

function draw() {
  background('#fff2f2');

  // 영상 표시
  push();
  translate(width / 2 + 120, 350);
  scale(-1, 1);
  image(video, 0, 0, 240, 180);
  pop();

  const candleX = width / 2;
  const candleY = height / 2;

  drawCandle(candleX, candleY);

  // 입 벌리면 촛불 끔
  if (flameOn && mouthOpen()) {
    flameOn = false;
    hasBlown = true;
    messageDiv.html(`"${inputBox.value()}" 을 위한 촛불을 껐어요 🎉`);
  }

  // 연기 발생
  if (!flameOn && hasBlown) {
    if (frameCount % 5 === 0) {
      smokeParticles.push(new Smoke(candleX, candleY - 50));
    }

    for (let i = smokeParticles.length - 1; i >= 0; i--) {
      const p = smokeParticles[i];
      const finished = p.update();
      if (finished) smokeParticles.splice(i, 1);
    }
  }
}

function drawCandle(x, y) {
  fill('#FFDDAA');
  noStroke();
  rect(x - 15, y, 30, 80, 10);

  fill(50);
  rect(x - 2, y - 40, 4, 40);

  if (flameOn) {
    fill(255, 150, 0);
    ellipse(x, y - 50 + random(-2, 2), 20, 30);
  }
}

function mouthOpen() {
  if (detections.length === 0) return false;
  let m = detections[0].parts.mouth;
  let topLip = m[13];
  let bottomLip = m[19];
  let d = dist(topLip._x, topLip._y, bottomLip._x, bottomLip._y);
  return d > 8;
}

function startCandle() {
  flameOn = true;
  hasBlown = false;
  smokeParticles = [];
  messageDiv.html('');
}

// Smoke 클래스 정의
class Smoke {
  constructor(x, y) {
    this.x = x + random(-5, 5);
    this.y = y;
    this.alpha = 255;
    this.size = random(10, 20);
    this.speed = random(0.5, 1.5);
  }

  update() {
    this.y -= this.speed;
    this.alpha -= 2;
    this.display();
    return this.alpha <= 0;
  }

  display() {
    noStroke();
    fill(200, 200, 200, this.alpha);
    ellipse(this.x, this.y, this.size);
  }
}
