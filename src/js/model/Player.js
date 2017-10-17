
import Entity from './Entity';
import { clamp } from '../util';

export default class Player extends Entity {
  constructor(opts) {
    var opts = opts || {}
    super(opts);
    this.sprite = opts.sprite || null;
    this.weapon = opts.weapon || null;
    this.speed = opts.speed || null;
    this.dead = opts.dead || false;
    this.score = opts.score || 0;
    this.deathTimeout = opts.deathTimeout || 4;
    this.canShoot = opts.canShoot
    this.gameModel = opts.gameModel;
    this.bullets = opts.bullets;
  }

  setWeapon(weapon) {
    this.weapon = weapon;
  }

  update(keysDown) {
    if (keysDown[65]) { //A
      this.x -= this.speed;
    }
    if (keysDown[87]) { //W
      this.y -= this.speed;
    }
    if (keysDown[68]) { //D
      this.x += this.speed;
    }
    if (keysDown[83]) { //S
      this.y += this.speed;
    }

    if (keysDown[32]) {
      this.shooting = true;
    } else {
      this.shooting = false;
    }

    this.x = clamp(this.x, 0, this.gameModel.width - this.width);
    this.y = clamp(this.y, 0, this.gameModel.height - this.height);

    if (this.dead) {
      this.score = 0;
      this.x = -100;
      this.y = -100;
      this.deathTimeout--;
      if (this.deathTimeout === 0) {
        this.x = this.gameModel.width / 2;
        this.y = this.gameModel.height - 300;
        this.dead = false;
        this.gameModel.enemies.forEach(function(e) {
          e.y = -200;
        });
        this.gameModel.timer = setInterval(() => {
          if (this.gameModel.active) this.gameModel.time++;
        }, 1000);
        this.gameModel.initEnemies();
      }
    }
  }
}
