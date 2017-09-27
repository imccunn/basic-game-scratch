import Entity from './Entity';

export default class Enemy extends Entity {
  constructor(opts) {
    super(opts);
    this.dead = false;
  }
}
