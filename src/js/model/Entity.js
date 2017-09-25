
export default class Entity {
  constructor() {
    this.x;
    this.y;
    this.width;
    this.height;
    this.speed;
  }

  collision(target) {
    const sourceXLo = this.x;
    const sourceXHi = sourceXLo + this.width;
    const sourceYLo = this.y;
    const sourceYHi = sourceYLo + this.height;

    const targetXLo = target.x;
    const targetXHi = targetXLo + target.width;
    const targetYLo = target.y;
    const targetYHi = targetYLo + target.height;

    const xOverlap = (sourceXLo <= targetXHi) && (sourceXHi >= targetXLo);
    const yOverlap = (sourceYLo <= targetYHi) && (sourceYHi >= targetYLo);

    return xOverlap && yOverlap;
  }

  update() {

  }
}
