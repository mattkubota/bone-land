console.clear();
// based on this: https://editor.p5js.org/codingtrain/sketches/LbNt1nyxE

class Box {
  constructor(x, y, w, h) {
    this.body = Matter.Bodies.rectangle(x, y, w, h);
    this.body.restitution = 0.8;
    this.body.friction = 0;
    Matter.World.add(world, this.body);
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
  }

  show() {
    const pos = this.body.position;
    const angle = this.body.angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    fill(255);
    rectMode(CENTER);
    imageMode(CENTER);
    image(boxImg, 0, 0, this.w, this.h);

    // textSize(32);
    // text('ass!', 0, 0, this.w, this.h);

    pop();
  }
}

class Circle {
  constructor(x, y, r) {
    const randomX = (Math.random() - 0.5) * 1;
    const randomY = (Math.random() - 0.5) * 1;
    this.body = Matter.Bodies.circle(x, y, r);
    this.body.restitution = 0.8;
    this.body.friction = 0;
    Matter.Body.applyForce(
      this.body,
      { x: x, y: y },
      { x: randomX, y: randomY }
    );
    Matter.Body.setMass(this.body, this.body.mass * 4);
    Matter.World.add(world, this.body);
    this.r = r;
  }
  show() {
    const pos = this.body.position;
    const angle = this.body.angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    imageMode(CENTER);
    image(boxImg, 0, 0, this.r * 2, this.r * 2);
    // textSize(64);
    // text('fuck!', 0, 0, this.w, this.h);
    pop();
  }
}

class Ground extends Box {
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.body.isStatic = true;
    this.body.restitution = 1;
    this.body.friction = 0;
  }

  show() {
    const pos = this.body.position;
    const angle = this.body.angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    noStroke();
    fill(30);
    rectMode(CENTER);
    rect(0, 0, this.w, this.h);
    pop();
  }
}

const { Engine, World, Bodies, Mouse, MouseConstraint, Constraint } = Matter;

let vpWidth = window.innerWidth;
let instruction = document.querySelector(".instruction");
let reset = document.querySelector(".js-reset");
let count = document.querySelector(".js-count");
let numOfDrags = 0;
let ground, ceiling, leftWall, rightWall;
let boxes = [];
let maxBoxes = 100;
let barriers = [];
let bird;
let world, engine;
let mConstraint;
let slingshot;

let dotImg;
let boxImg;
let bkgImg;

function preload() {
  dotImg = loadImage(
    "images/3.png"
    //"https://s3-us-west-2.amazonaws.com/s.cdpn.io/3410/_f.png"
  );
  boxImg = loadImage("images/3.png");
  //"https://cdn.shopify.com/s/files/1/1061/1924/products/Smiling_Emoji_with_Smiling_Eyes_large.png?v=1480481060"
  bkgImg = loadImage("images/3.png");
  //"https://gravatar.com/avatar/5b056cc7af4f884f27692f2f06a1d2bd?s=80&d=https://static.codepen.io/assets/avatars/user-avatar-80x80-bdcd44a3bfb9a5fd01eb8b86f9e033fa1a9897c3a15b33adfc2649a002dab1b6.png"
}

function resetBarrier() {
  barriers.length = 0;
}

function createBarriers() {
  barrierWidth = 50;
  barrierOffset = barrierWidth * 0.5;
  // setBarrier();
  ground = new Ground(width / 2, height + barrierOffset, width, barrierWidth);
  ceiling = new Ground(width / 2, -barrierOffset, width, barrierWidth);
  leftWall = new Ground(-barrierOffset, height / 2, barrierWidth, height);
  rightWall = new Ground(
    width + barrierOffset,
    height / 2,
    barrierWidth,
    height
  );

  barriers.push(ground, ceiling, leftWall, rightWall);
}

function setup() {
  const heightEl = document.querySelector(".height").offsetHeight;
  const canvas = createCanvas(windowWidth, heightEl);
  engine = Engine.create();
  world = engine.world;
  engine.timing.timeScale = 0.9;

  // setup barriers
  if (barriers.length > 0) resetBarrier();
  createBarriers();

  // remove boxes
  // if (boxes.length > 0) boxes = []

  for (let i = 0; i < boxes.length; i++) {
    // console.log()
    Matter.World.add(world, boxes[i].body);
  }

  // for (let i = 0; i < 1; i++) {
  //   boxes[i] = new Box(width/2, 300 - i * 75, 100, 100);
  // }

  const mouse = Mouse.create(canvas.elt);
  const options = {
    mouse: mouse
  };

  // A fix for HiDPI displays
  mouse.pixelRatio = pixelDensity();
  mConstraint = MouseConstraint.create(engine, options);
  World.add(world, mConstraint);
}

function keyPressed() {
  if (key == " ") {
    resetApp();
  }
}

const resetApp = () => {
  boxes.length = 0;
  // update count
  count.innerHTML = boxes.length;
  setup();
};

function mousePressed() {
  numOfDrags++;

  if (numOfDrags === 1) {
    instruction.innerHTML = "Nice! Again!";
  }

  if (numOfDrags > 1) {
    instruction.classList.remove("is-active");
  }

  if (numOfDrags > 6) {
    instruction.innerHTML = "OMG calm down";
    instruction.classList.add("is-active");
  }

  if (numOfDrags > 8) {
    instruction.innerHTML = "Ugh wutever.";
  }

  if (numOfDrags > 10) {
    instruction.innerHTML = "Have fun!";
  }

  if (numOfDrags > 12) {
    instruction.classList.remove("is-active");
  }
}

function mouseDragged() {
  // console.log(vpWidth/20)

  const newEl = new Circle(mouseX, mouseY, vpWidth / 20, vpWidth / 20);
  boxes.push(newEl);
  // update count
  count.innerHTML = boxes.length;
}

function isOutOfView(el) {
  let x = el.body.position.x;
  let y = el.body.position.y;

  if (x < -100 || x > windowWidth + 100 || y < -100 || y > windowHeight + 100) {
    return true;
  } else {
    return false;
  }
}

function draw() {
  background(bkgImg);
  background(255);
  Matter.Engine.update(engine);

  for (let barrier of barriers) {
    barrier.show();
  }

  // draw only the boxes in frame
  // delete the rest
  for (let i = 0; i < boxes.length; i++) {
    boxes[i].show();

    if (isOutOfView(boxes[i])) {
      Matter.World.remove(world, boxes[i].body);
      boxes.splice(i, 1);
      i--;
    }
  }

  if (boxes.length > maxBoxes - 1) {
    Matter.World.remove(world, boxes[0].body);
    boxes.splice(0, 1);
  }

  // for (let (index, box) of boxes.entries()) {
  //   if (!isOutOfView(box)) {
  //     box.show();
  //   } else {
  //     console.log(boxes.length)
  //     box.remove();
  //     boxes.splice(i,1)
  //     console.log(boxes.length)
  //   }
  // }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setup();
}

reset.addEventListener("click", resetApp);

window.addEventListener("resize", () => {
  vpWidth = window.innerWidth;
});
