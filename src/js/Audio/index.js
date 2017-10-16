
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

export function loadSound(path) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      context.decodeAudioData(request.response, function(buffer) {
        if (buffer) {
          resolve(buffer);
        } else {
          resolve();
        }
      }, reject);
    };
    request.send();
  });
}


export function playSound(buffer) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
}
