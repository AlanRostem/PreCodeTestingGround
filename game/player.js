import Entity from "./entity.js"
import Tile from "./tile.js"
import CollisionEventHandler from "./collision-event-handler.js";

export default class Player extends Entity {
    static _ = (() => {
        CollisionEventHandler.createCollisionScenario("PlayerVsCrate", {
            "left": (player, crate, deltaTime) => {
                if (!player.jumping) crate.push(player.body.vel.x /= 2);
            },
            "right": (player, crate, deltaTime) => {
                if (!player.jumping) crate.push(player.body.vel.x /= 2);
            }
        });
    })();

    walkSpeed = Tile.SIZE * 5;
    jumpSpeed = Tile.SIZE * 10;
    constructor() {
        super();
        this.body.acc.y = Tile.SIZE * 40;
        this.subscribeToApplyingCollisionEvent("PlayerVsCrate");
    }

    controls() {
        if (keyIsDown(65)) this.body.vel.x = -this.walkSpeed;
        if (keyIsDown(68)) this.body.vel.x = this.walkSpeed;
        if (!keyIsDown(65) && !keyIsDown(68) && !this.jumping) this.body.vel.x = 0;
        if (keyIsDown(16)) this.body.vel.x *= .2;
        if (this.body.vel.y !== 0) this.jumping = true;
        if (keyIsDown(32)) {
            if (!this.jumping) {
                this.jumping = true;
                this.body.vel.y = -this.jumpSpeed;
            }
        }
    }

    onLeftCollision() {

    }

    onRightCollision() {

    }

    onTopCollision() {
        this.body.vel.y = 0;
    }

    onBottomCollision() {
        this.jumping = false;
        //this.body.vel.x = 0;
        this.body.vel.y = 0;
    }

    update(world, deltaTime) {
        this.controls();
        super.update(world, deltaTime);
    }
}