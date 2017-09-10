
var bulletSound = null;
var score = 0;
let FPS = 10;

var gameModel = {
	update: function() {
		update();
		draw();
		window.requestAnimationFrame(gameModel.update)
	}
}

// window.requestAnimationFrame(gameModel.update)



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
	speed: 10,
	canShoot: true,
	bulletTimeout: 10,
	width: 32,
	height: 32
};

var numEnemies = 20
var enemies = [];
for (var i = 0; i < numEnemies; i++) {
	enemies.push({
		x: getRandomInt(1, canvasWidth),
		y: -20,
		speed: getRand(1, 3.5),
		width: 40,
		height: 40,
		dead: false
	});
}
var playerX = (canvasWidth / 2) - (image.width / 2);
var playerY = (canvasHeight / 2) - (image.width / 2);

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
	explosionSprite.update();
}

function updatePlayer() {
	if (keysDown[65]) { //A
		playerX -= plr.speed;
	}
	if (keysDown[87]) { //W
		playerY -= plr.speed;
	}
	if (keysDown[68]) { //D
		playerX += plr.speed;
	}
	if (keysDown[83]) { //S
		playerY += plr.speed;
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
		if (e.y > canvasHeight) {
			e.x = getRandomInt(1, canvasWidth)
			e.y = -200;
			e.dead = false;
		}
		if (plr.bullets) {
			plr.bullets.forEach(function(b) {
				if (checkCollision(b, e)) {
					if (!e.dead) {
						playSound(enemyExplosion);
						explosionSprite.x = e.x;
						explosionSprite.y = e.y
						explosionSprite.render();
						b.dead = true;
						e.dead = true;
						score++
					}
				}
			});
		}
	});
}

function clamp(x, min, max) {
	return x < min ? min : (x > max ? max : x);
}

function drawText() {
	canvas.font = '36px serif';
	canvas.fillStyle = '#ff0000';
  canvas.fillText('Score: ' + score, 20, 50);
}

function draw() {
	fillBackDefault();
	canvas.strokeRect(0, 0, canvasWidth, canvasHeight);
	canvas.drawImage(image, playerX, playerY);
	drawText();
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
		speed: 0.5 * -distance,
		trail: trail
	};
});

function updateStars() {
	stars.forEach(function(s) {
		s.y += 0.2 + s.distance;
		if (s.y > canvasHeight) {
			s.y = -10;
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

var shotsFired = 0;
var modifier = 1;
function drawBullets() {
	let bulletSpeed = 10;
	plr.bullets = plr.bullets.filter(function(b) {
		var stillActive = true;
		if (b.y < 0 || b.dead) stillActive = false;
		return stillActive;
	});
	for (var i = 0; i < plr.bullets.length; i++) {
		let bul = plr.bullets[i];
		bul.y -= bulletSpeed;
	}

	if (plr.bulletTimeout !== 0) plr.bulletTimeout -= modifier;
	if (plr.shooting && plr.canShoot && plr.bulletTimeout === 0) {
			shotsFired++;
			playSound(bulletSound)
			plr.bullets.push({
				x: plr.x + (plr.width),
				y: plr.y,
				width: 5,
				height: 5,
				dead: false
			});
			plr.bulletTimeout = 10;
	}
	for (var i = 0; i < plr.bullets.length; i++) {
			let bul = plr.bullets[i];
			if (!bul.dead) drawRect('#fff', bul.x, bul.y, 10);
	}
}

function drawEnemies() {
	enemies.forEach(function(e) {
		if (!e.dead) drawRect('#00ff00', e.x, e.y, e.width);
	});
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRand(min, max) {
	return Math.random() * (max - min) + min;
}


function checkCollision(source, target) {
	var sourceXLo = source.x;
	var sourceXHi = sourceXLo + source.width;
	var sourceYLo = source.y;
	var sourceYHi = sourceYLo + source.height;

	var targetXLo = target.x;
	var targetXHi = targetXLo + target.width;
	var targetYLo = target.y;
	var targetYHi = targetYLo + target.height;

	var xOverlap = (sourceXLo <= targetXHi) && (sourceXHi >= targetXLo);
	var yOverlap = (sourceYLo <= targetYHi) && (sourceYHi >= targetYLo);

	return xOverlap && yOverlap;
}

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
function playSound(buffer) {
  var source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
}

function loadSound(path, cb) {
  let request = new XMLHttpRequest();
  request.open('GET', path, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      if (buffer) {
				buf = buffer;
        cb(buffer)
      }
    }, function(error) {
			console.log('error: ', error)
		});
  };
  request.send();
}

var explosionImage = new Image();
explosionImage.src = 'images/explosion_3.png';

var explosionSprite = sprite({
	context: canvas,
	width: 97,
	height: 4365,
	image: explosionImage,
	numFrames: 45,
	x: 0,
	y: 0
});

function doExplosionSprite() {
	explosionSprite.update();
	explosionSprite.render();
}

function sprite(opt) {
	var sprite = {
		context: opt.context,
		width: opt.width,
		height: opt.height,
		image: opt.image,
		numFrames: opt.numFrames,
		x: opt.x,
		y: opt.y
	};
	var frameIndex = 0;
	var tickCount = 0;
	var ticksPerFrame = 1;

	sprite.render = function() {
		sprite.context.clearRect(0, 0, sprite.width, sprite.height);
		sprite.context.drawImage(
			sprite.image, // image object
			0, // sx
			frameIndex * sprite.height / sprite.numFrames, // sy
			sprite.width, //sw
			sprite.height / sprite.numFrames , // sh
			sprite.x, // dx
			sprite.y, // dy
			sprite.width, // dw
			sprite.height / sprite.numFrames // dh
		);
	};
	sprite.update = function() {
		tickCount += 1;
		if (frameIndex === 49) frameIndex = 0;
		if (tickCount > ticksPerFrame) {
			tickCount = 0;
			if (frameIndex < sprite.numFrames - 1) {
				frameIndex++;
			}
		}
	}
	return sprite;
}

loadSound('audio/test.mp3', function(buff) {
	bulletSound = buff;
	loadSound('audio/test2.mp3', function(buff) {
		enemyExplosion = buff;
		gameModel.update();
		// setInterval(function() {
		// 	update();
		// 	draw();
		// }, 1000 / FPS);
	});
});
