
import Entity from './Entity';
import { clamp } from '../util';
import ViewPort from '../view/ViewPort';

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
    this.gameModel = opts.gameModel;
    this.bullets = opts.bullets;
    this.hitbox = new Entity({
      x: this.x + this.width/2,
      y: this.y + this.height/2,
      width: 15,
      height: 15,
      speed: this.speed
    });
  }

  setWeapon(weapon) {
    this.weapon = weapon;
  }

  update(keysDown) {
    let cameraSpeed = this.speed * 0.2;
    if (keysDown[65]) { //A
      this.x -= this.speed;
      ViewPort.worldX -= cameraSpeed;
    }
    if (keysDown[87]) { //W
      this.y -= this.speed;
      ViewPort.worldY -= cameraSpeed;
    }
    if (keysDown[68]) { //D
      this.x += this.speed;
      ViewPort.worldX += cameraSpeed;
    }
    if (keysDown[83]) { //S
      this.y += this.speed;
      ViewPort.worldY += cameraSpeed;
    }

    if (keysDown[32]) {
      this.shooting = true;
    } else {
      this.shooting = false;
    }
    ViewPort.worldX = clamp(ViewPort.worldX, 0, this.gameModel.width - ViewPort.width);
    ViewPort.worldY = clamp(ViewPort.worldY, 0, this.gameModel.height - ViewPort.height);
    this.x = clamp(this.x, 0, this.gameModel.width - this.width);
    this.y = clamp(this.y, 0, this.gameModel.height - this.height);
    this.hitbox.x = this.x + this.width/2  - (this.hitbox.width / 2);
    this.hitbox.y = this.y + this.height/2 - (this.hitbox.height / 2);

    if (this.dead) {
      this.score = 0;
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
