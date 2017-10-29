
import ViewPort from './ViewPort';

const c = document.getElementById('c');
c.setAttribute('width', ViewPort.width);
c.setAttribute('height', ViewPort.height);

const ctx = c.getContext('2d');

export {
  c,
  ctx
}
