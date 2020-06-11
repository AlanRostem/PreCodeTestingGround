import TileMap from "./tile-map.js";

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

            if (aabb.bottom > height) {
                aabb.bottom = height;
                e.onBottomCollision(null);
            }

            if (aabb.left < 0) {
                aabb.left = 0;
                e.onLeftCollision(null);
            }

            if (aabb.right > width) {
                aabb.right = width;
                e.onRightCollision(null);
            }
        }
    }

    draw() {

        smooth(true)
        background(150, 0, 50);
        this.tileMap.draw();
        for (let e of this.entities) {
            e.draw();
        }
    }
}