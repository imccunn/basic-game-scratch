import Entity from './Entity';
import Bullet from './Bullet';

export default class Enemy extends Entity {
  constructor(opts) {
    super(opts);
    this.dead = false;
    this.weapon = opts.weapon;
  }

  fire(opts) {
    this.weapon.fire();
    let freeBullet = this.weapon.bullets.pop();
    freeBullet.x = this.x + this.width / 2;
    freeBullet.y = this.y + this.width;
    freeBullet.speed = 2;
    freeBullet.width = 5;
    let angle = Math.atan2(opts.y - freeBullet.y, opts.x - freeBullet.x);
    freeBullet.ySpeed = Math.sin(angle) * freeBullet.speed;
    freeBullet.xSpeed = Math.cos(angle) * freeBullet.speed;
    return freeBullet;
  }

  canFire() {
    return this.weapon.canFire();
  }
}
