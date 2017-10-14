
const canvasWidth = 1100;
const canvasHeight = window.innerHeight;

const c = document.getElementById('c');
c.setAttribute('width', canvasWidth);
c.setAttribute('height', canvasHeight);

const ctx = c.getContext('2d');

export {
  c,
  ctx
}
