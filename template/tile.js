import AABB from "./aabb.js"

export default class Tile {
    static SIZE = 16;
    x = 0;
    y = 0;
    id = -1;

    constructor(x, y, id = -1) {
        this.x = x;
        this.y = y;
        this.id = id;
    }

    toVec() {
        return createVector(
            this.x * Tile.SIZE + Tile.SIZE / 2,
            this.y * Tile.SIZE + Tile.SIZE / 2,
        );
    }

    toAABB() {
        return new AABB(createVector(
            this.x * Tile.SIZE + Tile.SIZE / 2,
            this.y * Tile.SIZE + Tile.SIZE / 2,
        ), createVector(Tile.SIZE / 2, Tile.SIZE / 2));
    }

    static toTile(vec) {
        return new Tile(
            vec.x / this.SIZE | 0,
            vec.y / this.SIZE | 0,
        );
    }
}
