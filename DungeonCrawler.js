var setUp = false;
var canvas;
var ctx;
var gameGrid =[];
var gridWidth;
var inGame = true;
var fps = 1000 / 30;
var player;
var moveStop;
var textures;

if(!setUp) setup();

function setup(){
    //Setup canvas environment
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext("2d");
    gridWidth = 50;
    canvas.width = 550;
    canvas.height = 550;
    player = new Player(0,0);
    document.addEventListener("keydown", keyDown, false);
    document.addEventListener("keyup", keyUp, false);
    document.addEventListener("click",mousePress,false);

    //0 = NoWall, 1 = RightWall, 2 = LeftWall, 3 = TopWall, 4 = BottomWall, 5 = AllWall 6 = RightLeftWall,
    // 7 = RightTopWall, 8 = RightBottomWall, 9 = LeftTopWall, 10 = LeftBottomWall, 11 = TopBottomWall
    // 12 = RightTopBottomWall, 13 = LeftTopBottomWall, 14 = RightLeftTopWall, 15 = RightLeftBottomWall

    textures = [
        "assets/RockTexture.png",
        "assets/RockTextureRightWall.png",
        "assets/RockTextureLeftWall.png",
        "assets/RockTextureTopWall.png",
        "assets/RockTextureBottomWall.png",
        "assets/RockTextureAllWall.png",
        "assets/RockTextureRightLeftWall.png",
        "assets/RockTextureRightTopWall.png",
        "assets/RockTextureBottomRightWall.png",
        "assets/RockTextureLeftTopWall.png",
        "assets/RockTextureBottomLeftWall.png",
        "assets/RockTextureTopBottomWall.png",
        "assets/RockTextureRightTopBottomWall.png",
        "assets/RockTextureLeftTopBottomWall.png",
        "assets/RockTextureRightLeftTopWall.png",
        "assets/RockTextureRightLeftBottomWall.png"
    ];

    //Making Grid
    makeGrid();
    setUp = true;
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    player.update();
    player.show();
    player.limits();
}

function makeGrid(){
    for(var col = 0; col < canvas.width/gridWidth; col++){
        var rowArray = [];
        for(var row = 0; row < canvas.height/gridWidth; row++){
            var cell = new Cell(col,row);
            rowArray.push(cell);
        }
        gameGrid.push(rowArray);
    }
}

function drawGrid(){
    ctx.strokeStyle = "white";
    for(var col = 0 ; col < gameGrid.length; col++){
        var cRow = gameGrid[col];
        for(var row = 0; row < cRow.length; row++){
            var cell = gameGrid[col][row];
            if(cell.occupied){
                cell.show();
                // ctx.fillStyle = "darkslategray";
                // ctx.fillRect(cell.x,cell.y,gridWidth,gridWidth);
                // ctx.strokeRect(cell.x,cell.y,gridWidth,gridWidth);
            }
        }
    }
}

function keyDown(e){
    if(!moveStop){
        switch(e.keyCode){
            case 39:
                if(!player.limitRight)
                    player.move(1,0);
                break;
            case 38:
                if(!player.limitTop)
                    player.move(0,-1);
                break;
            case 40:
                if(!player.limitBottom)
                    player.move(0,1);
                break;
            case 37:
                if(!player.limitLeft)
                    player.move(-1,0);
                break;
        }
        moveStop = true
    }
}

function keyUp(){
    moveStop = false;
}

function mousePress(e){
    var canvRect = canvas.getBoundingClientRect();
    var mouseX = e.clientX - canvRect.left;
    var mouseY = e.clientY - canvRect.top;
    for(var col = 0 ; col < gameGrid.length; col++) {
        var cRow = gameGrid[col];
        for (var row = 0; row < cRow.length; row++) {
            var cell = gameGrid[col][row];
            if(cell.intersects(mouseX,mouseY)){
                cell.occupied = !cell.occupied;
                break;
            }
        }
    }
}

function Cell(col, row){
    this.col = col;
    this.row = row;
    this.x = this.col * gridWidth;
    this.y = this.row * gridWidth;
    this.occupied = false;
    this.texturePath = textures[0];

    //(this.col === this.row && this.row === 0) ? false : Math.random() < .2
    this.getNeighbors = function(){
        var neighbors = [];
        var neigh;
        for(var xOff = -1; xOff <= 1; xOff++){
            for(var yOff = -1; yOff <= 1; yOff++){
                if(Math.abs(xOff) === Math.abs(yOff))
                    continue;
                if(gameGrid[this.col+xOff] !== undefined && gameGrid[this.col+xOff][this.row+yOff] !== undefined )
                    neigh = gameGrid[this.col+xOff][this.row+yOff];
                else{
                    neigh = "VOID";
                }
                if(neigh)
                     neighbors.push([neigh,[xOff,yOff]]);
            }
        }
        return neighbors;
    };

    this.intersects = function(x,y){
        return !(x > this.x + gridWidth || y > this.y + gridWidth || x < this.x || y < this.y);
    };

    this.show = function(){
        var texture = new Image();
        this.texturePath = this.decideTexture();
        texture.src = this.texturePath;
        ctx.drawImage(texture, 0, 0, texture.width, texture.height,
            this.x,this.y,gridWidth,gridWidth);
    };

    this.decideTexture = function(){
        //0 = NoWall, 1 = RightWall, 2 = LeftWall, 3 = TopWall, 4 = BottomWall, 5 = AllWall 6 = RightLeftWall,
        // 7 = RightTopWall, 8 = RightBottomWall, 9 = LeftTopWall, 10 = LeftBottomWall, 11 = TopBottomWall
        // 12 = RightTopBottomWall, 13 = LeftTopBottomWall, 14 = RightLeftTopWall, 15 = RightLeftBottomWall
        var neighbors = this.getNeighbors();
        var left = false;
        var right = false;
        var top = false;
        var bottom = false;
        for(var cell = 0; cell < neighbors.length; cell++){
            if(neighbors[cell][0].occupied){
                if(neighbors[cell][1][0] === -1){
                    left = true;
                }
                if(neighbors[cell][1][0] === 1){
                    right = true;
                }
                if(neighbors[cell][1][1] === 1){
                    bottom = true;
                }
                if(neighbors[cell][1][1] === -1){
                    top = true;
                }
            }
        }
        if(right && left && top && bottom){
            return textures[0];
        }
        else if(left && top && bottom){
            return textures[1];
        }
        else if(right && top && bottom){
            return textures[2];
        }
        else if(left && right && bottom){
            return textures[3];
        }
        else if(left && right && top){
            return textures[4];
        }
        else if(top && bottom){
            return textures[6];
        }
        else if(left && bottom){
            return textures[7];
        }
        else if(left && top){
            return textures[8];
        }
        else if(right && bottom){
            return textures[9];
        }
        else if(right && top){
            return textures[10];
        }
        else if(right && left){
            return textures[11];
        }
        else if(left){
            return textures[12];
        }
        else if(right){
            return textures[13];
        }
        else if(bottom){
            return textures[14];
        }
        else if(top){
            return textures[15];
        }
        else{
            return textures[5];
        }
    };
}

function Player(col,row){
    this.col = col;
    this.row = row;
    this.limitLeft = false;
    this.limitRight = false;
    this.limitTop = false;
    this.limitBottom = false;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.x = this.col * gridWidth;
    this.y = this.row * gridWidth;

    this.show = function(){
        ctx.fillStyle = "red";
        ctx.fillRect(this.x,this.y,gridWidth,gridWidth);
    };

    this.update = function() {
        this.col += this.xSpeed;
        this.row += this.ySpeed;
        this.x = this.col * gridWidth;
        this.y = this.row * gridWidth;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.limitLeft = false;
        this.limitRight = false;
        this.limitTop = false;
        this.limitBottom = false;
    };

    this.move = function(xS, yS){
        this.xSpeed = xS;
        this.ySpeed = yS;
    };

    this.limits = function(){
        var neighbors = gameGrid[this.col][this.row].getNeighbors();
        for(var cell = 0; cell < neighbors.length; cell++){
            if(neighbors[cell][0] === "VOID" || neighbors[cell][0].occupied){
                if(neighbors[cell][1][0] === -1){
                    this.limitLeft = true;
                }
                else if(neighbors[cell][1][0] === 1){
                    this.limitRight = true;
                }
                else if(neighbors[cell][1][1] === 1){
                    this.limitBottom = true;
                }
                else if(neighbors[cell][1][1] === -1){
                    this.limitTop = true;
                }
            }
        }
    }
}

if(inGame){
    setInterval(draw,fps);
}