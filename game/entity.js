import RectBody from "./rect-body.js";
import Tile from "./tile.js";

export default class Entity {
    constructor(body = new RectBody(createVector(Tile.SIZE * 10, Tile.SIZE * 15), createVector(Tile.SIZE / 2, Tile.SIZE / 2))) {
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
                    this.collisionStack.push(entity.body);
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

                this.collisionStack.push(tile);
            }
        }
    }

    // Resolve all possible collisions
    checkCollision(deltaTime, movement = this.body.vel, remainingTime = 1, collisionStack = this.collisionStack, count = 0) {
        let hit;
        let stack = [];

        // Retrieve the closest AABB to resolve collision for it
        for (let aabb of collisionStack) {
            if (aabb !== this) {
                if (this.body.getCollisionBoundary(deltaTime, movement).overlaps(aabb)) {
                    let sweep = this.body.getSweepObject(aabb, movement, deltaTime);
                    stack.push(aabb);
                    sweep.center = aabb.center;
                    sweep.extents = aabb.extents;
                    if (hit) {
                        if (sweep.collisionTime < hit.collisionTime) {
                            hit = sweep;
                        }
                    } else {
                        hit = sweep;
                    }
                }
            }
        }

        // If a collision is detected at all, resolve for the closest AABB. Otherwise add velocity to position.
        if (hit) {
            if (hit.collisionTime > remainingTime) hit.collisionTime = remainingTime;

            this.body.center.x += movement.x * hit.collisionTime * deltaTime; // - Math.sign(movement.x) * EPSILON;
            this.body.center.y += movement.y * hit.collisionTime * deltaTime; // - Math.sign(movement.y) * EPSILON;

            let time = remainingTime - hit.collisionTime;
            let dotProduct = p5.Vector.dot(movement, hit.normal) * time;
            hit.normal.mult(dotProduct);

            this.onCollision(hit.side);

            stroke(0, 255, 0);
            strokeWeight(1);
            rect(hit.center.x, hit.center.y, hit.extents.x * 2, hit.extents.y * 2);


            if (time > 0 && count < 5)
            // Keep resolving collisions for the other potential collisions
                this.checkCollision(deltaTime, hit.normal, time, stack, count + 1);
        } else {
            this.body.center.add(p5.Vector.mult(movement, deltaTime))
        }
    }

    update(world, deltaTime) {
        this.body.update(world, deltaTime);
        this.scanEntities(world.entities, deltaTime);
        this.scanTiles(world.tileMap, deltaTime);
        for (let e of this.collisionStack) {
            stroke(255, 255, 255, 100);
            noFill();
            rect(e.center.x, e.center.y, e.extents.x * 2, e.extents.y * 2);
        }
        stroke(255, 0, 0);
        line(this.body.center.x, this.body.center.y,
            this.body.center.x + this.body.vel.x / Tile.SIZE,
            this.body.center.y + this.body.vel.y / Tile.SIZE);
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
        stroke(255, 255, 0);
        rect(e.center.x, e.center.y, e.extents.x * 2, e.extents.y * 2);
        rectMode(CENTER);
        noStroke();
        fill(this.color);
        rect(this.body.center.x, this.body.center.y, this.body.extents.x * 2, this.body.extents.y * 2);
    }
}