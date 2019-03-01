// **** : to do list

class anim{
    constructor() {
        this.canvasWidth = document.getElementById('animation').offsetWidth;
        this.canvasHeight = document.getElementById('animation').offsetHeight;
        this.svg = d3.select("#annotation");
        this.edgeGroup = this.svg.append("g")
        .attr("id","edgegroup");
        this.pointsGroup = this.svg.append("g")
            .attr("id","pointgroup");
        this.frameGroup = this.svg.append("g")
            .attr("id","framegroup");
        this.checkGroup= this.svg.append("g")
            .attr("id", "checkgroup")
        this.connNodesGroup = this.svg.append("g")
            .attr("id","connNodesgroup");
        this.currentPoint = this.svg.append("circle")
            .attr("id","currentPoint")
            .attr("r",10)
            .attr("fill", "yellow")
        this.currentNewPoint = this.svg.append("circle")
            .attr("id","currentNewPoint")
            .attr("r",10)
            .attr("fill", "lightblue")
        
        

        this.drawFlag = true;
        this.step = 0.05;
        this.numSeg = 10;
        this.cp = [[0.25,0.5,1,1],[0.5,0.5,-1,1],[0.75,0.5,1,1]];
        // this.cp = [[0.5,0.5,1,1]];
        this.sigma = 0.1;
        this.edges = this.findEdges(this.cp);
        this.connNodes = this.findConnNodes(this.edges);
        this.edgeMapper = this.initializeEdgeMapper(this.edges);
        this.frames = [[0,0,0,1],[0,1,1,1],[0,0,1,0],[1,0,1,1,]]; //used for drawing frames
        

        console.log(this.edges)
        console.log(this.edgeMapper)

        //// curve ////
        let N = 45; // 25^2 curves
        // discretize the vfield coords
        this.xp = d3.range(N).map(
                function (i) {
                    return i/N;
                });
        this.yp = d3.range(N).map(
                function (i) {
                    return i/N;
                });

        this.xMap = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.canvasWidth]);
        this.yMap = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.canvasHeight]);
        this.xMapReverse = d3.scaleLinear()
            .domain([0, this.canvasWidth])
            .range([0, 1]);
        this.yMapReverse = d3.scaleLinear()
            .domain([0, this.canvasHeight])
            .range([0, 1]);
        


        this.cellBound = {"upper":[0.5,0], "lower":[0.5,1]};
        this.animation("original");
       
  
        this.gradmax = this.constructMesh(this.sigma,[1,1])
        this.gradsaddle1 = this.constructMesh(this.sigma, [-1,1])
        this.gradsaddle2 = this.constructMesh(this.sigma, [1,-1])
        this.gradmin = this.constructMesh(this.sigma,[-1,-1])

        this.apType = "";
        this.amType = "";

        // this.mapEdges(0)

        
        
    }

    amovePlus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = Anim.xMapReverse(d3.event.x-10);
                let y = Anim.yMapReverse(d3.event.y-100);
                if(this.apType === "max"){
                    this.cp.push([x,y,1,1]);
                    this.apType = "saddle";
                    d3.select("#amoveplus")
                        .attr("value","Add a saddle point")
                }
                else if(this.apType === "saddle"){
                    this.cp.push([x,y,-1,1]);
                    this.drawFlag=true;
                    d3.select("#annotation")
                        .on("click", ()=>{this.drawFlag = (this.drawFlag) ? false : true;});
                    d3.select("#amoveplus")
                        .attr("value","A+ move")
                    this.apType="";
                    this.edges = this.findEdges(this.cp);
                }
                this.drawAnnotation();
                this.addedges();
            })
    }
    amoveMinus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = Anim.xMapReverse(d3.event.x-10);
                let y = Anim.yMapReverse(d3.event.y-100);
                if(this.amType === "min"){
                    this.cp.push([x,y,-1,-1]);
                    this.amType = "saddle";
                    d3.select("#amoveminus")
                        .attr("value","Add a saddle point")
                }
                else if(this.amType === "saddle"){
                    this.cp.push([x,y,-1,1]);
                    this.drawFlag=true;
                    d3.select("#annotation")
                        .on("click", ()=>{this.drawFlag = (this.drawFlag) ? false : true;});
                    d3.select("#amoveminus")
                        .attr("value","A- move")
                    this.amType="";
                }
                this.drawAnnotation();
            })
    }

    drawAnnotation(){
        // draw critical points
        let circles = this.pointsGroup.selectAll("circle").data(this.cp);
        circles.exit().remove();
        let newcircles = circles.enter().append("circle");
        circles = newcircles.merge(circles);
        circles
            .attr("cx",(d)=>this.xMap(d[0]))
            .attr("cy",(d)=>this.yMap(d[1]))
            .attr("r",10)
            .attr("fill",(d)=>{
                if(d[2]===1&&d[3]===1){
                    return "red"
                } else if ((d[2]===-1&&d[3]===1)||(d[2]===1&&d[3]===-1)){
                    return "green"
                } else if (d[2]===-1&&d[3]===-1){
                    return "blue"
                }
            })
            .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

        let that=this;

        function dragstarted(d) {
            d3.select(this).raise().classed("active", true);
        }
              
        function dragged(d,i) {
            for(let j=0;j<that.edges.length;j++){
                if(that.edges[j][0].join()===that.cp[i].slice(0,2).join()) {
                    that.edges[j][0] = [that.xMapReverse(d3.event.x),that.yMapReverse(d3.event.y)];
                } else if (that.edges[j][2].join()===that.cp[i].slice(0,2).join()) {
                    that.edges[j][2] = [that.xMapReverse(d3.event.x),that.yMapReverse(d3.event.y)];
                }
            }
            d3.select(this).attr("cx", d[0] = that.xMapReverse(d3.event.x)).attr("cy", d[1] = that.yMapReverse(d3.event.y));
            that.cp[i][0] = that.xMapReverse(d3.event.x);
            that.cp[i][1] = that.yMapReverse(d3.event.y);            
            that.connNodes = that.findConnNodes(that.edges);
        }
              
        function dragended(d) {
            d3.select(this).classed("active", false);
        }

        // draw frames (local minimum)
        this.frameGroup.selectAll("line")
            .data(this.frames)
            .enter().append("line")
            .attr("x1",(d)=>this.xMap(d[0]))
            .attr("y1",(d)=>this.yMap(d[1]))
            .attr("x2",(d)=>this.xMap(d[2]))
            .attr("y2",(d)=>this.yMap(d[3]))
            .attr("class","frame")
        
        let nodes = this.connNodesGroup.selectAll("circle").data(this.connNodes);
        nodes.exit().remove();
        let newnodes = nodes.enter().append("circle");
        nodes = newnodes.merge(nodes);
        nodes
            .attr("cx",(d)=>{
                if(d[0][0]===0){
                    return this.xMap(d[0][0])+6;
                }
                else if(d[0][0]===1){
                    return this.xMap(d[0][0])-6;
                } else{ return this.xMap(d[0][0]);}
            })
            .attr("cy",(d)=>{
                if(d[0][1]===0){
                    return this.yMap(d[0][1])+6;
                }
                else if(d[0][1]===1){
                    return this.yMap(d[0][1])-6;
                } else{ return this.yMap(d[0][1]);}
            })
            .attr("class","connNode")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", draggedNode)
                .on("end", dragended))
            // .on("mouseover",mouseover)
            // .on("mouseout",mouseout);

        // function mouseover(d) {
        //     console.log("i am here")
        //     d3.select(this).classed("mouseover", true);
        // }
        
        // function mouseout(d){
        //     d3.select(this).classed("mouseover", false);
        // }
        function draggedNode(d){
            // **** need boundary control ****
            if([0,1].indexOf(d[0][0])!=-1){
                // node on vertical frame
                d3.select(this).attr("cy", d[0][1] = that.yMapReverse(d3.event.y));
                that.edges[d[1]][2][1] = that.yMapReverse(d3.event.y);
            }
            else if([0,1].indexOf(d[0][1])!=-1){
                // node on horizontal frame
                d3.select(this).attr("cx", d[0][0] = that.xMapReverse(d3.event.x));
                that.edges[d[1]][2][0] = that.xMapReverse(d3.event.x);
            }
            else {
                // node not on the frame
                d3.select(this).attr("cx", d[0][0] = that.xMapReverse(d3.event.x)).attr("cy", d[0][1] = that.yMapReverse(d3.event.y));
                that.edges[d[1]][1] = [that.xMapReverse(d3.event.x), that.yMapReverse(d3.event.y)]
            } 
            let pathid = "p"+d[1];
            console.log("pathid",pathid);
            let totalLength = d3.select("#"+pathid).node().getTotalLength();
            let stepLength = totalLength/that.numSeg;
            console.log("steplength",stepLength)
            let ed = that.edges[d[1]];
            let newPoints = [];
            for(let i=0;i<that.numSeg;i++){
                let pt = d3.select("#"+pathid).node().getPointAtLength(i*stepLength)
                if((ed[0][0]>ed[2][0])||(ed[0][1]>ed[2][1])){
                    pt = d3.select("#"+pathid).node().getPointAtLength((that.numSeg-i)*stepLength)
                }
                newPoints.push([that.xMapReverse(pt.x), that.yMapReverse(pt.y)]);
            }
            that.mapEdges(pathid, newPoints);

            // let checkCircles = that.checkGroup.selectAll("circle").data(newPoints)
            // checkCircles.exit().remove();
            // let newcheckCircles = checkCircles.enter().append("circle");
            // checkCircles = newcheckCircles.merge(checkCircles);
            // checkCircles
            //     .attr("cx",(d)=>that.xMap(d[0]))
            //     .attr("cy",(d)=>that.yMap(d[1]))
            //     .attr("r",10)
            //     .attr("fill","orange")

            // d3.select("#checkcircle")
            //     .attr("cx",tan.x)
            //     .attr("cy",tan.y)

        }
    }

    initializeEdgeMapper(edges){
        // console.log("i am here")
        let edgeMapper = {};
        for(let i=0;i<edges.length;i++){
            edgeMapper["p"+i] = [];
            let ed = edges[i].slice(0,3);
            ed.sort(function(x,y){
                return d3.ascending(x[0],y[0]) || d3.ascending(x[2],y[2]);
            })
            console.log("ed",ed)
            let xRange = ed[2][0]-ed[0][0];
            let yRange = ed[2][1]-ed[0][1];
            for(let j=0;j<this.numSeg;j++){
                edgeMapper["p"+i].push({"x":ed[0][0]+j*xRange/this.numSeg, "y":ed[0][1]+j*yRange/this.numSeg, "x_new":ed[0][0]+j*xRange/this.numSeg, "y_new":ed[0][1]+j*yRange/this.numSeg});
            }
            
        }
        return edgeMapper;
    }

    mapEdges(edgeid, newPoints){
        for(let i=0;i<this.numSeg;i++){
            // let pt = this.findMinPt([this.edgeMapper[edgeid][i].x, this.edgeMapper[edgeid][i].y], newPoints);
            let pt = newPoints[i]
            // console.log("i, pt",pt)
            this.edgeMapper[edgeid][i].x_new = pt[0];
            this.edgeMapper[edgeid][i].y_new = pt[1];
        }
        // this.edgeMapper[edgeid]
        // console.log(newPoints)
        

    }

    adjustBound(x,y){
        if(y<=0.5){
            this.cellBound.upper[0] = x;
        } else { this.cellBound.lower[0] = x;}
    }

    
    adjustFlow(x,y){
        // map the original point to a new location when the boundary geometry is changed
        let x_new = x;
        let y_new = y;

        // now only deal with vertical lines
        for(let i=0;i<this.edges.length;i++){
            let ed = this.edges[i];
            let xRange = Math.abs(ed[2][0]-ed[0][0]);
            let yRange = Math.abs(ed[2][1]-ed[0][1]);
            if(xRange===0){
                // now only deal with vertical lines
                if(Math.min(ed[0][1],ed[2][1])<=y&&y<=Math.max(ed[0][1],ed[2][1])){ // only these points need to change
                    let edMap = this.edgeMapper["p"+i];
                    let ySeg = Math.abs(ed[2][1]-ed[0][1])/this.numSeg;
                    let pIdx = Math.floor((y-Math.min(ed[0][1],ed[2][1]))/ySeg);
                    let pt0 = edMap[pIdx];
                    let pt1 = edMap[Math.min(pIdx+1,edMap.length-1)];
                    let xOrigin = ed[0][0]; //the x value before change curve
                    let x_line_old = xOrigin;
                    // console.log("y",pt0.y_new, pt1.y_new)
                    let x_line_new = pt1.x_new;
                    if(pt1.y_new!=pt0.y_new){
                        x_line_new = (pt1.y_new-y)/(pt1.y_new-pt0.y_new)*pt0.x_new+(y-pt0.y_new)/(pt1.y_new-pt0.y_new)*pt1.x_new;
                    }
                    if(x<=xOrigin){
                        // points on left
                        x_new = x * x_line_new / x_line_old;

                    } else { 
                        x_new = 1-(1-x)/(1-x_line_old)*(1-x_line_new);
                    } 
                }
            }
            if(yRange===0){
                // horizontal lines
                if(Math.min(ed[0][0],ed[2][0])<=x&&x<=Math.max(ed[0][0],ed[2][0])){
                    let edMap = this.edgeMapper["p"+i];
                    let xSeg = Math.abs(ed[2][0]-ed[0][0])/this.numSeg;
                    let pIdx = Math.floor((x-Math.min(ed[0][0],ed[2][0]))/xSeg);
                    let pt0 = edMap[pIdx];
                    let pt1 = edMap[Math.min(pIdx+1,edMap.length-1)];
                    let yOrigin = ed[0][1]; //the y value before change curve
                    let y_line_old = yOrigin;
                    // console.log("y",pt0.y_new, pt1.y_new)
                    let y_line_new = pt1.y_new;
                    if(pt1.x_new!=pt0.x_new){
                        y_line_new = (pt1.x_new-x)/(pt1.x_new-pt0.x_new)*pt0.y_new+(x-pt0.x_new)/(pt1.x_new-pt0.x_new)*pt1.y_new;
                    }
                    if(y<=yOrigin){
                        // points on left
                        y_new = y * y_line_new / y_line_old;

                    } else { 
                        y_new = 1-(1-y)/(1-y_line_old)*(1-y_line_new);
                    } 




                }

            } 
        }

        
        return [x_new, y_new];

    }

    chooseGrad(x,y){
        // determine the mesh type (max/min/saddle point mesh) for a given point
        // **** Now for fixed value ****
        if(x<0.375){
            return [this.cp[0],this.gradmax];
        } else if(x>0.625){
            return [this.cp[2],this.gradmax];
        } else if(x>=0.375 && x<=0.625){
            return [this.cp[1],this.gradsaddle1];
        }
    }
    

    animation(type){
        this.clearCanvas()
        // this.edges = this.findEdges(this.cp);
            
        let N = 45;
        var dt = 0.001;
        var X0 = [], Y0 = []; // to store initial starting locations
        var X  = [], Y  = []; // to store current point for each curve

        // array of starting positions for each curve on a uniform grid
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                X.push(this.xp[j]), Y.push(this.yp[i]);
                X0.push(this.xp[j]), Y0.push(this.yp[i]);
            }
        }
        // console.log("X",X)
        // console.log("Y",Y)
        function randage() {
            // to randomize starting ages for each curve
            return Math.round(Math.random()*100);
        }

        let g = d3.select("#animation").node().getContext("2d"); // initialize a "canvas" element
        g.fillStyle = "rgba(0, 0, 0, 0.05)"; // for fading curves
        g.lineWidth = 0.7;
        g.strokeStyle = "#FF8000"; // html color code
        //// mapping from vfield coords to web page coords

        

        let that = this;

        //// animation setup
        var frameRate = 500; // ms per timestep (yeah I know it's not really a rate)
        var M = X.length;
        var MaxAge = 200; // # timesteps before restart
        var age = [];
        for (var i=0; i<M; i++) {
            age.push(randage());
        }
        // let drawFlag = this.drawFlag
        setInterval(function () {if (that.drawFlag) {draw(type);}}, frameRate);
        d3.timer(function () {if (that.drawFlag) {draw(type);}}, frameRate);
        d3.select("#annotation")
            .on("click", function() {that.drawFlag = (that.drawFlag) ? false : true;});
            
        g.globalCompositeOperation = "source-over";
        
        function draw(type) {
            let width = document.getElementById('animation').offsetWidth;
            let height = document.getElementById('animation').offsetHeight;
            g.fillStyle = "rgba(0, 0, 0, 0.05)";
            g.fillRect(0, 0, width, height); // fades all existing curves by a set amount determined by fillStyle (above), which sets opacity using rgba
            
            
          
            // that.addnodes(that.cp);
            that.addedges()

            that.drawAnnotation();

            // d3.select("#checkcircle")
            //     .attr("cx",that.xMap(0.5))
            //     .attr("cy",that.yMap(0.15))

            
            for (let i=0; i<M; i++) { // draw a single timestep for every curve
                let dr = [0,0];
                let X_new = that.adjustFlow(X[i],Y[i])[0];
                let Y_new = that.adjustFlow(X[i],Y[i])[1];
                if(type === "original"){ 
                    // dr = that.gradF(that.cp, X[i],Y[i],0.1);
                    
                    // console.log(that.grad)
                    // let result = that.chooseGrad(X[i],Y[i]);
                    // console.log(result)
                    dr = that.findV(X[i]+(0.5-that.chooseGrad(X[i],Y[i])[0][0]),Y[i]+(0.5-that.chooseGrad(X[i],Y[i])[0][1]),that.chooseGrad(X[i],Y[i])[1])
                    // let minCP = that.findMinPt([X[i],Y[i]],that.cp);
                    // if(minCP[2]===1&&minCP[3]===1){
                    //     dr = that.findV(X[i]+(0.5-minCP[0]),Y[i]+(0.5-minCP[1]),that.gradmax)
                    // }
                    // else if(minCP[2]===-1&&minCP[3]===1){
                    //     dr = that.findV(X[i]+(0.5-minCP[0]),Y[i]+(0.5-minCP[1]),that.gradsaddle1)
                    // }
                    // else if(minCP[2]===1&&minCP[3]===-1){
                    //     dr = that.findV(X[i]+(0.5-minCP[0]),Y[i]+(0.5-minCP[1]),that.gradsaddle2)
                    // }
                    // else if(minCP[2]===-1&&minCP[3]===-1){
                    //     dr = that.findV(X[i]+(0.5-minCP[0]),Y[i]+(0.5-minCP[1]),that.gradmin)
                    // }

                    // if(X_new>=0 && X_new<=0.5 && Y_new>=0 && Y_new <= 0.5){
                    //     X_new = X_new*(that.cellBound.upper[0]+(0.5-that.cellBound.upper[0])*Y_new/0.5)/0.5
                    // }
                    // else if(X_new>0.5 && X_new<=1 && Y_new>=0 && Y_new <= 0.5){
                    //     X_new = 1-(1-X_new)*((1-2*Y_new)*(0.5-that.cellBound.upper[0])+0.5)/0.5
                    // }
                    // else if(X_new>=0 && X_new<=0.5 && Y_new>0.5 && Y_new <= 1){
                    //     X_new = X_new*(0.5-(2*Y_new-1)*(0.5-that.cellBound.lower[0]))/0.5
                    // }
                    // else if(X_new>0.5 && X_new<=1 && Y_new>0.5 && Y_new <= 1){
                    //     X_new = 1-(1-X_new)*((2*Y_new-1)*(0.5-that.cellBound.lower[0])+0.5)/0.5
                    // }

                    
                }

                g.setLineDash([1, 0])
                g.beginPath();
                g.moveTo(that.xMap(X_new), that.yMap(Y_new)); // the start point of the path
                g.lineTo(that.xMap(X_new+dr[0]*dt), that.yMap(Y_new+dr[1]*dt)); // the end point
                X[i]+=dr[0]*dt;
                Y[i]+=dr[1]*dt;
                g.lineWidth = 0.7;
                g.strokeStyle = "#FF8000";
                g.stroke(); // final draw command
                if (age[i]++ > MaxAge) {
                    // increment age of each curve, restart if MaxAge is reached
                    age[i] = randage();
                    X[i] = X0[i], Y[i] = Y0[i];
                }
            }
        }
    }

    addnodes(cp){
        let g = d3.select("#animation").node().getContext("2d");
        
        for(let i=0;i<cp.length;i++){
            let type = cp[i].slice(2);
            let arcX = this.xMap(cp[i][0]);
            let arcY = this.yMap(cp[i][1]);

            if (type.join() === "1,1"){ // maximum
                g.setLineDash([1, 0])
                g.beginPath();
                g.arc(arcX,arcY,15,0,2*Math.PI);
                g.strokeStyle = "#E24E42";
                g.lineWidth = 2;
                g.stroke();
    
                g.beginPath();
                g.arc(arcX,arcY,8,0,2*Math.PI);
                g.fillStyle = "#E24E42"
                g.fill();
                g.lineWidth = 0.7;
                g.strokeStyle = "#E24E42";
                g.stroke();
            }

            if ((type.join() === "-1,1")||(type.join() === "1,-1")) { // saddle
                g.setLineDash([1, 0])
                g.beginPath();
                g.arc(arcX,arcY,15,0,2*Math.PI);
                g.strokeStyle = "#3CC47C";
                g.stroke();
    
                g.beginPath();
                g.moveTo(arcX,arcY-8); 
                g.lineTo(arcX,arcY+8);
                g.strokeStyle = "#3CC47C";
                g.stroke();
    
                g.beginPath();
                g.moveTo(arcX-8,arcY); 
                g.lineTo(arcX+8,arcY);
                g.strokeStyle = "green";
                g.stroke();
            }

            if (type.join() === "-1,-1"){ // minimum
                g.setLineDash([1, 0])
                g.beginPath();
                g.arc(arcX,arcY,8,0,2*Math.PI);
                g.strokeStyle = "blue";
                g.stroke();
    
                g.beginPath();
                g.arc(arcX,arcY,4,0,2*Math.PI);
                g.strokeStyle = "blue";
                g.stroke();
            }
        }  
    }

    findMinPt(pt0, pts){
        function calDist(loc1, loc2){
            let dist = Math.sqrt(Math.pow(loc1[0]-loc2[0],2)+Math.pow(loc1[1]-loc2[1],2))
            return dist
        }
        let dist = calDist(pt0,pts[0]);
        let minPt = pts[0];
        for(let i=1;i<pts.length;i++){
            let disti = calDist(pt0,pts[i]);
            if(disti < dist){
                dist = disti;
                minPt = pts[i]
            }
        }
        return minPt
    }

    addedges(){
        let curve0 = d3.line()
            .x(d=>this.xMap(d[0]))
            .y(d=>this.yMap(d[1]))
            .curve(d3.curveCardinal.tension(0));
            // .curve(d3.curveStep)
        // console.log(curve0([[0.125,0.125],[0.25,0.25]]))
        let edges = this.edgeGroup.selectAll("path").data(this.edges);
        edges.exit().remove();
        let newedges = edges.enter().append("path");
        edges = newedges.merge(edges);
        edges
            .attr("d",(d)=>{
                let d_new = d.slice(0,3);
                return curve0(d_new);
            })
            .attr("class",(d)=>d[3]+"edge") // minedge/maxedge
            // .attr("id",(d)=>"p"+d[0].join()+d[3]+d[2].join()) // saddle position + min/max + min/max position
            .attr("id",(d,i)=>"p"+i)
            .style("fill", "none")
            .style("stroke", "white")
            .style("stroke-width",2)
            .style("stroke-dasharray",(d)=>{
                if(d[3]==="max"){
                    return "5,5";
                } else {return "";}
            })
    }

    findEdges(cp){
        // initialize edges
        let cp_new = {"max":[], "min":[], "saddle":[]};
        for(let i=0;i<cp.length;i++){
            let loc = cp[i].slice(0,2);
            let type = cp[i].slice(2);

            if(type.join()==="1,1"){
                cp_new.max.push(loc);
            }
            else if ((type.join()==="-1,1")||(type.join()==="1,-1")){
                cp_new.saddle.push(loc);
            }
            else if(type.join()==="-1,-1"){
                cp_new.min.push(loc);
            }    
        }
        let edges = [];
        for(let i=0;i<cp_new.saddle.length;i++){
            // let ex ={"saddle":cp_new.saddle[i],"max":[],"min":[]};
            if(cp_new.max.length>0){
                let pts = [];
                let cp_new_max = cp_new.max.slice(0);
                if(cp_new_max.length>2){
                    // find the closest max points
                    let pt1 = this.findMinPt(cp_new.saddle[i],cp_new_max);
                    let idx1 = cp_new_max.indexOf(pt1);
                    cp_new_max.splice(idx1,1);
                    let pt2 = this.findMinPt(cp_new.saddle[i],cp_new_max);
                    pts = [pt1,pt2];
                } else { pts = cp_new_max; }
                for(let j=0;j<pts.length;j++){
                    let midpt = [(cp_new.saddle[i][0]+pts[j][0])/2, (cp_new.saddle[i][1]+pts[j][1])/2];
                    edges.push([cp_new.saddle[i],midpt,pts[j],"max"])
                }
            }
            let cp_new_min = cp_new.min.slice(0);
            cp_new_min.push([cp_new.saddle[i][0],0]);
            cp_new_min.push([cp_new.saddle[i][0],1]);
            let pts = [];
            if(cp_new_min.length>2){
                // find the closest min points
                let pt1 = this.findMinPt(cp_new.saddle[i],cp_new_min);
                let idx1 = cp_new_min.indexOf(pt1);
                cp_new_min.splice(idx1,1);
                let pt2 = this.findMinPt(cp_new.saddle[i],cp_new_min);
                pts = [pt1,pt2];
            } else { pts = cp_new_min;}
            for(let j=0;j<pts.length;j++){
                let midpt = [(cp_new.saddle[i][0]+pts[j][0])/2, (cp_new.saddle[i][1]+pts[j][1])/2]
                edges.push([cp_new.saddle[i],midpt,pts[j],"min"]);
            }
        }
        return edges;
    }

    findConnNodes(edges){
        let connNodes = [];
        // console.log(edges)
        for(let i=0;i<edges.length;i++){
            // edge[i] = [saddle, mid point, max/min, "max"/"min"]
            if(edges[i][3]==="min"){
                if(([0,1].indexOf(edges[i][2][0])!=-1)||([0,1].indexOf(edges[i][2][1])!=-1)){
                    // if the edge is between a saddle and a min point on the frame
                    connNodes.push([edges[i][2],i]);
                    // node: [position, corresponding index in edges]
                } 
            }
            connNodes.push([edges[i][1],i]);
        }
        console.log(connNodes)
        return connNodes;
    }

    constructMesh(sigma,idx){
        let grad_new = [];
        for(let x=0;x<=1;x+=this.step){
            for(let y=0;y<=1;y+=this.step){
                let dx = idx[0]*(1/sigma) * (x-0.5) * Math.exp(-(Math.pow(x-0.5,2)+Math.pow(y-0.5,2))/sigma);
                let dy = idx[1]*(1/sigma) * (y-0.5) * (Math.exp(-(Math.pow(x-0.5,2)+Math.pow(y-0.5,2))/sigma));
                grad_new.push([x,y,dx,dy]);
            }
        }
        grad_new.sort(function(x,y){
            return d3.ascending(x[0],y[0]) || d3.ascending(x[1],y[1]);
        })
        return grad_new;

    }

    findV(x,y, grad){
        // Find the vector value for the original point
        let x1Idx = Math.floor(x/this.step);
        let x2Idx = x1Idx+1;
        let y1Idx = Math.floor(y/this.step);
        let y2Idx = y1Idx+1;

        let triang = [grad[x1Idx/this.step+y1Idx], grad[x2Idx/this.step+y1Idx], grad[x2Idx/this.step+y2Idx]];

        let ex_v = [0,0]
        for(let i=0;i<3;i++){
            if(typeof triang[i]!="undefined"){
                ex_v[0] += 1/3*triang[i][2]
                ex_v[1] += 1/3*triang[i][3]
            }
        }
        return ex_v;
    }

    clearCanvas(){  
        // $('#animation').remove();
        // $('#canvas-container').append('<canvas id="animation" width="1000" height="600"></canvas>');
    }  
}