
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

export function loadSound(dir, id) {
  return new Promise((resolve, reject) => {
    let path = `${dir}/${id}.mp3`;
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


export function playSound(buffer, gainValue) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  var gain = context.createGain();
  gain.gain.value = gainValue;
  source.connect(gain);
  gain.connect(context.destination);
  source.start(0);
}
