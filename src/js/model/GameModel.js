import EventEmitter from 'events';
import * as Events from './GameEvents';
import GameEvents from './GameEvents';
import ViewPort from '../view/ViewPort';
import Enemy from './Enemy';
import Weapon from './Weapon';

import { getRandomInt, getRand } from '../util';

// const canvasWidth = 1100;
// const canvasHeight = window.innerHeight;
let animator = null;

class GameModel {
  constructor() {
    this.width = ViewPort.width + 200;
    this.height = ViewPort.height + 400;
    this.viewport = ViewPort;
    this.timer = null;
    this.time = null;
    this.active = true;
    this.animator = animator;
    this.time = 0;
    this.timer = setInterval(() => {
      if (this.active) {
        this.time++;
      }
    }, 1000);

    this.numEnemies = 5;
    this.enemies;
    this.player;

    this.events = new EventEmitter();
  }

  update() {
    this.updateEnemies();
  }

  draw() {

  }

  updatePlayer() {
    this.player.update();
  }

  initEnemies() {
    this.enemies = [];
    for (var i = 0; i < this.numEnemies; i++) {
      this.enemies.push(new Enemy({
        x: getRandomInt(1, this.width - 40),
        y: -20,
        speed: getRand(1, 3.5),
        width: 40,
        height: 40,
        dead: false,
        weapon: new Weapon({})
      }));
    }
  }

  updateEnemies()  {
    if (this.enemies.length === 0) {
      this.initEnemies();
    }
    this.enemies.forEach((e) => {
      e.y += e.speed;
      e.weapon.bullets.forEach((b) => {
        b.x += b.xSpeed;
        b.y += b.ySpeed;
      })
    });
    this.enemies = this.enemies.filter((e) => {
      return e.y < this.height;
    });
    this.enemies.forEach((e) => {
      if (e.canFire()) {
        e.fire({x: this.player.x - (this.player.width/2), y: this.player.y - (this.player.height/2)});
      }
      if (!e.dead && e.collision(this.player)) {
        this.handleEvent(GameEvents.EXPLOSION);
        this.player.dead = true;
        this.player.deathTimeout = 300;
        if (this.player.score > this.highScore) this.highScore = this.player.score;
        this.player.score = 0;
        this.time = 0;
        clearInterval(this.timer);
      }
      if (this.player.bullets) {
        this.player.bullets.forEach((b) => {
          if (b.collision(e)) {
            if (!e.dead) {
              this.handleEvent(GameEvents.EXPLOSION);
              b.dead = true;
              e.dead = true;
              this.player.score++;
            }
          }
        });
      }
    });
  }

  handleEvent(event) {
    switch (event) {
      case GameEvents.EXPLOSION: this.audioFactory.playShipExplosion();
        break;
      case GameEvents.WEAPON_FIRE: this.audioFactory.playWeaponFire();
        break;
      case GameEvents.PAUSE: this.audioFactory.playPauseGame();
        break;
      default: throw new Error('Unknown game event passed to handleEvent.');
        break;
    }
  }
}

export default new GameModel();
