var snakeboard
var snakeboard_ctx
var xTileSize;
var yTileSize;
var hubert_i;
var hubert_j;
var map;
var data;
var visited_states; 
var previous_action;
var game;

document.getElementById("restart").onclick = reset;

$(document).ready(function(){
    $('#submit-file').on("click",function(e){
		e.preventDefault();
		$('#files').parse({
			config: {
				delimiter: "auto",
                complete: initMap
			},
			before: function(file, inputElem)
			{
				console.log("Parsing file...", file);
			},
			error: function(err, file)
			{
				console.log("ERROR:", err, file);
			},
			complete: function()
			{
			    //console.log("Done with all files");
			}
		});
    });
});


function drawTile(tile) {
    var color = "white";
    if (tile.val == 3) {
        color = "blue";
    }
    if (tile.val == 2) {
        color = "black";
    }
    if (tile.val == 4) {
        color = "red";
    }
    snakeboard_ctx.fillStyle = color;   
    snakeboard_ctx.strokestyle = color;
    snakeboard_ctx.fillRect(tile.x*xTileSize, tile.y*yTileSize, xTileSize, yTileSize);  
    snakeboard_ctx.strokeRect(tile.x*xTileSize, tile.y*yTileSize, xTileSize, yTileSize);
}

function initMap(results) {
    console.log("Results type:", typeof results)
    snakeboard = document.getElementById("gameCanvas");
    snakeboard_ctx = gameCanvas.getContext("2d");
    if (results != "reset") {
        data = results.data
    }
    console.log("Data:", data)
    map = []
    visited_states = []
    for(i=0;i<data.length-1;i++){
        var cells = data[i].join(",").split("\t");
        inner_map = []
        inner_visited = []
        for(j=0;j<cells.length;j++){
            inner_map.push(parseInt(cells[j]))
            inner_visited.push(0)
        }
        map.push(inner_map)
        visited_states.push(inner_visited)
    }
    console.log("Map:", map)
    previous_action = []
    for (i=0;i<5;i++) {
        previous_action.push([0, 0, 0])
    }

    xTileSize = snakeboard.width/map.length;
    yTileSize = snakeboard.height/map[1].length;
    visited_states = new onnx.Tensor(new Int32Array(map.length*map[1].length), 'int32', [map.length, map[1].length])
    hubert_i = map.length-2;
    hubert_j = 1
    visited_states.set(1.0, [hubert_i, hubert_j])
    drawMap()
    game = setInterval(play_game, 200)
}

function reset() {
    console.log(data)
    initMap("reset")
}


function drawMap(){
    for(i=0;i<map.length;i++){
        var cells = map[i];
        for(j=0;j<cells.length;j++){
            drawTile({x : j, y : i, val : cells[j]});
        }
    }
    drawTile({y : hubert_i, x : hubert_j, val : 4})
    }

    
function jump() {
    if (map[hubert_i+1][hubert_j] == 2 || map[hubert_i+1][hubert_j] == 3) {
        if (map[hubert_i-1][hubert_j] != 2){
            hubert_i -= 1
        }
        if (map[hubert_i-1][hubert_j] != 2){
            hubert_i -= 1
        }
    }
    else {
        if (Math.random() < 1/3){
            if (map[hubert_i-1][hubert_j] != 2) {
                hubert_i -= 1
            }
        }
        else {
        if (map[hubert_i+1][hubert_j] == 1) {
            hubert_i += 1
        }
        if (map[hubert_i+1][hubert_j] == 1) {
            hubert_i += 1}
        } }
}

function move(dir) {
    if (dir == 0) { //jump
        previous_action.push([1, 0, 0])
        previous_action.shift()
        jump()
        return
    }
    if (dir == 1) { //left
        previous_action.push([0, 1, 0])
        previous_action.shift()
        dir = -1
    }  
    if (dir == 2) { //right
        previous_action.push([0, 0, 1])
        previous_action.shift()
        dir = 1
    }
    if (map[hubert_i][hubert_j+dir] != 2) {
        hubert_j += dir
    }

    //Check if move is over
    if (map[hubert_i+1][hubert_j] == 2 || map[hubert_i+1][hubert_j] == 3) {
        return
    }
    else if( map[hubert_i+1][hubert_j] == 1){
        hubert_i += 1
    }
    if (map[hubert_i+1][hubert_j] == 2 || map[hubert_i+1][hubert_j] == 3) {
        return
    }
    if (map[hubert_i][hubert_j+dir] != 2){
        hubert_j += dir
    }
    //Check if move is over
    if (map[hubert_i+1][hubert_j] == 2 || map[hubert_i+1][hubert_j] == 3){
        return 
    }
    else if (map[hubert_i+1][hubert_j] == 1) {
        hubert_i += 1
    }
}

async function change_direction(event) 
{  
    return
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    
    const keyPressed = event.keyCode;
    
    if (keyPressed === UP_KEY)
    {    
        move(0)
        drawMap()
    }
    if (keyPressed === LEFT_KEY)
    {    
        move(1)  
        drawMap()
    }


    if (keyPressed === RIGHT_KEY)
    {    
        move(2)
        drawMap()
    }
    //TODO fix this and make a new model...............
    //Increase current state by 1
    value = visited_states.get(hubert_i, hubert_j)
    visited_states.set(value+1, hubert_i, hubert_j)

    if (value == 4) {
        visited_states.set(0, hubert_i, hubert_j)
    }
    var pred = await get_pred()
}

function getFeatures() {
    var features = new onnx.Tensor(new Float32Array(6*9*9), "float32", [1, 6, 9, 9])
    for(i=-4;i<5;i++){
        for(j=-4;j<5;j++){
            if (hubert_i + i < 0 || hubert_i + i > map.length-1 || hubert_j+j < 0 || hubert_j + j > map[1].length-1) {
                features.set(0.999999999999999, 0, 2, i+4, j+4)
                features.set(0.999999999999999, 0, 5, i+4, j+4)
            }
            else {
                features.set(0.999999999999999, 0, map[hubert_i+i][hubert_j+j]-1, i+4, j+4)
                features.set(visited_states.get(hubert_i+i, hubert_j+j)/5+0.000000000001, 0, 5, i+4, j+4)
            }
        }
    }
    return features
}

function getExtra() {
    i = hubert_i
    j = hubert_j
    //Previous actions
    extra = [].concat.apply([], previous_action.slice());
    //Energy budget, to be fixed
    extra.push(0.5) 

    //Wall right
    extra.push(+ (map[i][j+1] == 2 && map[i-1][j+1] == 2 && hubert_i != 1 && map[i-2][j+1] == 2))

    //Wall left
    extra.push(+ (map[i][j-1] == 2 && map[i-1][j-1] == 2 && hubert_i != 1 && map[i-2][j-1] == 2))

    //Can go dir
    extra.push(+ (map[i][j+1] != 2))
    extra.push(+ (map[i][j-1] != 2))
    extra.push(+ (map[i+1][j] != 2))
    extra.push(+ (map[i-1][j] != 2))

    //Platform to the side?
    extra.push(+ (map[i+1][j+1] != 1))
    extra.push(+ (map[i+1][j-1] != 1))
    return new onnx.Tensor(new Float32Array(extra), "float32", [1, 24])
}

async function get_pred() {
    const session = await ort.InferenceSession.create("http://localhost:8000/onnx_model.onnx");
    const input = getFeatures()
    const extra = getExtra()
    //var input = new onnx.Tensor(new Float32Array(6*9*9), "float32", [1, 6, 9, 9])
    //var extra = new onnx.Tensor(new Float32Array(24), "float32", [1, 24])
    const feeds = {"onnx::Gather_0": input, "onnx::Squeeze_1": extra}
    const results = await session.run(feeds)
    const data = results[226].data
    return data.indexOf(Math.max(...data));
}

async function play_game() {
        var pred = await get_pred()
        move(pred)
        drawMap()
        value = visited_states.get(hubert_i, hubert_j)
        visited_states.set(value+1, hubert_i, hubert_j)

        if (value == 4) {
            visited_states.set(0, hubert_i, hubert_j)
        }    
        if (hubert_i == 1) {
            clearInterval(game)
        }
}


document.addEventListener("keydown", change_direction)