
function clamp(x, min, max) {
  return x < min ? min : (x > max ? max : x);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRand(min, max) {
  return Math.random() * (max - min) + min;
}

export {
  clamp,
  getRandomInt,
  getRand
};
