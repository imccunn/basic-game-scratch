import Bullet from './Bullet';

export default class Weapon {

  constructor(opts) {
    this.BULLET_TIMEOUT = opts.bulletTimeout || 5;
    this.ticksUntilNextFire = 0;
    this.bulletSpeed = opts.bulletSpeed;
    this.ammo = opts.ammo || 12;
    this.capacity = opts.capacity || 12;
    this.fireTimeout = 2000;
    this._canFire = true;
    this.bullets = [];
  }

  getBulletTimeout() {
    return this.BULLET_TIMEOUT;
  }

  canFire() {
    return this._canFire;
  }

  fire() {
    console.log('enemy weapon fire.');
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
