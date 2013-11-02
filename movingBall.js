window.onload = init;

//variables for timer
var status; // 1 is STARTED and 2 is STOPPED
var time;

//variables for moving ball
var winW, winH;
var ball;
var hole;
var mouseDownInsideball;
var touchDownInsideball;
var movementTimer;
var lastMouse, lastOrientation, lastTouch;
                            
// Initialisation on opening of the window
function init() {

	//code to lock portrait view
	window.onorientationchange = reorient;
	window.setTimeout(reorient, 0);

	//timer.js code
	document.getElementById("start").onclick = start;
	document.getElementById("stop").onclick = stop;
	document.getElementById("resume").onclick = resume;
	status = 2;
	time = 0;
	setInterval(timer, 1000);
	
	//Moving ball code
	lastOrientation = {};
	window.addEventListener('resize', doLayout, false);
	document.body.addEventListener('mousemove', onMouseMove, false);
	document.body.addEventListener('mousedown', onMouseDown, false);
	document.body.addEventListener('mouseup', onMouseUp, false);
	document.body.addEventListener('touchmove', onTouchMove, false);
	document.body.addEventListener('touchstart', onTouchDown, false);
	document.body.addEventListener('touchend', onTouchUp, false);
	window.addEventListener('deviceorientation', deviceOrientationTest, false);
	lastMouse = {x:0, y:0};
	lastTouch = {x:0, y:0};
	mouseDownInsideball = false;
	touchDownInsideball = false;
	doLayout(document);
}

//function to lock portrait view
 function reorient(e) {
    var portrait = (window.orientation % 180 == 0);
    $("body > div").css("-webkit-transform", !portrait ? "rotate(-90deg)" : "");
 }


//function for timer
function start() {
	if (status == 2) {
		time = 0;
		status = 1;
		doLayout(document);
		var textZone = document.getElementById("winMessage");
		textZone.style = "";
		textZone.innerHTML = "";
	}
}

function stop() {
	if (status == 1) {
		status = 2;
	}
}

function resume() {
	if (status == 2) {
		status = 1;
	}
}

function timer() {
	if (status == 1) {
		time++;
		var text = document.getElementById("time");
		text.innerHTML = "" + getTime();
	}
}

function getTime() {
	var timeElapsed = "0";
	if (time < 60) {
		timeElapsed = "00:" + time + "";
	}
	else if (time >= 60 && time < 3600) {
		timeElapsed = time/60 + ":" + time%60; 
	} else if (time >= 3600){
		var hours = time/3600;
		var minutes = (time-hours*3600)/60;
		var seconds = (time-hours*3600-minutes*60);
		timeElapsed = hours + ":" + minutes + ":" + seconds;
	}
	return timeElapsed;
}

//functions for moving ball
// Does the gyroscope or accelerometer actually work?
function deviceOrientationTest(event) {
	window.removeEventListener('deviceorientation', deviceOrientationTest);
	if (event.beta != null && event.gamma != null) {
		window.addEventListener('deviceorientation', onDeviceOrientationChange, false);
		movementTimer = setInterval(onRenderUpdate, 10); 
	}
}

function doLayout(event) {
	winW = window.innerWidth;
	winH = window.innerHeight;
	var surface = document.getElementById('surface');
	surface.width = winW;
	surface.height = winH;
	var radius = Math.sqrt(winW*winW+winH*winH)/30;
	var radiusHole = Math.sqrt(winW*winW+winH*winH)/20;
	ball = {	radius:radius,
				x:Math.round(winW/2),
				y:Math.round(winH/2),
				color:'rgba(255, 255, 255, 255)'};
	hole = {	radius:radiusHole,
				x:Math.round(Math.random()*(winW-radiusHole)),
				y:Math.round(Math.random()*(winH-radiusHole)), 
				color: 'rgba(35, 190, 35, 255)'};
	renderBall();
}
	
function renderBall() {
	var surface = document.getElementById('surface');
	var context = surface.getContext('2d');
	context.clearRect(0, 0, surface.width, surface.height);
	
	renderHole();
	
	context.beginPath();
	context.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI, false);
	context.fillStyle = ball.color;
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = ball.color;
	context.stroke();	
} 

function renderHole() {
	var surface = document.getElementById('surface');
	var context = surface.getContext('2d');
	
	context.beginPath();
	context.arc(hole.x, hole.y, hole.radius, 0, 2 * Math.PI, false);
	context.fillStyle = hole.color;
	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = hole.color;
	context.stroke();
}

function renderWinMessage() {
	var textZone = document.getElementById("winMessage");
	textZone.style = "Color:#FFFFFF; Background-color: rgba(30, 30, 30, 0.5);";
	textZone.innerHTML = "Congratulations! You win in "+ getTime();
}

function onRenderUpdate(event) {
	var xDelta, yDelta;
	switch (window.orientation) {
		case 0: // portrait - normal
			xDelta = lastOrientation.gamma;
			yDelta = lastOrientation.beta;
			break;
		case 180: // portrait - upside down
			xDelta = lastOrientation.gamma * -1;
			yDelta = lastOrientation.beta * -1;
			break;
		case 90: // landscape - bottom right
			xDelta = lastOrientation.beta;
			yDelta = lastOrientation.gamma * -1;
			break;
		case -90: // landscape - bottom left
			xDelta = lastOrientation.beta * -1;
			yDelta = lastOrientation.gamma;
			break;
		default:
			xDelta = lastOrientation.gamma;
			yDelta = lastOrientation.beta;
	}
	moveBall(xDelta, yDelta);
}

function moveBall(xDelta, yDelta) {
	if(status==1) {
		ball.x += xDelta;
		ball.y += yDelta;
		if (ball.x - ball.radius > hole.x - hole.radius
				&& ball.x + ball.radius < hole.x + hole.radius
				&& ball.y - ball.radius > hole.y  - hole.radius
				&& ball.y + ball.radius < hole.y  + hole.radius) {
					renderBall();
					renderWinMessage();
					stop();
		}
		renderBall();
	}
}

function onMouseMove(event) {
	if(mouseDownInsideball){
		var xDelta, yDelta;
		xDelta = event.clientX - lastMouse.x;
		yDelta = event.clientY - lastMouse.y;
		moveBall(xDelta, yDelta);
		lastMouse.x = event.clientX;
		lastMouse.y = event.clientY;
	}
}

function onMouseDown(event) {
	var x = event.clientX;
	var y = event.clientY;
	if(	x > ball.x - ball.radius &&
		x < ball.x + ball.radius &&
		y > ball.y - ball.radius &&
		y < ball.y + ball.radius){
		mouseDownInsideball = true;
		lastMouse.x = x;
		lastMouse.y = y;
	} else {
		mouseDownInsideball = false;
	}
} 

function onMouseUp(event) {
	mouseDownInsideball = false;
}

function onTouchMove(event) {
	event.preventDefault();	
	if(touchDownInsideball){
		var touches = event.changedTouches;
		var xav = 0;
		var yav = 0;
		for (var i=0; i < touches.length; i++) {
			var x = touches[i].pageX;
			var y =	touches[i].pageY;
			xav += x;
			yav += y;
		}
		xav /= touches.length;
		yav /= touches.length;
		var xDelta, yDelta;

		xDelta = xav - lastTouch.x;
		yDelta = yav - lastTouch.y;
		moveBall(xDelta, yDelta);
		lastTouch.x = xav;
		lastTouch.y = yav;
	}
}

function onTouchDown(event) {
	event.preventDefault();
	touchDownInsideball = false;
	var touches = event.changedTouches;
	for (var i=0; i < touches.length && !touchDownInsideball; i++) {
		var x = touches[i].pageX;
		var y = touches[i].pageY;
		if(	x > ball.x - ball.radius &&
			x < ball.x + ball.radius &&
			y > ball.y - ball.radius &&
			y < ball.y + ball.radius){
			touchDownInsideball = true;		
			lastTouch.x = x;
			lastTouch.y = y;			
		}
	}
} 

function onTouchUp(event) {
	touchDownInsideball = false;
}

function onDeviceOrientationChange(event) {
	lastOrientation.gamma = event.gamma;
	lastOrientation.beta = event.beta;
}