import Entity from "./entity.js";
import Tile from "./tile.js";

export default class Crate extends Entity {
    pushing = false;
    update(world, deltaTime) {
        this.body.acc.y = Tile.SIZE * 40;
        super.update(world, deltaTime);
    }

    push(xVel) {
        this.body.vel.x = xVel;
        this.pushing = true;
    }

    onBottomCollision(entity) {
        this.body.vel.y = 0;
        if (!this.pushing) {
            this.body.vel.x = 0;
        } else {
            this.pushing = false;
        }
    }
}