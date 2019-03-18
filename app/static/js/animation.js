// **** : to do list

class criticalPoint{
    constructor(id,x,y,type,edges){
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;
        this.fv = this.f(x,y,type); // function value
        this.edges = edges;
    }

    f(x,y,type){
        // **** now only calculate max ****
        let w = 1;
        let sigma = 0.1;
        if(type === "max"){
            return w*Math.exp(-(Math.pow(0,2)+Math.pow(0,2))/sigma);
        } else if(type === "saddle"){
            return w*Math.exp(-(Math.pow(0.25,2)+Math.pow(0,2))/sigma);
        }
        
    }
}

class anim{
    constructor(cp=undefined, edges=undefined) {
        this.canvasWidth = document.getElementById('animation').offsetWidth;
        this.canvasHeight = document.getElementById('animation').offsetHeight;
        this.svg = d3.select("#annotation");
        this.edgeGroup = this.svg.append("g")
        .attr("id","edgegroup");
        this.pointsGroup = this.svg.append("g")
            .attr("id","pointgroup");
        this.heightsGroup = this.svg.append("g")
            .attr("id","heightsgroup");
        this.frameGroup = this.svg.append("g")
            .attr("id","framegroup");
        this.checkGroup= this.svg.append("g")
            .attr("id", "checkgroup")
        this.additionalEdge = this.svg.append("path")
            .attr("id","additionalEdge")
            .attr("stroke","red")
            .attr("fill","none")
        this.connNodesGroup = this.svg.append("g")
            .attr("id","connNodesgroup");
        // this.currentPoint = this.svg.append("circle")
        //     .attr("id","currentPoint")
        //     .attr("r",10)
        //     .attr("fill", "yellow")
        // this.currentNewPoint = this.svg.append("circle")
        //     .attr("id","currentNewPoint")
        //     .attr("r",10)
        //     .attr("fill", "lightblue")
        
        
        

        this.drawFlag = true;
        this.step = 0.01;
        // this.step = 0.05;
        this.numSeg = 10;
        this.sigma = 0.1;
        if(cp===undefined){
            this.cp = [];
            this.cp.push(new criticalPoint(0,0.25,0.5,"max",0));
            this.cp.push(new criticalPoint(1,0.5,0.5,"saddle",[0,1,2,3]));
            this.cp.push(new criticalPoint(2,0.75,0.5,"max",1));
        } else {
            this.cp = cp
        }
        if(edges===undefined){
            this.edges = this.findEdges(this.cp);
        } else{
            this.edges = edges
        }
        
        
        console.log(this.cp)
        this.cp_saddle = [];
        for(let i=0;i<this.cp.length;i++){
            if(this.cp[i].type==="saddle"){
                this.cp_saddle.push(this.cp[i]);
            }
        }
        
        this.connNodes = this.findConnNodes(this.edges);
        // this.edgeMapper = this.initializeEdgeMapper(this.edges);
        this.edgeMapper = {};
        for(let i=0;i<this.edges.length;i++){
            this.edgeMapper["p"+i] = this.initializeEdgeMapper(this.edges[i]);
        }
        this.frames = [[0,0,0,1],[0,1,1,1],[0,0,1,0],[1,0,1,1,]]; //used for drawing frames
        

        console.log(this.edges)
        console.log(this.edgeMapper)

        //// curve ////
        let N = 50; // 25^2 curves
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

        this.animation();
       
        this.grad = this.constructMesh(this.sigma)
        console.log(this.grad)
        // this.addSlider();
    }

    // addSlider(){
    //     let slides = 
    //     d3.select("#functionValues").append("input")
    //         .attr("type","range")
    // }

    findNearestPoint(cp){
        // if cp.type === max or min, return the nearest saddle point
        // if cp.type === saddle, return 2 max, 2 min
    }
    

    drawAnnotation(){
        // draw critical points
        let circles = this.pointsGroup.selectAll("circle").data(this.cp);
        circles.exit().remove();
        let newcircles = circles.enter().append("circle");
        circles = newcircles.merge(circles);
        circles
            .attr("cx",(d)=>this.xMap(d.x))
            .attr("cy",(d)=>this.yMap(d.y))
            .attr("r",15)
            .attr("fill","white")
        
        let circletext = this.pointsGroup.selectAll("text").data(this.cp);
        circletext.exit().remove();
        let newcircletext = circletext.enter().append("text");
        circletext = newcircletext.merge(circletext);
        circletext
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', '35px')
            .attr("x",(d)=>this.xMap(d.x))
            .attr("y",(d)=>this.yMap(d.y))
            .attr("class",(d)=>{
                if(d.type==="max"){
                    return "far max"
                } else if (d.type==="saddle"){
                    return "far saddle"
                } else if (d.type==="min"){
                    return "fas min"
                }
            })
            .text((d)=>{
                    if(d.type==="max"){
                        return "\uf192"
                    } else if (d.type==="saddle"){
                        return "\uf057"
                    } else if (d.type==="min"){
                        return "\uf140"
                    }
                })
            .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", draggedText)
                    .on("end", dragended)); 
        
        let labels = this.heightsGroup.selectAll("text").data(this.cp);
        labels.exit().remove();
        let newlabels = labels.enter().append("text");
        labels = newlabels.merge(labels);
        labels
            .attr("x",(d)=>this.xMap(d.x)-20)
            .attr("y",(d)=>this.yMap(d.y)-20)
            // .text((d)=>{
            //     if(d[2]===1&&d[3]===1){
            //         return this.fmax(1,0,0,this.sigma);
            //     } else if(d[2]*d[3]===-1){
            //         return this.fmax(1,-0.25,0,this.sigma);
            //     }
            // })
            .text((d,i)=>i+1)
            .attr("class",(d)=>"label "+d.type)
            .style("font-weight","bold")
            
            // this.fmax(1,-0.25,0,this.sigma)



        let that=this;

        function dragstarted(d) {
            d3.select(this).raise().classed("active", true);
        }
              
        function draggedText(d,i) {
            console.log("this",this)
            console.log("d3",d3.mouse(this))
            for(let j=0;j<that.edges.length;j++){
                let ed = that.edges[j];
                console.log("ed",that.edges[j])
                if([that.edges[j][0].x,that.edges[j][0].y].join()===[that.cp[i].x,that.cp[i].y].join()) {
                    that.edges[j][0] = {"x":that.xMapReverse(d3.mouse(this)[0]),"y":that.yMapReverse(d3.mouse(this)[1])};
                } else if ([that.edges[j][2].x,that.edges[j][2].y].join()===[that.cp[i].x,that.cp[i].y].join()) {
                    that.edges[j][2] = {"x":that.xMapReverse(d3.mouse(this)[0]),"y":that.yMapReverse(d3.mouse(this)[1])};
                }
                // that.edges[j][1] = {"x":(that.edges[j][0].x+that.edges[j][2].x)/2,"y":(that.edges[j][0].y+that.edges[j][2].y)/2};
            }
            //     // let totalLength = d3.select("#p"+j).node().getTotalLength();
            //     // let stepLength = totalLength/that.numSeg;
            //     // let newPoints = [];
            //     // for(let k=0;k<that.numSeg;k++){
            //     //     let pt = d3.select("#p"+j).node().getPointAtLength(k*stepLength)
            //     //     if((ed[0][0]>ed[2][0])||(ed[0][1]>ed[2][1])){
            //     //         pt = d3.select("#p"+j).node().getPointAtLength((that.numSeg-k)*stepLength)
            //     //     }
            //     //     newPoints.push([that.xMapReverse(pt.x), that.yMapReverse(pt.y)]);
            //     // }
            //     // that.mapEdges("p"+j, newPoints);
            // }
            // d3.select(this)
            //     .attr("x",d3.mouse(this)[0])
            //     .attr("y", d3.mouse(this)[1]);
            that.cp[i].x = that.xMap.invert(d3.mouse(this)[0]);
            that.cp[i].y = that.yMap.invert(d3.mouse(this)[1]);        
            that.connNodes = that.findConnNodes(that.edges);
            that.grad = that.constructMesh(that.sigma);
            // console.log("cp",that.cp)
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
                if(d[0].x===0){
                    return this.xMap(d[0].x)+6;
                }
                else if(d[0].x===1){
                    return this.xMap(d[0].x)-6;
                } else{ return this.xMap(d[0].x);}
            })
            .attr("cy",(d)=>{
                if(d[0].y===0){
                    return this.yMap(d[0].y)+6;
                }
                else if(d[0].y===1){
                    return this.yMap(d[0].y)-6;
                } else{ return this.yMap(d[0].y);}
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
        function draggedNode(d,i){
            // **** need boundary control ****
            console.log("d3",d3.event)
            let pathid = "p"+d[1];
            let ed = that.edges[d[1]];
            let ed_new = [ed[0],{"x":that.xMapReverse(d3.event.x),"y":that.yMapReverse(d3.event.y)}, ed[2]];
            d3.select("#additionalEdge")
                .attr("d",(d)=>that.curve0(ed_new))
                .style("opacity",0)
            let totalLength = d3.select("#additionalEdge").node().getTotalLength();
            let stepLength = totalLength/that.numSeg;
            let newPoints = [];
            for(let i=0;i<that.numSeg;i++){
                let pt = d3.select("#additionalEdge").node().getPointAtLength(i*stepLength)
                if((ed[0].x>ed[2].x)||(ed[0].y>ed[2].y)){
                    pt = d3.select("#additionalEdge").node().getPointAtLength((that.numSeg-i)*stepLength)
                }
                newPoints.push({"x":that.xMapReverse(pt.x), "y":that.yMapReverse(pt.y)});
            }
            if(that.ifCurvesIntersect(pathid, newPoints)===false){
                that.mapEdges(pathid, newPoints);
                // console.log("that mapper",that.edgeMapper)
                if([0,1].indexOf(d[0].x)!=-1){
                    // node on vertical frame
                    d3.select(this).attr("cy", d[0].y = that.yMapReverse(d3.event.y));
                    that.edges[d[1]][2].y = that.yMapReverse(d3.event.y);
                }
                else if([0,1].indexOf(d[0].y)!=-1){
                    // node on horizontal frame
                    d3.select(this).attr("cx", d[0].x = that.xMapReverse(d3.event.x));
                    that.edges[d[1]][2].x = that.xMapReverse(d3.event.x);
                    // that.edges[d[1]][1].x = (that.edges[d[1]][2].x+that.edges[d[1]][0].x)/2;
                }
                else {
                    // node not on the frame
                    d3.select(this).attr("cx", d[0].x = that.xMapReverse(d3.event.x)).attr("cy", d[0].y = that.yMapReverse(d3.event.y));
                    that.edges[d[1]][1] = {"x":that.xMapReverse(d3.event.x), "y":that.yMapReverse(d3.event.y)}
                    that.connNodes[i][0] = {"x":that.xMapReverse(d3.event.x), "y":that.yMapReverse(d3.event.y)};
                } 
                that.grad = that.constructMesh(that.sigma);
            } else {
                ed_new = [ed[0], {"x":(ed[0].x+ed[2].x)/2,"y":(ed[0].y+ed[2].y)/2}, ed[2]]
                d3.select("#additionalEdge")
                    .attr("d",that.curve0(ed_new))
                    .style("opacity",0)
            }

            // let checkCircles = that.checkGroup.selectAll("circle").data(newPoints)
            // checkCircles.exit().remove();
            // let newcheckCircles = checkCircles.enter().append("circle");
            // checkCircles = newcheckCircles.merge(checkCircles);
            // checkCircles
            //     .attr("cx",(d)=>that.xMap(d[0]))
            //     .attr("cy",(d)=>that.yMap(d[1]))
            //     .attr("r",10)
            //     .attr("fill","orange")

        }
    }

    initializeEdgeMapper(edge){
        let em = [];
        let ed = edge.slice(0,3);
        ed.sort(function(a,b){
            return d3.ascending(a.x,b.x) || d3.ascending(a.y,b.y);
        })
        let xRange = ed[2].x-ed[0].x;
        let yRange = ed[2].y-ed[0].y;
        for(let j=0;j<this.numSeg;j++){
            em.push({"x":ed[0].x+j*xRange/this.numSeg, "y":ed[0].y+j*yRange/this.numSeg, "x_new":ed[0].x+j*xRange/this.numSeg, "y_new":ed[0].y+j*yRange/this.numSeg});
        }
        return em;
    }

    mapEdges(edgeid, newPoints){
        for(let i=0;i<this.numSeg;i++){
            // let pt = this.findMinPt([this.edgeMapper[edgeid][i].x, this.edgeMapper[edgeid][i].y], newPoints);
            let pt = newPoints[i]
            // console.log("i, pt",pt)
            this.edgeMapper[edgeid][i].x_new = pt.x;
            this.edgeMapper[edgeid][i].y_new = pt.y;
        }
        // this.edgeMapper[edgeid]
        // console.log(newPoints)
        

    }

    ifLinesIntersect(line1,line2){
        // for example, line1 = [pt1,pt2]; pt1 = {x:0,y:0};
        let pt1 = line1[0];
        let pt2 = line1[1];
        let pt3 = line2[0];
        let pt4 = line2[1];
        let x = undefined;
        let y = undefined;
        if(pt1.x===pt2.x&&pt3.x===pt4.x){ // if two lines are both vertical
            if(pt1.x===pt3.x){
                return true;
            } else {
                return false;
            }
        } else if(pt1.x===pt2.x){ // if line1 is vertical
            let a2 = (pt3.y-pt4.y)/(pt3.x-pt4.x);
            let b2 = (pt3.x*pt4.y-pt4.x*pt3.y)/(pt3.x-pt4.x);
            x = pt1.x;
            y = a2*x+b2;
        } else if(pt3.x===pt4.x){
            let a1 = (pt1.y-pt2.y)/(pt1.x-pt2.x);
            let b1 = (pt1.x*pt2.y-pt2.x*pt1.y)/(pt1.x-pt2.x);
            x = pt3.x;
            y = a1*x+b1;
        } else {
            let a1 = (pt1.y-pt2.y)/(pt1.x-pt2.x);
            let b1 = (pt1.x*pt2.y-pt2.x*pt1.y)/(pt1.x-pt2.x);
            let a2 = (pt3.y-pt4.y)/(pt3.x-pt4.x);
            let b2 = (pt3.x*pt4.y-pt4.x*pt3.y)/(pt3.x-pt4.x);
            if(a1===a2){
                return false;
            } else {
                x = (b2-b1)/(a1-a2);
                y = (a1*b2-a2*b1)/(a1-a2);
            }
        }        
        if((Math.min(pt1.x,pt2.x)<x && x<Math.max(pt1.x,pt2.x))&&(Math.min(pt1.y,pt2.y)<y && y<Math.max(pt1.y,pt2.y))&&(Math.min(pt3.x,pt4.x)<x && x<Math.max(pt3.x,pt4.x))&&(Math.min(pt3.y,pt4.y)<y && y<Math.max(pt3.y,pt4.y))){
            return true;
        } else { return false;}
    
    }

    ifCurvesIntersect(pathid, newpoints){
        for(let i=0;i<Object.keys(this.edgeMapper).length;i++){
            if(Object.keys(this.edgeMapper)[i]!=pathid){
                // console.log("sp",Object.keys(this.edgeMapper)[i],pathid)
                let ed = this.edgeMapper[Object.keys(this.edgeMapper)[i]];
                // console.log(ed,newpoints)
                for(let j=1;j<ed.length;j++){
                    for(let k=1;k<newpoints.length;k++){
                        let sp1 = [{"x":ed[j-1].x_new+0.0001,"y":ed[j-1].y_new+0.0001},{"x":ed[j].x_new-0.0001,"y":ed[j].y_new-0.0001}];
                        let sp2 = [{"x":newpoints[k-1].x+0.0001, "y":newpoints[k-1].y+0.0001},{"x":newpoints[k].x-0.0001, "y":newpoints[k].y-0.0001}];
                        // console.log(sp1,sp2)
                        if(this.ifLinesIntersect(sp1,sp2)){
                            console.log("return true")
                            return true;
                        }
                    }
                }
            }
        }
        console.log("return false")
        return false;
        // one edge is the current line being moved, how to find another edge?
    }

    
    adjustFlow(x,y){
        // map the original point to a new location when the boundary geometry is changed
        let x_new = x;
        let y_new = y;
        // console.log("adjusting flow")

        // now only deal with vertical lines
        for(let i=0;i<this.edges.length;i++){
            let ed = this.edges[i];
            let edMap = this.edgeMapper["p"+i];
            let xRange = Math.abs(ed[2].x-ed[0].x);
            let yRange = Math.abs(ed[2].y-ed[0].y);
            if(xRange!=0 && yRange!=0){
                // console.log("i am here")
            }
            // if((Math.min(ed[0][1],ed[2][1])<=y&&y<=Math.max(ed[0][1],ed[2][1]))||(Math.min(ed[0][0],ed[2][0])<=x&&x<=Math.max(ed[0][0],ed[2][0])))
            // let edMap = this.edgeMapper["p"+i];
            // let xSeg = Math.abs(ed[2][0]-ed[0][0])/this.numSeg;
            // let ySeg = Math.abs(ed[2][1]-ed[0][1])/this.numSeg;
            // let edMapPts = [];
            // edMap.forEach(p=>edMapPts.push([p.x,p.y,p.x_new,p.y_new]))
            // let pt0 = this.findMinPt([x,y],edMapPts);
            // let edMapPts1 = [];
            // for(let j=0;j<edMapPts.length;j++){
            //     if(edMapPts[j].join()!=pt0.join()){
            //         edMapPts1.push(edMapPts[j]);
            //     }
            // }
            // let pt1 = this.findMinPt([x,y],edMapPts1);
            // let x_line_old = pt0[0];
            // let x_line_new = pt0[2];
            // if(pt1[3]!=pt0[3]){
            //     x_line_new = (pt1[3]-y)/(pt1[3]-pt0[3])*pt0[2]+(y-pt0[3])/(pt1[3]-pt0[3])*pt1[2];
            // }
            // if(x<=pt0[0]){
            //     // points on left
            //     x_new = x * x_line_new / x_line_old;
            // } else { 
            //     x_new = 1-(1-x)/(1-x_line_old)*(1-x_line_new);
            // } 

            // console.log(x_line_old,x_line_new)

            // console.log(pt0)
            let a = 1



            // if(xRange===0){
            if(a===1){
                // now only deal with vertical lines
                if(Math.min(ed[0].y,ed[2].y)<=y&&y<=Math.max(ed[0].y,ed[2].y)){ // only these points need to change
                    let edMap = this.edgeMapper["p"+i];
                    let ySeg = Math.abs(ed[2].y-ed[0].y)/this.numSeg;
                    let pIdx = Math.floor((y-Math.min(ed[0].y,ed[2].y))/ySeg);
                    let pt0 = edMap[pIdx];
                    let pt1 = edMap[Math.min(pIdx+1,edMap.length-1)];
                    let xOrigin = ed[0].x; //the x value before change curve
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
            // if(a===1){
                // horizontal lines
                if(Math.min(ed[0].x,ed[2].x)<=x&&x<=Math.max(ed[0].x,ed[2].x)){
                    let edMap = this.edgeMapper["p"+i];
                    let xSeg = Math.abs(ed[2].x-ed[0].x)/this.numSeg;
                    let pIdx = Math.floor((x-Math.min(ed[0].x,ed[2].x))/xSeg);
                    let pt0 = edMap[pIdx];
                    let pt1 = edMap[Math.min(pIdx+1,edMap.length-1)];
                    let yOrigin = ed[0].y; //the y value before change curve
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
    

    animation(){            
        let N = 50;
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
        function randage() {
            // to randomize starting ages for each curve
            return Math.round(Math.random()*100);
        }

        let g = d3.select("#animation").node().getContext("2d"); // initialize a "canvas" element
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
        setInterval(function () {if (that.drawFlag) {draw();}}, frameRate);
        d3.timer(function () {if (that.drawFlag) {draw();}}, frameRate);
        d3.select("#annotation")
            .on("click", function() {that.drawFlag = (that.drawFlag) ? false : true;});
            
        g.globalCompositeOperation = "source-over";
        
        function draw() {
            let width = document.getElementById('animation').offsetWidth;
            let height = document.getElementById('animation').offsetHeight;
            g.fillStyle = "rgba(255,255, 255, 0.05)";
            // g.fillStyle = "black";
            g.fillRect(0, 0, width, height); // fades all existing curves by a set amount determined by fillStyle (above), which sets opacity using rgba            

            that.drawAnnotation();
            that.addedges()

            // d3.select("#checkcircle")
            //     .attr("cx",that.xMap(0.5))
            //     .attr("cy",that.yMap(0.15))

            
            for (let i=0; i<M; i++) { // draw a single timestep for every curve

                    // let dr = [0,0];
                    // let X_new = that.adjustFlow(X[i],Y[i])[0];
                    // let Y_new = that.adjustFlow(X[i],Y[i])[1];
                    // dr = that.findV(X[i],Y[i],that.grad);
                    
                    
                        // dr = that.gradF(that.cp, X[i],Y[i],0.1);
                        
                        // console.log(that.grad)
                        // let result = that.chooseGrad(X[i],Y[i]);
                        // console.log(result)
                        // dr = that.findV(X[i]+(0.5-that.chooseGrad(X[i],Y[i])[0][0]),Y[i]+(0.5-that.chooseGrad(X[i],Y[i])[0][1]),that.chooseGrad(X[i],Y[i])[1])
                    let dr = that.findV(X[i],Y[i],that.grad)[0]
                    let pt_new = that.findV(X[i],Y[i],that.grad)[1]
                    let X_new = pt_new[0];
                    let Y_new = pt_new[1];

                        
                    

                    g.setLineDash([1, 0])
                    g.beginPath();
                    g.moveTo(that.xMap(X_new), that.yMap(Y_new)); // the start point of the path
                    g.lineTo(that.xMap(X_new+dr[0]*dt), that.yMap(Y_new+dr[1]*dt)); // the end point
                    X[i]+=dr[0]*dt;
                    Y[i]+=dr[1]*dt;
                    g.lineWidth = 1;
                    // g.strokeStyle = "#FF8000";
                    // g.strokeStyle = "rgb(141,106,184)"
                    g.strokeStyle = "rgb(110,24,110)"
                    g.stroke(); // final draw command
                    if (age[i]++ > MaxAge) {
                        // increment age of each curve, restart if MaxAge is reached
                        age[i] = randage();
                        X[i] = X0[i], Y[i] = Y0[i];
                    }
            }
        }
    }

    calDist(loc1, loc2){
        let dist = Math.sqrt(Math.pow(loc1.x-loc2.x,2)+Math.pow(loc1.y-loc2.y,2));
        return dist;
    }

    findMinPt(pt0, pts){
        let dist = this.calDist(pt0,pts[0]);
        let minPt = pts[0];
        for(let i=1;i<pts.length;i++){
            let disti = this.calDist(pt0,pts[i]);
            if(disti < dist){
                dist = disti;
                minPt = pts[i]
            }
        }
        return minPt
    }

    addedges(){
        this.curve0 = d3.line()
            .x(d=>this.xMap(d.x))
            .y(d=>this.yMap(d.y))
            .curve(d3.curveCardinal.tension(0));
        let edges = this.edgeGroup.selectAll("path").data(this.edges);
        edges.exit().remove();
        let newedges = edges.enter().append("path");
        edges = newedges.merge(edges);
        edges
            .attr("d",(d)=>{
                let d_new = d.slice(0,3);
                // console.log(this.curve0(d_new))
                return this.curve0(d_new);
            })
            .attr("class",(d)=>d[3]+"edge") // minedge/maxedge
            .attr("id",(d,i)=>"p"+i)
            .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-width",2)
            .style("stroke-dasharray",(d)=>{
                if(d[3]==="max"){
                    return "5,5";
                } else {return "";}
            })
            .style("opacity",0.8)
    }

    findEdges(cp){
        // initialize edges
        console.log("finding edge")
        let cp_new = {"max":[], "min":[], "saddle":[]};
        for(let i=0;i<cp.length;i++){
            let loc = {"x":cp[i].x,"y":cp[i].y};
            let type = cp[i].type;

            if(type==="max"){
                cp_new.max.push(loc);
            }
            else if (type==="saddle"){
                cp_new.saddle.push(loc);
            }
            else if(type==="min"){
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
                    pts = this.find2MinPt(cp_new.saddle[i],cp_new.max);
                } else { pts = cp_new_max; }
                for(let j=0;j<pts.length;j++){
                    let midpt = {"x":(cp_new.saddle[i].x+pts[j].x)/2, "y":(cp_new.saddle[i].y+pts[j].y)/2};
                    edges.push([cp_new.saddle[i],midpt,pts[j],"max"])
                }
            }
            let cp_new_min = cp_new.min.slice(0);
            cp_new_min.push({"x":cp_new.saddle[i].x,"y":0});
            cp_new_min.push({"x":cp_new.saddle[i].x,"y":1});
            let pts = [];
            if(cp_new_min.length>2){
                // find the closest min points
                pts = this.find2MinPt(cp_new.saddle[i],cp_new_min);
            } else { pts = cp_new_min;}
            for(let j=0;j<pts.length;j++){
                let midpt = {"x":(cp_new.saddle[i].x+pts[j].x)/2, "y":(cp_new.saddle[i].y+pts[j].y)/2};
                edges.push([cp_new.saddle[i],midpt,pts[j],"min"]);
            }
        }
        return edges;
    }

    findConnNodes(edges){
        // find the location of control nodes on each edge
        console.log("finding conn")
        let connNodes = [];
        // console.log(edges)
        for(let i=0;i<edges.length;i++){
            // edge[i]: [saddle, mid point, max/min, "max"/"min"]
            if(edges[i][3]==="min"){
                if(([0,1].indexOf(edges[i][2].x)!=-1)||([0,1].indexOf(edges[i][2].y)!=-1)){
                    // if the edge is between a saddle and a min point on the frame
                    connNodes.push([edges[i][2],i]);
                    // node: [position, corresponding index in edges]
                } 
            }
            connNodes.push([edges[i][1],i]);
        }
        // console.log(connNodes)
        return connNodes;
    }

    find2MinPt(pt,pts){
        let pt1 = this.findMinPt(pt,pts);
        let idx1 = pts.indexOf(pt1);
        let pts1 = pts.slice(0,idx1);
        let pts2 = pts.slice(idx1+1);
        let pts_new = pts1.concat(pts2);
        let pt2 = this.findMinPt(pt,pts_new);
        return [pt1,pt2];
    }

    constructMesh(sigma){
        console.log("constucting")
        let grad_new = [];
        let cp_max = [];
        for(let i=0;i<this.cp.length;i++){
            if(this.cp[i].type==="max"){
                cp_max.push(this.cp[i]);
            }
        }
        for(let x=0;x<=1;x+=this.step){
            for(let y=0;y<=1;y+=this.step){
                let cpt = this.findMinPt({"x":x,"y":y},this.cp);
                if(this.cp.length===3){
                    if(x>0.35 && x<0.65){
                        cpt = this.cp[1];
                    } else if (x <= 0.35){
                        cpt = this.cp[0];
                    } else {
                        cpt = this.cp[2];
                    }

                }
                
                let idx = [];
                let x_new = x - cpt.x;
                let y_new = y - cpt.y;
                if(cpt.type === "max"){
                    idx=[1,1];
                } else if(cpt.type==="saddle"){
                    idx=[-1,1];
                } else if(cpt.type==="min"){
                    idx=[-1,-1];
                }
                // console.log(idx)
                let dx = idx[0]*(1/sigma) * x_new * Math.exp(-(Math.pow(x_new,2)+Math.pow(y_new,2))/sigma);
                let dy = idx[1]*(1/sigma) * y_new * (Math.exp(-(Math.pow(x_new,2)+Math.pow(y_new,2))/sigma));
                // let dx = x_new;
                // let dy = y_new;
                // if(idx[0]*idx[1]<0){
                    
                // }
                // console.log(dx,dy)
                // if(cpt.type === "max"){
                //     let ed = this.edges[cpt.edges];
                //     if(ed[0].x-ed[2].x!=0 && ed[0].y-ed[2].y!=0){
                //         let theta = Math.atan2(ed[0].y-ed[2].y,ed[0].x-ed[2].x)*2;
                //         if(x>0.5 && x<0.75){
                //             let dx_new = Math.cos(theta)*dx-Math.sin(theta)*dy;
                //             let dy_new = Math.sin(theta)*dx+Math.cos(theta)*dy;
                //             dx = dx_new;
                //             dy = dy_new;  
    
                //         }
                //     }
                    


                // }

                if(cpt.type==="saddle"){
                    // for(let i=0;i<cpt.edges.length;i++){
                    //     let ed = this.edges[cpt.edges[i]];
                    //     if(ed[0].x-ed[2].x!=0 && ed[0].y-ed[2].y!=0){
                    //         let theta = Math.atan2(ed[0].y-ed[2].y,ed[0].x-ed[2].x)*2;
                    //         // if(this.calDist({"x":x,"y":y},ed[1])<0.05){
                    //         if(x>0.5 && (y>0.25 && y < 0.75)){
                    //             let dx_new = Math.cos(theta)*dx-Math.sin(theta)*dy;
                    //             let dy_new = Math.sin(theta)*dx+Math.cos(theta)*dy;
                    //             dx = dx_new;
                    //             dy = dy_new;  

                    //         }

                    //     }
                        
                                              
                    // }
                    // dx = -x_new;
                    // dy = y_new;
                    // dx = -(1/sigma)*x_new*Math.exp(-(Math.pow(y,2)+Math.pow(x,2))/sigma);
                    // dy = (1/sigma)*y_new*Math.exp(-(Math.pow(y,2)+Math.pow(x,2))/sigma);
                    // flow rotation
                    // if([cpt.x,cpt.y].join!=[0.5,0.5].join()){
                    //     let pts = this.find2MinPt(cpt,cp_max);
                    //     let theta = Math.atan2(pts[1].y-pts[0].y,pts[1].x-pts[0].x)*2;
                    //     let dx_new = Math.cos(theta)*dx-Math.sin(theta)*dy;
                    //     let dy_new = Math.sin(theta)*dx+Math.cos(theta)*dy;
                    //     dx = dx_new;
                    //     dy = dy_new;

                    // }
                    
                    
                }
                let pt_new = this.adjustFlow(x,y);
                grad_new.push([x,y,dx,dy,pt_new[0],pt_new[1]]);
                // grad_new.push([x,y,dx,dy]);
            }
        }
        grad_new.sort(function(x,y){
            return d3.ascending(x[0],y[0]) || d3.ascending(x[1],y[1]);
        })
        // console.log(grad_new)
        return grad_new;
    }

    findV(x,y, grad){
        // Find the vector value for the point
        // let x1Idx = Math.floor(x/this.step);
        let x1Idx = Math.min(Math.max(Math.floor(x/this.step),0),1/this.step-1);
        // let x2Idx = x1Idx+1;
        let x2Idx = Math.min(x1Idx+1,1/this.step-1);
        // let y1Idx = Math.floor(y/this.step);
        let y1Idx = Math.min(Math.max(Math.floor(y/this.step),0),1/this.step-1);
        // let y2Idx = y1Idx+1;
        let y2Idx = Math.min(y1Idx+1,1/this.step-1);

        let triang = [grad[x1Idx/this.step+y1Idx], grad[x2Idx/this.step+y1Idx], grad[x2Idx/this.step+y2Idx]];
        // console.log(x,y)
        // console.log(x1Idx,x2Idx,y1Idx,y2Idx)
        // console.log(triang)

        let ex_v = [0,0]
        for(let i=0;i<3;i++){
            if(typeof triang[i]!="undefined"){
                ex_v[0] += 1/3*triang[i][2]
                ex_v[1] += 1/3*triang[i][3]
            }
        }

        let x_new = ((triang[1][0]-x)*triang[0][4]+(x-triang[0][0])*triang[1][4])/(triang[1][0]-triang[0][0]);
        let y_new = ((triang[2][1]-y)*triang[1][5]+(y-triang[1][1])*triang[2][5])/(triang[2][1]-triang[1][1]);
        let pt_new = [x_new,y_new]
        return [ex_v,pt_new];
        // return ex_v;
    }

    // fmax(w,x,y,sigma){
    //     return w*Math.exp(-(Math.pow(x,2)+Math.pow(y,2))/sigma)
    // }

    clearCanvas(){
        // clear both canvas and svg
        this.drawFlag = false;
        $('#animation').remove();
        $('#annotation').remove();
        $('#container').append('<canvas id="animation" style="position: absolute; top:100px; left:80px; z-index:1" width="1000" height="1000" ></canvas>');
        $('#container').append('<svg id="annotation" style="position: absolute; top:100px; left:80px; z-index:1" width="1000" height="1000"></svg>');
    }  
}