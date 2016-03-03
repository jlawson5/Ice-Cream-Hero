    ///////////////////////////////////////////////////////////////
    //Game: Gravity Man - Justin Lawson                          //
    //Sources: Code from Phaser example "Starstruck" used        //
    //         Tilemap file from Phaser example "Starstruck" used//
    ///////////////////////////////////////////////////////////////

    window.onload = function() {

        var game = new Phaser.Game(500, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('bg', 'assets/bg.png');//background//
    game.load.image('hero', 'assets/Hero.png');//our hero, determined to get the ice cream//
    game.load.image('icecream', 'assets/IceCream.png');//Ice Cream: Collect these to increase your time by 3 and your score by 2000//
    game.load.image('spinach', 'assets/GrossSpinach.png');//Cans of Spinach: The disgusting greens your parents keep saying is good for you. Tastes disgusting and reduces time by 10; but it's good for you so it gives you 10000 points//
    game.load.audio('music', 'assets/IceCreamTruck.mp3');
    game.load.audio('item', 'assets/Electronic_Chime-KevanGC-495939803.mp3');
    game.load.audio('lose', 'assets/Sad_Trombone-Joe_Lamb-665429450.mp3');
}

var isRunning = false;//if the game is running//
var player;
var cursors;
var bg1;//two instances are used for wrapping
var bg2;
var score = 0;//increments each in-game step. Collecting ice cream and spinach can quickly earn you more points//
var scoreString = 'Score: ';
var scoreText;
var timeLeft = 60;//time remaining in seconds, -1 about every 1000 in-game steps. Gameover when time = 0//
var timeTimer = 1000;//a bit of a stupidly named variable; keeps track of the remaining time limit using the in-game timer//
var timeString = 'Time: ';
var timeText;
var icecream;//ice cream group//
var spinach;//gross spinach group//
var itemTimer = 1000;//timer on which spinach and icecream spawn//
var stateText;
var resetChar = false;//used to reset the character's coordinates upon restarting (startGame() doesn't seem to want to do it)//
var music;
var itemSFX;
var loseSFX;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#000000';

    bg1 = game.add.sprite(0, 0, 'bg');
    game.physics.enable(bg1, Phaser.Physics.ARCADE);
    bg1.body.setSize(500, 600, 0, 0);
    bg2 = game.add.sprite(0, 600, 'bg');
    game.physics.enable(bg2, Phaser.Physics.ARCADE);
    bg2.body.setSize(500, 600, 0, 0);

    player = game.add.sprite(250, 400, 'hero');
    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.collideWorldBounds = true;
    player.body.setSize(64, 64, 0, 0);
    
    icecream = game.add.group();
    spinach = game.add.group();
    
    scoreText = game.add.text(10, 10, scoreString + score, {font: '34px Arial', fill: '#fff'});
    timeText = game.add.text(10, 50, timeString + timeLeft, {font: '34px Arial', fill: '#fff'});
    stateText = game.add.text(130, 300, "Click to play!", {font: '34px Arial', fill: '#000'});
    
    music = game.add.audio('music');
    music.addMarker('music', 0, 19, 1, true);
    music.play('music', 0, 1, true);
    
    itemSFX = game.add.audio('item');
    loseSFX = game.add.audio('lose');

    cursors = game.input.keyboard.createCursorKeys();
}

function update() {
    
    if(resetChar)
    {
        player.body.x = 250;
        player.body.y = 400;
        resetChar = false;
    }
    if(isRunning)
    {
        score++;
        bg1.body.velocity.y = 300;
        bg2.body.velocity.y = 300;
        if (cursors.left.isDown)
        {
            player.body.velocity.x = -250;
            player.body.velocity.y = 0;
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 250;
            player.body.velocity.y = 0;
        }
        else if (cursors.up.isDown)
        {
            player.body.velocity.y = -250;
            player.body.velocity.x = 0;
        }
        else if (cursors.down.isDown)
        {
            player.body.velocity.y = 250;
            player.body.velocity.x = 0;
        }
        else
        {
            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
        }
        
        //itemTimer and timeTimer run on the same time, but I have them seperate to be safe//
        if(game.time.now > itemTimer && timeLeft > 0)
        {
            spawnItem();
            itemTimer = game.time.now + 1000;
        }
        
        if(game.time.now > timeTimer && timeLeft > 0)
        {
            timeLeft--;
            timeTimer = game.time.now + 1000;
        }
    }
    else
    {
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        game.input.onTap.addOnce(startGame,this);
        bg1.body.velocity.y = 0;
        bg2.body.velocity.y = 0;
    }
    timeText.text = timeString + timeLeft;
    scoreText.text = scoreString + score;
    
    if(bg1.body.y == 600)
        bg1.body.y = -600;
    
    if(bg2.body.y == 600)
        bg2.body.y = -600;
    
    if(timeLeft <= 0)
    {
        if(isRunning)
            loseSFX.play();
        isRunning = false;
        icecream.removeAll(true);
        spinach.removeAll(true);
        stateText.visible = true;
        game.input.onTap.addOnce(startGame,this);
    }
    
    //collisions//
    game.physics.arcade.overlap(player, icecream, iceCreamCollision, null, this);
    game.physics.arcade.overlap(player, spinach, spinachCollision, null, this);
}
        
function spawnItem()
{
    var roll = Math.random();
    var coord = Math.random() * 3;//used to determine which of three possible x-coordinates the item will spawn//
    var xCoord;//actual x-coordinate item will spawn at//
    if(coord < 1)
        xCoord = 125;
    else if(coord < 2)
        xCoord = 250;
    else
        xCoord = 375;
    if(roll <= .49)//ice cream, yay!//
    {
        var cone = icecream.create(xCoord, -32, 'icecream');
        game.physics.enable(cone, Phaser.Physics.ARCADE);
        cone.body.setSize(24, 24, 0, 0);
        cone.body.velocity.y = 300;
    }
    
    else//bleh, gross spinach//
    {
        var can = spinach.create(xCoord, -32, 'spinach');
        game.physics.enable(can, Phaser.Physics.ARCADE);
        can.body.setSize(24, 24, 0, 0);
        can.body.velocity.y = 300;
    }
}
        
function startGame()
{
    resetChar = true;
    isRunning = true;
    timeLeft = 60;
    score = 0;
    timeTimer = game.time.now + 1000;
    itemTimer = game.time.now + 1000;
    stateText.text = "   Gameover! \nClick to play again!"
    stateText.visible = false;
}
        
function iceCreamCollision(player, icecream)
{
    itemSFX.play();
    icecream.kill();
    score += 2000;
    timeLeft += 3;
}
        
function spinachCollision(player, spinach)
{
    itemSFX.play();
    spinach.kill();
    score += 10000;//a lot of points for a lot of gross. Is it worth it?//
    timeLeft -= 10;
    if(timeLeft < 0)
        timeLeft = 0;
}

function render () {}

    };