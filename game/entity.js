import RectBody from "./rect-body.js";

class EntityBody extends RectBody {
    constructor(entity, center, extents) {
        super(center, extents);
        this.entity = entity;
    }

    onCollision(side) {
        if (side.y > 0) {
            this.entity.onBottomCollision();
        } else if (side.y < 0) {
            this.entity.onTopCollision();
        }

        if (side.x < 0) {
            this.entity.onLeftCollision();
        } else if (side.x > 0) {
            this.entity.onRightCollision();
        }
    }
}

export default class Entity {


    constructor(body = new EntityBody(this, createVector(width/2, height * .75), createVector(16, 16))) {
        this.color = color(255, random(255), random(255));
        this.body = body;
    }

    onTopCollision() {

    }

    onBottomCollision() {

    }

    onLeftCollision() {

    }

    onRightCollision() {

    }

    update(world, deltaTime) {
        this.body.update(world, deltaTime);
    }

    draw() {
        rectMode(CENTER);
        fill(this.color);
        rect(this.body.center.x, this.body.center.y, this.body.extents.x * 2, this.body.extents.y * 2);
    }
}