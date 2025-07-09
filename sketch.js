/*

Game Project Final

Extensions:
I created platforms and enemies.

Difficulties I encountered:
I found the factory pattern hard to understand. 
In the game project, we were taught to use literal objects to draw collectable items, but use the factory pattern to draw platforms. 
For me, these two seem similar while the former is easy to understand and to implement, the latter is difficult.
I also find that when the codes get too long, it is very hard to navigate through them, making adding new codes or changing codes difficult. 

Skills I learnt/practiced:
In this course, I learnt and practiced the basic JavaScript concepts: variables, arrays, objects (including properties and methods), and functions (including constructor functions).
I also learnt the coding philosophies, especially the technics to debug, which I used quite often in this game project.
I also find myself more patient and attentive to details. 

Works Cited:
All the sound files in this folder belong to Mixkit, https://mixkit.co/. They are licensed under the Mixkit Sound Effects Free License.
The font, Pixel Millennium v1.00, belongs to Zdenek Gromnica a.k.a. FutureMillennium, http://futuremillennium.com/. It is licensed under the Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Unported License (CC BY-NC-ND 3.0).

*/

let gameChar_x;
let gameChar_y;
let gameChar_world_x;
let scrollPos;
let floorPos_y;

let isLeft;
let isRight;
let isFalling;
let isPlummeting;
let onPlatform;
let contactEnemy;

let clouds;
let mountains;
let trees_x;
let crown_height;
let canyons;
let collectables;
let platforms;
let enemies;

let game_score;
let lives;
let flagpole;
let gameStart;

let jumpSound;
let coinSound;
let dieSound;
let gameOverSound;
let gameWinSound;
let myFont;

function preload()
{
	// Load the sounds and the font.
    soundFormats('mp3','wav'); 
    jumpSound = loadSound('Sounds/mixkit-arcade-game-jump-coin-216.wav'); 
	coinSound = loadSound('Sounds/mixkit-space-coin-win-notification-271.wav'); 
	dieSound = loadSound('Sounds/mixkit-small-hit-in-a-game-2072.wav'); 
	gameOverSound = loadSound('Sounds/mixkit-long-game-over-notification-276.wav'); 
	gameWinSound = loadSound('Sounds/mixkit-video-game-win-2016.wav'); 
	myFont = loadFont('Fonts/PixelMillennium-1oBZ.ttf');
}

function setup(){
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;
	lives = 3; //Initialize the character lives.
	gameStart = false; //Initialize the game status.
	startGame();
}

function draw(){
	background(148,180,205); // Draw the sky.
	noStroke();
	fill(10,41,85);
	rect(0, floorPos_y, width, height/4); // Draw the floor.
	
	push();
	translate(scrollPos, 0);
	drawClouds(); 
	drawMountains(); 
	drawTrees(); 
	for(const c of canyons){ // Draw canyons.
		checkCanyon(c);
		drawCanyon(c);
	}
	for(const p of platforms){ //Draw platforms.
		p.update();
		p.draw();
	}
	for(const c of collectables){ // Draw collectable items.
		if(!c.isFound){
			drawCollectable(c);
			checkCollectable(c);
		}
	}
	for(const e of enemies){ // Draw enemies.
		e.draw();
		if(e.checkContact(gameChar_world_x,gameChar_y)){ // Check if the character touches the enemy.
			contactEnemy = true;
		}
	} 
	renderFlagpole(); // Draw the flagpole.
	pop();

	drawGameChar();
	drawWelcome(); // Draw the welcome screen.
	drawGameOver(); // Draw the game over screen.

	// Draw the player lives and score counts.
	renderLives(); 
	fill(244); 
	noStroke();
	textSize(18);
	textAlign(LEFT, BOTTOM);
	textStyle(NORMAL);
	textFont(myFont); 
	text("Lives: ", 20, 60); 
	text("Score: " + game_score + "/10", 20, 30);

	// Check if the game ends.
	checkPlayerDie();
	if(!flagpole.isReached){checkFlagpole();}else{return;}
	if(lives < 1){return;}

	// Logic to make the game character move or the background scroll.
	if(isLeft){
		if(gameChar_x > width * 0.2){gameChar_x -= 5;}else{scrollPos += 5;}
	}
	if(isRight){
		if(gameChar_x < width * 0.8){gameChar_x  += 5;}else{scrollPos -= 5;}
	}

	// Logic to check if the game character is standing on the platform.
	for(const p of platforms){
		if(p.checkContact(gameChar_world_x,gameChar_y)){
			onPlatform = true;
			if(p instanceof Platform){
				gameChar_x += p.direction;
			}
			break;
		}else{
			onPlatform = false;
		}
	}

	// Logic to make the game character rise and fall.
	if(gameChar_y < floorPos_y && !onPlatform){
		isFalling = true;
		gameChar_y += 2;
	}else{
		isFalling = false;
	}
	if(isPlummeting == true){gameChar_y += 20;}

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}

// ---------------------
// start game function
// ---------------------

function startGame(){
	gameChar_x = width/2;
	gameChar_y = floorPos_y;
	scrollPos = 0; // letiable to control the background scrolling.
	gameChar_world_x = gameChar_x - scrollPos; // letiable to store the real position of the gameChar in the game world. Needed for collision detection.

	// Boolean letiables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
	onPlatform = false;

	// Initialise arrays of scenery objects.
	// Initialise the trees.
	trees_x = [80,250,500,750,1050,1400,1600,2050,2300]; 
	crown_height = [];
	for(const t of trees_x){crown_height.push(random(160,240));}
	
	// Initialise the clouds.
	clouds = []; 
	for(let i = 0; i < 20; i++){clouds.push({x:100 + random(0,100) + 250 * i, y:random(60,90), size:random(60,90)});}
	
	// Initialise the mountains.
	mountains = [ 
		{x:0,y:152},
		{x:425,y:82},
		{x:600,y:282},
		{x:710,y:132},
		{x:1050,y:282},
		{x:1250,y:382},
		{x:1400,y:112},
		{x:1730,y:232},
		{x:1820,y:112},
		{x:2250,y:382},
		{x:2450,y:232},
	];

	// Initialise the canyons.
	canyons = [
		{x:100,width:80}, 
		{x:300,width:90},
		{x:800,width:80},
		{x:1500,width:90},
		{x:1900,width:100},
	];

	// Initialise the collectable items. 10 collectables in total.
	collectables = []; 
	for(let i = 0; i < 10; i++){
		collectables.push({x:random(0,150)+ 50 + 250 * i, y:random(220,400), size:40, isFound:false});
	}
	
	//Initialize the game score.
	game_score = 0; 

	//Initialize the flagpole.
	flagpole = {x_pos: 2800, isReached: false}; 

	//Initialize the platforms.
	platforms = [];
	for(let i = 0; i < 10; i++){
		platforms.push(
			new Platform(
				random(0,150)+ 50 + 250 * i, 
				random(120,185) * 2, 
				random(60,120), 
				random(20,40), 
				random(-0.4,0.4)
			)
		);
	}

	//Initialize the enemies.
	enemies = [];
	enemies.push(new Enemy(180, floorPos_y, 100))
	enemies.push(new Enemy(700, floorPos_y, 60))
	enemies.push(new Enemy(1080, floorPos_y, 80))
	enemies.push(new Enemy(1700, floorPos_y, 100))
	enemies.push(new Enemy(2000, floorPos_y, 120))
	enemies.push(new Enemy(2300, floorPos_y, 80))
}

// ---------------------
// Key control functions  
// ---------------------

function keyPressed(){
	if(key == 'A' || keyCode == 37){isLeft = true;}
	if(key == 'D' || keyCode == 39){isRight = true;}
	if(keyCode == 32){
		if(!gameStart){ // Press SPACE to start the game.
			gameStart = true;
		}else if(flagpole.isReached || lives < 1){ // After the game ends, press SPACE to restart the game.
			return setup();
		}else if(gameChar_y == floorPos_y || onPlatform){ // If the game character is on the floor or on the platforms, press SPACE to jump.
			gameChar_y -= 140;
			jumpSound.play();
		}
	}
}

function keyReleased(){
	if(key == 'A' || keyCode == 37){isLeft = false;}
	if(key == 'D' || keyCode == 39){isRight = false;}
}

// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.
function drawGameChar(){
	// draw game character
	if(isLeft && isFalling){
		//Jump left
		fill(187,71,48);
		ellipse(gameChar_x,gameChar_y - 27,60,45);
		stroke(187,71,48);
		strokeWeight(3);
		line(gameChar_x + 4,gameChar_y + 1,gameChar_x + 19,gameChar_y + 20);
		line(gameChar_x + 18,gameChar_y - 4,gameChar_x + 33,gameChar_y + 15);
		line(gameChar_x - 14,gameChar_y - 4,gameChar_x + 1,gameChar_y + 15);
		fill(204);
		noStroke();
		ellipse(gameChar_x - 18,gameChar_y - 30,7,14);
		ellipse(gameChar_x - 4,gameChar_y - 30,12,20);
	}else if(isRight && isFalling){ 
		//Jump right
		fill(187,71,48);
		ellipse(gameChar_x,gameChar_y - 27,60,45);
		stroke(187,71,48);
		strokeWeight(3);
		line(gameChar_x - 4,gameChar_y + 1,gameChar_x - 19,gameChar_y + 20);
		line(gameChar_x - 18,gameChar_y - 4,gameChar_x - 33,gameChar_y + 15);
		line(gameChar_x + 14,gameChar_y - 4,gameChar_x - 1,gameChar_y + 15);
		fill(204);
		noStroke();
		ellipse(gameChar_x + 18,gameChar_y - 30,7,14);
		ellipse(gameChar_x + 4,gameChar_y - 30,12,20);
	}else if(isLeft){
		//Walk left
		fill(187,71,48);
		ellipse(gameChar_x,gameChar_y - 30,60);
		fill(204);
		ellipse(gameChar_x - 18,gameChar_y - 36,9,22);
		ellipse(gameChar_x,gameChar_y - 36,13,26);
	}else if(isRight){
		//Walk right
		fill(187,71,48);
		ellipse(gameChar_x,gameChar_y - 30,60);
		fill(204);
		ellipse(gameChar_x + 18,gameChar_y - 36,9,22);
		ellipse(gameChar_x,gameChar_y - 36,13,26);
	}else if(isFalling || isPlummeting){
		//Jump facing forwards
		fill(187,71,48);
		ellipse(gameChar_x,gameChar_y - 27,60,45);
		stroke(187,71,48);
		strokeWeight(3);
		line(gameChar_x,gameChar_y + 1,gameChar_x,gameChar_y + 20);
		line(gameChar_x - 16,gameChar_y - 4,gameChar_x - 16,gameChar_y + 15);
		line(gameChar_x + 16,gameChar_y - 4,gameChar_x + 16,gameChar_y + 15);
		stroke(204);
		strokeWeight(2);
		line(gameChar_x - 5, gameChar_y - 30, gameChar_x - 18, gameChar_y - 33);
		line(gameChar_x - 5, gameChar_y - 30, gameChar_x - 18, gameChar_y - 27);
		line(gameChar_x + 5, gameChar_y - 30, gameChar_x + 18, gameChar_y - 33);
		line(gameChar_x + 5, gameChar_y - 30, gameChar_x + 18, gameChar_y - 27);
	}else{
		//Stand front facing
		fill(187,71,48);
		ellipse(gameChar_x,gameChar_y - 30,60);
		fill(204);
		ellipse(gameChar_x - 10,gameChar_y - 36,13,26);
		ellipse(gameChar_x + 10,gameChar_y - 36,13,26);
	}

}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds(){
	fill(224);
	for(const c of clouds){
		fill(224);
		push(); 
		translate(c.x,c.y);
		if(frameCount % 100 < 50){ //animate the clouds
			ellipse(0,0,c.size);
			ellipse(c.size/2,c.size/3,c.size);
			ellipse(- c.size/2,c.size/4,c.size);
			ellipse(- c.size/20,c.size/2,c.size);
		}else{
			ellipse(- c.size/20,0,c.size);
			ellipse(c.size/2,c.size/4,c.size);
			ellipse(- c.size/2,c.size/3,c.size);
			ellipse(c.size/20,c.size/2,c.size);
		}
		pop();
	}
}
// Function to draw mountains objects.
function drawMountains(){
	for(const m of mountains){
		push(); 
		translate(m.x,floorPos_y);
		if(frameCount % 100 < 50){ //animate the mountains
			fill(151,141,175);
			triangle(0, - m.y, - m.y * 0.6, 0, m.y * 0.6, 0);
			fill(207,192,213);
			triangle(0, - m.y, - m.y * 0.45, 0, m.y * 0.6, 0);
		}else{
			fill(151,141,175);
			triangle(0, - m.y * 0.96, - m.y * 0.6, 0, m.y * 0.6, 0);
			fill(207,192,213);
			triangle(0, - m.y * 0.96, - m.y * 0.45, 0, m.y * 0.6, 0);
		}
		pop();
	}	
}
// Function to draw trees objects.
function drawTrees(){
	for(let i = 0; i < trees_x.length; i++){
		//the trunk
		stroke(33,23,24); 
		strokeWeight(12);
		strokeCap(SQUARE);
		line(trees_x[i],floorPos_y,trees_x[i],floorPos_y - 180);
		//the crown
		noStroke();
		push(); 
		translate(trees_x[i],floorPos_y - crown_height[i]);
		if(frameCount % 100 > 50){ //animate the crown
			translate(0, crown_height[i] * 0.04);
			rotate(-PI/16);
		}
		fill(64,96,59);
		ellipse(0,0,140,140);
		fill(140,165,82);
		ellipse(0,0,110,140);
		arc(0,0,140,140,-PI/2,PI/2);
		pop();
	}
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.
function drawCanyon(t_canyon){
	fill(79,105,126);
	rect(t_canyon.x,floorPos_y,t_canyon.width,height);
	fill(148,180,205);
	rect(t_canyon.x,floorPos_y,t_canyon.width - 15,height);
}

// Function to check character is over a canyon.
function checkCanyon(t_canyon){
	if(gameChar_world_x > t_canyon.x + 15 && gameChar_world_x < t_canyon.x + t_canyon.width - 20 && gameChar_y == floorPos_y){
		isPlummeting = true;
	}
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.
function drawCollectable(t_collectable){
	fill(236,202,7,100);
	ellipse(t_collectable.x,t_collectable.y,t_collectable.size);
	fill(236,202,7);
	ellipse(t_collectable.x,t_collectable.y,t_collectable.size - 6);
	fill(224);
	textAlign(CENTER,CENTER);
	textSize(24);
	push(); 
	translate(t_collectable.x, t_collectable.y);
	if(frameCount % 100 > 50){rotate(-PI/16);}else{rotate(PI/16);}
	text("C", 0, 0);
	pop();
}

// Function to check character has collected an item.
function checkCollectable(t_collectable){
	if(dist(gameChar_world_x,gameChar_y - 30,t_collectable.x,t_collectable.y)<30){
		t_collectable.isFound = true;
		coinSound.play();
		game_score += 1;
	}
}

// ----------------------------------
// Flagpole render and check functions
// ----------------------------------

// Function to draw the flagpole.
function renderFlagpole(){
	noStroke();
	if(!flagpole.isReached){
		fill(238,205,89,90);
		ellipse(flagpole.x_pos, height/2, height - 240, height - 240);
		ellipse(flagpole.x_pos, height/2, height - 300, height - 300);
	}else{
		for(let i = 0; i < 15; i++){
			fill(238,205,89,50 + i * 5);
			ellipse(flagpole.x_pos, height/2, height - i * 30, height - i * 30);
		}
		fill(224);
		textSize(48);
		textAlign(RIGHT); 
		textStyle(BOLD);
		textFont(myFont); 
		text("LEVEL", flagpole.x_pos, height/2 - 48);
		text("COMPLETE", flagpole.x_pos, height/2);
		textSize(20);
		text("Press SPACE to restart ", flagpole.x_pos, height/2 + 45);
	}
}

// Function to check the flagpole.
function checkFlagpole(){
	if(gameChar_world_x >= flagpole.x_pos - width * 0.2){
		flagpole.isReached = true;
		gameWinSound.play();
	}
}

// ----------------------------------
// Player lives render and check functions
// ----------------------------------

// Function to render player lives.
function renderLives(){
	noStroke();
	for(let i = 0; i < lives; i++){
		fill(187,71,48);
		ellipse(88 + 35 * i,52,28);
		fill(204);
		ellipse(82 + 35 * i,50,7,13);
		ellipse(93 + 35 * i,50,7,13);
	}
}

// Function to check player lives.
function checkPlayerDie(){
	// If the character falls off the screen or if it touches the enemy, it loses one life.
	if((gameChar_y >= height + 77 || contactEnemy) && lives > 0){ 
		contactEnemy = false;
		lives -= 1; 
		if(lives > 0){
			dieSound.play();
		}else{
			gameOverSound.play();
		}
		return startGame();
	}
}

// ----------------------------------
// Start screen render function
// ----------------------------------

function drawWelcome(){
	if(!gameStart){
		noStroke();
		for(let i = 0; i < 15; i++){
			fill(238,205,89,100 + i * 5);
			ellipse(width/2, height/2, height - i * 30, height - i * 30);
		}
		fill(224);
		textSize(72);
		textAlign(CENTER, CENTER);
		textStyle(BOLD);
		text("WELCOME", width/2, height/2 - 55);
		text("TO THE GAME", width/2, height/2 + 15);
		textSize(26);
		textStyle();
		text("Press SPACE to start", width/2, height/2 + 100);
	}
}

// ----------------------------------
// Game over screen render function
// ----------------------------------

function drawGameOver(){
	if(lives < 1){
		noStroke();
		for(let i = 0; i < 15; i++){
			fill(238,205,89,100 + i * 5);
			ellipse(width/2, height/2, height - i * 30, height - i * 30);
		}
		fill(224);
		textSize(90);
		textAlign(CENTER, CENTER);
		textStyle(BOLD);
		text("GAME OVER", width/2, height/2 - 20);
		textSize(26);
		textStyle();
		text("Press SPACE to restart", width/2, height/2 + 60);
	}
}

// ---------------------------------
// Platforms render function
// ---------------------------------

class Platform{
	constructor(x, y, length, range, direction){
		this.x = x;
		this.y = y;
		this.length = length;
		this.range = range;
		this.anchor = x;
		this.direction = direction;
	}
	draw(){
		fill(10,41,85);
		rect(this.x, this.y, this.length, 20);
		fill(79,105,126);
		rect(this.x, this.y, 15, 20);
	}
	update(){
		if(abs(this.anchor - this.x) > this.range){
			this.direction *= -1;
		}
		this.x += this.direction;
	}
	checkContact(x, y){
		if(x > this.x && x < this.x + this.length && y < this.y + 5  && y > this.y - 1){
			y = this.y;
			return true;
		}
		return false;		
	}
}

// ---------------------------------
// Enemies render function
// ---------------------------------

class Enemy{
	constructor(x, y, range){
		this.x = x;
		this.y = y;
		this.range = range;
		this.currentX = x;
		this.inc = 0.4;
	}
	update(){
		this.currentX += this.inc;
		if(this.currentX >= this.x + this.range){
			this.inc = -0.4;
		}else if(this.currentX < this.x){
			this.inc = 0.4;
		}
	}
	draw(){
		this.update();
		if(frameCount % 20 < 10){
			fill(187,71,48,100);
			ellipse(this.currentX, this.y - 20, 40);
		}
		fill(187,71,48);
		ellipse(this.currentX, this.y - 20, 34);
		fill(224);
		textAlign(CENTER,CENTER);
		textSize(45);
		textFont('sans-serif');
		text("⚠︎︎", this.currentX, this.y - 20);
	}
	checkContact(x, y){
		if(dist(x, y, this.currentX, this.y) < 30){
			return true;
		}
		return false;
	}
}