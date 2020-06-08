import World from "./world.js";
import Entity from "./entity.js"

let world;

window.setup = () => {
    createCanvas(640, 640);
    world = new World;

    let e = new Entity();
    e.body.acc.y = 2000;
    world.spawnEntity(e);
};

window.draw = () => {
    world.update(deltaTime/1000);
    world.draw();
};