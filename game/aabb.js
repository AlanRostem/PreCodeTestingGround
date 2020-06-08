export default class AABB {
    static EPSILON = 1e-5;
    constructor(center, extents) {
        this.center = center;
        this.extents = extents;
    }

    overlaps(aabb) {
        return this.left < aabb.right &&
            this.right > aabb.left &&
            this.top < aabb.bottom &&
            this.bottom > aabb.top;
    }

    get top() {
        return this.center.y - this.extents.y + AABB.EPSILON;
    }

    set top(y) {
        this.center.y = y + this.extents.y - AABB.EPSILON;
    }

    get bottom() {
        return this.center.y + this.extents.y - AABB.EPSILON;
    }

    set bottom(y) {
        this.center.y = y - this.extents.y + AABB.EPSILON;
    }

    get left() {
        return this.center.x - this.extents.x + AABB.EPSILON;
    }

    set left(x) {
        this.center.x = x + this.extents.x - AABB.EPSILON;
    }

    get right() {
        return this.center.x + this.extents.x - AABB.EPSILON;
    }

    set right(x) {
        this.center.x = x - this.extents.x + AABB.EPSILON;
    }
}