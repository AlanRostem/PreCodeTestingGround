import RectBody from "./rect-body.js";
import Tile from "./tile.js";
import AABB from "./aabb.js";

export default class Entity {
    constructor(body = new RectBody(createVector(Tile.SIZE * 10 - 8, Tile.SIZE * 15 - 8), createVector(Tile.SIZE / 2, Tile.SIZE / 2))) {
        this.color = color(255, random(255), random(255));
        this.body = body;
        this.collisionStack = [];
    }

    onTopCollision(entity) {

    }

    onBottomCollision(entity) {

    }

    onLeftCollision(entity) {

    }

    onRightCollision(entity) {

    }

    scanEntities(entities, deltaTime) {
        for (let entity of entities) {
            if (entity !== this) {
                if (this.body.getCollisionBoundary(deltaTime).overlaps(entity.body)) {
                    this.collisionStack.push(this.body.getSweepObject(entity.body, this.body.vel, deltaTime));
                }
            }
        }
    }

    scanTiles(tileMap, deltaTime) {
        let bounds = this.body.getCollisionBoundary(deltaTime);
        let centralTile = Tile.toTile(bounds.center);
        const proxy = 1;
        let tileX = Math.round(bounds.extents.x * 2 / Tile.SIZE + proxy);
        let tileY = Math.round(bounds.extents.y * 2 / Tile.SIZE + proxy);
        if (tileX === 1) tileX++;
        if (tileY === 1) tileY++;
        let tileArea = createVector(tileX, tileY);
        for (let x = -tileArea.x + 1; x < tileArea.x; x++) {
            for (let y = -tileArea.y + 1; y < tileArea.y; y++) {
                let xx = centralTile.x + x;
                let yy = centralTile.y + y;
                let tile = new Tile(xx, yy).toAABB();
                if (
                    xx < 0 || xx >= tileMap.width ||
                    yy < 0 || yy >= tileMap.height ||
                    tileMap.getTileId(xx, yy) === 0 ||
                    !bounds.overlaps(tile)
                ) continue;

                this.collisionStack.push(this.body.getSweepObject(tile, this.body.vel, deltaTime));
            }
        }
    }

    // Resolve all possible collisions
    checkCollision(deltaTime, movement = this.body.vel, remainingTime = 1, collisionStack = this.collisionStack, count = 0) {
        collisionStack.sort((a, b) => {
            return Math.sign(movement.x) * (a.collisionTime - b.collisionTime);
        });
        let hit;
        if (movement.x <= 0)
            hit = collisionStack.pop();
        else
            hit = collisionStack.shift();

        // Retrieve the closest AABB to resolve collision for it
        /*for (let sweep of collisionStack) {
            if (this.body.getCollisionBoundary(deltaTime, movement).overlaps(sweep.aabb)) {
                let newSweep = this.body.getSweepObject(sweep.aabb, movement, deltaTime);
                stack.push(newSweep);
                if (hit) {
                    if (newSweep.collisionTime <= hit.collisionTime) {
                        hit = newSweep;
                    }
                } else {
                    hit = newSweep;
                }
            }
        }*/

        // If a collision is detected at all, resolve for the closest AABB. Otherwise add velocity to position.
        if (hit) {
            if (hit.collisionTime > remainingTime) hit.collisionTime = remainingTime;

            this.body.center.x += movement.x * hit.collisionTime * deltaTime;
            this.body.center.y += movement.y * hit.collisionTime * deltaTime;


            this.body.center.x = parseFloat(this.body.center.x.toFixed(-Math.log10(AABB.EPSILON)));
            this.body.center.y = parseFloat(this.body.center.y.toFixed(-Math.log10(AABB.EPSILON)));

            let time = remainingTime - hit.collisionTime;
            let dotProduct = p5.Vector.dot(movement, hit.normal) * time;
            hit.normal.mult(dotProduct);

            this.onCollision(hit.side);

            stroke(0, 255, 0);
            strokeWeight(1);
            rect(hit.aabb.center.x, hit.aabb.center.y, hit.aabb.extents.x * 2, hit.aabb.extents.y * 2);

            text("" + count, hit.aabb.center.x - 3, hit.aabb.center.y + 3);

            if (time > 0) {
                let stack = [];
                for (let sweep of collisionStack) {
                    if (this.body.getCollisionBoundary(deltaTime, hit.normal).overlaps(sweep.aabb)) {
                        let newSweep = this.body.getSweepObject(sweep.aabb, hit.normal, deltaTime);
                        stack.push(newSweep);
                    }
                }
                // Keep resolving collisions for the other potential collisions
                this.checkCollision(deltaTime, hit.normal, time, stack, count + 1);
            }
        } else {
            this.body.center.add(p5.Vector.mult(movement, deltaTime));

            this.body.center.x = parseFloat(this.body.center.x.toFixed(-Math.log10(AABB.EPSILON)));
            this.body.center.y = parseFloat(this.body.center.y.toFixed(-Math.log10(AABB.EPSILON)));
        }
    }

    update(world, deltaTime) {
        this.body.update(world, deltaTime);
        this.scanEntities(world.entities, deltaTime);
        this.scanTiles(world.tileMap, deltaTime);
        for (let e of this.collisionStack) {
            stroke(255, 255, 255, 100);
            noFill();
            rect(e.aabb.center.x, e.aabb.center.y, e.aabb.extents.x * 2, e.aabb.extents.y * 2);
        }
        stroke(255, 0, 0);
        line(this.body.center.x, this.body.center.y,
            this.body.center.x + this.body.vel.x * deltaTime,
            this.body.center.y + this.body.vel.y * deltaTime);
        this.checkCollision(deltaTime);
        if (this.collisionStack.length > 0) this.collisionStack = [];
    }

    onCollision(side) {
        let entity = null;
        if (side.y > 0) {
            this.onBottomCollision(entity);
        } else if (side.y < 0) {
            this.onTopCollision(entity);
        }

        if (side.x < 0) {
            this.onLeftCollision(entity);
        } else if (side.x > 0) {
            this.onRightCollision(entity);
        }
    }

    draw() {
        let e = this.body.getCollisionBoundary(deltaTime / 1000);
        noFill();
        stroke(255, 0, 0);
        rect(e.center.x, e.center.y, e.extents.x * 2, e.extents.y * 2);
        rectMode(CENTER);
        noStroke();
        fill(this.color);
        rect(this.body.center.x, this.body.center.y, this.body.extents.x * 2, this.body.extents.y * 2);
    }
}