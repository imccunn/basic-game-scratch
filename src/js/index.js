
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
      dead: false,
      weapon: new Weapon({})
    }));
  }
}

initEnemies();

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
  ctx.fillText('Paused', gameModel.viewport.width / 2, gameModel.viewport.height / 2);
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
    let viewCoord = {
      x: (plr.x / gameModel.width) * gameModel.viewport.width,
      y: (plr.y / gameModel.height) * gameModel.viewport.height
    }
    let x = clamp(viewCoord.x, 0, gameModel.viewport.width - plr.width);
    let y = clamp(viewCoord.y, 0, gameModel.viewport.height - plr.height);
    ctx.drawImage(plr.sprite, x, viewCoord.y);
    drawCircle(ctx, viewCoord.x + plr.width / 2, viewCoord.y + plr.height / 2, 10, `#05e7fc`);
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
    x: (x + ((x - gameModel.viewport.worldX)* 0.4) * dist),
    y: (y + (y - gameModel.viewport.worldY) * dist) * 0.5
  };
}

function drawStars() {
  stars.forEach(function(s) {
    let viewCoord = toViewCoord(s.distance, s.x, s.y);
    drawCircle(ctx, viewCoord.x, s.y, s.size, s.clr);
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
        x: (bul.x / gameModel.width) * gameModel.viewport.width,
        y: (bul.y / gameModel.height) * gameModel.viewport.height
      }
      if (!bul.dead) {
        drawRect(ctx, bul.color, viewCoord.x, viewCoord.y, 8);
      }
  }
}

function drawEnemies() {
  enemies.forEach(function(e) {
    let viewCoord = {
      x: (e.x / gameModel.width) * gameModel.viewport.width,
      y: (e.y / gameModel.height) * gameModel.viewport.height
    };
    if (!e.dead) drawRect(ctx, '#00ff00', viewCoord.x, viewCoord.y, e.width);
    e.weapon.bullets.forEach((b) => {
      let viewCoord = {
        x: (b.x / gameModel.width) * gameModel.viewport.width,
        y: (b.y / gameModel.height) * gameModel.viewport.height
      };
      drawRect(ctx, '#0000ff', viewCoord.x, viewCoord.y, b.width);
    });
  });
}

audioFactory.init()
  .then(assets => {
    gameModel.update();
  });
