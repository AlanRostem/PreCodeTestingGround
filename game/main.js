import World from "./world.js";
import RectBody from "./rect-body.js"
import Entity from "./entity.js"
import Player from "./player.js"

let world;

window.setup = () => {
    createCanvas(640, 640);
    world = new World;

    world.spawnEntity(new Player());
    window.world = world;
};

window.mousePressed = () => {
    world.spawnEntity(new Entity(
        new RectBody(
            createVector(mouseX, mouseY),
            createVector(16, 16))
    ));
};

window.draw = () => {
    world.update(deltaTime / 1000);
    world.draw();
};