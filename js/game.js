`use strict`

let canvas = document.getElementById(`canvas`);
canvas.width = document.documentElement.clientWidth*0.99;
canvas.height = document.documentElement.clientHeight*0.98;
let ctx = canvas.getContext(`2d`);

let score = 0;
let v =0;
let aim = {
    width: 50,
    img: new Image(),
    x: 0,
    y: 0,
}
aim.img.src = `img/aim.png`;
document.addEventListener(`mousemove`,onMouseMove);
function onMouseMove(event){
    aim.x = event.clientX;
    aim.y = event.clientY;
}

let audio = {
    shootSound : document.getElementById(`shootSound`),
}



class Sponge{
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.img = new Image();
        this.img.src=`img/testSponge.png`;
        this.width = 50;
        this.height = 100;
        this.angle = 0;
        this.speed = 0;
    }
}
let sponges = new Set();
sponges.add(new Sponge(canvas.width/2 - 400,canvas.height/2 - 30));


class Bullet{
    constructor(x,y,angle) {
        this.x = x;
        this.y = y;
        this.img = new Image();
        this.img.src = `img/testBullet.png`;
        this.width = 10;
        this.height = 20;
        this.angle = angle;
        this.speed = 1;
    }
}
let bullets = new Set();









let crab = {
    x: canvas.width/2,
    y: canvas.height/2,
    ///// x and y coordinate of center //////////
    width: 150,
    img: new Image(),
    angle: 0,
    ////// angle in rad//////////
    speed: 5,
    ableToShout: true,
    shoot: function (){
        if(this.ableToShout) {
            bullets.add(new Bullet(this.x, this.y, this.angle));
            audio.shootSound.play();
            this.ableToShout= false;
            setTimeout(() => {this.ableToShout= true},1000 );
        }
    },
}

crab.img.src = `img/testCrab.png`;





let pressedButtons = new Set();
document.addEventListener(`keydown`,onKeyDown)
function onKeyDown(event) {
    pressedButtons.add(event.key);
}
document.addEventListener(`keyup`,onKeyUp)
function onKeyUp(event) {
    pressedButtons.delete(event.key);
}


document.addEventListener(`click`,onClick)
function onClick(event) {
    crab.shoot();
}








function drawGame() {
    ctx.fillStyle = `#00ffff`;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.drawImage(aim.img, aim.x-aim.width/2,aim.y-aim.width/2,aim.width,aim.width);

    trajectory(pressedButtons);
    look(crab,aim.x,aim.y);
    rotateImg(crab.img,crab.angle,crab.x,crab.y,crab.width,crab.width);





    for(let bullet of bullets){
        bulletNavigator(bullet);
        rotateImg(bullet.img, bullet.angle, bullet.x, bullet.y, bullet.width, bullet.height);
        for(let sponge of sponges){
            if(collision(bullet,sponge)){
                bullets.delete(bullet);
                sponges.delete(sponge);
                score+=1;
            }
        }
    }



    for(let sponge of sponges) {
        spongeNavigator(sponge);
        rotateImg(sponge.img, sponge.angle, sponge.x, sponge.y, sponge.width, sponge.height);

        if(collision(crab,sponge)) gameOver();
    }




}

let setI = setInterval(drawGame,10);




















function rotateImg(img, angle, x, y, width, height){
    ctx.save();
    ctx.rotate(angle);
    y-= height/2;
    x-= width/2;

    ctx.translate((x+width/2)*Math.cos(angle)+(y+height/2)*Math.sin(angle)-x-width/2,
        -(x+width/2)*Math.sin(angle)+(y+height/2)*Math.cos(angle)-y-height/2);

    ctx.drawImage(img,x,y,width,height);
    ctx.restore();


}

function look(crab,x,y) {
    crab.angle=Math.atan2(x-crab.x, crab.y-y);
}

function trajectory(set) {
    if(set.has(`w`)){
      crab.x += Math.sin(crab.angle)*crab.speed;
      crab.y -= Math.cos(crab.angle)*crab.speed;
    }
}

function spongeNavigator(sponge) {
    sponge.angle = Math.atan2(crab.x-sponge.x, sponge.y-crab.y);
    sponge.x += Math.sin(sponge.angle)*sponge.speed;
    sponge.y -= Math.cos(sponge.angle)*sponge.speed;

}
function bulletNavigator(bullet) {
    bullet.x += Math.sin(bullet.angle)*bullet.speed;
    bullet.y -= Math.cos(bullet.angle)*bullet.speed;

    if(bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) bullets.delete(bullet);
}

function collision (o1,o2) {
    let result;
    if((o1.width+o2.height)/4+(o2.width+o2.height)/2 >
    Math.sqrt((o1.x-o2.x)**2 + (o1.y-o2.y)**2)) result = true;
    else result = false;
    return result;
}

function gameOver() {
    clearInterval(setI);
    ctx.fillStyle = `black`
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = `red`;
    ctx.font = "100px Georgia";
    ctx.fillText("Game Over", 400, 400);

}

function randomGeneration() {
    let p = Math.random()*3;
}






