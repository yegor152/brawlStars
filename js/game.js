`use strict`

let canvas = document.getElementById(`canvas`);
canvas.width = document.documentElement.clientWidth*0.99;
canvas.height = document.documentElement.clientHeight*0.98;
let ctx = canvas.getContext(`2d`);

let score = 0;
let paused = false;
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
    shootSound : new Audio(`audio/shootSound.mp3`),
    f: new Audio(`audio/f.mp3`),
}
audio.f.play();
audio.f.volume=0.5;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Line {
    constructor(p1, p2) {
        this.a = p2.y - p1.y;
        this.b = p1.x - p2.x;
        this.c = p2.x * p1.y - p1.x * p2.y;
        if(p1.x === p2.x) {
            this.a = 1; this.b = 0; this.c = -p1.x;
        }
        if(p1.y === p2.y) {
            this.a = 0; this.b = 1; this.c = -p1.y;
        }
    }
}



class Batko {
    constructor(x, y, angle, speed, width, height, imgSrc) {
        this._x = x;
        this._y = y;

        ///// x and y coordinate of center //////////
        this.img = new Image();
        this.img.src = imgSrc;
        this.width = width;
        this.height = height;
        this.angle = angle;
        ////// angle in rad//////////
        this.speed = speed;
        this.halfDiagonal = Math.sqrt(Math.pow(this.width/2, 2) + Math.pow(this.height/2, 2));
        this.alpha = Math.atan(this.height / this.width);
        this.corners = [];
        this.lines = [];
        this.setCorners();
        this.setLines();
    }
    get x (){
        return this._x;
    }
    set x (value){
        this._x = value;
        this.setLines();
        this.setCorners();
    }
    get y (){
        return this._y;
    }
    set y (value){
        this._y = value;
        this.setLines();
        this.setCorners();
    }



    setCorners() {
        let halfDiagonal =this.halfDiagonal;
        let angle  = this.angle;
        let alpha = this.alpha;
        let x = this.x;
        let y = this.y;
            this.corners = [new Point(x + halfDiagonal * Math.cos(angle + alpha), y + halfDiagonal * Math.sin(angle + alpha)),
                            new Point(x + halfDiagonal * Math.cos(angle - alpha + Math.PI), y + halfDiagonal * Math.sin(angle - alpha + Math.PI)),
                            new Point(x + halfDiagonal * Math.cos(angle + alpha + Math.PI), y + halfDiagonal * Math.sin(angle + alpha + Math.PI)),
                            new Point(x + halfDiagonal * Math.cos(angle - alpha), y + halfDiagonal * Math.sin(angle - alpha))]
    }
    setLines() {
            let corners = this.corners;
            this.lines = [  new Line (corners[0], corners[1]),
                            new Line (corners[2], corners[3]),
                            new Line (corners[0], corners[3]),
                            new Line (corners[1], corners[2])]
    }
}
class Sponge extends Batko{
    constructor(x, y, angle, speed=1, width=50, height =100, imgSrc=`img/sponge.png`) {
        super(x, y, angle, speed, width, height, imgSrc);
    }
}
class Frog extends Batko {
    constructor(x, y, angle, speed=0.5, width=94, height =100, imgSrc=`img/frogOchka.png`) {
        super(x, y, angle, speed, width, height, imgSrc);
    }
}
let sponges = new Set();
sponges.add(new Sponge(100,100,0));

class Bullet extends Batko{
    constructor(x, y, angle, speed=20, width=10, height =20, imgSrc=`img/bullet.png`) {
        super(x, y, angle, speed, width, height, imgSrc);
    }
}
let bullets = new Set();



let crab = new Batko(canvas.width/2, canvas.height/2, 0, 5, 150, 150, `img/crab.png`)
crab.shoot = function(){
        bullets.add(new Bullet(this.x, this.y, this.angle));
        audio.shootSound.play();
}
crab.life = 3;



let heart= {
    img:  new Image(),
    width: 50,
    height: 50,
}
heart.img.src = `img/heart.png`;


let pressedButtons = new Set();
document.addEventListener(`keydown`,onKeyDown)
function onKeyDown(event) {
    pressedButtons.add(event.key);
    if(event.key === `p`){
        if(paused){
            setI = setInterval(drawGame,10);
            paused = false;
        }
        else {
            clearInterval(setI);
            paused = true;
        }
    }
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


    trajectory(pressedButtons);
    look(crab,aim.x,aim.y);
    rotateImg(crab.img,crab.angle,crab.x,crab.y,crab.width,crab.width);



    for(let bullet of bullets){
        bulletNavigator(bullet);
        rotateImg(bullet.img, bullet.angle, bullet.x, bullet.y, bullet.width, bullet.height);
        for(let sponge of sponges){
            if(collision(bullet,sponge)){
                sponges.delete(sponge);
                bullets.delete(bullet);
                createSponge();
                createSponge();
                score++;
            }
        }
    }



    for(let sponge of sponges) {
        spongeNavigator(sponge);
        rotateImg(sponge.img, sponge.angle, sponge.x, sponge.y, sponge.width, sponge.height);

         if(collision(crab,sponge)){
             sponges.delete(sponge);
             crab.life--;
             if(!crab.life) gameOver();
         }
    }






    ctx.drawImage(aim.img, aim.x-aim.width/2,aim.y-aim.width/2,aim.width,aim.width);

    for(let i=crab.life;i>0;i--){
        ctx.drawImage(heart.img,canvas.width-i*heart.width, 0,heart.width,heart.height);
    }

    ctx.font = '50px serif';
    ctx.fillStyle = `red`;
    ctx.fillText(score, 0, 50);

}

let setI = setInterval(drawGame,10);



















function distanceBetweenPointAndLine (p, l){
    return Math.abs(l.a * p.x + l.b * p.y + l.c) / Math.sqrt(Math.pow(l.a, 2) + Math.pow(l.b, 2));
}
function halfCollision(c1, c2) {

    for(let p of c2.corners) {
        let res1 = distanceBetweenPointAndLine(p, c1.lines[0]) + distanceBetweenPointAndLine(p, c1.lines[1]);
        let res2 = distanceBetweenPointAndLine(p, c1.lines[2]) + distanceBetweenPointAndLine(p, c1.lines[3]);
        if(res1 < (c1.height + 0.0001) && res2 < (c1.width + 0.0001) &&
            res1 > (c1.height - 0.0001) && res2 > (c1.width - 0.0001)) {
            return true;
        }
    }
    return false;
}
function collision(c1, c2) {
    return halfCollision(c1, c2) || halfCollision(c2, c1);
}
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
function gameOver() {
    clearInterval(setI);
    ctx.fillStyle = `black`
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = `red`;
    ctx.font = "100px Georgia";
    ctx.fillText("Game Over", 400, 400);
    crab.ableToShout = false;

}
function createSponge() {
    let c = Math.round(Math.random()*3);
    let x,y;
    if(c === 0){
        x=-100;
        y= Math.random()*canvas.height;
    }
    else if(c === 1){
        x= Math.random()*canvas.width;
        y= -100;
    }
    else if(c === 2){
        x= canvas.width+100;
        y= Math.random()*canvas.height;
    }
    else if(c === 3){
        x= Math.random()*canvas.width;
        y= canvas.height+100;
    }
    sponges.add(new Sponge(x,y,0));
}





