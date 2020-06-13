export default class EntityEventHandler {
    static relations = {};

    static createRelation(relationName, conditionHandler, resolutionHandler) {
        this.relations[relationName] = {
            condition: conditionHandler,
            resolution: resolutionHandler,
        }
    }

    static postRelationEvents(entity0, entity1, deltaTime) {
        let match = entity0.applyingRelationSubs.match(entity1.receivingRelationSubs);
        for (let event of match) {
            if (this.relations[event].condition(entity0, entity1, deltaTime)) {
                this.relations[event].resolution(entity0, entity1, deltaTime);
            }
        }
    }
}