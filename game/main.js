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
    world.update(deltaTime / 1000);
    console.log(player.body);

    let scaleFactor = 2;
    translate((-player.body.center.x * scaleFactor + width / 2), (-player.body.center.y * scaleFactor + height / 2));
    scale(scaleFactor, scaleFactor);
    world.draw();
};