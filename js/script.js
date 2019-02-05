//background grid information
// var width = 60; 
// var height = 60;
// var cellSize = 1;
var gridWidth = 60;
var gridHeight = 60;
// var grid = new Array(gridWidth * gridHeight);

let Anim = new anim()
// Anim.animation("original")

d3.select("#original")
    .on("click",()=>{
        Anim.clearCanvas("amove");
        Anim.animation("original")
    })
d3.select("#amove")
    .on("click",()=>{
        Anim.clearCanvas("amove");
        Anim.animation("amove")
    })
d3.select("#bmove")
    .on("click",()=>{
        Anim.animation("bmove")
    })

d3.select("#cmove")
    .on("click",()=>{
        Anim.animation("cmove")
    })

// function testFunction(x,y) {
//     return   (1./2.) * Math.exp(-(Math.pow(x-.25,2)+Math.pow(y-.25,2))/0.05)
//            - (2./4.) * Math.exp(-(Math.pow(x-.75,2)+Math.pow(y-.25,2))/0.05)
//            - (3./6.) * Math.exp(-(Math.pow(x-.25,2)+Math.pow(y-.75,2))/0.05)
//            + (4./8.) * Math.exp(-(Math.pow(x-.75,2)+Math.pow(y-.75,2))/0.05);
// }
// function testFunction(x,y) {
//     return   - (1./2.) * Math.exp(-(Math.pow(x-.75,2)+Math.pow(y-.5,2))/0.05)
//                - (1./2.) * Math.exp(-(Math.pow(x-.25,2)+Math.pow(y-.5,2))/0.05) 
//               //  - (1./2.) * Math.exp(-(Math.pow(x-.25,2)+Math.pow(y-.25,2))/0.05) 
// }


// myColors = ['rgb(166,206,227)','rgb(178,223,138)','rgb(251,154,153)','rgb(253,191,111)','rgb(202,178,214)','rgb(255,255,153)','rgb(31,120,180)','rgb(51,160,44)','rgb(227,26,28)','rgb(255,127,0)','rgb(106,61,154)','rgb(177,89,40)'];
// myColors = ["white"]

// for (let y = 0; y < gridHeight; y++) {
//     for(let x = 0; x < gridWidth; x++) {
//       grid[y*gridWidth + x] = testFunction(x/(gridWidth-1),y/(gridHeight-1));
//     }
// }

// console.log("grid",grid)

// var maxFlow = {};
// var minFlow = {};
// var colorDict = {};
// var nextColor = 0;

// function getMin(idx){
//     while (idx in minFlow && idx != minFlow[idx]) {
//         idx = minFlow[idx];
//     }
//     return idx;
// }

// function getMax(idx){
//     while (idx in maxFlow && idx != maxFlow[idx]) {
//         idx = maxFlow[idx];
//     }
//     return idx;
// }

// function functionValueOrder(i,j) {
//     ///Orders two indices based on increasing function value, and will
//     // apply simulation of simplicity to break ties, where the larger
//     // index is "higher" valued.
//     if (grid[i] < grid[j] || (grid[i] == grid[j] && i < j)) {
//       return [i,j];
//     }
//     else {
//       return [j,i];
//     }
// }

// function getIdx(x,y) {
//     ///Converts a 2D index to a flattened array index
//     return y*gridWidth+x;
// }

// function constructGradientFlow() {
//     //First determine each point's steepest a/descending neighbor
//     for (let y = 0; y < gridHeight; y++) {
//         for(let x = 0; x < gridWidth; x++) {
//           //Set the point as its own maximum/minimum
//           minIdx = maxIdx = currentIdx = y*gridWidth + x;
//           maxFlow[currentIdx.toString()] = maxIdx.toString();
//           minFlow[currentIdx.toString()] = minIdx.toString();

//           //Test the point's right neighbor (or wrapped neighbor)
//           if ( x < gridWidth-1) {
//             testIdx = getIdx(x+1,y);
//           }
//           else {
//             testIdx = getIdx(0,y);
//           }
//           maxIdx = functionValueOrder(maxIdx,testIdx)[1];
//           minIdx = functionValueOrder(minIdx,testIdx)[0];
//           //Test the points upper neighbor (or wrapped neighbor)
//           if ( y < gridHeight-1) {
//             testIdx = getIdx(x,y+1);
//           }
//           else {
//             testIdx = getIdx(x,0);
//           }
//           maxIdx = functionValueOrder(maxIdx,testIdx)[1];
//           minIdx = functionValueOrder(minIdx,testIdx)[0];
//           //Test the points left neighbor (or wrapped neighbor)
//           if ( x > 0) {
//             testIdx = getIdx(x-1,y);
//           }
//           else {
//             testIdx = getIdx(gridWidth-1,y);
//           }
//           maxIdx = functionValueOrder(maxIdx,testIdx)[1];
//           minIdx = functionValueOrder(minIdx,testIdx)[0];
//           //Test the points lower neighbor (or wrapped neighbor)
//           if ( y > 0) {
//             testIdx = getIdx(x,y-1);
//           }
//           else {
//             testIdx = getIdx(x,gridHeight-1);
//           }
//           maxIdx = functionValueOrder(maxIdx,testIdx)[1];
//           minIdx = functionValueOrder(minIdx,testIdx)[0];

//           minFlow[currentIdx.toString()] = minIdx.toString();
//           maxFlow[currentIdx.toString()] = maxIdx.toString();
//         }
//     }
//     for (let y = 0; y < gridHeight; y++) {
//         for(let x = 0; x < gridWidth; x++) {
//           minIdx = maxIdx = currentIdx = y*gridWidth + x;
//           fxy = grid[getIdx(x,y)];
//           fx1y = grid[getIdx(x+1,y)];
//           fxy1 = grid[getIdx(x,y+1)];
//           fx1y1 = grid[getIdx(x+1,y+1)];

//           minIdx = getMin(currentIdx.toString());
//           maxIdx = getMax(currentIdx.toString());
//           idx = minIdx.toString() + '_' + maxIdx.toString();
//           if (!(idx in colorDict)) {
//               colorDict[idx] = myColors[nextColor];
//               nextColor = nextColor + 1;
//               if (nextColor > myColors.length) {
//                   nextColor = 0;
//               }
//           }

//           if (x < gridWidth-1) {
//             //Horizontal edge
//             if (fxy < fx1y) {
//               maxFlow[getIdx(x,y).toString()+"_"+getIdx(x+1,y).toString()] = getIdx(x+1,y).toString();
//               minFlow[getIdx(x,y).toString()+"_"+getIdx(x+1,y).toString()] = getIdx(x,y).toString();
//             }
//             else {
//               maxFlow[getIdx(x,y).toString()+"_"+getIdx(x+1,y).toString()] = getIdx(x,y).toString();
//               minFlow[getIdx(x,y).toString()+"_"+getIdx(x+1,y).toString()] = getIdx(x+1,y).toString();
//             }
//           }
//           else
//           {
//             //Wrap the edge boundary
//             //Horizontal edge
//             if (fxy < grid[getIdx(0,y)]) {
//               maxFlow[getIdx(0,y).toString()+"_"+getIdx(x,y).toString()] = getIdx(0,y).toString();
//               minFlow[getIdx(0,y).toString()+"_"+getIdx(x,y).toString()] = getIdx(x,y).toString();
//             }
//             else {
//               maxFlow[getIdx(0,y).toString()+"_"+getIdx(x,y).toString()] = getIdx(x,y).toString();
//               minFlow[getIdx(0,y).toString()+"_"+getIdx(x,y).toString()] = getIdx(0,y).toString();
//             }
//           }
//           if (y < gridHeight-1) {
//             //Vertical edge
//             if (fxy < fxy1) {
//               maxFlow[getIdx(x,y).toString()+"_"+getIdx(x,y+1).toString()] = getIdx(x,y+1).toString();
//               minFlow[getIdx(x,y).toString()+"_"+getIdx(x,y+1).toString()] = getIdx(x,y).toString();
//             }
//             else {
//               maxFlow[getIdx(x,y).toString()+"_"+getIdx(x,y+1).toString()] = getIdx(x,y).toString();
//               minFlow[getIdx(x,y).toString()+"_"+getIdx(x,y+1).toString()] = getIdx(x,y+1).toString();
//             }
//           }
//           else
//           {
//             //Wrap the edge boundary
//             //Vertical edge
//             if (fxy < grid[getIdx(x,0)]) {
//               maxFlow[getIdx(x,0).toString()+"_"+getIdx(x,y).toString()] = getIdx(x,0).toString();
//               minFlow[getIdx(x,0).toString()+"_"+getIdx(x,y).toString()] = getIdx(x,y).toString();
//             }
//             else {
//               maxFlow[getIdx(x,0).toString()+"_"+getIdx(x,y).toString()] = getIdx(x,y).toString();
//               minFlow[getIdx(x,0).toString()+"_"+getIdx(x,y).toString()] = getIdx(x,0).toString();
//             }
//           }
//           if (x < (gridWidth-1) && y < (gridHeight-1)) {
//             let idx =   getIdx(x,y).toString() + "_"
//                       + getIdx(x+1,y).toString() + "_"
//                       + getIdx(x,y+1).toString() + "_"
//                       + getIdx(x+1,y+1).toString();

//             e1 = 0.5*(fxy1+fx1y1);
//             e2 = 0.5*(fx1y1+fx1y);
//             e3 = 0.5*(fxy+fx1y);
//             e4 = 0.5*(fxy+fxy1);
//             maxValue = Math.max(e1,e2,e3,e4);
//             minValue = Math.min(e1,e2,e3,e4);
//             if (e1 == maxValue)
//             {
//               //down
//               maxFlow[idx] = getIdx(x,y+1).toString()+'_'+getIdx(x+1,y+1).toString();
//             }
//             else if (e2 == maxValue)
//             {
//               //right
//               maxFlow[idx] = getIdx(x+1,y).toString()+'_'+getIdx(x+1,y+1).toString();
//             }
//             else if (e3 == maxValue)
//             {
//               //up
//               maxFlow[idx] = getIdx(x,y).toString()+'_'+getIdx(x+1,y).toString();
//             }
//             else
//             {
//               //left
//               maxFlow[idx] = getIdx(x,y).toString()+'_'+getIdx(x,y+1).toString();
//             }
//             if (e1 == minValue)
//             {
//               //down
//               minFlow[idx] = getIdx(x,y+1).toString()+'_'+getIdx(x+1,y+1).toString();
//             }
//             else if (e2 == minValue)
//             {
//               //right
//               minFlow[idx] = getIdx(x+1,y).toString()+'_'+getIdx(x+1,y+1).toString();
//             }
//             else if (e3 == minValue)
//             {
//               //up
//               minFlow[idx] = getIdx(x,y).toString()+'_'+getIdx(x+1,y).toString();
//             }
//             else
//             {
//             //   left
//               minFlow[idx] = getIdx(x,y).toString()+'_'+getIdx(x,y+1).toString();
//             }
//           }
//         }
//     }
// }
// constructGradientFlow()