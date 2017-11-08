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
      gameModel.animator = window.requestAnimationFrame(start);
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
  speed: 5,
  weapon: new Weapon({
    bulletTimeout: 6,
    bulletSpeed: 3
  })
});

gameModel.player = plr;
gameModel.score = score;
gameModel.highScore = highScore;
gameModel.update = function() {
  plr.update(keysDown);
  updatePlayerBullets();
  gameModel.updateEnemies();
  gameModel.updateActiveBullets();
  updateStars();
}

function start() {
  gameModel.animator = window.requestAnimationFrame(start);
  gameModel.update();
  draw();
}

var shotsFired = 0;
function updatePlayerBullets() {
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
  if (plr.weapon.ticksUntilNextFire !== 0) plr.weapon.ticksUntilNextFire -= 1;
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

function draw() {
  fillBackDefault(ctx, gameModel.viewport.width, gameModel.viewport.height);
  drawPlayer();
  drawPlayerBullets();
  drawStars();
  drawEnemies();
  drawActiveBullets();
  drawText();
}

function toViewCoord(x, y) {
  return {
    x: (x - gameModel.viewport.worldX),
    y: (y - gameModel.viewport.worldY)
  };
}

function drawPausedText() {
  ctx.font = '48px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff0000';
  ctx.fillText('Paused', gameModel.viewport.width / 2, gameModel.viewport.height / 2);
}

function drawPlayer() {
  let viewCoord = toViewCoord(plr.x, plr.y);
  let x = clamp(viewCoord.x, 0, gameModel.viewport.width - plr.width);
  let y = clamp(viewCoord.y, 1, gameModel.viewport.height - plr.height);

  if (!plr.dead) {
    ctx.drawImage(plr.sprite, x, y);
    viewCoord = toViewCoord(plr.hitbox.x, plr.hitbox.y);
    ctx.beginPath();
    ctx.rect(x + plr.width/2 - plr.hitbox.width/2, y + plr.height/2 - plr.hitbox.height/2, plr.hitbox.width, plr.hitbox.height);
    ctx.fillStyle = '#ff0000';
    ctx.fill();
  } else {
    viewCoord = toViewCoord(plr.hitbox.x, plr.hitbox.y);
    ctx.beginPath();
    ctx.rect(viewCoord.x, viewCoord.y, plr.hitbox.width, plr.hitbox.height);
    ctx.fillStyle = '#ff0000';
    ctx.fill();
  }
}

function drawStars() {
  stars.forEach(function(s) {
    let viewCoord = toViewCoord(s.x, s.y);
    drawCircle(ctx, viewCoord.x, viewCoord.y, s.size, s.clr);
    if (s.trail) {
      for (var i = 0; i < s.trail; i++) {
        var op = (0.05 * i + 1);
        drawRect(ctx, 'rgba(255, 0, 155, ' + op + ')', viewCoord.x, s.y - i * 3, s.size - (0.23 * i));
      }
    }
  });
}

function drawPlayerBullets() {
  for (var i = 0; i < plr.bullets.length; i++) {
    let bul = plr.bullets[i];
    let viewCoord = toViewCoord(bul.x, bul.y);
    if (!bul.dead) {
      drawRect(ctx, bul.color, viewCoord.x, viewCoord.y, 8);
    }
  }
}

function drawActiveBullets() {
  gameModel.activeBullets.forEach((b) => {
    let viewCoord = toViewCoord(b.x, b.y);
    drawRect(ctx, '#0000ff', viewCoord.x, viewCoord.y, 11);
  });
}

function drawEnemies() {
  gameModel.enemies.forEach(function(e) {
    let viewCoord = toViewCoord(e.x, e.y);
    if (!e.dead) drawRect(ctx, '#00ff00', viewCoord.x, viewCoord.y, e.width);
    e.weapon.bullets.forEach((b) => {
      let viewCoord = toViewCoord(b.x, b.y);
      drawRect(ctx, '#0000ff', viewCoord.x, viewCoord.y, 11);
    });
  });
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

gameModel.audioFactory.init()
  .then(assets => {
    start();
  });
