`use strict`

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
function simpleNavigator(object) {
    object.x += Math.sin(object.angle) * object.speed;
    object.y -= Math.cos(object.angle) * object.speed;

    if (!inField(object)) {
        bullets.delete(object);
        stones.delete(object);
    }
}
function navigator(sponge) {
    sponge.angle = Math.atan2(crab.x - sponge.x, sponge.y - crab.y);

    simpleNavigator(sponge);
}
function frogNavigator(frog) {
    navigator(frog);
    if (inField(frog))frog.shoot();
}
function drawWarning(chertila) {
    let img = new Image();
    length = 50*sizeCoefficient;
    img.src = `img/warning.png`;
    if (chertila.x<0)rotateImg(img,0,length/2,chertila.y,length,length);
    if (chertila.y<0)rotateImg(img,0,chertila.x,length/2,length,length);
    if (chertila.x>canvas.width)rotateImg(img,0,canvas.width-length/2,chertila.y,length,length);
    if (chertila.y>canvas.height)rotateImg(img,0,chertila.x,canvas.height-length/2,length,length);
}
function cannonNavigator(cannon) {
    if(cannon.speed === cannon.maxSpeed) {
        navigator(cannon);
        if (inField(cannon)) cannon.shoot();
    }
    else if(cannon.speed <0 && !cannon.charging){
        cannon.speed+= cannon.a;
        simpleNavigator(cannon);
    }
    else if(!cannon.charging){
        cannon.speed = cannon.maxSpeed;
        simpleNavigator(cannon);
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
    else if (chertilaType.toLowerCase() === `cannon`) chertilas.add(new Cannon(x, y, 0));
}


