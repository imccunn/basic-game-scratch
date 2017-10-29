
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

export function loadSound(id) {
  return new Promise((resolve, reject) => {
    let path = `audio/${id}.mp3`
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
  console.log('playSound')
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
}
