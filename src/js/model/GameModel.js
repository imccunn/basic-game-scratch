import EventEmitter from 'events';
import * as Events from './GameEvents';
import GameEvents from './GameEvents';
import ViewPort from '../view/ViewPort';
import Enemy from './Enemy';
import Weapon from './Weapon';
import AudioFactory from '../Audio/AudioFactory';

import { getRandomInt, getRand } from '../util';

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
    this.audioFactory = new AudioFactory();
    this.time = 0;
    this.timer = setInterval(() => {
      if (this.active) {
        this.time++;
      }
    }, 1000);

    this.numEnemies = 10;
    this.enemies;
    this.activeBullets = [];
    this.player;

    this.events = new EventEmitter();
  }

  update() {
    this.updateEnemies();
    this.updateActiveBullets();
  }

  draw() {

  }

  updatePlayer() {
    this.player.update();
  }

  initEnemies() {
    this.enemies = [];
    for (var i = 0; i < this.numEnemies; i++) {
      let x = getRandomInt(1, this.width - 40);
      this.enemies.push(new Enemy({
        x: x,
        y: -20,
        speed: getRand(1, 3.5),
        width: 40,
        height: 40,
        dead: false,
        weapon: new Weapon({x: x, y: -20})
      }));
    }
  }

  updateEnemies()  {
    if (this.enemies.length === 0) {
      this.initEnemies();
    }
    this.enemies.forEach((e) => {
      e.y += e.speed;

    });
    this.enemies = this.enemies.filter((e) => {
      return e.y < this.height;
    });
    this.activeBullets.forEach((b) => {
      if (b.collision(this.player.hitbox) && this.player.dead === false) {
        b.dead = true;
        this.handlePlayerDeath();
      }
    })
    this.enemies.forEach((e) => {
      if (e.canFire() && !e.dead) {
        this.activeBullets.push(e.fire({x: this.player.x + (this.player.width / 2), y: this.player.y + (this.player.height / 2)}));
      }

      e.weapon.bullets.forEach((b) => {
        if (b.collision(this.player.hitbox) && this.player.dead === false) {
          b.dead = true;
          this.handlePlayerDeath();
        }
      });
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

  updateActiveBullets() {
    this.activeBullets = this.activeBullets.filter((b) => {
      return !(b.x < 0 || b.x > this.width || b.y > this.height || b.y < 0 || b.dead);
    });
    this.activeBullets.forEach((b) => {
      if (b.dead) {
        b.x = b.x;
        b.y = b.y;
      } else {
        b.x += b.xSpeed;
        b.y += b.ySpeed;
      }
    });
  }

  handlePlayerDeath() {
    this.handleEvent(GameEvents.EXPLOSION);
    this.player.dead = true;
    this.player.deathTimeout = 300;
    if (this.player.score > this.highScore) this.highScore = this.player.score;
    this.player.score = 0;
    this.time = 0;
    clearInterval(this.timer);
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
