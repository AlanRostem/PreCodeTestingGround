class Enum {
    constructor(...args) {
        let i = 0;
        for (let e of args) {
            this[e] = i++;
        }
        Object.freeze(this);
    }
}

class TileArray {
    #arr = [];

    get(x, y) {
        return this.#arr[x % this.getWidth() + this.getWidth() * (y % this.getHeight())];
    }

    getWidth() {
        return 20;
    }

    getHeight() {
        return 20;
    }
}

class IntervalTree {
    static #Interval = class Interval {
        constructor(low, high) {
            this.low = low;
            this.high = high;
        }
    };

    static #Node = class Node {
        constructor(left, right, value, max, interval) {
            this.left = left;
            this.right = right;
            this.value = value;
            this.interval = interval;
            this.max = max;
        }
    };

    static #checkOverlap = (i0, i1) => {
        return i0.low <= i1.high && i1.low <= i0.high;
    };

    #root = null;

    #newNode = (_interval, _value) => {
        return new this.constructor.#Node(null, null, _value, _interval.high, _interval);
    };

    #insertUtil = (_node, _interval, _value) => {
        if (_node == null) {
            return this.#newNode(_interval, _value);
        }

        let low = this.#root.interval.low;

        if (_interval.low < low) {
            this.#root.left = this.#insertUtil(this.#root.left, _interval, _value);
        } else {
            this.#root.right = this.#insertUtil(this.#root.right, _interval, _value);
        }

        if (this.#root.max < _interval.high) {
            this.#root.max = _interval.high;
        }

        return _node;
    };

    #overlapSearch = (_node, _interval) => {
        if (_node === null) return null;
        if (this.constructor.#checkOverlap(_node.interval, _interval)) {
            return _node.value;
        }

        if (_node.left !== null && _node.left.max >= _interval.low) {
            return this.#overlapSearch(_node.left, _interval);
        }

        return this.#overlapSearch(_node.right, _interval);
    };

    insert(low, high, value) {
        this.#root = this.#insertUtil(this.#root,
            new this.constructor.#Interval(low, high), value);
    }

    get(low, high) {
        return this.#overlapSearch(this.#root, new this.constructor.#Interval(low, high));
    }
}

class TileEventHandler {

    static #self = new TileEventHandler();

    static get() {
        return this.#self;
    }

    #handlerMap = new Map;

    createTileTypeSituation(startId, endId, handlerFunc) {

    }
}

class TileMap {
    TILESIZE = 32;
    #array;
    constructor(array) {
        this.#array = array;
    }

    getArray() {
        return this.#array;
    }

    handleCollisionWith(entity) {
        let cx = Math.floor(entity.x / this.TILESIZE);
        let cy = Math.floor(entity.y / this.TILESIZE);

        let proxy = 2; // Amount of margin of tiles around entity

        let tileX = Math.floor(entity.w / Tile.SIZE) + proxy;
        let tileY = Math.floor(entity.h / Tile.SIZE) + proxy;

        for (let y = -proxy; y < tileY; y++) {
            for (let x = -proxy; x < tileX; x++) {
                let xx = cx + x;
                let yy = cy + y;

                let tile = this.#array.get(xx, yy);
                if (true /*Check existence*/) {
                    // Handle
                }
            }
        }
    }
}

let EntityEvents = new Enum(
    "EntityVsEntity",
);

class Entity {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color(random(255), random(255), random(255));

        this.subscriptions = new Set;

        this.subscribeToEntityEvent(EntityEvents.EntityVsEntity);
    }

    subscribeToEntityEvent(id) {
        this.subscriptions.add(id);
    }

    getEventSubscriptions() {
        return this.subscriptions;
    }

    update(entityManager) {
        this.x += random(-10, 10);
        this.y += random(-10, 10);

        if (this.x - this.w / 2 < 0) {
            this.x = this.w / 2;
        }
        if (this.y - this.h / 2 < 0) {
            this.y = this.h / 2;
        }

        if (this.x + this.w / 2 > width) {
            this.x = width - this.w / 2;
        }

        if (this.y + this.h / 2 > height) {
            this.y = height - this.h / 2;
        }

        for (let entity of entityManager.getEntityList()) {
            if (entity !== this) {
                EntityEventHandler.get().listenToEvent(this, entity)
            }
        }
    }

    draw() {
        fill(this.color);
        rect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
    }
}

class EntityEventHandler {
    static #self = new EntityEventHandler();

    static get() {
        return this.#self;
    }

    #eventMap = new Map;

    createEntityEvent(eventId, conditionFunc, handlerFunc) {
        if (!this.#eventMap.has(eventId)) {
            this.#eventMap.set(eventId, {
                condition: conditionFunc,
                handler: handlerFunc,
            });
        }
    }

    listenToEvent(e0, e1) {
        for (let eventId of e0.getEventSubscriptions()) {
            if (this.#eventMap.has(eventId)) {
                let pair = this.#eventMap.get(eventId);
                if (pair.condition(e0, e1)) {
                    pair.handler(e0, e1);
                }
            }
        }
    }
}

class EntityManager {

    #entities = new Set;

    spawnEntity(entity) {
        this.#entities.add(entity);
    }

    removeEntity(entity) {
        this.#entities.delete(entity);
    }

    getEntityList() {
        return this.#entities;
    }

    update() {
        for (let e of this.#entities) {
            e.update(this);
            e.draw();
        }
    }
}

let entityManager;

function setup() {
    createCanvas(640, 640);
    EntityEventHandler.get().createEntityEvent(EntityEvents.EntityVsEntity,
        (e0, e1) => {
            return e0.x - e0.w / 2 < e1.x + e1.w / 2 &&
                e0.x + e0.w / 2 > e1.x - e1.w / 2 &&
                e0.y - e0.h / 2 < e1.y + e1.h / 2 &&
                e0.y + e0.h / 2 > e1.y - e1.h / 2
        },
        (e0, e1) => {
            //console.log(e0, e1);
        });
    entityManager = new EntityManager();
    for (let i = 0; i < 2; i++) {
        let size = random(16, 64);
        entityManager.spawnEntity(new Entity(random(width), random(height), size, size));
    }
}

function draw() {
    background(150);
    entityManager.update();
}