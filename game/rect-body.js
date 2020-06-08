import AABB from "./aabb.js"
import Sweep from "./sweep.js"

export default class RectBody extends AABB {
    vel = createVector();
    acc = createVector();
    collisionStack = [];

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

    scanEntities(entities, deltaTime) {
        for (let entity of entities) {
            if (entity !== this) {
                if (this.getCollisionBoundary(deltaTime).overlaps(entity)) {
                    this.collisionStack.push(entity);
                }
            }
        }
    }

    update(world, deltaTime) {
        this.vel.add(p5.Vector.mult(this.acc, deltaTime));
        this.scanEntities(world.entities, deltaTime);
        // TODO: this.scanTiles(world.tileMap);
        this.checkCollision(deltaTime);
    }

    checkCollision(deltaTime, movement = this.vel, remainingTime = 1, collisionStack = this.collisionStack, count = 0) {
        let potential;
        let stack = [];

        for (let entity of collisionStack) {
            if (entity !== this) {
                if (this.getCollisionBoundary(movement).overlaps(entity)) {
                    let sweep = this.getSweepObject(entity, movement, deltaTime / 1000);
                    stack.push(entity);
                    if (potential) {
                        if (sweep.collisionTime < potential.collisionTime) {
                            potential = sweep;
                        }
                    } else {
                        potential = sweep;
                    }
                }
            }
        }

        if (potential) {
            if (potential.collisionTime > remainingTime) potential.collisionTime = remainingTime;

            this.center.x += movement.x * potential.collisionTime * deltaTime;
            this.center.y += movement.y * potential.collisionTime * deltaTime;

            let time = remainingTime - potential.collisionTime;
            let dotProduct = p5.Vector.dot(movement, potential.normal) * time;
            potential.normal.mult(dotProduct);

            if (time > 0 && count < 5)
                this.checkCollision(potential.normal, time, stack, deltaTime, count + 1);
        } else {
            this.center.add(p5.Vector.mult(movement, deltaTime))
        }
    }

    getSweepObject(aabb, movement, deltaTime) {
        let deltaEntry = createVector(0, 0);
        let deltaExit = createVector(0, 0);

        let velocity = p5.Vector.mult(movement, deltaTime);

        if (velocity.x > 0) {
            deltaEntry.x = aabb.left - this.right;
            deltaExit.x = aabb.right - this.left;
        } else {
            deltaEntry.x = aabb.right - this.left;
            deltaExit.x = aabb.left - this.right;
        }

        if (velocity.y > 0) {
            deltaEntry.y = aabb.top - this.bottom;
            deltaExit.y = aabb.bottom - this.top;
        } else {
            deltaEntry.y = aabb.bottom - this.top;
            deltaExit.y = aabb.top - this.bottom;
        }

        let entryTime = createVector(0, 0);
        let exitTime = createVector(0, 0);

        if (velocity.x === 0) {
            entryTime.x = -Infinity;
            exitTime.x = Infinity;
        } else {
            entryTime.x = deltaEntry.x / velocity.x;
            exitTime.x = deltaExit.x / velocity.x;
        }

        if (velocity.y === 0) {
            entryTime.y = -Infinity;
            exitTime.y = Infinity;
        } else {
            entryTime.y = deltaEntry.y / velocity.y;
            exitTime.y = deltaExit.y / velocity.y;
        }

        if (entryTime.y > 1) entryTime.y = -Infinity;
        if (entryTime.x > 1) entryTime.x = -Infinity;

        let maxEntryTime = Math.max(entryTime.x, entryTime.y);
        let minExitTime = Math.min(exitTime.x, exitTime.y);

        let resultTime = 1;
        let normal = createVector();

        if (!(maxEntryTime > minExitTime ||
            (entryTime.x < 0 && entryTime.y < 0)
            || (entryTime.x < 0 && (this.right < aabb.left || this.left > aabb.right))
            || (entryTime.y < 0 && (this.bottom < aabb.top || this.top > aabb.bottom))
        )) {
            resultTime = maxEntryTime;
            if (Math.abs(deltaEntry.x) > Math.abs(deltaEntry.y)) {
                if (deltaEntry.x < 0) {
                    normal = createVector(1, 0);
                } else {
                    normal = createVector(-1, 0);
                }
            } else {
                if (deltaEntry.y < 0) {
                    normal = createVector(0, 1);
                } else {
                    normal = createVector(0, -1);
                }
            }
        }
        resultTime = Math.floor((resultTime * 1e5)) / 1e5;

        return new Sweep(resultTime, normal);
    }
};