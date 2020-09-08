import RectBody from "./rect-body.js";
import Tile from "./tile.js";
import AABB from "./aabb.js";
import EventSubscriptionSet from "./event-subscription-set.js";
import CollisionEventHandler from "./collision-event-handler.js";
import EntityEventHandler from "./entity-event-handler.js";

export default class Entity {
    static _ = (() => {
        EntityEventHandler.createRelation("PhysicalVsPhysical",
            (e0, e1, dt) => e0.body.getCollisionBoundary(dt).overlaps(e1.body),
            (e0, e1, dt) => e0.collisionStack.push(e0.body.getSweepObject(e1.body, e0.body.vel, dt, e1))
        );
    })();

    constructor(body = new RectBody(createVector(Tile.SIZE * 10 - 8, Tile.SIZE * 15 - 8), createVector(
        Tile.SIZE / 2,
        Tile.SIZE / 2))) {
        this.color = color(255, random(255), random(255));
        this.body = body;
        this.collisionStack = [];

        this.applyingRelationSubs = new EventSubscriptionSet();
        this.receivingRelationSubs = new EventSubscriptionSet();

        this.subscribeToApplyingRelation("PhysicalVsPhysical");
        this.subscribeToReceivingRelation("PhysicalVsPhysical");

        this.applyingCollisionSubs = new EventSubscriptionSet();
        this.receivingCollisionSubs = new EventSubscriptionSet();
    }

    subscribeToApplyingCollisionEvent(event) {
        this.applyingCollisionSubs.add(event);
    }


    subscribeToReceivingCollisionEvent(event) {
        this.receivingCollisionSubs.add(event);
    }

    subscribeToApplyingRelation(event) {
        this.applyingRelationSubs.add(event);
    }


    subscribeToReceivingRelation(event) {
        this.receivingRelationSubs.add(event);
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
                EntityEventHandler.postRelationEvents(this, entity, deltaTime);
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
                    tileMap.getTileId(xx, yy) === 0
                    || !bounds.overlaps(tile)
                ) continue;

                this.collisionStack.push(this.body.getSweepObject(tile, this.body.vel, deltaTime));
            }
        }
    }

    // Resolve all possible collisions
    checkCollision(deltaTime, movement = this.body.vel, remainingTime = 1, collisionStack = this.collisionStack, count = 0) {
        collisionStack.sort((a, b) => a.distance - b.distance);
        collisionStack.sort((a, b) => a.collisionTime - b.collisionTime);

        let hit = collisionStack.shift();

        // If a collision is detected at all, resolve for the closest AABB. Otherwise add velocity to position.
        if (hit) {
            this.body.center.x += movement.x * hit.collisionTime * deltaTime;// - Math.sign(movement.x) * AABB.EPSILON;
            this.body.center.y += movement.y * hit.collisionTime * deltaTime;// - Math.sign(movement.y) * AABB.EPSILON;
            let time = remainingTime - hit.collisionTime;
            let dotProduct = p5.Vector.dot(movement, hit.normal) * time;
            hit.normal.mult(dotProduct);
            this.onCollision(hit);
            if (hit.entity !== null)
                CollisionEventHandler.postCollisionEvents(this, hit, deltaTime);

            function highlight(box, c = color(0, 255, 0)) {
                stroke(c);
                strokeWeight(1);
                rect(box.center.x, box.center.y, box.extents.x * 2, box.extents.y * 2);
                noFill();
            }

            highlight(hit.aabb);

            if (time > 0) {
                let stack = [];
                for (let sweep of collisionStack) {
                    fill(255);
                    highlight(sweep.aabb, color(255));
                    if (this.body.getCollisionBoundary(deltaTime, hit.normal).overlaps(sweep.aabb)) {
                        let newSweep = this.body.getSweepObject(sweep.aabb, hit.normal, deltaTime, sweep.entity);
                        stack.push(newSweep);
                    }
                }
                // Keep resolving collisions for the other potential collisions
                this.checkCollision(deltaTime, hit.normal, time, stack, count + 1);
            }
        } else {
            this.body.center.add(p5.Vector.mult(movement, deltaTime));
        }
    }

    update(world, deltaTime) {
        this.body.update(world, deltaTime);
        this.scanEntities(world.entities, deltaTime);
        this.scanTiles(world.tileMap, deltaTime);
        for (let e of this.collisionStack) {
            //stroke(255, 255, 255, 100);
            //noFill();
            //rect(e.aabb.center.x, e.aabb.center.y, e.aabb.extents.x * 2, e.aabb.extents.y * 2);
        }
        stroke(255, 0, 0);
        line(this.body.center.x, this.body.center.y,
            this.body.center.x + this.body.vel.x * deltaTime,
            this.body.center.y + this.body.vel.y * deltaTime);
        this.checkCollision(deltaTime);
        if (this.collisionStack.length > 0) this.collisionStack = [];
    }

    onCollision(hit) {
        let side = hit.side;

        switch (side) {
            case "top":
                this.onTopCollision();
                break;
            case "bottom":
                this.onBottomCollision();
                break;
            case "left":
                this.onLeftCollision();
                break;
            case "right":
                this.onRightCollision();
        }
    }

    draw() {
        let e = this.body.getCollisionBoundary(deltaTime / 1000);
        //noFill();
        //stroke(255, 0, 0);
        //rect(e.center.x, e.center.y, e.extents.x * 2, e.extents.y * 2);
        rectMode(CENTER);
        noStroke();
        fill(this.color);
        rect(this.body.center.x, this.body.center.y, this.body.extents.x * 2, this.body.extents.y * 2);
    }
}