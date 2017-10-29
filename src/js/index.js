
import { clamp, getRand, getRandomInt } from './util';
import Player from './model/Player';
import Sprite from './view/Sprite';
import Enemy from './model/Enemy';
import Bullet from './model/Bullet';
import Weapon from './model/Weapon';

import { c, ctx } from './view/CanvasContext';
import gameModel from './model/GameModel';
import AudioFactory from './Audio/AudioFactory';
import GameEvents from './model/GameEvents';
import initStars from './model/Stars';
import { loadSound, playSound } from './Audio';


import {
  fillBackDefault,
  drawRect
} from './view';
console.log('GameModel: ', gameModel)
var stars = initStars();

var score = 0;
var highScore = 0;
let FPS = 10;
let animator = null;

var keysDown = {};

let domBody = document.getElementsByTagName('body')[0];

domBody.addEventListener('keydown', function(e) {
  keysDown[e.which] = true;
  if (keysDown[32]) plr.shooting = true;
  console.log('player shooting ')
});

domBody.addEventListener('keyup', function(e) {
  keysDown[e.which] = false;
  if (e.which === 80) {
    gameModel.active = !gameModel.active;
    if (gameModel.active === true) {
      gameModel.animator = window.requestAnimationFrame(gameModel.update);
      gameModel.handleEvent(GameEvents.PAUSE);
    } else {
      gameModel.handleEvent(GameEvents.PAUSE);
      drawPausedText();
      window.cancelAnimationFrame(gameModel.animator);
    }
  }

  if (e.which === 32) {
    plr.shooting = false;
  }
});

var domStats = document.getElementById('stats');
var statsCtx = domStats.getContext('2d')
domStats.setAttribute('width', 200);
domStats.setAttribute('height', 200);

var playerImage = new Image();
playerImage.src = 'images/medfighter.png';
var plr = new Player({
  gameModel: gameModel,
  x: (gameModel.viewport.width / 2),
  y: (gameModel.viewport.height / 2),
  width: 85,
  height: 85,
  score: score,
  sprite: playerImage,
  bullets: [],
  speed: 10
});

gameModel.player = plr;
gameModel.score = score;
gameModel.highScore = highScore;
let weapon1 = new Weapon({
  bulletTimeout: 6,
  bulletSpeed: 3
});
plr.weapon = weapon1;

var numEnemies = 10
var enemies = [];
function initEnemies() {
  enemies = [];
  for (var i = 0; i < numEnemies; i++) {
    enemies.push(new Enemy({
      x: getRandomInt(1, gameModel.width - 40),
      y: -20,
      speed: getRand(1, 3.5),
      width: 40,
      height: 40,
      dead: false
    }));
  }
}

// initEnemies();

const audioFactory = new AudioFactory();
gameModel.audioFactory = audioFactory;
gameModel.enemies = enemies;
gameModel.initEnemies = initEnemies;
gameModel.update = function() {
  gameModel.animator = window.requestAnimationFrame(gameModel.update);
  update();
  draw();
}

function update() {
  plr.update(keysDown);
  gameModel.updateEnemies();
  updateStars();
}

function drawPausedText() {
  ctx.font = '48px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff0000';
  ctx.fillText('Paused', gameModel.width / 2, gameModel.height / 2);
}

function drawText() {
  statsCtx.beginPath();
  statsCtx.rect(0, 0, 400, 400);
  statsCtx.fillStyle = '#000';
  statsCtx.fill();
  statsCtx.font = '16px monospace';
  statsCtx.fillStyle = '#ff0000';
  statsCtx.fillText('score: ' + score, 20, 20);
  statsCtx.fillText('high Score: ' + gameModel.highScore, 20, 40);
  statsCtx.fillText('time: ' + gameModel.time, 20, 60);
}

function draw() {
  fillBackDefault(ctx, gameModel.viewport.width, gameModel.viewport.height);
  drawPlayer();
  drawText();
  drawBullets();
  drawStars();
  drawEnemies();
}

function drawPlayer() {
  if (!plr.dead) {
    ctx.drawImage(plr.sprite, plr.x, plr.y);
    // drawRect(ctx, '#ff0000', plr.x, plr.y, 6);
    ctx.beginPath();
    // ctx.rect(plr.x, plr.y, plr.width, plr.height);
    ctx.strokeStyle = '#f9e003';
    ctx.stroke();
  }
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

function toViewCoord(dist, x, y) {
  return {
    x: (x + (x - gameModel.viewport.worldX) * dist),
    y: (y + (y - gameModel.viewport.worldY) * dist) * 0.5
  };
}

function drawStars() {
  stars.forEach(function(s) {
    let viewCoord = toViewCoord(s.distance, s.x, s.y);
    drawRect(ctx, s.clr, viewCoord.x, viewCoord.y, s.size);
    if (s.trail) {
      for (var i = 0; i < s.trail; i++) {
        var op = (0.05 * i + 1);
        drawRect(ctx, 'rgba(255, 0, 155, ' + op + ')', viewCoord.x, viewCoord.y - i * 3, s.size - (0.23 * i));
      }
    }
  });
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
  if (plr.weapon.ticksUntilNextFire !== 0) plr.weapon.ticksUntilNextFire -= modifier;
  if (!plr.dead && plr.shooting && plr.weapon.ticksUntilNextFire === 0) {
      shotsFired++;
      gameModel.handleEvent(GameEvents.WEAPON_FIRE);
      plr.bullets.push(new Bullet({
        x: plr.x + plr.width / 2,
        y: plr.y,
        width: 5,
        height: 5,
        dead: false,
        color: '#f97f04'
      }));
      plr.weapon.ticksUntilNextFire = plr.weapon.getBulletTimeout();
  }
  for (var i = 0; i < plr.bullets.length; i++) {
      let bul = plr.bullets[i];
      if (!bul.dead) drawRect(ctx, bul.color, bul.x, bul.y, 10);
  }
}

function drawEnemies() {
  enemies.forEach(function(e) {
    if (!e.dead) drawRect(ctx, '#00ff00', e.x, e.y, e.width);
  });
}

audioFactory.init()
  .then(assets => {
    gameModel.update();
  });
