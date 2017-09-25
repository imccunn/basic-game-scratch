
import path from 'path';
import { clamp } from './util';
import Player from './model/Player';
import gameModel from './model/GameModel';
import initStars from './model/Stars';

console.log('Game starting...');

var stars = initStars();

const WIDTH = gameModel.width;
const HEIGHT = gameModel.height;

var bulletSound = null;
var enemyExplosion = null;
var score = 0;
var highScore = 0;
let FPS = 10;
let animator = null;

var keysDown = {};

$('body').bind('keydown', function(e) {
  keysDown[e.which] = true;
});

$('body').bind('keyup', function(e) {
  keysDown[e.which] = false;
  if (e.which === 80) {
    gameModel.active = !gameModel.active;
    if (gameModel.active === true) {
      gameModel.animator = window.requestAnimationFrame(gameModel.update);
      playSound(clickSound);
    } else {
      playSound(clickSound);
      drawPausedText();
      window.cancelAnimationFrame(animator);
    }
  }
});

$('body').bind('keyup', function(e) {
  if (e.which === 32) playerFired();
});

var canvas = $('#c')[0].getContext('2d');
$('#c').attr('width', WIDTH);
$('#c').attr('height', HEIGHT);
var statsCtx = $('#stats')[0].getContext('2d')
$('#stats').attr('width', 200);
$('#stats').attr('height', 200);

var playerImage = new Image();
playerImage.src = 'images/medfighter.png';
var plr = new Player({
  gameModel: gameModel,
  score: score
});
plr.sprite = playerImage;
plr.bullets = [];
plr.speed = 10;
plr.canShoot = true;
plr.bulletTimeout = 15;
plr.x = (gameModel.width / 2);
plr.y = (gameModel.height / 2);
plr.width = 85;
plr.height = 85;

var numEnemies = 10
var enemies = [];
function initEnemies() {
  enemies = [];
  for (var i = 0; i < numEnemies; i++) {
    enemies.push({
      x: getRandomInt(1, gameModel.width - 40),
      y: -20,
      speed: getRand(1, 3.5),
      width: 40,
      height: 40,
      dead: false
    });
  }
}

initEnemies();
gameModel.enemies = enemies;
gameModel.initEnemies = initEnemies;
gameModel.update = function() {
  gameModel.animator = window.requestAnimationFrame(gameModel.update)
  update();
  draw();
}

function fillBackDefault() {
  canvas.beginPath();
  canvas.rect(0, 0, gameModel.width, gameModel.height);
  canvas.fillStyle = '#000';
  canvas.fill();
  canvas.closePath();
}

function update() {
  plr.update(keysDown);
  updateEnemies();
  updateStars();
}

function updateEnemies() {
  if (gameModel.time !== 0 && gameModel.time % 10 === 0) {
    for (var i = 0; i < 1; i++) {
      enemies.push({
        x: getRandomInt(10, gameModel.width - 50),
        y: -20,
        speed: getRand(1, 3.5),
        width: 40,
        height: 40,
        dead: false
      });
    }
  }
  enemies.forEach((e) => {
    e.y += e.speed;
  });
  enemies = enemies.filter(function(e) {
    return e.y < gameModel.height;
  });
  enemies.forEach(function(e) {
    if (!e.dead && checkCollision(e, plr)) {
      playSound(enemyExplosion);
      plr.dead = true;
      plr.deathTimeout = 300;
      if (score > highScore) highScore = score;
      score = 0;
      gameModel.time = 0;
      clearInterval(gameModel.timer);
    }
    if (plr.bullets) {
      plr.bullets.forEach(function(b) {
        if (checkCollision(b, e)) {
          if (!e.dead) {
            playSound(enemyExplosion);
            explosionSprite.x = e.x;
            explosionSprite.y = e.y
            explosionSprite.render();
            b.dead = true;
            e.dead = true;
            score++;
          }
        }
      });
    }
  });
}

function drawPausedText() {
  canvas.font = '48px monospace';
  canvas.textAlign = 'center';
  canvas.fillStyle = '#ff0000';
  canvas.fillText('Paused', gameModel.width / 2, gameModel.height / 2);
}

function drawText() {
  statsCtx.beginPath();
  statsCtx.rect(0, 0, 400, 400);
  statsCtx.fillStyle = '#000';
  statsCtx.fill();
  statsCtx.font = '16px monospace';
  statsCtx.fillStyle = '#ff0000';
  statsCtx.fillText('score: ' + score, 20, 20);
  statsCtx.fillText('high Score: ' + highScore, 20, 40);
  statsCtx.fillText('time: ' + gameModel.time, 20, 60);
}

function draw() {
  fillBackDefault();
  drawPlayer();
  drawText();
  drawBullets();
  drawStars();
  drawEnemies();
}

function drawPlayer() {
  if (!plr.dead) {
    canvas.drawImage(plr.sprite, plr.x, plr.y);
    drawRect('#ff0000', plr.x, plr.y, 6)
    canvas.beginPath();
    canvas.rect(plr.x, plr.y, plr.width, plr.height);
    canvas.strokeStyle = '#f9e003';
    canvas.stroke();
  }
}

function drawRect(clr, posx, posy, size) {
  canvas.beginPath();
  canvas.rect(posx, posy, size, size);
  canvas.fillStyle = clr;
  canvas.fill();
}

function updateStars() {
  stars.forEach(function(s) {
    s.y += 0.4 * s.distance;
    if (s.y > gameModel.height) {
      s.y = -10;
      s.x = getRandomInt(1, gameModel.width);
    }
  });
}

function drawStars() {
  stars.forEach(function(s) {
    drawRect(s.clr, s.x, s.y, s.size);
    if (s.trail) {
      for (var i = 0; i < s.trail; i++) {
        var op = (0.05 * i + 1);
        drawRect('rgba(255, 0, 155, ' + op + ')', s.x, s.y - i * 3, s.size - (0.23 * i));
      }
    }
  });
}

function playerFired() {
  plr.bulletTimeout = 4;
}

var shotsFired = 0;
var modifier = 1;
function drawBullets() {
  let bulletSpeed = 15;
  plr.bullets = plr.bullets.filter(function(b) {
    var stillActive = true;
    if (b.y < 0 || b.dead) stillActive = false;
    return stillActive;
  });
  for (var i = 0; i < plr.bullets.length; i++) {
    let bul = plr.bullets[i];
    bul.y -= bulletSpeed;
  }

  if (plr.bulletTimeout !== 0) plr.bulletTimeout -= modifier;
  if (!plr.dead && plr.shooting && plr.canShoot && plr.bulletTimeout === 0) {
      shotsFired++;
      playSound(bulletSound)
      plr.bullets.push({
        x: plr.x + plr.width / 2,
        y: plr.y,
        width: 5,
        height: 5,
        dead: false
      });
      plr.bulletTimeout = 4;
  }
  for (var i = 0; i < plr.bullets.length; i++) {
      let bul = plr.bullets[i];
      if (!bul.dead) drawRect('#f97f04', bul.x, bul.y, 10);
  }
}

function drawEnemies() {
  enemies.forEach(function(e) {
    if (!e.dead) drawRect('#00ff00', e.x, e.y, e.width);
  });
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRand(min, max) {
  return Math.random() * (max - min) + min;
}

function checkCollision(source, target) {
  var sourceXLo = source.x;
  var sourceXHi = sourceXLo + source.width;
  var sourceYLo = source.y;
  var sourceYHi = sourceYLo + source.height;

  var targetXLo = target.x;
  var targetXHi = targetXLo + target.width;
  var targetYLo = target.y;
  var targetYHi = targetYLo + target.height;

  var xOverlap = (sourceXLo <= targetXHi) && (sourceXHi >= targetXLo);
  var yOverlap = (sourceYLo <= targetYHi) && (sourceYHi >= targetYLo);

  return xOverlap && yOverlap;
}

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
function playSound(buffer) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
}

function loadSound(path, cb) {
  let request = new XMLHttpRequest();
  request.open('GET', path, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      if (buffer) {
        cb(buffer)
      }
    }, function(error) {
      console.log('error: ', error)
    });
  };
  request.send();
}

var explosionImage = new Image();
explosionImage.src = 'images/explosion_3.png';

var explosionSprite = sprite({
  context: canvas,
  width: 97,
  height: 4365,
  image: explosionImage,
  numFrames: 45,
  x: 0,
  y: 0
});

function doExplosionSprite() {
  explosionSprite.update();
  explosionSprite.render();
}

function sprite(opt) {
  var sprite = {
    context: opt.context,
    width: opt.width,
    height: opt.height,
    image: opt.image,
    numFrames: opt.numFrames,
    x: opt.x,
    y: opt.y
  };
  var frameIndex = 0;
  var tickCount = 0;
  var ticksPerFrame = 1;

  sprite.render = function() {
    sprite.context.clearRect(0, 0, sprite.width, sprite.height);
    sprite.context.drawImage(
      sprite.image, // image object
      0, // sx
      frameIndex * sprite.height / sprite.numFrames, // sy
      sprite.width, //sw
      sprite.height / sprite.numFrames , // sh
      sprite.x, // dx
      sprite.y, // dy
      sprite.width, // dw
      sprite.height / sprite.numFrames // dh
    );
  };
  sprite.update = function() {
    tickCount += 1;
    if (frameIndex === 49) frameIndex = 0;
    if (tickCount > ticksPerFrame) {
      tickCount = 0;
      if (frameIndex < sprite.numFrames - 1) {
        frameIndex++;
      }
    }
  }
  return sprite;
}
var clickSound = null;
loadSound('audio/test.mp3', function(buff) {
  bulletSound = buff;
  loadSound('audio/test2.mp3', function(buff) {
    enemyExplosion = buff;
    loadSound('audio/click.mp3', function(buff) {
      clickSound = buff;
      gameModel.update();
    });
  });
});
