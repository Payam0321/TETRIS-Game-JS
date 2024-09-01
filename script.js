const canvas = document.getElementById("tetris");
const context = canvas.getContext('2d');

context.scale(20, 20);


function arenaSweepTest() {
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        //debugger;
        //arena.splice(y,1)[0].fillStyle = colors[3];
        arena[y].fill(1);
        //debugger;
        //console.log(y);
        //wait(2000);
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
    }
}


const colors = [
    null,
    'red',
    'blue',
    'green',
    'purple',
    'yellow',
    'orange',
    'pink'
];

const clearedLineColor = colors.length;

function arenaSweep() {
    let clearedLines = true;
    while (clearedLines) {
        clearedLines = false;

        for (let y = arena.length - 1; y >= 0; --y) {
            let emptyCells = 0;
            for (let x = 0; x < arena[y].length; ++x) {
                if (arena[y][x] === 0) {
                    emptyCells++;
                    if (emptyCells > 0) {
                        break;
                    }
                }
            }

            if (emptyCells === 0) {
                // Change line color to clearedLineColor
                for (let x = 0; x < arena[y].length; ++x) {
                    arena[y][x] = 4;
                }


                // Temporary delay for debugging
                //setTimeout(() => {
                // Remove the complete line
                arena.splice(y, 1);
                // Add a new empty row at the top
                //arena.unshift(arena.splice(y, 0)[0].fill(0));
                arena.unshift(Array(arena[0].length).fill(0));
                //}, 500); // Adjust the delay as needed
                clearedLines = true;

                // Update score (if applicable)
                // Check for game over (if applicable)
            }
        }
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPeace(type) {
    if (type === "T") {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ];
    } else if (type === "O") {
        return [
            [2, 2],
            [2, 2]
        ];
    } else if (type === "L") {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
        ];
    } else if (type === "J") {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0]
        ];
    } else if (type === "I") {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0]
        ];
    } else if (type === "S") {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0]
        ];
    } else if (type === "Z") {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ];
    }

}

function draw() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 })
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                    y + offset.y,
                    1, 1);
            }
        });
    });
}

function merege(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}
const arena = createMatrix(12, 20);

function playerReset() {
    const peces = "ILJOTSZ";
    //player.matrix = createPeace(peces[2]);
    //player.matrix = createPeace("O");
    player.matrix = createPeace(peces[peces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merege(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}



function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                    matrix[y][x],
                    matrix[x][y]
                ]
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

//update function
let dropCounter = 0;
let dropInterval = 500;
let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

const peces = "ILJOTSZ";

const player = {
    matrix: createPeace("O"),
    // matrix : createPeace(peces[peces.length * Math.random() | 0]),
    pos: { x: 5, y: 0 }
};

//merege(arena,player);
//console.table(arena);




document.addEventListener("keydown", event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 38) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

update();