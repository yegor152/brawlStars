`use strict`

let canvas = document.getElementById(`canvas`);
canvas.width = document.documentElement.clientWidth*0.99;
canvas.height = document.documentElement.clientHeight ;
let ctx = canvas.getContext(`2d`);

let score = 0;
let paused = false;

let aim = {
    width: canvas.width * 2 / 57,
    img: new Image(),
    x: 0,
    y: 0,
}
aim.img.src = `img/aim.png`;

document.addEventListener(`mousemove`, onMouseMove);
function onMouseMove(event) {
    aim.x = event.clientX;
    aim.y = event.clientY;
}
let audio = {
    shootSound: new Audio(`audio/shootSound.mp3`),
    f: new Audio(`audio/f.mp3`),
}

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
        if (p1.x === p2.x) {
            this.a = 1;
            this.b = 0;
            this.c = -p1.x;
        }
        if (p1.y === p2.y) {
            this.a = 0;
            this.b = 1;
            this.c = -p1.y;
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
        this.halfDiagonal = Math.sqrt(Math.pow(this.width / 2, 2) + Math.pow(this.height / 2, 2));
        this.alpha = Math.atan(this.height / this.width);
        this.corners = [];
        this.lines = [];
        this.setCorners();
        this.setLines();
    }

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;
        this.setLines();
        this.setCorners();
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;
        this.setLines();
        this.setCorners();
    }


    setCorners() {
        let halfDiagonal = this.halfDiagonal;
        let angle = this.angle;
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
        this.lines = [new Line(corners[0], corners[1]),
            new Line(corners[2], corners[3]),
            new Line(corners[0], corners[3]),
            new Line(corners[1], corners[2])]
    }
}

const sizeCoefficient = canvas.width/1425;


class Bullet extends Batko {
    constructor(x, y, angle) {
        super(x, y, angle,  20 * sizeCoefficient,
            5*sizeCoefficient, 51.5*sizeCoefficient, `img/bullet.png`);
    }
}

class Stone extends Batko {
    constructor(x, y, angle,parent) {
        super(x, y, angle,   7 * sizeCoefficient,
            12.5*sizeCoefficient,  12.5*sizeCoefficient, `img/stone.png`);
        this.parent = parent;
    }
}



class Sponge extends Batko {
    constructor(x, y, angle,) {
        super(x, y, angle,   sizeCoefficient,  25*sizeCoefficient,
            50*sizeCoefficient,  `img/sponge.png`);
        this.type = `sponge`;
    }
}

class Frog extends Batko {
    constructor(x, y, angle) {
        super(x, y, angle,  0.5 * sizeCoefficient, 47*sizeCoefficient,
            50* sizeCoefficient,  `img/frogOchka.png`);
        this.type = `frog`;
        this.ableToShoot = true;
    }

    shoot() {
        if (this.ableToShoot) {
            let speed = this.speed;
            this.speed = 0;
            this.ableToShoot= false;
            setTimeout(()=>{
                if(chertilas.has(this)) {
                    this.speed = speed;
                    stones.add(new Stone(this.x, this.y, this.angle,this));
                    audio.shootSound.play();
                    setTimeout(() => {
                        this.ableToShoot = true;
                    }, 3000);
                }
            },1000);
        }
    };
}

class Cannon extends Batko {
    constructor(x, y, angle) {
        super(x, y, angle,  0.2 * sizeCoefficient, 25*sizeCoefficient,
            50* sizeCoefficient,  `img/testSponge.png`);
        this.type = `cannon`;
        this.ableToShoot = true;
        this.a = 0.05;
        this.charging= false;
        this.maxSpeed =  this.speed;
    }

    shoot() {
        if (this.ableToShoot) {
            this.charging = true;
            this.speed = 0;
            this.ableToShoot= false;
            setTimeout(()=>{
                if(chertilas.has(this)) {
                    this.speed=-2;
                    this.charging= false;
                    stones.add(new Stone(this.x, this.y, this.angle,this));
                    audio.shootSound.play();
                    setTimeout(() => {
                        this.ableToShoot = true;
                    }, 3000);
                }
            },1000);
        }
    };
}

class Crab extends Batko{
    constructor(x,y,angle,life) {
        super(x,y,angle,5 * sizeCoefficient, 75*sizeCoefficient,
            75*sizeCoefficient, `img/crab.png`);
        this.life = life;
    }
    shoot(){
        bullets.add(new Bullet(this.x, this.y, this.angle));
        audio.shootSound.play();
    }
}

let heart = {
    img: new Image(),
    width: 50*sizeCoefficient,
    height: 50*sizeCoefficient,
}
heart.img.src = `img/heart.png`;

let stones = new Set();
let bullets = new Set();
let chertilas = new Set();
let crab = new Crab(canvas.width/2,canvas.height/2,0,3);


let pressedButtons = new Set();
document.addEventListener(`keydown`, onKeyDown)
function onKeyDown(event) {
    pressedButtons.add(event.key);
    if (event.key === `p`) {
        if (paused) {
            setI = setInterval(drawGame, 10);
            paused = false;
        } else {
            clearInterval(setI);
            paused = true;
        }
    }
}

document.addEventListener(`keyup`, onKeyUp)
function onKeyUp(event) {
    pressedButtons.delete(event.key);
}


document.addEventListener(`click`, onClick)
function onClick(event) {
    crab.shoot();
}

let time = 0;
let generateCoef = 0;
const spongeSpawnCoeff = 120;
const frogSpawnCoeff = 150;
const cannonSpawnCoeff = 300;
let currentChertila = `sponge`;
function drawGame() {
    ctx.fillStyle = `#00ffff`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

///////////////////////////////generate chertila//////////////
    time++;
    generateCoef+= 1 + 0.0003*time;

    while (generateCoef >= spongeSpawnCoeff) {
        console.log(currentChertila);
        if (generateCoef >= frogSpawnCoeff && currentChertila ===`frog`){
            createChertila(`frog`);
            generateCoef -= frogSpawnCoeff;
            currentChertila = `sponge`
        }
        else if(currentChertila === "sponge"){
            createChertila(`sponge`);
            generateCoef -= spongeSpawnCoeff;
            currentChertila = `frog`;
        }
        else{
            break;
        }
    }
//////////////////////////////////////////////////////////////

    trajectory(pressedButtons);
    rotateImg(crab.img, crab.angle, crab.x, crab.y, crab.width, crab.height);


    for (let bullet of bullets) {
        simpleNavigator(bullet);
        rotateImg(bullet.img, bullet.angle, bullet.x, bullet.y, bullet.width, bullet.height);
        for (let chertila of chertilas) {
            if (collision(bullet, chertila)) {
                chertilas.delete(chertila);
                bullets.delete(bullet);
                score++;
            }
        }
    }

    for (let chertila of chertilas) {
        if(chertila.type === `sponge`) navigator(chertila);
        else if (chertila.type === `frog`) frogNavigator(chertila);
        else if (chertila.type === `cannon`) cannonNavigator(chertila);
        rotateImg(chertila.img, chertila.angle, chertila.x, chertila.y, chertila.width, chertila.height);

        if (collision(crab, chertila)) {
            chertilas.delete(chertila);
            crab.life--;
            if (!crab.life) gameOver();
        }
        drawWarning(chertila);
    }

    for (let stone of stones){
        simpleNavigator(stone);
        rotateImg(stone.img, stone.angle, stone.x, stone.y, stone.width, stone.height);
        if (collision(crab, stone)) {
            stones.delete(stone);
            crab.life--;
            if (!crab.life) gameOver();
        }
        for (let bullet of bullets){
            if (collision(bullet,stone)){
                stones.delete(stone);
                bullets.delete(bullet);
            }
        }
        for (chertila of chertilas){
            if(collision(chertila,stone) && stone.parent !==chertila){
                chertilas.delete(chertila);
                stones.delete(stone);
            }
        }
    }



    ctx.drawImage(aim.img, aim.x - aim.width / 2, aim.y - aim.width / 2, aim.width, aim.width);

    for (let i = crab.life; i > 0; i--) {
        ctx.drawImage(heart.img, canvas.width - i * heart.width, 0, heart.width, heart.height);
    }

    ctx.font = '50px serif';
    ctx.fillStyle = `red`;
    ctx.fillText(score, 0, 50);

}
let setI = setInterval(drawGame, 10);







