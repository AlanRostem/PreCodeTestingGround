import AABB from "./aabb.js"
import Sweep from "./sweep.js"

export default class RectBody extends AABB {
    vel = createVector();
    acc = createVector();
    old = createVector();

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

    getSweepObject(aabb, movement, deltaTime, entity = null) {
        let deltaEntry = createVector(0, 0);
        let deltaExit = createVector(0, 0);

        let velocity = p5.Vector.mult(movement, deltaTime);

        /**
         * The issue lies there ^^^^^ since we solve for collision that will probably
         * happen in the future (aka next frame) which makes it impossible to go through
         * tile gaps when in motion along one axis. The way we solve collision using
         * time relies on there being an active motion and does not account for objects
         * that were displaced instantly. This causes collision detection to look at the
         * tile that closes the gap before letting the player fall into the hole. Instead,
         * there should be no knowledge of the gap closure tile until gravity was applied
         * to the player.
         *
         * Solving collision using displacement calculated from the previous frame in order
         * to simulate velocity and using collision time from the past can solve this issue
         * since this eliminates the knowledge of the tile that closes the gap.
         */

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
        let side = "";
        let hasCollided = false;

        if (!(maxEntryTime > minExitTime ||
            (entryTime.x < 0 && entryTime.y < 0)
            || (entryTime.x < 0 && (this.right + velocity.x * maxEntryTime < aabb.left || this.left + velocity.x * maxEntryTime > aabb.right))
            || (entryTime.y < 0 && (this.bottom + velocity.y * maxEntryTime < aabb.top || this.top + velocity.y * maxEntryTime > aabb.bottom))
        )) {
            resultTime = maxEntryTime;
            hasCollided = true;
            if (entryTime.x < entryTime.y) {
                normal = createVector(Math.sign(deltaEntry.x), 0);
                if (velocity.y > 0) side = "bottom";
                else if (velocity.y < 0) side = "top";
            } else if (entryTime.x > entryTime.y) {
                normal = createVector(0, Math.sign(deltaEntry.y));
                if (velocity.x > 0) side = "right";
                else if (velocity.x < 0) side = "left";
            } else {
                // Problem: Both axes have equal intersection depth (direct and perfect corner collision).
                // We need to use the velocity to determine the correct collision normal
                let absVel = createVector(Math.abs(velocity.x), Math.abs(velocity.y));

                // If the x-velocity is stronger than the y-velocity, perform a y-collision like we did previously and vice-versa
                if (absVel.x >= absVel.y) {
                    normal = createVector(Math.sign(velocity.x), 0);
                    if (velocity.y > 0) side = "bottom";
                    else if (velocity.y < 0) side = "top";
                } else if (absVel.x < absVel.y) {
                    normal = createVector(0, Math.sign(velocity.y));
                    if (velocity.x > 0) side = "right";
                    else if (velocity.x < 0) side = "left";
                }

                /**
                 * This causes an issue where entities with the size equal to a tile cannot pass through
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

        return new Sweep(aabb, entity, resultTime, normal, side, this.center.copy().sub(aabb.center).magSq(), hasCollided);
    }

    get displacement() {
        return this.center.copy().sub(this.old);
    }

    update(world, deltaTime) {
        this.old = this.center.copy();
        this.vel.add(p5.Vector.mult(this.acc, deltaTime));
    }
};