import EventEmitter from 'events';
import * as Events from './GameEvents';
import GameEvents from './GameEvents';
const canvasWidth = 1100;
const canvasHeight = window.innerHeight;
let animator = null;

class GameModel {
  constructor() {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.timer = null;
    this.time = null;
    this.active = true;
    this.initEnemies = null
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
    if (this.enemies.length === 0) {
      // initEnemies();
    }
    this.enemies.forEach((e) => {
      e.y += e.speed;
    });
    this.enemies = this.enemies.filter((e) => {
      return e.y < this.height;
    });
    this.enemies.forEach((e) => {
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
    if (event === GameEvents.EXPLOSION) {
      this.audioFactory.playShipExplosion();
    }
    if (event === GameEvents.WEAPON_FIRE) {
      this.audioFactory.playWeaponFire();
    }

    if (event === GameEvents.PAUSE) {
      this.audioFactory.playPauseGame();
    }
  }
}

export default new GameModel();
