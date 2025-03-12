import { Enemy } from "./enemy.js";
import { enemies, gridStep, halfStep, level, levelMap, mult, powerUpMap, powerups, solidWalls, weakWalls } from "./game.js";
import { Player } from "./player.js";
import { BombUp, FlameUp } from "./powerup.js";
import { SolidWall, WeakWall } from "./walls.js";

export function resizeGameContainer() {
    const gameContainer = document.getElementById("game-container");

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // wide or narrow window? single screen Bomberman level is 13 * 11 squares
    if (windowWidth / windowHeight > 13 / 11) {
        gameContainer.style.height = windowHeight * 0.8 + "px";
        gameContainer.style.width = windowHeight * 0.8 * (13 / 11) + "px";
    } else {
        gameContainer.style.height = windowWidth * 0.8 * (11 / 13) + "px";
        gameContainer.style.width = windowWidth * 0.8 + "px";
    };

    const bounds = gameContainer.getBoundingClientRect();
    gameContainer.style.left = (windowWidth - bounds.width) / 2 + 'px';
    gameContainer.style.top = (windowHeight - bounds.height) / 2 + 'px';

    return bounds;
};

export function getGridSize() {
    const gameContainer = document.getElementById("game-container");
    const gridStep = gameContainer.getBoundingClientRect().width / 13;
    const halfStep = gridStep / 2;
    return [gridStep, halfStep];
};

export function setUpGame(bounds) {
    // multiplier from game-container size scales things (speed, placements) 
    // to different sized windows
    const multiplier = bounds.width / 1000;

    const playerSpeed = 4.5 * multiplier;
    const playerSize = 55 * multiplier;
    const playerX = halfStep - (playerSize / 2); // put player to top left    
    const playerY = halfStep - (playerSize / 2);

    const player = new Player(playerSize, playerSpeed, playerX, playerY);

    return [multiplier, player];
};

export function makeLevelMap() {
    // 11 rows and 13 columns
    let map = new Array(11);
    for (let i = 0; i < map.length; i++)  map[i] = new Array(13);
    return map;
};

export function makeWalls() {

    // place solid walls in 6 * 5 grid
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            const mapX = (1 + i * 2);
            const mapY = (1 + j * 2);
            const x = gridStep * mapX;
            const y = gridStep * mapY;
            const newSolid = new SolidWall(x, y, gridStep);
            solidWalls.push(newSolid);
            levelMap[mapY][mapX] = 'solidWall';
        };
    };

    // put solid walls around play area
    const yVals = [-1, 11];
    for (let i = 0; i < 15; i++) {
        for (const yVal of yVals) {
            const mapX = i - 1;
            const mapY = yVal;
            const x = gridStep * mapX;
            const y = gridStep * mapY;
            new SolidWall(x, y, gridStep);
        }
    };
    const xVals = [-1, 13];
    for (let i = 0; i < 11; i++) {
        for (const xVal of xVals) {
            const mapX = xVal
            const mapY = i;
            const x = gridStep * mapX;
            const y = gridStep * mapY;
            new SolidWall(x, y, gridStep);
        }
    };

    // place weak walls randomly
    while (weakWalls.size < 45) {
        const mapX = Math.floor(Math.random() * 13);
        const mapY = Math.floor(Math.random() * 11);

        // don't replace content or put anything in the top left and bottom right corners
        if (levelMap[mapY][mapX] || (mapX < 2 && mapY < 2) || (mapX > 10 && mapY > 8)) {
            continue;
        };

        const x = gridStep * mapX;
        const y = gridStep * mapY;
        const name = `weakWall${mapX}${mapY}`;
        const newWeak = new WeakWall(x, y, gridStep);
        weakWalls.set(name, newWeak);
        levelMap[mapY][mapX] = name;
    };

    // place bomb powerups inside weak walls
    while (powerups.size < 5) {
        const mapX = Math.floor(Math.random() * 13);
        const mapY = Math.floor(Math.random() * 11);

        if (levelMap[mapY][mapX] && typeof levelMap[mapY][mapX] == 'string' && levelMap[mapY][mapX].startsWith('weakWall')) {
            const x = gridStep * mapX;
            const y = gridStep * mapY;
            const name = `bombUp${mapX}${mapY}`;
            const newBombUp = new BombUp(x, y, gridStep * 0.9, name, mapY, mapX);
            powerups.set(name, newBombUp)
            powerUpMap[mapY][mapX] = [name, newBombUp];
        };
    }

    // place flame powerups inside weak walls
    while (powerups.size < 10) {
        const mapX = Math.floor(Math.random() * 13);
        const mapY = Math.floor(Math.random() * 11);

        if (levelMap[mapY][mapX] &&
            typeof levelMap[mapY][mapX] == 'string' &&
            levelMap[mapY][mapX].startsWith('weakWall') &&
            !powerUpMap[mapY][mapX]
        ) {
            const x = gridStep * mapX;
            const y = gridStep * mapY;
            const name = `flameUp${mapX}${mapY}`;
            const newFlameUp = new FlameUp(x, y, gridStep * 0.9, name, mapY, mapX);
            powerups.set(name, newFlameUp)
            powerUpMap[mapY][mapX] = [name, newFlameUp];
        };
    }

    // place enemies
    while (enemies.size < 1 + (level * 1.5)) {
        const mapX = Math.floor(Math.random() * 13);
        const mapY = Math.floor(Math.random() * 11);

        // don't replace content or put anything in the top left and bottom right corners
        if (levelMap[mapY][mapX] || (mapX < 3 && mapY < 3) || (mapX > 9 && mapY > 7)) {
            continue;
        };

        const x = gridStep * mapX;
        const y = gridStep * mapY;
        const name = `enemy${mapX}${mapY}`;
        const newEnemy = new Enemy(55 * mult, level * mult, x, y, name);
        enemies.set(name, newEnemy);
        levelMap[mapY][mapX] = 'enemy';
    };

    // enemies were there only to stop them being placed on top of each other
    for (let i = 0; i < levelMap.length; i++) {
        for (let j = 0; j < levelMap[0].length; j++) {
            if (levelMap[i][j] == 'enemy') {
                levelMap[i][j] = null;
            };
        };
    };
};
