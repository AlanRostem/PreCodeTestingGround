import World from "./world.js";
import RectBody from "./rect-body.js"
import Entity from "./entity.js"
import Player from "./player.js"

let world;
let player;

window.setup = () => {
    createCanvas(640, 640);
    world = new World;

    world.spawnEntity(window.player = player = new Player());
    window.world = world;
};

window.addEventListener("keydown", e => {
    switch (e.keyCode) {
        case 32:
            e.preventDefault();
    }
});

window.mousePressed = () => {
    world.spawnEntity(new Entity(
        new RectBody(
            createVector(mouseX, mouseY),
            createVector(16, 16))
    ));
};

window.draw = () => {
    scale(2, 2);
    world.draw();
    world.update(deltaTime / 1000);
};