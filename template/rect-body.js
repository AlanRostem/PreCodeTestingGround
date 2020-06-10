import AABB from "./aabb.js"
import Sweep from "./sweep.js"

export default class RectBody extends AABB {
    vel = createVector();
    acc = createVector();

    getCollisionBoundary(deltaTime, movement = this.vel) {
        let collisionBoundary = new AABB(this.center.copy(), this.extents.copy());
        let vel = p5.Vector.mult(movement, deltaTime);
        if (vel.x > 0) {
            collisionBoundary.extents.x = this.extents.x + vel.x;
            collisionBoundary.left = this.left;
        } else {
            collisionBoundary.extents.x = this.extents.x - vel.x;
            collisionBoundary.right = this.right;
        }

        if (vel.y > 0) {
            collisionBoundary.extents.y = this.extents.y + vel.y;
            collisionBoundary.top = this.top;
        } else {
            collisionBoundary.extents.y = this.extents.y - vel.y;
            collisionBoundary.bottom = this.bottom;
        }
        return collisionBoundary;
    }

    update(world, deltaTime) {
        this.vel.add(p5.Vector.mult(this.acc, deltaTime));
    }
};