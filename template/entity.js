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
                if (this.body.getVelocityBoundary(deltaTime).overlaps(entity.body)) {
                    // TODO: Reserve collision resolution
                }
            }
        }
    }

    scanTiles(tileMap, deltaTime) {
        let bounds = this.body.getVelocityBoundary(deltaTime);
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

                // TODO: Reserve collision resolution
            }
        }
    }

    resolveCollision(deltaTime) {
        // TODO: Implement
    }

    update(world, deltaTime) {
        this.body.update(world, deltaTime);
        this.body.center.add(this.body.vel.copy().mult(deltaTime));
        this.scanEntities(world.entities, deltaTime);
        this.scanTiles(world.tileMap, deltaTime);
        this.resolveCollision(deltaTime);
    }


    draw() {
        fill(this.color);
        rect(this.body.center.x, this.body.center.y, this.body.extents.x * 2, this.body.extents.y * 2);
    }
}