//TREX GAme by Advait Suresh using JS



//Declare variables for game objects and behaviour indicators(FLAGS)
var trex, trexRun, trexDead;
var ground, groundImage, invisibleGround;
var cloud, cloudGroup, cloudImage;
var obstacle, obstacleGroup, cactus1, cactus2, cactus3, cactus4, cactus5, cactus6;
var restartIcon, iconImage;
var gameOver, gameOverImage;

var PLAY, END, gameState;
var score, hiScore;
var hiscoreflag;

var dieSound, jumpSound, checkpointSound;


//Create Media library and load to use it during the course of the software
//executed only once at the start of the program
function preload() {
  trexRun = loadAnimation("trex1.png", "trex3.png", "trex4.png");
  trexDead = loadImage("trex_collided.png");
  groundImage = loadImage("ground2.png");
  cloudImage = loadImage("cloud.png");
  cactus1 = loadImage("obstacle1.png");
  cactus2 = loadImage("obstacle2.png");
  cactus3 = loadImage("obstacle3.png");
  cactus4 = loadImage("obstacle4.png");
  cactus5 = loadImage("obstacle5.png");
  cactus6 = loadImage("obstacle6.png");
  iconImage = loadImage("restart.png");
  gameOverImage = loadImage("gameOver.png");

  dieSound = loadSound("die.mp3");
  jumpSound = loadSound("jump.mp3");
  checkpointSound = loadSound("checkPoint.mp3");
}

//define the intial environment of the software(before it is used)
//by defining the declared variables with default values
//executed only once at the start of the program
function setup() {
  createCanvas(600, 300);
  //creating trex sprite
  trex = createSprite(50, 260, 35, 35);
  trex.addAnimation("trexRun", trexRun);
  trex.addAnimation("trexDead", trexDead);
  trex.scale = 0.7;
  trex.debug = false;

  //creating ground and invisible ground sprites
  ground = createSprite(300, 265, 600, 10);
  ground.addImage("groundImage", groundImage);
  invisibleGround = createSprite(100, 280, 200, 10);
  invisibleGround.visible = false;

  //assigning gamestates
  PLAY = 1;
  END = 0;
  gameState = PLAY;

  //assigning default values to score and highscore
  score = 0;
  hiScore = 0;
  hiscoreflag = false;


  //defining group: 
  //Adding each individual sprite to Groups because: 
  //1. to manage properties and track activity of all sprites belonging to one category as a group 
  //2. because it is not possible to modify or control any individual sprites over the course of program 
  //3. as we are creating unlimited sprites in the form of clouds and cactus, we can never know which cactus is going to collide with trex 
  //or which cloud should be paused in the GAAMESTAE END 
  cloudGroup = createGroup();
  obstacleGroup = createGroup();

  restartIcon = createSprite(300, 150, 60, 60);
  restartIcon.addImage("iconImage", iconImage);
  restartIcon.visible = false;

  gameOver = createSprite(290, 100, 60, 60);
  gameOver.addImage("gameOverImage", gameOverImage);
  gameOver.visible = false;
}




//All modifications, changes, conditions, manipulations, actions during the course of the program are written inside function draw.
//All commands to be executed and checked continously or applied throughout the program are written inside function draw.
//function draw is executed for every frame created since the start of the program.
function draw() {
  background("white");

  //display scoreboard by using concatenation
  text("Score: " + score, 520, 50);


  if (gameState == PLAY) {

    //score calculation
    score = score + Math.round(World.frameRate / 60);
    //score checkpoint
    if (score % 100 == 0) {
      checkpointSound.play();
    }

    if (hiscoreflag == true) {
      text("HiScore:" + hiScore, 450, 50);
    }

    //trex behaviour  
    if (keyDown("space") && trex.y >= 240) {
      trex.velocityY = -15;
      jumpSound.play();
    }
    trex.velocityY = trex.velocityY + 0.5 //gravity effect

    //ground behaviour
    ground.velocityX = (-1) * (6 + (score / 70));
    if (ground.x < 0) {
      ground.x = ground.width / 2;
    }

    restartIcon.visible = false;
    gameOver.visible = false;


    //function call to spawn clouds and cacti
    spawnClouds();
    spawnObstacles();

    if (trex.isTouching(obstacleGroup)) {
      gameState = END;
      dieSound.play();
    }
  } else if (gameState == END) {


    trex.changeAnimation("trexDead", trexDead);
    trex.velocityX = 0;
    trex.velocityY = 0;

    ground.velocityX = 0;

    restartIcon.visible = true;
    gameOver.visible = true;

    obstacleGroup.setVelocityXEach(0);
    obstacleGroup.setLifetimeEach(-1);

    cloudGroup.setVelocityXEach(0);
    cloudGroup.setLifetimeEach(-1);

    if (score > hiScore) {
      hiScore = score;
    }
    text("HiScore:" + hiScore, 450, 50);

    if (mousePressedOver(restartIcon)) {

      gameState = PLAY;

      trex.changeAnimation("trexRun", trexRun);

      score = 0;
      hiscoreflag = true;


      obstacleGroup.destroyEach();
      cloudGroup.destroyEach();

    }


  }

  //trex behaviour
  trex.collide(invisibleGround);
  drawSprites();

}

//function definition to spawn clouds
function spawnClouds() {
  if (World.frameCount % 80 == 0) {
    cloud = createSprite(600, 50, 40, 10);
    cloud.velocityX = -3;
    cloud.addImage("cloudImage", cloudImage);
    cloud.scale = 0.8;
    cloud.y = random(40, 150);
    cloud.lifetime = 210;

    cloudGroup.add(cloud);
  }

}

//function definition to create and move obstacles 
function spawnObstacles() {
  //create cactus objects after every 90 frames 
  //to attain this we have to divide the framecount by 90 and check if the remainder is equal to zero
  //if framecount is divisible by given number then a cactus object will be created
  if (frameCount % 90 == 0) {
    //create and define a cactus sprite object in declared variable
    obstacle = createSprite(width, height - 60, 20, 50);
    //velocity of cactus which makes it move from left to right
    obstacle.velocityX = (-1) * (6 + (score / 70));
    obstacle.debug = false;
    //generating lifetime to solve the problem of memory leak 
    //by dividing the distance to be crossed by the object with the speed of the object. 
    //here width = width of canvas(600) and speed is velocity of cactus(-(4+ score/120)) 
    //as velocity is negative, we need to make the lifetime as positive by muliplying the answer with -1;
    obstacle.lifetime = (-1) * (width / obstacle.velocityX);

    //randomNumber is a function used to generate any number between given range.
    //Math.round function is used to round and convert any decimal number to its nearest whole integer. 
    //generate a random number between 1 to 6 and save it in a variable caseNumber.
    var caseNumber = Math.round(random(1, 6));
    //console.log(caseNumber);

    //switch case passes a single variable to match with cases    
    switch (caseNumber) {
      //use the caseNumber to apply the name of the animation such as cactus1, cactus2, cactus3, cactus4, cactus5, cactus6

      case 1:
        obstacle.addImage("cactus1", cactus1);
        //adjust the size of animation for cactus sprite by keeping the width and height ratio stable 
        obstacle.scale = 0.9;
        break;
      case 2:
        obstacle.addImage("cactus2", cactus2);
        //adjust the size of animation for cactus sprite by keeping the width and height ratio stable
        obstacle.scale = 0.9;
        break;
      case 3:
        obstacle.addImage("cactus3", cactus3);
        //adjust the size of animation for cactus sprite by keeping the width and height ratio stable
        obstacle.scale = 0.85;
        break;
      case 4:
        obstacle.addImage("cactus4", cactus4);
        //adjust the size of animation for cactus sprite by keeping the width and height ratio stable
        obstacle.scale = 0.75;
        break;
      case 5:
        obstacle.addImage("cactus5", cactus5);
        //adjust the size of animation for cactus sprite by keeping the width and height ratio stable
        obstacle.scale = 0.7;
        break;
      case 6:
        obstacle.addImage("cactus6", cactus6);
        //adjust the size of animation for cactus sprite by keeping the width and height ratio stable
        obstacle.scale = 0.7;
        break;
      default:
        obstacle.addImage("cactus1", cactus1);
        //adjust the size of animation for cactus sprite by keeping the width and height ratio stable
        obstacle.scale = 0.9;
        break;
    }

    //Adding each cactus to Group;
    //1. to detect collisons between trex and the group
    //2. to manage and track all cactus
    //3. because it is not possible to modify or control any individual cactus
    //GroupName.add(spriteobjectName)
    obstacleGroup.add(obstacle);
  }

}