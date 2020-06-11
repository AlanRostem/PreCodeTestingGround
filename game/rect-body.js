import AABB from "./aabb.js"
import Sweep from "./sweep.js"

export default class RectBody extends AABB {
    vel = createVector();
    acc = createVector();

    constructor(e,c) {
        super(e, c);
        this.extents.x -= (AABB.EPSILON);
        this.extents.y -= (AABB.EPSILON);
    }

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
        let side = createVector();

        if (!(maxEntryTime > minExitTime ||
            (entryTime.x < 0 && entryTime.y < 0)
            || (entryTime.x < 0 && (this.right + velocity.x * maxEntryTime < aabb.left || this.left + velocity.x * maxEntryTime > aabb.right))
            || (entryTime.y < 0 && (this.bottom + velocity.y * maxEntryTime < aabb.top || this.top + velocity.y * maxEntryTime > aabb.bottom))
        )) {
            resultTime = maxEntryTime;
            if (entryTime.x < entryTime.y) {
                normal = createVector(Math.sign(deltaEntry.x), 0);
                side.y = Math.sign(velocity.y);
            } else if (entryTime.x > entryTime.y) {
                normal = createVector(0, Math.sign(deltaEntry.y));
                side.x = Math.sign(velocity.x);
            } else {
                // Problem: Both axes have equal intersection depth (direct and perfect corner collision).
                // We need to use the velocity to determine the correct collision normal
                let absVel = createVector(Math.abs(this.vel.x), Math.abs(this.vel.y));

                // If the x-velocity is stronger than the y-velocity, perform a y-collision like we did previously and vice-versa
                if (absVel.x > absVel.y) {
                    normal = createVector(Math.sign(velocity.x), 0);
                    side.y = Math.sign(velocity.y);
                } else if (absVel.x < absVel.y) {
                    normal = createVector(0, Math.sign(velocity.y));
                    side.x = Math.sign(velocity.x);
                }

                /**
                 * This causes an issue than entities with the size equal to a tile cannot pass through
                 * a tile "hole". The reason for this is that the collision normal changes to one axis
                 * with its respective direction, which makes sense if you want to solve the "crack"
                 * problem in the long-term.
                 *
                 * Another potential issue is if the velocity of both axes is perfectly equal. This
                 * would satisfy the condition "absVel.x == absVel.y" which means we do not handle
                 * any collision normal ("normal"-variable defaults to p5.Vector(0, 0)). This would
                 * rarely happen in a platformer, but could happen nonetheless.
                 *
                 * There needs to be a solution to both problems simultaneously. I have yet to find
                 * that out, but the idea remains the same; to prioritize one axis over the other.
                 * My idea is that we can prioritize y over x since we involve gravity (which is
                 * usually applied to y), if and only if the velocity on both axes remain equal.
                 * However, concepts such as multi-directional gravity (e.g. diagonal gravity or
                 * x-axis gravity on magnet blocks in Pivot) will be problematic.
                 *
                 * In conclusion, the concept of "if x > y then resolve for x and vice-versa" is
                 * fundamentally flawed for all use-cases of swept AABB collision, and needs to
                 * be reevaluated. 
                 */

                fill(0, 255, 255);
                rect(aabb.center.x, aabb.center.y, aabb.extents.x * 2, aabb.extents.y * 2);
            }
        }

        //resultTime = Math.floor(resultTime / AABB.EPSILON) * AABB.EPSILON;

        return new Sweep(aabb, resultTime, normal, side);
    }

    update(world, deltaTime) {
        this.vel.add(p5.Vector.mult(this.acc, deltaTime));
    }
};