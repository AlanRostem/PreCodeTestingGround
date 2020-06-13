import Entity from "./entity.js";
import Tile from "./tile.js";
import CollisionEventHandler from "./collision-event-handler.js";

export default class Crate extends Entity {
    static _ = (() => {
        CollisionEventHandler.createCollisionScenario("CrateVsCrate", {
            "left": (self, crate, deltaTime) => {
                if (Math.abs(self.body.vel.x) > Math.abs(crate.body.vel.x)) crate.push(self.body.vel.x /= 2);
            },
            "right": (self, crate, deltaTime) => {
                if (Math.abs(self.body.vel.x) > Math.abs(crate.body.vel.x)) crate.push(self.body.vel.x /= 2);
            }
        });
    })();

    pushing = false;
    update(world, deltaTime) {
        this.body.acc.y = Tile.SIZE * 40;
        super.update(world, deltaTime);
        this.subscribeToReceivingCollisionEvent("PlayerVsCrate");

        this.subscribeToApplyingCollisionEvent("CrateVsCrate");
        this.subscribeToReceivingCollisionEvent("CrateVsCrate");
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