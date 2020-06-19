import World from "./world.js";
import RectBody from "./rect-body.js"
import Entity from "./entity.js"
import Player from "./player.js"
import Crate from "./crate.js";

let world;
let player;
const scaleFactor = 1;

window.setup = () => {
    createCanvas(320, 320);
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
    world.spawnEntity(new Crate(
        new RectBody(
            createVector(mouseX/scaleFactor, mouseY/scaleFactor),
            createVector(8, 8))
    ));
};

window.draw = () => {
    scale(scaleFactor, scaleFactor);
    world.draw();
    world.update(deltaTime / 1000);
};