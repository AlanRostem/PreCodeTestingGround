export default class Sweep {
    constructor(aabb, entity = null, collisionTime = 1, normal = createVector(0, 0), side = createVector(0, 0)) {
        this.aabb = aabb;
        this.collisionTime = collisionTime;
        this.normal = normal;
        this.side = side;
        this.entity = entity;
    }
}