import TileMap from "./tile-map.js";
import Tile from "./tile.js";

export default class World {
    entities = [];
    tileMap = new TileMap();

    spawnEntity(entity) {
        this.entities.push(entity);
    }

    update(deltaTime) {
        for (let e of this.entities) {
            e.update(this, deltaTime);
        }

        for (let e of this.entities) {
            let aabb = e.body;
            if (aabb.top < 0) {
                aabb.top = 0;
                e.onTopCollision(null);
            }

            if (aabb.bottom > this.tileMap.height * Tile.SIZE) {
                aabb.bottom = this.tileMap.height * Tile.SIZE;
                e.onBottomCollision(null);
            }

            if (aabb.left < 0) {
                aabb.left = 0;
                e.onLeftCollision(null);
            }

            if (aabb.right > this.tileMap.width * Tile.SIZE) {
                aabb.right = this.tileMap.width * Tile.SIZE;
                e.onRightCollision(null);
            }
        }
    }

    draw() {
        background(150, 0, 50);
        this.tileMap.draw();
        for (let e of this.entities) {
            e.draw();
        }
    }
}