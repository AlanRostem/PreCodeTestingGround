import RectBody from "./rect-body.js";
import Tile from "./tile.js";

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
        this.collisionStack = [];
    }

    onTopCollision() {

    }

    onBottomCollision() {

    }

    onLeftCollision() {

    }

    onRightCollision() {

    }

    scanEntities(entities, deltaTime) {
        for (let entity of entities) {
            if (entity.body !== this) {
                if (this.body.getCollisionBoundary(deltaTime).overlaps(entity.body)) {
                    this.collisionStack.push(entity.body);
                }
            }
        }
    }

    scanTiles(tileMap, deltaTime) {
        let centralTile = Tile.toTile(this.body.center);
        const proxy = 1;
        let tileX = Math.round(this.body.extents.x * 2 / Tile.SIZE + proxy);
        let tileY = Math.round(this.body.extents.y * 2 / Tile.SIZE + proxy);
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
                    !this.body.getCollisionBoundary(deltaTime).overlaps(tile)
                ) continue;

                this.collisionStack.push(tile);
            }
        }
    }

    checkCollision(deltaTime, movement = this.body.vel, remainingTime = 1, collisionStack = this.collisionStack, count = 0) {
        let hit;
        let stack = [];

        for (let entity of collisionStack) {
            if (entity !== this) {
                if (this.body.getCollisionBoundary(deltaTime, movement).overlaps(entity)) {
                    let sweep = this.body.getSweepObject(entity, movement, deltaTime);
                    stack.push(entity);
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

        if (hit) {
            if (hit.collisionTime > remainingTime) hit.collisionTime = remainingTime;

            this.body.center.x += movement.x * hit.collisionTime * deltaTime; // - Math.sign(movement.x) * EPSILON;
            this.body.center.y += movement.y * hit.collisionTime * deltaTime; // - Math.sign(movement.y) * EPSILON;

            let time = remainingTime - hit.collisionTime;
            let dotProduct = p5.Vector.dot(movement, hit.normal) * time;
            hit.normal.mult(dotProduct);

            this.body.onCollision(hit.side);

            if (time > 0 && count < 5)
                this.checkCollision(deltaTime, hit.normal, time, stack, count + 1);
        } else {
            this.body.center.add(p5.Vector.mult(movement, deltaTime))
        }
    }

    update(world, deltaTime) {
        this.body.update(world, deltaTime);
        this.scanEntities(world.entities, deltaTime);
        this.scanTiles(world.tileMap, deltaTime);
        this.checkCollision(deltaTime);
        if (this.collisionStack.length > 0) this.collisionStack = [];
    }

    draw() {
        rectMode(CENTER);
        fill(this.color);
        rect(this.body.center.x, this.body.center.y, this.body.extents.x * 2, this.body.extents.y * 2);
    }
}