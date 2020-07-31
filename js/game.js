`use strict`

let canvas = document.getElementById(`canvas`);
canvas.width = document.documentElement.clientWidth * 0.99;
canvas.height = document.documentElement.clientHeight * 0.98;
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
audio.f.play();
audio.f.volume = 0.5;
audio.a = audio.f;

let map = []


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

const macDiagonal13 = Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / Math.sqrt(773 ** 2 + 1425 ** 2);

class Bullet extends Batko {
    constructor(x, y, angle, speed = 20 * macDiagonal13,
                width = canvas.width / 285, height = canvas.height / 15, imgSrc = `img/bullet.png`) {
        super(x, y, angle, speed, width, height, imgSrc);
    }
}

class Stone extends Batko {
    constructor(x, y, angle, speed = 7 * macDiagonal13,
                width = canvas.width / 114, height = canvas.height * 12.5 / 773, imgSrc = `img/stone.png`) {
        super(x, y, angle, speed, width, height, imgSrc);
    }
}

let stones = new Set();

class Sponge extends Batko {
    constructor(x, y, angle, speed = macDiagonal13,
                width = canvas.width / 57, height = canvas.height * 50 / 773, imgSrc = `img/sponge.png`) {
        super(x, y, angle, speed, width, height, imgSrc);
        this.type = `sponge`;
    }
}

class Frog extends Batko {
    constructor(x, y, angle, speed = 0.5 * macDiagonal13,
                width = canvas.width * 47 / 1425, height = canvas.height * 50 / 773, imgSrc = `img/frogOchka.png`) {
        super(x, y, angle, speed, width, height, imgSrc);
        this.type = `frog`;
        this.ableToShoot = true;
    }

    shoot() {
        if (this.ableToShoot) {
            let speed = this.speed;
            this.speed = 0;
            this.ableToShoot= false;
            console.log(chertilas.has(this));
            setTimeout(()=>{
                if(chertilas.has(this)) {
                    this.speed = speed;
                    stones.add(new Stone(this.x, this.y, this.angle));
                    audio.shootSound.play();
                    setTimeout(() => {
                        this.ableToShoot = true;
                    }, 3000);
                }
            },1000);
        }
    };
}

let chertilas = new Set();
chertilas.add(new Sponge(100, 100, 0));


let bullets = new Set();


let crab = new Batko(canvas.width / 2, canvas.height / 2, 0, 5 * macDiagonal13,
    75 / 1425 * canvas.width, 75 / 773 * canvas.height, `img/crab.png`)
crab.shoot = function () {
    bullets.add(new Bullet(this.x, this.y, this.angle));
    audio.shootSound.play();
}
crab.life = 3;


let heart = {
    img: new Image(),
    width: 50,
    height: 50,
}
heart.img.src = `img/heart.png`;


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


function drawGame() {
    ctx.fillStyle = `#00ffff`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    trajectory(pressedButtons);
    rotateImg(crab.img, crab.angle, crab.x, crab.y, crab.width, crab.height);


    for (let bullet of bullets) {
        simpleNavigator(bullet);
        rotateImg(bullet.img, bullet.angle, bullet.x, bullet.y, bullet.width, bullet.height);
        for (let chertila of chertilas) {
            if (collision(bullet, chertila)) {
                chertilas.delete(chertila);
                bullets.delete(bullet);
                createChertila(`sponge`);
                createChertila(`frog`);
                score++;
            }
        }
    }


    for (let chertila of chertilas) {
        if(chertila.type === `sponge`) navigator(chertila);
        else if (chertila.type === `frog`) frogNavigator(chertila);
        rotateImg(chertila.img, chertila.angle, chertila.x, chertila.y, chertila.width, chertila.height);

        if (collision(crab, chertila)) {
            chertilas.delete(chertila);
            crab.life--;
            if (!crab.life) gameOver();
        }
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






function distanceBetweenPointAndLine(p, l) {
    return Math.abs(l.a * p.x + l.b * p.y + l.c) / Math.sqrt(Math.pow(l.a, 2) + Math.pow(l.b, 2));
}
function halfCollision(c1, c2) {

    for (let p of c2.corners) {
        let res1 = distanceBetweenPointAndLine(p, c1.lines[0]) + distanceBetweenPointAndLine(p, c1.lines[1]);
        let res2 = distanceBetweenPointAndLine(p, c1.lines[2]) + distanceBetweenPointAndLine(p, c1.lines[3]);
        if (res1 < (c1.height + 0.0001) && res2 < (c1.width + 0.0001) &&
            res1 > (c1.height - 0.0001) && res2 > (c1.width - 0.0001)) {
            return true;
        }
    }
    return false;
}
function collision(c1, c2) {
    return halfCollision(c1, c2) || halfCollision(c2, c1);
}



function rotateImg(img, angle, x, y, width, height) {
    ctx.save();
    ctx.rotate(angle);
    y -= height / 2;
    x -= width / 2;

    ctx.translate((x + width / 2) * Math.cos(angle) + (y + height / 2) * Math.sin(angle) - x - width / 2,
        -(x + width / 2) * Math.sin(angle) + (y + height / 2) * Math.cos(angle) - y - height / 2);

    ctx.drawImage(img, x, y, width, height);
    ctx.restore();


}

function inField(object) {
    if(object.x<object.width/2) return false;
    if(object.x>canvas.width-object.width/2) return false;
    if(object.y<object.height/2) return false;
    if(object.y>canvas.height-object.height/2) return false;
    return true;
}

function trajectory(set) {
    crab.angle = Math.atan2(aim.x - crab.x, crab.y - aim.y);
    if (set.has(`w`)) {
        crab.y -= crab.speed;
    }
    if (set.has(`d`)) {
        crab.x += crab.speed;
    }
    if (set.has(`s`)) {
        crab.y += crab.speed;
    }
    if (set.has(`a`)) {
        crab.x -= crab.speed;
    }
    crab.x = Math.max(crab.width/2,crab.x);
    crab.x = Math.min(canvas.width- crab.width/2,crab.x);
    crab.y = Math.max(crab.height/2,crab.y);
    crab.y = Math.min(canvas.height-crab.height/2,crab.y);
}
function navigator(sponge) {
    sponge.angle = Math.atan2(crab.x - sponge.x, sponge.y - crab.y);

    simpleNavigator(sponge);
}
function frogNavigator(frog) {
    navigator(frog);
    if (inField(frog))frog.shoot();
}
function simpleNavigator(object) {
    object.x += Math.sin(object.angle) * object.speed;
    object.y -= Math.cos(object.angle) * object.speed;

    if (object.x < 0 || object.x > canvas.width || object.y < 0 || object.y > canvas.height) {
        bullets.delete(object);
        stones.delete(object);
    }
}



function gameOver() {
    clearInterval(setI);
    ctx.fillStyle = `black`
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = `red`;
    ctx.font = "100px Georgia";
    ctx.fillText("Game Over", 400, 400);
    crab.ableToShout = false;

}


function createChertila(chertilaType) {
    let c = Math.round(Math.random() * 3);
    let x, y;
    if (c === 0) {
        x = -100;
        y = Math.random() * canvas.height;
    } else if (c === 1) {
        x = Math.random() * canvas.width;
        y = -100;
    } else if (c === 2) {
        x = canvas.width + 100;
        y = Math.random() * canvas.height;
    } else if (c === 3) {
        x = Math.random() * canvas.width;
        y = canvas.height + 100;
    }
    if (chertilaType.toLowerCase() === `sponge`) chertilas.add(new Sponge(x, y, 0));
    else if (chertilaType.toLowerCase() === `frog`) chertilas.add(new Frog(x, y, 0));
}





