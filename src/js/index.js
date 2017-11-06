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
  drawRect,
  drawCircle
} from './view';

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
  x: (gameModel.width / 2),
  y: (gameModel.height / 2),
  width: 85,
  height: 85,
  score: score,
  sprite: playerImage,
  bullets: [],
  speed: 8
});

gameModel.player = plr;
gameModel.score = score;
gameModel.highScore = highScore;
let weapon1 = new Weapon({
  bulletTimeout: 6,
  bulletSpeed: 3
});
plr.weapon = weapon1;

var numEnemies = 2

const audioFactory = new AudioFactory();
gameModel.audioFactory = audioFactory;
gameModel.initEnemies();
gameModel.update = function() {
  gameModel.animator = window.requestAnimationFrame(gameModel.update);
  update();
  draw();
}

function update() {
  plr.update(keysDown);
  gameModel.updateEnemies();
  gameModel.updateActiveBullets();
  updateStars();
}

function drawPausedText() {
  ctx.font = '48px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff0000';
  ctx.fillText('Paused', gameModel.viewport.width / 2, gameModel.viewport.height / 2);
}

function drawText() {
  statsCtx.beginPath();
  statsCtx.rect(0, 0, 400, 400);
  statsCtx.fillStyle = '#000';
  statsCtx.fill();
  statsCtx.font = '16px monospace';
  statsCtx.fillStyle = '#ff0000';
  statsCtx.fillText('score: ' + gameModel.player.score, 20, 20);
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
  drawActiveBullets();
}

function drawPlayer() {

  let viewCoord = {
    x: (plr.x - gameModel.viewport.worldX),
    y: (plr.y - gameModel.viewport.worldY)
  };
  let x = clamp(viewCoord.x, 0, gameModel.viewport.width - plr.width);
  let y = clamp(viewCoord.y, 0, gameModel.viewport.height - plr.height);

  if (!plr.dead) {
    ctx.drawImage(plr.sprite, x, viewCoord.y);
    viewCoord = {
      x: plr.hitbox.x - gameModel.viewport.worldX,
      y: plr.hitbox.y - gameModel.viewport.worldY
    };
    ctx.beginPath();
    ctx.rect(viewCoord.x, viewCoord.y, plr.hitbox.width, plr.hitbox.height);
    ctx.fillStyle = '#ff0000';
    ctx.fill();
    // drawCircle(ctx, viewCoord.x + plr.width / 2 - plr.hitbox.width, viewCoord.y + plr.height / 2 + plr.hitbox.width, 14, `#f900a6`);
    // drawCircle(ctx, viewCoord.x + plr.width / 2, viewCoord.y + plr.height / 2, 10, `#05e7fc`);
    // drawCircle(ctx, viewCoord.x + plr.width / 2, viewCoord.y + plr.height / 2, 5, `#f900a6`);
  } else {
    viewCoord = {
      x: plr.hitbox.x - gameModel.viewport.worldX,
      y: plr.hitbox.y - gameModel.viewport.worldY
    };
    ctx.beginPath();
    ctx.rect(viewCoord.x, viewCoord.y, plr.hitbox.width, plr.hitbox.height);
    ctx.fillStyle = '#ff0000';
    ctx.fill();
  }
}

function updateStars() {
  stars.forEach(function(s) {
    s.y += s.speed;
    if (s.y > gameModel.height) {
      s.y = -10;
      s.x = getRandomInt(1, gameModel.width);
    }
  });
}

function toViewCoord(dist, x, y) {
  return {
    x: (x - gameModel.viewport.worldX),
    y: (y - gameModel.viewport.worldY)
  };
}

function drawStars() {
  stars.forEach(function(s) {
    let viewCoord = toViewCoord(s.distance, s.x, s.y);
    drawCircle(ctx, viewCoord.x, viewCoord.y, s.size, s.clr);
    if (s.trail) {
      for (var i = 0; i < s.trail; i++) {
        var op = (0.05 * i + 1);
        drawRect(ctx, 'rgba(255, 0, 155, ' + op + ')', viewCoord.x, s.y - i * 3, s.size - (0.23 * i));
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
        color: '#ff0000'
      }));
      plr.weapon.ticksUntilNextFire = plr.weapon.getBulletTimeout();
  }
  for (var i = 0; i < plr.bullets.length; i++) {
      let bul = plr.bullets[i];
      let viewCoord = {
        x: (bul.x - gameModel.viewport.worldX),
        y: (bul.y - gameModel.viewport.worldY)
      }
      if (!bul.dead) {
        drawRect(ctx, bul.color, viewCoord.x, viewCoord.y, 8);
      }
  }
}

function drawActiveBullets() {
  gameModel.activeBullets.forEach((b) => {
    let viewCoord = {
      x: b.x - gameModel.viewport.worldX,
      y: b.y - gameModel.viewport.worldY
    };
    drawRect(ctx, '#0000ff', viewCoord.x, viewCoord.y, 11);
  });
}

function drawEnemies() {
  gameModel.enemies.forEach(function(e) {
    let viewCoord = {
      x: e.x - gameModel.viewport.worldX,
      y: e.y - gameModel.viewport.worldY
    };
    if (!e.dead) drawRect(ctx, '#00ff00', viewCoord.x, viewCoord.y, e.width);
    e.weapon.bullets.forEach((b) => {
      let viewCoord = {
        x: b.x - gameModel.viewport.worldX,
        y: b.y - gameModel.viewport.worldY
      };
      drawRect(ctx, '#0000ff', viewCoord.x, viewCoord.y, 11);
    });
  });
}

gameModel.audioFactory.init()
  .then(assets => {
    gameModel.update();
  });
