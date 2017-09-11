
export default class Entity {
  constructor() {
    this.x;
    this.y;
    this.width;
    this.height;
    this.speed;
  }

  collision(target) {
    var sourceXLo = this.x;
    var sourceXHi = sourceXLo + this.width;
    var sourceYLo = this.y;
    var sourceYHi = sourceYLo + this.height;

    var targetXLo = target.x;
    var targetXHi = targetXLo + target.width;
    var targetYLo = target.y;
    var targetYHi = targetYLo + target.height;

    var xOverlap = (sourceXLo <= targetXHi) && (sourceXHi >= targetXLo);
    var yOverlap = (sourceYLo <= targetYHi) && (sourceYHi >= targetYLo);

    return xOverlap && yOverlap;
  }

  update() {

  }
}
