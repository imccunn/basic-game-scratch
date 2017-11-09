import Entity from './Entity';
import Bullet from './Bullet';

export default class Weapon extends Entity {

  constructor(opts) {
    super(opts);
    this.BULLET_TIMEOUT = opts.bulletTimeout || 5;
    this.ticksUntilNextFire = 0;
    this.bulletSpeed = opts.bulletSpeed;
    this.ammo = opts.ammo || 12;
    this.capacity = opts.capacity || 12;
    this.fireTimeout = 3000;
    this._canFire = true;
    this.bullets = [];
    for (var i = 0; i < this.capacity; i++) {
      this.bullets.push(new Bullet({
        x: this.x + this.width / 2,
        y: this.y + this.width,
        speed: 12,
        width: 5,
        height: 5,
        dead: false,
        color: '#00ff00',
        xSpeed: '',
        ySpeed: ''
      }));
    }
  }

  getBulletTimeout() {
    return this.BULLET_TIMEOUT;
  }

  canFire() {
    return this._canFire;
  }

  fire() {
    this.ammo--;
    this._canFire = false;
    setTimeout(() => {
      this._canFire = true;
    }, this.fireTimeout);
  }

  reload() {
    this.ammo = this.capacity;
  }
}
