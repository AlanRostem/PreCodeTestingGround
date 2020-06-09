export default class AABB {
    static EPSILON = 0;1e-2;
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
        return this.center.y - this.extents.y;
    }

    set top(y) {
        this.center.y = y + this.extents.y;
    }

    get bottom() {
        return this.center.y + this.extents.y;
    }

    set bottom(y) {
        this.center.y = y - this.extents.y;
    }

    get left() {
        return this.center.x - this.extents.x;
    }

    set left(x) {
        this.center.x = x + this.extents.x;
    }

    get right() {
        return this.center.x + this.extents.x;
    }

    set right(x) {
        this.center.x = x - this.extents.x;
    }
}