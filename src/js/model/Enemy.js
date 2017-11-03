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
    let bullet = new Bullet({
      x: this.x + this.width / 2,
      y: this.y,
      speed: 2,
      width: 5,
      height: 5,
      dead: false,
      color: '#00ff00',
      xSpeed: '',
      ySpeed: ''
    });
    let angle = Math.atan2(opts.y - bullet.y, opts.x - bullet.x);
    bullet.xSpeed = Math.sin(angle) * bullet.speed;
    bullet.ySpeed = Math.cos(angle) * bullet.speed;
    this.weapon.bullets.push(bullet);
  }

  canFire() {
    return this.weapon.canFire();
  }
}
