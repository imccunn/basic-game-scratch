import EventEmitter from 'events';
import * as Events from './GameEvents';
import GameEvents from './GameEvents';
import ViewPort from '../view/ViewPort';

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
    this.initEnemies = null;
    this.animator = animator;
    this.time = 0;
    this.timer = setInterval(() => {
      if (this.active) {
        this.time++;
      }
    }, 1000);

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

  updateEnemies()  {
    // if (this.enemies.length === 0) {
    //   initEnemies();
    // }
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
        e.fire({x: this.player.x, y: this.player.y});
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
