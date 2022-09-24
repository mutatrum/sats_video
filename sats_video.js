require('log-timestamp');
const { createCanvas } = require('canvas');
const fs = require('fs');
const Color = require('./color');
const color = new Color();

const BORDER = 24;
const RADIUS = 22;

var COLUMNS = 10;
var GRID = 10;
var DOT = 6;
var DOT_GAP = 2;
var GRID_GAP = 4;
var BLOCK = (DOT * 10) + (DOT_GAP * 9) + GRID_GAP;
var FONT_SIZE = 14;

var WIDTH = 3840;
var HEIGHT = 2160;

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext('2d');

const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);

var buffer = new ArrayBuffer(imageData.data.length);
var pixels = new Uint32Array(buffer);

createInto();

var f = fs.readFileSync('data.json');
var data = JSON.parse(f);
var date = new Date(data.since);
for (var i in data.prices) {

  // Using the lowest future price to determine the size of the dots to prevens flipping between multiple scalings
  var min_price = Math.min(...data.prices.slice(i));
  onSchedule(data.prices[i], min_price, date.toISOString().substring(0, 10));
  date.setDate(date.getDate() + 1);
}

function onSchedule(price, min_price, date) {

  var min_sats = Math.floor(1e8 / min_price);

  if (min_sats <= 10000) {
    COLUMNS = 10;
    DOT = 16;
    DOT_GAP = 3;
    GRID_GAP = 6;
  } else
  if (min_sats <= 40000) {
    COLUMNS = 20;
    DOT = 6;
    DOT_GAP = 2;
    GRID_GAP = 4;
  } else
  if (min_sats <= 156000) {
    COLUMNS = 40;
    DOT = 4;
    DOT_GAP = 1;
    GRID_GAP = 2;
  } else
  if (min_sats <= 512000) {
    COLUMNS = 80;
    DOT = 2;
    DOT_GAP = 1;
    GRID_GAP = 2;
  } else
  if (min_sats <= 1520000) {
    COLUMNS = 160;
    DOT = 1;
    DOT_GAP = 1;
    GRID_GAP = 2;
  } else
    return;

  BLOCK = (DOT * 10) + (DOT_GAP * 9) + GRID_GAP;

  var sats = Math.floor(1e8 / price);

  console.log(`sats: ${sats}`)

  var buffer = createImage(sats, date);

  fs.writeFileSync(`output/img-${date}.png`, buffer);
}

function createInto() {
  pixels.fill(0xFF000000);

  imageData.data.set(new Uint8ClampedArray(buffer));
  ctx.putImageData(imageData, 0, 0);

  ctx.fillStyle = `white`;
  ctx.textAlign = 'center'
  ctx.font = `80px DejaVu Sans Mono`;
  ctx.fillText(`sats per dollar`, WIDTH / 2, HEIGHT / 3);

  fs.writeFileSync(`img-intro1.png`, canvas.toBuffer());

  ctx.font = `60px DejaVu Sans Mono`;
  ctx.fillText(`8 years`, WIDTH / 2, (HEIGHT / 3) + 100);

  fs.writeFileSync(`img-intro2.png`, canvas.toBuffer());

  ctx.font = `40px DejaVu Sans Mono`;
  ctx.fillText('a satoshi is the smallest unit of bitcoin', WIDTH / 2, (HEIGHT / 3) + 200)
  ctx.fillText('one bitcoin consist of 100.000.000 satoshi', WIDTH / 2, (HEIGHT / 3) + 250)
  ctx.fillText(`a single dot is one satoshi`, WIDTH / 2, (HEIGHT / 3) + 300);

  fs.writeFileSync(`img-intro3.png`, canvas.toBuffer());

  ctx.fillText(`each frame shows the number of satoshi per dollar on a given date`, WIDTH / 2, (HEIGHT / 3) + 400);
  ctx.fillText(`starting 8 years ago, up to now`, WIDTH / 2, (HEIGHT / 3) + 450);

  fs.writeFileSync(`img-intro4.png`, canvas.toBuffer());
}

function createImage(sats, date) {
  color.next();
  
  var background = color.background();
  var foreground = color.foreground();
  
  var width = getWidth();
  var height = getHeight(sats);

  pixels.fill(0xFF000000);

  var ox = (WIDTH - width) >> 1;
  var oy = (HEIGHT - height) >> 1;

  drawBackground(pixels, background, WIDTH, width, height, ox, oy);

  drawDots(pixels, foreground, WIDTH, ox, oy, sats);

  imageData.data.set(new Uint8ClampedArray(buffer));
  ctx.putImageData(imageData, 0, 0);
  ctx.font = `${FONT_SIZE}px DejaVu Sans Mono`;
  ctx.imageSmoothingEnabled = false;

  ctx.textAlign = 'left'
  ctx.fillText('We are all hodlonaut', ox, oy + height + ((BORDER + FONT_SIZE) >> 1));

  ctx.textAlign = 'right'
  ctx.fillText('CSW is a fraud', ox + width, oy + height + ((BORDER + FONT_SIZE) >> 1));

  ctx.fillStyle = `white`;
  ctx.textAlign = 'left'
  ctx.font = `32px DejaVu Sans Mono`;
  ctx.fillText(`sats per dollar ${sats}`, ox, 35);

  ctx.textAlign = 'right'
  ctx.fillText(date, ox + width, 35);

  return canvas.toBuffer();
}

function getHeight(sats) {
  var rows = Math.ceil(sats / (COLUMNS * 100));
  return (rows * 10 * DOT) + (rows * 9 * DOT_GAP) + ((rows - 1) * GRID_GAP);
}

function getWidth() {
  return (COLUMNS * 10 * DOT) + (COLUMNS * 9 * DOT_GAP) + ((COLUMNS - 1) * GRID_GAP);
}

function drawBackground(pixels, foreground, WIDTH, width, height, ox, oy) {
  ox -= BORDER;
  oy -= BORDER;
  width += BORDER << 1;
  height += BORDER << 1;
  
  var circle = getCircle()

  var x = ox + ((oy + RADIUS) * WIDTH);
  for (var i = 0; i <= height - RADIUS - RADIUS; i++) {
    pixels.fill(foreground, x, x + width);
    x += WIDTH;
  }
  var x = ox + RADIUS + (oy * WIDTH);
  var x2 = (height - RADIUS - 1) * WIDTH;
  for (var i = 0; i <= RADIUS; i++) {
    var c1 = circle[RADIUS - i];
    pixels.fill(foreground, x - c1, x + width + c1 - RADIUS - RADIUS);
    var c2 = circle[i];
    pixels.fill(foreground, x + x2 - c2, x + x2 + width + c2 - RADIUS - RADIUS);
    x += WIDTH;
  }
}

function drawDots(pixels, foreground, WIDTH, ox ,oy, sats) {
  var ax = 0, ay = 0, bx = 0, by = 0;
  
  for (var i = 0; i < sats; i++) {

    var x = ox + (ax * (DOT + DOT_GAP)) + (bx * BLOCK);
    var y = oy + (ay * (DOT + DOT_GAP)) + (by * BLOCK);
    
    dot(pixels, WIDTH, x, y, foreground);
    
    ax++;
    if (ax == GRID) {
      ax = 0;
      ay++;
    }
    
    if (ay == GRID) {
      bx++;
      ay = 0;
    }
    
    if (bx == COLUMNS) {
      by++;
      bx = 0;
    }
  }
}

function getCircle() {
  var circle = new Array(RADIUS);
  circle[0] = RADIUS;

  var x = 0;
  var y = RADIUS;
  var d = 3 - (2 * RADIUS);
 
  while(x <= y) {
    if(d <= 0) {
      d = d + (4 * x) + 6;
    } else {
      d = d + (4 * x) - (4 * y) + 10;
      y--;
    }
    x++;

    circle[x] = y;
    circle[y] = x;
  }

  return circle;
}

function dot(pixels, WIDTH, x, y, foreground) {
  var p = (y * WIDTH) + x;
  for (var i = 0; i < DOT; i++) {
    pixels.fill(foreground, p, p + DOT);
    p += WIDTH;
  }
}
