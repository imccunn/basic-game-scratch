// game.js

var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;

$('#c').attr('width', canvasWidth);
$('#c').attr('height', canvasHeight);

var keysDown = {};

$('body').bind('keydown', function(e) {
	keysDown[e.which] = true;
});

$('body').bind('keyup', function(e) {
	keysDown[e.which] = false;
});

$('body').bind('keyup', function(e) {
	if (e.which === 32) playerFired();
});

var canvas = $('#c')[0].getContext('2d');

var image = new Image();
image.src = 'medfighter.png';
var plr = {
	bullets: [],
	canShoot: true,
	bulletTimeout: 5
};

var enemies = [];
for (var i = 0; i < 20; i++) {
	enemies.push({
		x: getRandomInt(1, canvasWidth),
		y: -20,
		speed: getRand(3, 6)
	});
}
var playerX = (canvasWidth/2) - (image.width/2);
var playerY = (canvasHeight/2) - (image.width/2);

function fillBackDefault() {
    canvas.beginPath();
    canvas.rect(0, 0, canvasWidth, canvasHeight);
    canvas.fillStyle = '#000';
    canvas.fill();
    canvas.closePath();
}

function update() {
	updatePlayer();
	updateEnemies();
	updateStars();
}

function updatePlayer() {
	if (keysDown[65]) { //A
		playerX -= 10;
	}
	if (keysDown[87]) { //W
		playerY -= 10;
	}
	if (keysDown[68]) { //D
		playerX += 10;
	}
	if (keysDown[83]) { //S
		playerY += 10;
	}

	if (keysDown[32]) {
		plr.shooting = true;
	} else {
		plr.shooting = false;
	}

	playerX = clamp(playerX, 0, canvasWidth - image.width);
	playerY = clamp(playerY, 0, canvasHeight - image.height);
	plr.x = playerX;
	plr.y = playerY;
}

function updateEnemies() {
	enemies.forEach(function(e) {
		e.y += e.speed;
		if (e.y > canvasWidth) {
			e.x = getRandomInt(1, canvasWidth)
			e.y = -10;
		}
	});

}

function clamp(x, min, max) {
	return x < min ? min : (x > max ? max : x);
}

function draw() {
	fillBackDefault();
	canvas.strokeRect(0, 0, canvasWidth, canvasHeight);
	canvas.drawImage(image, playerX, playerY);
	drawBullets();
	drawStars();
	drawEnemies();
}

function drawRect(clr, posx, posy, size) {
    canvas.beginPath();
    canvas.rect(posx, posy, size, size);
    canvas.fillStyle = clr;
    canvas.fill();
}

var stars = [];
stars.length = 150;
stars.fill({});
stars = stars.map(function(s) {
	var distance = Math.random();
	var size = distance < 0.9 ? getRand(0.5, 2) : getRand(2, 4);
	var trail = distance > 0.9 ? getRandomInt(5, 11) : null;
	return {
		x: getRandomInt(1, canvasWidth),
		y: getRandomInt(1, canvasHeight),
		distance: distance,
		size: size,
		trail: trail
	};
});
console.log('stars: ', stars);

function updateStars() {
	stars.forEach(function(s) {
		s.y += 2 + s.distance;
		if (s.y > canvasHeight) {
			s.y = -1;
			s.x = getRandomInt(1, canvasWidth);
		}
	});
}

function drawStars() {
	stars.forEach(function(s) {
		drawRect('#fff', s.x, s.y, s.size);
		if (s.trail) {
			for (var i = 0; i < s.trail; i++) {
				var op = (0.05 * i + 1);
				drawRect('rgba(255, 0, 155, ' + op + ')', s.x, s.y - i * 3, s.size - (0.23 * i));
			}
		}
	});
}
function playerFired() {
	plr.bulletTimeout = 10;
}
var modifier = 1;
function drawBullets() {
	let bulletSpeed = 20;

	for (var i = 0; i < plr.bullets.length; i++) {
		let bul = plr.bullets[i];
		bul.y -= bulletSpeed;
	}
	plr.bullets = plr.bullets.filter(function(b) {
		return b.y > 0;
	});

	if (plr.bulletTimeout !== 0) plr.bulletTimeout -= modifier;
	if (plr.shooting && plr.canShoot && plr.bulletTimeout === 0) {
			playSound(gunShot)
			plr.bullets.push({
				x: plr.x,
				y: plr.y
			});
			plr.bulletTimeout = 10;
	}
	for (var i = 0; i < plr.bullets.length; i++) {
			let bul = plr.bullets[i];
			drawRect('#ff0000', bul.x, bul.y, 5);
	}
}

function drawEnemies() {
	enemies.forEach(function(e) {
		drawRect('#00ff00', e.x, e.y, 10);
	});
}
// function drawStars() {
// 	for (var i = 0; i < 50; i++) {
// 		var x = getRandomInt(1, canvasWidth);
// 		var y = getRandomInt(1, canvasHeight);
// 		var size = getRandomInt(1, 4);
// 		drawRect('#fff', x, y, size);
// 	}
// }

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRand(min, max) {
	return Math.random() * (max - min) + min;
}


var FPS = 30;
setInterval(function() {
	update();
	draw();
}, 1000 / FPS);

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
function playSound(buffer) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
}

loadSound();

gunShot = null;
function loadSound() {
  var audioURL = 'test.mp3';
  var request = new XMLHttpRequest();
  request.open("GET", audioURL, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
		console.log('recieved')
    context.decodeAudioData(request.response, function(buffer) {
      if (buffer) {
				gunShot = buffer;
        // playSound(buffer);
      }
    }, function(error) {
			console.log('error: ', error)
		});
  };
  request.send();
}
