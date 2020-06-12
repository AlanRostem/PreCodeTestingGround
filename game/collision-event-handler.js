export default class CollisionEventHandler {
    static NONE_HANDLER = (e0, e1, dt) => {
    };
    static collisionScenarios = {};

    static createCollisionScenario(scenarioName, sideHandlers) {
        this.collisionScenarios[scenarioName] = {
            "top": sideHandlers["top"] ? sideHandlers["top"] : CollisionEventHandler.NONE_HANDLER,
            "bottom": sideHandlers["bottom"] ? sideHandlers["bottom"] : CollisionEventHandler.NONE_HANDLER,
            "left": sideHandlers["left"] ? sideHandlers["left"] : CollisionEventHandler.NONE_HANDLER,
            "right": sideHandlers["right"] ? sideHandlers["right"] : CollisionEventHandler.NONE_HANDLER,
        };
    }

    static postCollisionEvents(entity, hit, deltaTime) {
        let match = entity.applyingCollisionSubs.match(hit.entity.receivingCollisionSubs);
        for (let event of match) {
            if (this.collisionScenarios[event]) {
                if (hit.side !== "")
                    this.collisionScenarios[event][hit.side](entity, hit.entity, deltaTime);
            }
        }
    }
}