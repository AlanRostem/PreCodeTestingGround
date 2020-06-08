export default class Sweep {
    constructor(collisionTime = 1, normal = createVector(0, 0), side = createVector(0, 0)) {
        this.collisionTime = collisionTime;
        this.normal = normal;
        this.side = side;
    }
}