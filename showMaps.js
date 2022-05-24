var maps = []
function show_canvas(data, i) {
    var canvas = document.createElement('canvas');
    canvas.id     =  i;
    canvas.width  = 300;
    canvas.height = 300;
    canvas.style.position = "relative"
    canvas_ctx = canvas.getContext("2d")
    var xTileSize = canvas.width/data.length;
    var yTileSize = canvas.height/data[1].length;
    document.body.appendChild(canvas);
    canvas.addEventListener("click", function() {
        initMap({data: maps[i]})
    }) 
    showMapdrawMap(data, canvas_ctx, xTileSize, yTileSize)
}

async function showMaps() {
    var data = await fetch('http://localhost:8000/maps/map_list.txt').then(function(response) {return response.text();});
    data = data.split('\n');
    maps = []
    for (var i=0;i<data.length; i++) {
        var file = await fetch('http://localhost:8000/maps/'+data[i]).then(function(response) {return response.text();})
        var map = []
        var other = []
        file = file.split('\n')
        
        for(j=0;j<file.length-1;j++){
            var cells = file[j].split("\t");
            var inner_map = []
            for(k=0;k<cells.length;k++){
                inner_map.push(parseInt(cells[k]))
            }
            other.push([file[j]])//.slice(0, file[j].length-2)])
            map.push(inner_map)
        }
        other.push([]) //Because I'm not sure
        maps.push(other)
        show_canvas(map, i)
    }
    console.log(maps[1])
}


function showMapdrawTile(tile, canvas_ctx, xTileSize, yTileSize) {
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
    canvas_ctx.fillStyle = color;   
    canvas_ctx.strokestyle = color;
    canvas_ctx.fillRect(tile.x*xTileSize, tile.y*yTileSize, xTileSize, yTileSize);  
    canvas_ctx.strokeRect(tile.x*xTileSize, tile.y*yTileSize, xTileSize, yTileSize);
}

function showMapdrawMap(map, canvas_ctx, xTileSize, yTileSize){
    for(var i=0;i<map.length;i++){
        var cells = map[i];
        for(var j=0;j<cells.length;j++){
            showMapdrawTile({x : j, y : i, val : cells[j]}, canvas_ctx, xTileSize, yTileSize);
        }
    }
}