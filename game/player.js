import Entity from "./entity.js"

export default class Player extends Entity {
    walkSpeed = 200;
    jumpSpeed = 500;

    constructor() {
        super();
        this.body.acc.y = 2000;
        this.body.extents = createVector(16, 16);
    }

    controls() {
        if (keyIsDown(65)) this.body.vel.x = -this.walkSpeed;
        if (keyIsDown(68)) this.body.vel.x = this.walkSpeed;
        if (keyIsDown(32)) {
            if (!this.jumping) {
                this.jumping = true;
                this.body.vel.y = -this.jumpSpeed;
            }
        }
    }

    onLeftCollision() {
        this.body.vel.x = 0;
    }

    onRightCollision() {
        this.body.vel.x = 0;
    }

    onTopCollision() {
        this.body.vel.y *= 0;
    }

    onBottomCollision() {
        this.jumping = false;
        this.body.vel.x = 0;
        this.body.vel.y = 0;
    }

    update(world, deltaTime) {
        this.controls();
        super.update(world, deltaTime);
    }
}