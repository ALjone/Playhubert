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
    document.getElementById("size").style.display = 'none';
    document.getElementById("mapsizelabel").style.display = 'none';
    document.getElementById("submit-input").style.display = 'none';

    document.getElementById("sendmap").style.display = 'block';
    document.getElementById("checkboxlabelsend").style.display = 'block';

    document.getElementById("downloadmap").style.display = 'block';
    document.getElementById("checkboxlabeldownload").style.display = 'block';

    document.getElementById("mapname").style.display = 'block';
    document.getElementById("mapnamelabel").style.display = 'block';


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
async function save() {
    let csvContent = "";
    var transposed = map[0].map((_, colIndex) => map.map(row => row[colIndex]));
    transposed.forEach(function(rowArray) {
        let row = rowArray.join("\t");
        csvContent += row + "\r\n";
    });
    var mapname = document.getElementById("mapname").value;

    
    if (document.getElementById("sendmap").checked) {
        console.log("Sent to server.")
        var result = await fetch("http://localhost:8000/", {
            method: "POST",
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({data: csvContent, name: mapname})
            }).then(result => result.json()).then(data => {return data})

        if (result == "invalid_filename") {
            window.alert("Invalid filename. Please try again.")
        }
    }
    if (document.getElementById("downloadmap").checked) {
        console.log("Downloaded the map")
        var encodedUri = encodeURI("data:text/csv;charset=utf-8,"+csvContent);
        window.open(encodedUri);
    }
    if (!document.getElementById("downloadmap").checked && !document.getElementById("sendmap").checked) {
        window.alert("Please check at least one of the boxes!")
    }
}