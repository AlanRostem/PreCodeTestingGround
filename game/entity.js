import RectBody from "./rect-body.js";

export default class Entity {
    constructor(body = new RectBody(createVector(width/2, height * .75), createVector(16, 16))) {
        this.color = color(255, random(255), random(255));
        this.body = body;
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