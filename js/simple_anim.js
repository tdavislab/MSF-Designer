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
        this.connNodesGroup = this.svg.append("g")
            .attr("id","connNodesgroup");
        

        this.drawFlag = true;
        this.cp = [[0.25,0.5,1,1],[0.75,0.5,1,1],[0.5,0.5,-1,1]];
        // this.cp = [[0.5,0.5,1,1]];
        this.sigma = 0.1;
        this.edges = this.findEdges(this.cp);
        this.connNodes = this.findConnNodes(this.edges);
        this.frames = [[0,0,0,1],[0,1,1,1],[0,0,1,0],[1,0,1,1,]];

        //// curve ////
        let N = 60; // 25^2 curves
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
        console.log(this.edges)
        this.animation("original");
       

        // this.adbound = false;
        // d3.select("#adbound")
        //     .on("click",()=>{
        //         if(this.adbound === false){
        //             d3.select("#adbound")
        //                 .attr("class","btn btn-primary")
        //                 .attr("value","Finish Adjustment")
        //             this.adbound = true;
        //             this.adjustBound();
        //         } else { 
        //             d3.select("#adbound")
        //                 .attr("class","btn btn-secondary")
        //                 .attr("value","Adjust Bound")
        //             this.adbound = false;
        //         }
        //     })
  
        this.gradmax = this.constructMesh(this.sigma,[1,1])
        this.gradsaddle1 = this.constructMesh(this.sigma, [-1,1])
        this.gradsaddle2 = this.constructMesh(this.sigma, [1,-1])
        this.gradmin = this.constructMesh(this.sigma,[-1,-1])

        this.apType = "";
        this.amType = "";
        
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
            that.adjustBound(that.xMapReverse(d3.event.x), that.yMapReverse(d3.event.y)); 

        }
    }

    adjustBound(x,y){
        if(y<=0.5){
            this.cellBound.upper[0] = x;
        } else { this.cellBound.lower[0] = x;}
    }

    

    constructMesh(sigma,idx){
        let grad_new = [];
        for(let x=0;x<=1;x+=0.025){
            for(let y=0;y<=1;y+=0.05){
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
        let x1 = Math.floor(x/0.025);
        let x2 = x1+1;
        let y1 = Math.floor(y/0.05);
        let y2 = y1+1;

        let triang = [grad[x1*20+y1], grad[x2*20+y1], grad[x2*20+y2]];

        let ex_v = [0,0]
        for(let i=0;i<3;i++){
            if(typeof triang[i]!="undefined"){
                ex_v[0] += 1/3*triang[i][2]
                ex_v[1] += 1/3*triang[i][3]
            }
        }
        return ex_v;
    }

    animation(type){
        this.clearCanvas()
        // this.edges = this.findEdges(this.cp);
            
        let N = 60;
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

            
            for (let i=0; i<M; i++) { // draw a single timestep for every curve
                let dr = [0,0];
                let X_new = X[i];
                let Y_new = Y[i];
                if(type === "original"){ 
                    // dr = that.gradF(that.cp, X[i],Y[i],0.1);
                    
                    // console.log(that.grad)
                    let minCP = that.findMinPt([X[i],Y[i]],that.cp);
                    if(minCP[2]===1&&minCP[3]===1){
                        dr = that.findV(X[i]+(0.5-minCP[0]),Y[i]+(0.5-minCP[1]),that.gradmax)
                    }
                    else if(minCP[2]===-1&&minCP[3]===1){
                        dr = that.findV(X[i]+(0.5-minCP[0]),Y[i]+(0.5-minCP[1]),that.gradsaddle1)
                    }
                    else if(minCP[2]===1&&minCP[3]===-1){
                        dr = that.findV(X[i]+(0.5-minCP[0]),Y[i]+(0.5-minCP[1]),that.gradsaddle2)
                    }
                    else if(minCP[2]===-1&&minCP[3]===-1){
                        dr = that.findV(X[i]+(0.5-minCP[0]),Y[i]+(0.5-minCP[1]),that.gradmin)
                    }

                    if(X_new>=0 && X_new<=0.5 && Y_new>=0 && Y_new <= 0.5){
                        X_new = X_new*(that.cellBound.upper[0]+(0.5-that.cellBound.upper[0])*Y_new/0.5)/0.5
                    }
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
                else if (type === "amove"){
                    // dr = that.gradF(that.cp, X[i], Y[i],0.1);
                    dr = that.findV([Math.max(X[i],0),Math.max(Y[i],0)],that.grad);
                }
                else if (type === "bmove"){
                    dr = that.gradF(that.cp, X[i], Y[i],0.05);
                    // dr = that.findV([Math.max(X[i],0),Math.max(Y[i],0)],that.grad);
                }
                else if (type === "cmove"){
                    dr = that.gradF(that.cp,X[i], Y[i],0.05);
                }

                g.setLineDash([1, 0])
                g.beginPath();
                g.moveTo(that.xMap(X_new), that.yMap(Y[i])); // the start point of the path
                g.lineTo(that.xMap(X_new+dr[0]*dt), that.yMap(Y[i]+=dr[1]*dt)); // the end point
                X[i]+=dr[0]*dt
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
        // let edges = this.edgeGroup.selectAll("line").data(this.edges);
        // edges.exit().remove();
        // let newedges = edges.enter().append("line");
        // edges = newedges.merge(edges);
        // edges
        //     .attr("x1",(d)=>this.xMap(d[0][0]))
        //     .attr("y1",(d)=>this.yMap(d[0][1]))
        //     .attr("x2",(d)=>this.xMap(d[1][0]))
        //     .attr("y2",(d)=>this.yMap(d[1][1]))
        //     .attr("class",(d)=>d[2]+"edge") // minedge/maxedge
        //     .attr("id",(d)=>d[0].join()+d[2]+d[1].join()) // saddle position + min/max + min/max position

        let curve0 = d3.line()
            .x(d=>this.xMap(d[0]))
            .y(d=>this.yMap(d[1]))
            .curve(d3.curveCardinal);
            // .curve(d3.curveCatmullRomOpen)
        let edges = this.edgeGroup.selectAll("path").data(this.edges);
        edges.exit().remove();
        let newedges = edges.enter().append("path");
        edges = newedges.merge(edges);
        edges
            // .attr("d",(d)=>{
            //     let p = "M "+this.xMap(d[0][0])+" "+this.yMap(d[0][1])
            //     for(let i=1;i<d.length-1;i++){
            //         p += " L "+this.xMap(d[i][0])+" "+this.yMap(d[i][1])
            //     }
            //     return p;
            // })
            .attr("d",(d)=>{
                let d_new = d.slice(0,3);
                return curve0(d_new);
            })
            .attr("class",(d)=>d[3]+"edge") // minedge/maxedge
            .attr("id",(d)=>d[0].join()+d[2]+d[1].join()) // saddle position + min/max + min/max position
            .style("fill", "none")
            .style("stroke", "white")
            .style("stroke-width",2)
            .style("stroke-dasharray",(d)=>{
                if(d[3]==="max"){
                    return "5,5";
                } else {return "";}
            })
            // .interpolate("cardinal")

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
            // let px = (edges[i][0][0] + edges[i][1][0])/2 // in the middle of two end points
            // let py = (edges[i][0][1] + edges[i][1][1])/2
            connNodes.push([edges[i][1],i]);
        }
        console.log(connNodes)
        return connNodes;

    }

    clearCanvas(){  
        // $('#animation').remove();
        // $('#canvas-container').append('<canvas id="animation" width="1000" height="600"></canvas>');
    }  
}