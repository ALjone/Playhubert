var snakeboard
var snakeboard_ctx


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

// https://stackoverflow.com/questions/51101063/is-there-any-way-to-get-the-natural-offset-of-the-canvas-in-javascript
function getBounds() {
    return snakeboard.getBoundingClientRect();
  }
function getOffset() {
var bounds = getBounds();
return {
    x: bounds.left + window.scrollX,
    y: bounds.top + window.scrollY,
};}

function initMap() {
    snakeboard = document.getElementById("gameCanvas");
    snakeboard_ctx = gameCanvas.getContext("2d");
    size = document.getElementById("size").value;
    document.getElementById("save").style.display = "block";
    map = []
    for(i=0;i<size;i++){
        inner_map = []
        for(j=0;j<size;j++){
            if (i == 0 || j == 0 || i == size-1 || j == size-1) {
                inner_map.push(2)
            }
            else {
               inner_map.push(1)
            }
        }
        map.push(inner_map)
    }
    xTileSize = snakeboard.width/map.length;
    yTileSize = snakeboard.height/map[1].length;
    snakeboard.addEventListener("click", function(event) {
        bounds = getOffset()
        var x = Math.floor((event.pageX-bounds.x)/xTileSize)
        var y = Math.floor((event.pageY-bounds.y)/yTileSize)
        var val = map[x][y]+1
        if (val > 3) {
            val = 1
        }
        map[x][y] = val
        drawTile({x:x, y:y, val:val})

    })
    drawMap()
}


function drawMap(){
    for(i=0;i<map.length;i++){
        var cells = map[i];
        for(j=0;j<cells.length;j++){
            drawTile({x : j, y : i, val : cells[j]});
        }
    }
}

//https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
function save() {
    let csvContent = "";
    var transposed = map[0].map((_, colIndex) => map.map(row => row[colIndex]));
    transposed.forEach(function(rowArray) {
        let row = rowArray.join("\t");
        csvContent += row + "\n";
    });

    console.log("Sending", JSON.stringify(csvContent))
    csvContent = {data: csvContent}
    fetch("http://localhost:8000/", {
        method: "POST",
        mode: 'no-cors',
        body: JSON.stringify(csvContent),
        headers: {
            'Content-Type': 'application/json' // The type of data you're sending
        }
    })
}