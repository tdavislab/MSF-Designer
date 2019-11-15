// **** : to do list

class criticalPoint{
    constructor(id,x,y,type){
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;
        this.fv = this.f(x,y,type); // function value
        this.fv_perb = this.fv + Math.random();
        this.edges = {};
        this.lvalue = 0;
        this.uvalue = 10;
    }

    f(x,y,type){
        // **** now only calculate max ****
        let w = 1;
        let sigma = 0.1;
        // if(type === "max"){
        //     return w*Math.exp(-(Math.pow(0,2)+Math.pow(0,2))/sigma);
        // } else if(type === "saddle"){
        //     return w*Math.exp(-(Math.pow(0.25,2)+Math.pow(0,2))/sigma);
        // }
        if(type === "max"){
            // return w*Math.exp(-(Math.pow(x_new,2)+Math.pow(y_new,2))/sigma);
            return -Math.pow(0,2) - Math.pow(0,2)+10;
        } else if(type === "saddle"){
            // if(x_new<0){
            //     x_new = x - 0.25
            // } else{ x_new = x-0.75}
            // return w*Math.exp(-(Math.pow(x_new,2)+Math.pow(y_new,2))/sigma);
            return Math.pow(0,2) - Math.pow(0,2)+5;
        } else if(type === "min"){
            return Math.pow(0,2) + Math.pow(0,2);
        }
        
    }
}

class editStep{
    constructor(cp,edges,modif){
        this.cp = cp;
        this.edges = edges;
        this.modif = modif;
    }
}

class anim{
    constructor(cp=undefined, edges=undefined, edgeMapper=undefined) {
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
        this.additionalEdge = this.svg.append("path")
            .attr("id","additionalEdge")
            .attr("stroke","red")
            .attr("fill","none")
        this.connNodesGroup = this.svg.append("g")
            .attr("id","connNodesgroup");
        this.terminalNodesGroup = this.svg.append("g")
            .attr("id","terminalNodesGroup");
        this.frames = [[0,0,0,1],[0,1,1,1],[0,0,1,0],[1,0,1,1,]]; //used for drawing frames

        // initialize step legend
        this.margin = {"top":20,"bottom":20,"left":20,"right":20,"betweenstep":50};
        this.step_svgWidth = 350;
        this.step_svgHeight = 1210;
        this.step_frameWidth = 300;
        this.step_frameHeight = 300;
        this.step_svg = d3.select("#undogroup").append("svg")
            .attr("id","undoSVG")
            .attr("width", this.step_svgWidth)
            .attr("height", this.step_svgHeight);
        this.recordgroup1 = this.step_svg.append("g")
            .attr("id","record1");
        this.recordgroup2 = this.step_svg.append("g")
            .attr("id","record2");
        this.recordgroup3 = this.step_svg.append("g")
            .attr("id","record3");
        
        this.step_xMap = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.step_frameWidth]);
        this.step_yMap = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.step_frameHeight]);

        this.step_curveMap = d3.line()
            .x(d=>this.step_xMap(d.x))
            .y(d=>this.step_yMap(d.y))
            .curve(d3.curveCardinal.tension(0));
        
        this.recordgroup1.append("rect")
            .attr("x",this.margin.left)
            .attr("y",this.margin.top)
            .attr("width",this.step_frameWidth)
            .attr("height",this.step_frameHeight)
            .attr("stroke","white")
            .attr("fill", "none");
        
        this.recordgroup2.append("rect")
            .attr("x",this.margin.left)
            .attr("y",this.margin.top+this.step_frameHeight+this.margin.betweenstep)
            .attr("width",this.step_frameWidth)
            .attr("height",this.step_frameHeight)
            .attr("stroke","white")
            .attr("fill", "none");
        
        this.recordgroup3.append("rect")
            .attr("x",this.margin.left)
            .attr("y",this.margin.top+2*this.step_frameHeight+2*this.margin.betweenstep)
            .attr("width",this.step_frameWidth)
            .attr("height",this.step_frameHeight)
            .attr("stroke","white")
            .attr("fill", "none");
        
        this.drawFlag = true;
        this.step = 0.01;
        // this.step = 0.05;
        this.numSeg = 10;
        this.sigma = 0.1;
        if(cp===undefined){
            this.cp = [];
            this.cp.push(new criticalPoint(0,0.25,0.5,"max"));
            this.cp.push(new criticalPoint(1,0.5,0.5,"saddle"));
            this.cp.push(new criticalPoint(2,0.75,0.5,"max"));
        } else {
            this.cp = cp
        }
        this.cp_saddle = [];
        this.cp_max = [];
        this.cp_min = [];
        for(let i=0;i<this.cp.length;i++){
            if(this.cp[i].type==="saddle"){
                this.cp_saddle.push(this.cp[i]);
            } else if(this.cp[i].type==="max"){
                this.cp_max.push(this.cp[i]);
            } else if(this.cp[i].type==="min"){
                this.cp_min.push(this.cp[i]);
            }
        }
        this.minBound = [];
        for(let i=0;i<20;i++){
            let v = 1/20*i;
            this.minBound.push({"x":v,"y":0,"id":"b0"+i,"type":"min", "ifBound":true});
            this.minBound.push({"x":v,"y":1,"id":"b1"+i,"type":"min", "ifBound":true});
            this.minBound.push({"x":0,"y":v,"id":"b2"+i,"type":"min", "ifBound":true});
            this.minBound.push({"x":1,"y":v,"id":"b3"+i,"type":"min", "ifBound":true});
        }
        this.minBound_dict = {};
        this.minBound.forEach(p=>this.minBound_dict[p.id] = p);

        console.log("minBound", this.minBound)

        this.cp_min = this.cp_min.concat(this.minBound);
        this.edges = {};
        this.edgeMapper = {};
        // edge id: edge+start_point_id+end_point_id
        if(edges===undefined){
            this.addNewEdge(this.cp[1],this.cp[0],"max");
            this.addNewEdge(this.cp[1],this.cp[2],"max");
            this.addNewEdge(this.cp[1],{"x":0.5,"y":0,"id":"b0"+10, "type":"min", "ifBound":true},"min");
            this.addNewEdge(this.cp[1],{"x":0.5,"y":1,"id":"b1"+10, "type":"min", "ifBound":true},"min");
        } else{
            this.edges = edges;
            this.edgeMapper = edgeMapper;
        }
        
        console.log(this.edges)
        console.log(this.edgeMapper)

        this.stepRecorder = [];
        this.addStep();

        // discretize the vfield coords
        let N = 50;
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
        this.curve0 = d3.line()
            .x(d=>this.xMap(d.x))
            .y(d=>this.yMap(d.y))
            .curve(d3.curveCardinal.tension(0));

       
        this.grad = this.initializeMesh();
        this.assignEdge();
        this.constructMesh(this.sigma);
        this.animation();

        let mindist = 1;
        let maxdist = 0;
        for(let i=0;i<this.grad.length;i++){
            let edgedist = this.calDist({"x":this.grad[i].x,"y":this.grad[i].y},this.grad[i].ed);
            if(edgedist<mindist){
                mindist = edgedist;
            }
            if(edgedist>maxdist){
                maxdist = edgedist;
            }
        }
        console.log("mindist",mindist)
        console.log("maxdist", maxdist)


        this.findRange();
        this.drawAnnotation();
        this.addedges();
        this.drawStep();

        this.dragTerminal = false;

        // console.log(this.ifArcViolate(this.cp[1])) // false
        console.log("grad",this.grad)
        console.log('cp', this.cp)

    }

    criticalPointsDetection(cp_detection){
        console.log(cp_detection)
        if(cp_detection.length > this.cp.length){
            console.log("more")
        }


    }

    

    findRange(){
        // find the range of the function value for each critical point
        for(let i=0;i<this.cp.length;i++){
            this.cp[i].lvalue = 0;
            this.cp[i].uvalue = 10;
            for(let eid in this.cp[i].edges){
                if(this.cp[i].type === "saddle"){
                    let np = this.cp[i].edges[eid][2];
                    if(np.type === "max"){
                        if(np.fv < this.cp[i].uvalue){
                            this.cp[i].uvalue = np.fv;
                        }
                    } else if(np.type === "min"){
                        if(np.fv > this.cp[i].lvalue){
                            this.cp[i].lvalue = np.fv;
                        }
                    }
                } else if(this.cp[i].type === "max"){
                    let np = this.cp[i].edges[eid][0];
                    if(np.fv > this.cp[i].lvalue){
                        this.cp[i].lvalue = np.fv;
                    }
                } else if(this.cp[i].type === "min"){
                    let np = this.cp[i].edges[eid][0];
                    if(np.fv < this.cp[i].uvalue){
                        this.cp[i].uvalue = np.fv;
                    }
                }
            }
        }
    }

    addNewEdge(startpoint, endpoint, type, that_cp = this.cp, that_edges = this.edges, that_edgeMapper = this.edgeMapper, midpoint = undefined){
        // console.log("adding!!", startpoint, endpoint, type)
        let edgeid = "edge"+startpoint.id+endpoint.id;
        // add to this.edges
        if(Object.keys(that_edges).indexOf(edgeid)!=-1){
            // check if there has already been an edge between start and end points
            that_edges[edgeid] = [startpoint,{"x":(startpoint.x+endpoint.x)/2-0.03, "y":(startpoint.y+endpoint.y)/2-0.03},endpoint,type];
            edgeid = edgeid + "_1";
            that_edges[edgeid] = [startpoint,{"x":(startpoint.x+endpoint.x)/2+0.03, "y":(startpoint.y+endpoint.y)/2+0.03},endpoint,type];
        } else {
            if(midpoint===undefined){
                that_edges[edgeid] = [startpoint,{"x":(startpoint.x+endpoint.x)/2, "y":(startpoint.y+endpoint.y)/2},endpoint,type];
            } else {
                that_edges[edgeid] = [startpoint,midpoint,endpoint,type];
            }
            
        }
        // add this edge to corresponding critical points
        // startpoint is always a saddle point
        this.cpReassignEdge();
        // that_cp[startpoint.id].edges[edgeid] = that_edges[edgeid]
        // if(that_cp[endpoint.id]!=undefined){
        //     that_cp[endpoint.id].edges[edgeid] = that_edges[edgeid]
        // }
        // add this edge to this.edgeMapper
        that_edgeMapper[edgeid] = this.initializeEdgeMapper(that_edges[edgeid])
    }

    deleteOldEdge(edgeid){
        if(this.edges[edgeid]!=undefined){
            // delete edge
            delete this.edges[edgeid];
            // delete edgemapper
            delete this.edgeMapper[edgeid];
            // re-assign edges to cp
            this.cpReassignEdge();
        }
        
    }

    cpReassignEdge(){ // re-assign edges to cp
        this.cp.forEach(p=>{
            let edges = {};
            for(let ed_key in this.edges){
                let ed = this.edges[ed_key];
                if(ed[0].id === p.id || ed[2].id === p.id){
                    edges[ed_key] = ed;
                }
            }
            p.edges = edges;
        })
    }

    cpReorganize(){
        this.cpClassification();
        this.cpReassignID();
    }

    cpClassification(){ // classfy cps into max/min/saddle
        let cp_max = [];
        let cp_min = [];
        let cp_saddle = [];
        this.cp.forEach(p=>{
            if(p.type === "max"){ cp_max.push(p); }
            if(p.type === "min"){ cp_min.push(p); }
            if(p.type === "saddle"){ cp_saddle.push(p); }
        })
        this.cp_max = cp_max;
        this.cp_min = cp_min;
        this.cp_saddle = cp_saddle;
    }

    cpReassignID(){
        for(let i=0; i<this.cp.length; i++){
            this.cp[i].id = i;
        }
        this.edgeReassignID();
    }

    edgeReassignID(){
        for(let ed_key in this.edges){
            let ed = this.edges[ed_key];
            let ed_key_new = "edge"+ed[0].id+ed[2].id;
            if(ed_key_new != ed_key){
                this.addNewEdge(ed[0],ed[2],ed[3],this.cp,this.edges,this.edgeMapper,ed[1]);
                this.deleteOldEdge(ed_key);
            }
        }
    }

    // reassignTempEdges(){
    //     // if there are temp edges, re-assign them
    //     for(let ed)
    // }




    mapEdges(edgeid){
        // update edgeMapper when change the edge curve
        let ed = this.edges[edgeid];
        let totalLength = d3.select("#"+edgeid).node().getTotalLength();
        let stepLength = totalLength/this.numSeg;
        let newPoints = [];
        let pt;
        for(let i=0;i<this.numSeg;i++){
            if(ed[3]==="max"){
                if(this.edgeMapper[edgeid][0]["direction"]==="in"){
                    pt = d3.select("#"+edgeid).node().getPointAtLength(i*stepLength);
                } else if(this.edgeMapper[edgeid][0]["direction"]==="out"){
                    pt = d3.select("#"+edgeid).node().getPointAtLength((this.numSeg-i)*stepLength);
                }
            } else if(ed[3]==="min"){
                if(this.edgeMapper[edgeid][0]["direction"]==="in"){
                    pt = d3.select("#"+edgeid).node().getPointAtLength((this.numSeg-i)*stepLength);
                }else if(this.edgeMapper[edgeid][0]["direction"]==="out"){
                    pt = d3.select("#"+edgeid).node().getPointAtLength(i*stepLength);
                }
            }
            // pt = d3.select("#"+edgeid).node().getPointAtLength(i*stepLength)
            // if((ed[0].x>ed[2].x)||(ed[0].y>ed[2].y)){
            // if(this.edgeMapper[edgeid][0]["direction"]==="out"){
            //     pt = d3.select("#"+edgeid).node().getPointAtLength((this.numSeg-i)*stepLength)
            // }
            newPoints.push({"x":this.xMap.invert(pt.x), "y":this.yMap.invert(pt.y)});
        }     
        // newPoints.sort(function(a,b){
        //     return d3.ascending(a.x,b.x) || d3.ascending(a.y,b.y);
        // })
        // // **** need to fix
        // if(edgeid==="edge1b010" || edgeid ==="edge1b110"){
        //     newPoints.sort(function(a,b){
        //         return d3.ascending(a.y,b.y) || d3.ascending(a.x,b.x);
        //     })
        // }
        for(let i=0;i<this.numSeg;i++){
            // let pt = this.findMinPt([this.edgeMapper[edgeid][i].x, this.edgeMapper[edgeid][i].y], newPoints);
            let pt = newPoints[i]
            this.edgeMapper[edgeid][i].x_new = pt.x;
            this.edgeMapper[edgeid][i].y_new = pt.y;
        }
        // this.edgeMapper[edgeid]
        // console.log(newPoints)
        

    }

    getAngle(x1, y1, x2, y2){
        // compute the angle between a straight line and the horizontal line
        let x = x2 - x1;
        let y = y2 - y1;
        let angle = Math.atan2(y,x)*180/Math.PI
        if(angle>=0){
            return angle;
        } else{
            return angle + 360;
        }
    }

    ifArcViolate(saddle){ // check the order of flow lines
        // console.log('ifArcViolate')
        let max_angles = [];
        let min_angles = [];
        for(let eid in saddle.edges){
            let ed = saddle.edges[eid];
            // consosle.log(ed)
            let edm = this.edgeMapper[eid]
            if(ed[3]==="max"){
                max_angles.push(this.getAngle(ed[1].x, ed[1].y, ed[0].x, ed[0].y));
            } else if(ed[3]==="min"){
                min_angles.push(this.getAngle(ed[1].x, ed[1].y, ed[0].x, ed[0].y));
            }
        }
        // console.log(max_angles)
        // console.log(min_angles)
        let min_angles_1 = Math.min(min_angles[0], min_angles[1]);
        let min_angles_2 = Math.max(min_angles[0], min_angles[1]);
        let max_angles_1 = Math.min(max_angles[0], max_angles[1]);
        let max_angles_2 = Math.max(max_angles[0], max_angles[1]);
        if(min_angles_1 > max_angles_1 && min_angles_1 < max_angles_2 && min_angles_2 > max_angles_2){
            return false;
        } else if(min_angles_2 > max_angles_1 && min_angles_2 < max_angles_2 && min_angles_1 < max_angles_1){
            return false;
        } else {
            return true;
        }
    }

    drawAnnotation(){
        // console.log("draw annotation")
        // console.log(this.cp)
        let edgelist = d3.entries(this.edges);
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
            .attr("id",(d)=>"cp"+d.id)
            .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", draggedText)
                    .on("end", dragendedText))
            .on("mouseover",(d)=>{
                d3.select("#cp"+d.id).attr("font-size","45px")
            })
            .on("mouseout",(d)=>{
                d3.select("#cp"+d.id).attr("font-size","35px")
            }); 
        
        let labels = this.heightsGroup.selectAll("text").data(this.cp);
        labels.exit().remove();
        let newlabels = labels.enter().append("text");
        labels = newlabels.merge(labels);
        labels
            .attr("x",(d)=>this.xMap(d.x)-20)
            .attr("y",(d)=>this.yMap(d.y)-20)
            .text((d,i)=>i+1)
            .attr("class",(d)=>"label "+d.type)
            .style("font-weight","bold")

        let that=this;

        function dragstarted(d) {
            d3.select(this).raise().classed("active", true);
        }
              
        function draggedText(d,i) {
            if(that.xMap.invert(d3.mouse(this)[0])>=0 && that.xMap.invert(d3.mouse(this)[0])<=1 && that.yMap.invert(d3.mouse(this)[1])>=0 && that.yMap.invert(d3.mouse(this)[1])<=1){
                d3.select("#cp"+d.id)
                    .attr("x",(d)=>{
                        d.x = that.xMap.invert(d3.mouse(this)[0])
                        return that.xMap(d.x)})
                    .attr("y",(d)=>{
                        d.y = that.yMap.invert(d3.mouse(this)[1])
                        return that.yMap(d.y)});
                for(let eid in d.edges){
                    that.mapEdges(eid);
                }
                that.addedges();
                that.drawAnnotation();

            }
            this.dragTerminal = true;
            
        }

        function dragendedText(d) {
            if(this.dragTerminal){
                d3.select(this).classed("active", false);
                // check edge intersection
                let ifInter = false;
                for(let eid1 in that.edges){
                    for(let eid2 in that.edges){
                        if(eid1 != eid2){
                            if(that.ifCurvesIntersect(that.edgeMapper[eid1], that.edgeMapper[eid2])){
                                d3.select("#"+eid1)
                                    .style("stroke", "red")
                                d3.select("#"+eid2)
                                    .style("stroke", "red")
                                ifInter = true;
                            }
                        }
                    }
                }
                // check the line order
                that.cp.forEach(p=>{
                    if(p.type === "saddle"){
                        if(that.ifArcViolate(p)){
                            ifInter = true;
                        }
                    }
                })

                if(!ifInter){
                    that.drawAnnotation();
                    that.addedges();
                    if(d3.select("#ifskeleton").node().value === "Only Display Skeleton"){
                        that.assignEdge();
                        that.constructMesh(that.sigma);
                        that.drawFlag = true;
                    }
                    that.addStep();
                    that.drawStep();
                } else {
                    that.drawFlag = false;
                }
                this.dragTerminal = false;
            }
            
            
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
        
        // let nodes = this.connNodesGroup.selectAll("circle").data(this.connNodes);
        let nodes = this.connNodesGroup.selectAll("circle").data(edgelist);
        nodes.exit().remove();
        let newnodes = nodes.enter().append("circle");
        nodes = newnodes.merge(nodes);
        nodes
            .attr("cx",(d)=>{
                return this.xMap(d.value[1].x);
            })
            .attr("cy",(d)=>{
                return this.yMap(d.value[1].y);
            })
            .attr("class","connNode")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", draggedNode)
                .on("end", dragendedNode))
            .on("mouseover",mouseover)
            .on("mouseout",mouseout);

        function mouseover(d) {
            d3.select(this).classed("mouseover", true);
        }
        
        function mouseout(d){
            d3.select(this).classed("mouseover", false);
        }

        function draggedNode(d,i){
            if(that.xMap.invert(d3.mouse(this)[0])>=0 && that.xMap.invert(d3.mouse(this)[0])<=1 && that.yMap.invert(d3.mouse(this)[1])>=0 && that.yMap.invert(d3.mouse(this)[1])<=1){
                that.mapEdges(d.key);
                d3.select(this).attr("cx", d.value[1].x = that.xMap.invert(d3.mouse(this)[0])).attr("cy", d.value[1].y = that.yMap.invert(d3.mouse(this)[1]));
                that.drawAnnotation();
                that.addedges();
            } 
        }

        function dragendedNode(d) {
            let ifInter = false;
            for(let eid in that.edges){
                if(eid!=d.key && ["temp1","temp2","temp3","temp4"].indexOf(eid)===-1){
                    if(that.ifCurvesIntersect(that.edgeMapper[eid], that.edgeMapper[d.key])){
                        d3.select("#"+eid)
                            .style("stroke", "red")
                        d3.select("#"+d.key)
                            .style("stroke", "red")
                        ifInter = true;
                    }
                }
            }
            // check the line order
            that.cp.forEach(p=>{
                if(p.type === "saddle"){
                    if(that.ifArcViolate(p)){
                        ifInter = true;
                        Object.keys(p.edges).forEach(eid=>{
                            d3.select("#"+eid)
                                .style("stroke", "red")
                        })
                    }
                }
            })
            if(!ifInter){
                d3.select(this).classed("active", false);
                if(d3.select("#ifskeleton").node().value === "Only Display Skeleton"){
                    that.assignEdge();
                    that.constructMesh(that.sigma);
                    that.drawFlag = true;
                }
                that.addStep();
                that.drawStep();
                that.addedges();
                that.drawAnnotation();
            } else {
                that.drawFlag = false;
            }
        }

        let terminalNodes = this.terminalNodesGroup.selectAll("circle").data(edgelist)
        terminalNodes.exit().remove();
        let newTerminalNodes = terminalNodes.enter().append("circle");
        terminalNodes = newTerminalNodes.merge(terminalNodes);
        terminalNodes
            .attr("cx",(d)=>{
                if(d.value[2].y===0 || d.value[2].y===1 || d.value[0].x===d.value[2].x){
                    return this.xMap(d.value[2].x);
                } else if(d.value[2].x===0){
                    return this.xMap(d.value[2].x+0.005);
                } else if(d.value[2].x===1){
                    return this.xMap(d.value[2].x-0.005);
                } else {
                    return this.xMap(d.value[2].x + (d.value[0].x-d.value[2].x)/Math.abs(d.value[0].x-d.value[2].x)*0.015);
                }
            })
            .attr("cy",(d)=>{
                if(d.value[2].x===0 || d.value[2].x===1 || d.value[0].y===d.value[2].y){
                    return this.yMap(d.value[2].y);
                } else if(d.value[2].y===0){
                    return this.yMap(d.value[2].y+0.005);

                } else if(d.value[2].y===1){
                    return this.yMap(d.value[2].y-0.005);
                } else {
                    return this.yMap(d.value[2].y + (d.value[0].y-d.value[2].y)/Math.abs(d.value[0].y-d.value[2].y)*0.015)
                }
            })
            .attr("id",(d,i)=>"terminal"+i)
            .attr("r",5)
            .attr("fill","grey")
            .attr("stroke","black")
            .on("mouseover",(d,i)=>{
                d3.select("#terminal"+i)
                    .attr("r",10)
            })
            .on("mouseout",(d,i)=>{
                d3.select("#terminal"+i)
                    .attr("r",5)
            })
            .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", draggedTerminal)
                    .on("end", dragendedTerminal));

        function draggedTerminal(d,i){
            d3.select("#terminal"+i)
                .attr("cx",d3.mouse(this)[0])
                .attr("cy",d3.mouse(this)[1])
            let edgeid = d.key;
            d3.select("#"+edgeid)
                .attr("d",(d)=>that.curve0([d.value[0],d.value[1],{"x":that.xMap.invert(d3.mouse(this)[0]),"y":that.yMap.invert(d3.mouse(this)[1])}]))
        }

        function dragendedTerminal(d,i) {
            let ifinter=false;
            let ifinter1 = false;
            d3.select(this).classed("active", false);
            if(that.cp.length!=that.cp[that.cp.length-1].id+1){
                for(let k=0; k<that.cp.length; k++){
                    that.cp[k].id = k;
                }
                // rename edge key
                for(let eid in that.edges){
                    let ed = that.edges[eid];
                    console.log(eid)
                    if(["temp1","temp2","temp3","temp4"].indexOf(eid)===-1){
                        that.deleteOldEdge(eid);
                        that.addNewEdge(ed[0],ed[2],ed[3]);
                    }
                }
            }

            // that.cp.forEach(p=>{console.log(p.id)});
            // Object.keys(that.edges).forEach(k=>{
            //     console.log(k)
            // })
            if(d.value[3]==="max"){
                let cpm = that.findMinPt({"x":that.xMap.invert(d3.mouse(this)[0]),"y":that.yMap.invert(d3.mouse(this)[1])},that.cp_max);
                if(that.calDist({"x":that.xMap.invert(d3.mouse(this)[0]),"y":that.yMap.invert(d3.mouse(this)[1])},cpm)<0.03){
                    // check intersection
                    // ifinter: if this edge does not intersect with other edges, draw this edge
                    for(let k in that.edges){
                        if(k!=d.key && ["temp1","temp2","temp3","temp4"].indexOf(k)===-1){
                            let curve1 = that.edgeMapper[k];
                            let curve2 = that.initializeEdgeMapper([d.value[0],{"x":(d.value[0].x+cpm.x)/2, "y":(d.value[0].y+cpm.y)/2},cpm,"max"]);
                            if(that.ifCurvesIntersect(curve1,curve2)){
                                ifinter=true;
                            }
                        }
                    }
                    
                    
                    //ifinter1: if there are no any other edges intersect, allow this configuration
                    for(let eid1 in that.edges){
                        for(let eid2 in that.edges){
                            if(eid1 != eid2 && ["temp1","temp2","temp3","temp4"].indexOf(eid1)===-1 && ["temp1","temp2","temp3","temp4"].indexOf(eid2)===-1){
                                if(that.ifCurvesIntersect(that.edgeMapper[eid1], that.edgeMapper[eid2])){
                                    d3.select("#"+eid1)
                                        .style("stroke", "red")
                                    d3.select("#"+eid2)
                                        .style("stroke", "red")
                                    ifinter1 = true;
                                }
                            }
                        }
                    }
                    
                    if(!ifinter){
                        that.deleteOldEdge(d.key);
                        that.addNewEdge(d.value[0],cpm,"max");
                        d3.select("#terminal"+i)
                            .attr("cx",that.xMap(cpm.x))
                            .attr("cy",that.yMap(cpm.y));
                        that.drawAnnotation();
                        that.addedges();

                    }

                    let iftemp = false;
                    for(let k in that.edges){
                        if(["temp1","temp2","temp3","temp4"].indexOf(k)!=-1){
                            iftemp = true;
                        }
                    }
                    if(!iftemp){
                        that.cp.forEach(p=>{
                            if(p.type === "saddle"){
                                if(that.ifArcViolate(p)){
                                    ifinter1 = true;
                                }
                            }
                        })

                    }

                    console.log('iftemp',iftemp)
                    console.log('ifinter1', ifinter1)
                    
                    if(!iftemp && !ifinter1){
                        if(d3.select("#ifskeleton").node().value === "Only Display Skeleton"){
                            that.assignEdge();
                            that.constructMesh(that.sigma);
                            that.drawFlag=true;
                        }
                        that.addStep();
                        that.drawStep();
                    }
                    

                
                }
            } else if (d.value[3]==="min"){
                let cpm = that.findMinPt({"x":that.xMap.invert(d3.mouse(this)[0]),"y":that.yMap.invert(d3.mouse(this)[1])},that.cp_min);
                if(that.calDist({"x":that.xMap.invert(d3.mouse(this)[0]),"y":that.yMap.invert(d3.mouse(this)[1])},cpm)<0.03){
                    // check intersection
                    // ifinter: if this edge does not intersect with other edges, draw this edge
                    for(let k in that.edges){
                        if(k!=d.key && ["temp1","temp2","temp3","temp4"].indexOf(k)===-1){
                            let curve1 = that.edgeMapper[k];
                            let curve2 = that.initializeEdgeMapper([d.value[0],{"x":(d.value[0].x+cpm.x)/2, "y":(d.value[0].y+cpm.y)/2},cpm,"min"]);
                            if(that.ifCurvesIntersect(curve1,curve2)){
                                ifinter=true;
                            }
                        }
                    }
                    // that.cp.forEach(p=>{
                    //     if(p.type === "saddle"){
                    //         if(that.ifArcViolate(p)){
                    //             ifinter = true;
                    //         }
                    //     }
                    // })
                    
                    
                    //ifinter1: if there are no any other edges intersect, allow this configuration
                    for(let eid1 in that.edges){
                        for(let eid2 in that.edges){
                            if(eid1 != eid2 && ["temp1","temp2","temp3","temp4"].indexOf(eid1)===-1 && ["temp1","temp2","temp3","temp4"].indexOf(eid2)===-1){
                                if(that.ifCurvesIntersect(that.edgeMapper[eid1], that.edgeMapper[eid2])){
                                    d3.select("#"+eid1)
                                        .style("stroke", "red")
                                    d3.select("#"+eid2)
                                        .style("stroke", "red")
                                    ifinter1 = true;
                                }
                            }
                        }
                    }
                    
                    if(!ifinter){
                        that.deleteOldEdge(d.key);
                        that.addNewEdge(d.value[0],cpm,"min");
                        d3.select("#terminal"+i)
                            .attr("cx",that.xMap(cpm.x))
                            .attr("cy",that.yMap(cpm.y))
                        that.drawAnnotation();
                        that.addedges();
                    }

                    let iftemp = false;
                    for(let k in that.edges){
                        if(["temp1","temp2","temp3","temp4"].indexOf(k)!=-1){
                            iftemp = true;
                        }
                    }

                    console.log('iftemp',iftemp)
                    console.log('ifinter1', ifinter1) 


                    if(!iftemp){
                        that.cp.forEach(p=>{
                            if(p.type === "saddle"){
                                if(that.ifArcViolate(p)){
                                    ifinter1 = true;
                                }
                            }
                        })

                    }

                    console.log('iftemp',iftemp)
                    console.log('ifinter1', ifinter1)

                    if(!iftemp && !ifinter1){
                        if(d3.select("#ifskeleton").node().value === "Only Display Skeleton"){
                            that.assignEdge();
                            that.constructMesh(that.sigma);
                            that.drawFlag=true;
                        }
                        that.addStep();
                        that.drawStep();
                    }
                    
                }
            }
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
        if(edge[2].type==="max"){
            if((edge[2].x>edge[0].x)||(edge[2].y>edge[0].y)){
                
                em[0]["direction"] = "in";
                em[this.numSeg-1]["direction"] = "out";
            } else {
                xRange = ed[0].x-ed[2].x;
                yRange = ed[0].y-ed[2].y;

                em[0]["direction"] = "out";
                em[this.numSeg-1]["direction"] = "in";
            }
        } else { // min
            if((edge[2].x>edge[0].x)||(edge[2].y>edge[0].y)){
                em[0]["direction"] = "out";
                em[this.numSeg-1]["direction"] = "in";
            } else {
                em[0]["direction"] = "in";
                em[this.numSeg-1]["direction"] = "out";
            }
        }
        return em;
    }

    

    ifLinesIntersect(line1,line2){
        // for example, line1 = [pt1,pt2]; pt1 = {x:0,y:0};
        let pt1 = line1[0];
        let pt2 = line1[1];
        let pt3 = line2[0];
        let pt4 = line2[1];
        let x;
        let y;
        // if they share the same endpoint, they do not intersect
        if((pt1.x===pt3.x && pt1.y===pt3.y)||(pt1.x===pt4.x && pt1.y===pt4.y)||(pt2.x===pt3.x && pt2.y===pt3.y)||(pt2.x===pt4.x && pt2.y===pt4.y)){
            return false;
        }
        if(pt1.x===pt2.x&&pt3.x===pt4.x){ // if two lines are both vertical
            if(pt1.x===pt3.x){
                if((pt3.y<=Math.max(pt1.y,pt2.y) && pt3.y>=Math.min(pt1.y,pt2.y))||(pt4.y<=Math.max(pt1.y,pt2.y) && pt4.y>=Math.min(pt1.y,pt2.y))){
                    return true;
                } else{
                    return false;
                }
            } else {
                return false;
            }
        } else if(pt1.x===pt2.x){ // if line1 is vertical
            let a2 = (pt3.y-pt4.y)/(pt3.x-pt4.x);
            let b2 = (pt3.x*pt4.y-pt4.x*pt3.y)/(pt3.x-pt4.x);
            x = pt1.x;
            y = a2*x+b2;
        } else if(pt3.x===pt4.x){ // if line2 is vertical
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
        if((Math.min(pt1.x,pt2.x)<=x && x<=Math.max(pt1.x,pt2.x))&&(Math.min(pt1.y,pt2.y)<=y && y<=Math.max(pt1.y,pt2.y))&&(Math.min(pt3.x,pt4.x)<=x && x<=Math.max(pt3.x,pt4.x))&&(Math.min(pt3.y,pt4.y)<=y && y<=Math.max(pt3.y,pt4.y))){
            return true;
        } else { return false;}
    
    }

    ifCurvesIntersect(curve1, curve2){
        // console.log("checking")
        for(let i=1; i<curve1.length; i++){
            for(let j=1; j<curve2.length; j++){
                let line1 = [{"x":curve1[i-1].x_new,"y":curve1[i-1].y_new}, {"x":curve1[i].x_new,"y":curve1[i].y_new}];
                let line2 = [{"x":curve2[j-1].x_new,"y":curve2[j-1].y_new}, {"x":curve2[j].x_new,"y":curve2[j].y_new}];
                if(this.ifLinesIntersect(line1,line2)){
                    return true;
                }
            }
        }
        return false;
    }

    addedges(){
        let edgelist = d3.entries(this.edges);
        let edges = this.edgeGroup.selectAll("path").data(edgelist);
        edges.exit().remove();
        let newedges = edges.enter().append("path");
        edges = newedges.merge(edges);
        edges
            .attr("d",(d)=>{
                let d_new = d.value.slice(0,3);
                return this.curve0(d_new);
            })
            .attr("class",(d)=>d.value[3]+"edge") // minedge/maxedge
            .attr("id",(d)=>d.key)
            .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-width",2)
            .style("stroke-dasharray",(d)=>{
                if(d.value[3]==="max"){
                    return "5,5";
                } else {return "";}
            })
            .style("opacity",0.8)
            .on("mouseover",(d,i)=>{
                d3.select("#"+d.key)
                    .style("stroke-width",5)
            })
            .on("mouseout",(d,i)=>{
                d3.select("#"+d.key)
                    .style("stroke-width",2)
            })
    }

    initializeMesh(){
        let grad_new = [];
        for(let x=0;x<=1;x+=this.step){
            for(let y=0;y<=1;y+=this.step){
                grad_new.push({"x":x,"y":y});
            }
        }
        return grad_new
    }

    assignEdge(){
        if(Object.keys(this.edges).length>0){
            let edgepoints = [];
            for(let key in this.edgeMapper){
                let ed = this.edgeMapper[key];
                for(let i=1;i<ed.length-1;i++){
                    edgepoints.push({"x":ed[i].x_new,"y":ed[i].y_new,"edgeid":key,"inedgeid":i});
                }
            }

            // for(let i=0; i<this.minBound.length; i++){
            //     edgepoints.push({"x":this.minBound[i].x, "y":this.minBound[i].y, "edgeid":"minBound", "inedgeid":this.minBound[i].id})
            // }
            
            // this.minBound.forEach(p=>{
            //     edgepoints.push({"x":p.x,"y":p.y,"edgeid":p.id})
            // })
            for(let x=0;x<=1;x+=this.step){
                for(let y=0;y<=1;y+=this.step){
                    let gradid = Math.round(x/this.step*100+y/this.step);
                    let edpoint = this.findMinPt({"x":x,"y":y},edgepoints);
                    this.grad[gradid]["ed"] = edpoint;
                }
            }
        } else {
            for(let x=0;x<=1;x+=this.step){
                for(let y=0;y<=1;y+=this.step){
                    let gradid = Math.round(x/this.step*100+y/this.step);
                    this.grad[gradid]["ed"] = undefined;
                }
            }
        }
    }

    constructMesh(sigma){
        // initialize the triangulation
        for(let x=0;x<=1;x+=this.step){
            for(let y=0;y<=1;y+=this.step){
                let cpt;
                let gradid = Math.round(x/this.step*100+y/this.step);
                if(this.grad[gradid].ed!=undefined){
                    if (this.edges[this.grad[gradid].ed.edgeid][0].type === 'saddle'){
                        cpt = this.edges[this.grad[gradid].ed.edgeid][2]
                    } else{
                        cpt = this.edges[this.grad[gradid].ed.edgeid][0]
                    }
                    if (cpt.ifBound){
                        let ed = this.edges[this.grad[gradid].ed.edgeid];
                        let cpCandi = [];
                        this.cp_max.forEach(p=>{
                            if(this.ifLinesIntersect([{"x":x,"y":y}, p],[ed[0],ed[2]])===false){
                                cpCandi.push(p);
                            }
                        })
                        cpt = this.findMinPt({"x":x, "y":y}, cpCandi)
                    }

                } else {
                    cpt = this.findMinPt({"x":x,"y":y},this.cp_max);
                }
                let dx1;
                let dy1;
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
                dx1 = idx[0]*(1/sigma) * x_new * Math.exp(-(Math.pow(x_new,2)+Math.pow(y_new,2))/sigma);
                dy1 = idx[1]*(1/sigma) * y_new * (Math.exp(-(Math.pow(x_new,2)+Math.pow(y_new,2))/sigma));
                
                // if(cpt.type==="saddle"){
                //     // flow rotation
                //     let pts = this.find2MinPt(cpt,cp_max);
                //     let theta = Math.atan2(pts[1].y-pts[0].y,pts[1].x-pts[0].x)*2;
                //     let dx_new = Math.cos(theta)*dx1-Math.sin(theta)*dy1;
                //     let dy_new = Math.sin(theta)*dx1+Math.cos(theta)*dy1;
                //     dx1 = dx_new;
                //     dy1 = dy_new;
                // }
                let pt_new = [x,y];
                let dx=dx1;
                let dy=dy1;
                if(this.grad[gradid].ed!=undefined && this.grad[gradid].ed.edgeid!="minBound"){
                    let dx2 = 0;
                    let dy2 = 0;
                    let edgedist;
                    let edp = this.edgeMapper[this.grad[gradid].ed.edgeid];
                    edgedist = this.calDist({"x":x,"y":y},this.grad[gradid].ed)
                    if(edgedist<0.1){
                        if(edp[0].direction==="in"){
                            if(this.grad[gradid].ed.inedgeid>0){
                                let idx = this.grad[gradid].ed.inedgeid;
                                dx2 = (edp[idx-1].x_new - edp[idx].x_new)*10;
                                dy2 = (edp[idx-1].y_new - edp[idx].y_new)*10;
                            } else{
                                dx2 = (edp[0].x_new - edp[1].x_new)*10;
                                dy2 = (edp[0].y_new - edp[1].y_new)*10;
                            }
                        } else if(edp[0].direction==="out"){
                            if(this.grad[gradid].ed.inedgeid>0){
                                let idx = this.grad[gradid].ed.inedgeid;
                                dx2 = (edp[idx].x_new - edp[idx-1].x_new)*10;
                                dy2 = (edp[idx].y_new - edp[idx-1].y_new)*10;
                            } else{
                                dx2 = (edp[1].x_new - edp[0].x_new)*10;
                                dy2 = (edp[1].y_new - edp[0].y_new)*10;
                            }
                        }
                    }
                    if(this.calDist({"x":x,"y":y},cpt)<0.1 && cpt.type!="saddle"){
                        dx = dx1;
                        dy = dy1;
                    } else {
                        dx = (edgedist*3*dx1 + (1-edgedist*3)*dx2)*1.5;
                        dy = (edgedist*3*dy1 + (1-edgedist*3)*dy2)*1.5;
                    }
                    
                    

                }
                let fv_cp = this.findMinPt({"x":x,"y":y},this.cp)
                let fv = this.calFV(x,y,fv_cp);

                this.grad[gradid]["dx"] = dx;
                this.grad[gradid]["dy"] = dy;
                this.grad[gradid]["x_new"] = pt_new[0];
                this.grad[gradid]["y_new"] = pt_new[1];
                this.grad[gradid]["fv"] = fv;
            }
        }
        this.grad.sort(function(a,b){
            return d3.ascending(a.x,b.x) || d3.ascending(a.y,b.y);
        })
    }

    calFV(x,y,cp){
        let w = 1;
        let sigma = 0.1;
        let x_new = x-cp.x;
        let y_new = y-cp.y;
        if(cp.type === "max"){
            // return w*Math.exp(-(Math.pow(x_new,2)+Math.pow(y_new,2))/sigma);
            return -Math.pow(x_new,2) - Math.pow(y_new,2)+cp.fv;
        } else if(cp.type === "saddle"){
            // if(x_new<0){
            //     x_new = x - 0.25
            // } else{ x_new = x-0.75}
            // return w*Math.exp(-(Math.pow(x_new,2)+Math.pow(y_new,2))/sigma);
            return Math.pow(x_new,2) - Math.pow(y_new,2)+cp.fv;
        } else if(cp.type === "min"){
            return Math.pow(x_new,2) + Math.pow(y_new,2)+cp.fv;
        }
        // return w*Math.exp(-(Math.pow(x,2)+Math.pow(y,2))/sigma)
    }

    animation(){            
        let N = 50;
        let dt = 0.001;
        let X0 = [], Y0 = []; // to store initial starting locations
        let X  = [], Y  = []; // to store current point for each curve

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
        let frameRate = 500; // ms per timestep (yeah I know it's not really a rate)
        let M = X.length;
        let MaxAge = 200; // # timesteps before restart
        var age = [];
        for (var i=0; i<M; i++) {
            age.push(randage());
        }

        // let drawFlag = this.drawFlag
        setInterval(function () {if (that.drawFlag) {draw();}}, frameRate);
        d3.timer(function () {if (that.drawFlag) {draw();}}, frameRate);
        // d3.select("#annotation")
        //     .on("click", function() {that.drawFlag = (that.drawFlag) ? false : true;});
            
        g.globalCompositeOperation = "source-over";
        
        function draw() {
            let width = document.getElementById('animation').offsetWidth;
            let height = document.getElementById('animation').offsetHeight;
            g.fillStyle = "rgba(255,255, 255, 0.05)";
            g.fillRect(0, 0, width, height); // fades all existing curves by a set amount determined by fillStyle (above), which sets opacity using rgba   

            
            for (let i=0; i<M; i++) { // draw a single timestep for every curve
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

    findV(x,y, grad){
        // Find the vector value for the point
        let x1Idx = Math.min(Math.max(Math.floor(x/this.step),0),1/this.step-1);
        let x2Idx = Math.min(x1Idx+1,1/this.step-1);
        let y1Idx = Math.min(Math.max(Math.floor(y/this.step),0),1/this.step-1);
        let y2Idx = Math.min(y1Idx+1,1/this.step-1);

        let triang = [grad[x1Idx/this.step+y1Idx], grad[x2Idx/this.step+y1Idx], grad[x2Idx/this.step+y2Idx]];

        let ex_v = [0,0]
        for(let i=0;i<3;i++){
            if(typeof triang[i]!="undefined"){
                ex_v[0] += 1/3*triang[i].dx
                ex_v[1] += 1/3*triang[i].dy
            }
        }

        let x_new = ((triang[1].x-x)*triang[0].x_new+(x-triang[0].x)*triang[1].x_new)/(triang[1].x-triang[0].x);
        let y_new = ((triang[2].y-y)*triang[1].y_new+(y-triang[1].y)*triang[2].y_new)/(triang[2].y-triang[1].y);
        let pt_new = [x_new,y_new]
        let fv = (triang[0].fv + triang[1].fv + triang[2].fv)/3
        return [ex_v,pt_new,fv];
        // return ex_v;
    }

    // **************** This is only for "semi-auto" mode ****************

    findEdges(){
        // automatically find edges, only for "expert mode"
        for(let i=0;i<this.cp.length;i++){
            if(this.cp[i].type==="saddle"){
                let saddle = this.cp[i];
                for(let ed_key in saddle.edges){
                    this.deleteOldEdge(ed_key);
                }
                if(this.cp_max.length>0){
                    let pts = [];
                    let cp_new_max = this.cp_max.slice(0);
                    if(cp_new_max.length>2){
                        // find the closest max points
                        pts = this.find2MinPt(saddle,this.cp_max);
                    } else { pts = cp_new_max; }
                    for(let j=0;j<pts.length;j++){
                        this.addNewEdge(saddle,pts[j],"max");
                    }
                }
                let cp_new_min = [];
                this.cp.forEach(p=>{
                    if(p.type==="min"){
                        cp_new_min.push(p);
                    }
                })
                let bound_upper = [];
                let bound_lower = [];
                this.cp_min.forEach(p=>{
                    if(p.y===0){
                        bound_upper.push(p);
                    } else if(p.y===1){
                        bound_lower.push(p);
                    }
                })
                let pts = [];
                let pt_lower = this.findMinPt(saddle,bound_lower);
                let pt_upper = this.findMinPt(saddle,bound_upper);
                if(cp_new_min.length>=2){
                //     // find the closest min points
                    pts = this.find2MinPt(saddle,cp_new_min);
                } else if(cp_new_min.length===1){
                    pts.push(cp_new_min[0])
                    pts.push(this.findMinPt(saddle,[pt_lower,pt_upper]));
                    // if(cp_new_min[0].y>=saddle.y){
                    //     pts.push(this.findMinPt(saddle,bound_lower));
                    // } else { pts.push(this.findMinPt(saddle,bound_upper));}
                } else if(cp_new_min.length===0){
                    pts.push(pt_lower);
                    pts.push(pt_upper);

                }
                for(let j=0;j<pts.length;j++){
                    this.addNewEdge(saddle,pts[j],"min");               
                }

                
            }
        }
        
        
    }

    // **************** Draw "undo" sketch ****************

    addStep(){
        // modiType: cp, connNode, terminalNode, move, simplification
        // add step for legend
        let cp = [];
        this.cp.forEach(p=>{
            let new_p = new criticalPoint(p.id, p.x, p.y, p.type);
            new_p.fv = p.fv;
            new_p.fv_perb = p.fv_perb;
            new_p.lvalue = p.lvalue;
            new_p.uvalue = p.uvalue;
            cp.push(new_p);
        })
        let edges = {};
        let edgeMapper = {};
        for(let eid in this.edges){
            let startpoint = cp[this.edges[eid][0].id];
            let endpoint;
            let type;
            if(cp[this.edges[eid][2].id]!=undefined){
                endpoint = cp[this.edges[eid][2].id];
                type = endpoint.type;
            } else {
                endpoint = this.minBound_dict[this.edges[eid][2].id];
                type = "min";
            }
            let midpoint = {"x":this.edges[eid][1].x, "y":this.edges[eid][1].y};
            this.addNewEdge(startpoint, endpoint, type, cp, edges, edgeMapper, midpoint);
            
        }
        let step = new editStep(cp, edges);
        this.stepRecorder.push(step);
    }

    drawStep(){
        // draw legend
        console.log(this.stepRecorder)
        for(let j=1;j<=3;j++){
            let idx = this.stepRecorder.length-j;
            if(this.stepRecorder[idx]!=undefined){
                d3.select("#record"+j)
                    .style("visibility","visible");
                d3.select("#record"+j).select("rect")
                    .attr("stroke","rgb(44,123,246)")
                let step = this.stepRecorder[idx]
                let edgelist = d3.entries(step.edges);
                let edges = d3.select("#record"+j).selectAll("path").data(edgelist);
                edges.exit().remove();
                let newedges = edges.enter().append("path");
                edges = newedges.merge(edges);
                edges
                    .attr("d",(d)=>{
                        let d_new = d.value.slice(0,3);
                        return this.step_curveMap(d_new);
                    })
                    .attr("class",(d)=>d.value[3]+"edge") // minedge/maxedge
                    // .attr("transform","translate("+(this.margin.left+(j-1)*this.step_frameWidth + (j-1)*this.margin.betweenstep)+","+this.margin.top+")")
                    .attr("transform","translate("+this.margin.left+","+(this.margin.top+(j-1)*this.step_frameHeight + (j-1)*this.margin.betweenstep)+")")
                    .style("fill", "none")
                    .style("stroke", "black")
                    .style("stroke-width",2)
                    .style("stroke-dasharray",(d)=>{
                        if(d.value[3]==="max"){
                            return "5,5";
                        } else {return "";}
                    })

                let circles = d3.select("#record"+j).selectAll("circle").data(step.cp);
                circles.exit().remove();
                let newcircles = circles.enter().append("circle");
                circles = newcircles.merge(circles);
                circles
                    .attr("cx",(d)=>this.step_xMap(d.x)+this.margin.left)
                    .attr("cy",(d)=>this.step_yMap(d.y)+this.margin.top+(j-1)*this.step_frameHeight + (j-1)*this.margin.betweenstep)
                    .attr("r",15)
                    .attr("fill","white");
            
                let circletext = d3.select("#record"+j).selectAll("text").data(step.cp);
                circletext.exit().remove();
                let newcircletext = circletext.enter().append("text");
                circletext = newcircletext.merge(circletext);
                circletext
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'central')
                    .attr('font-size', '35px')
                    .attr("x",(d)=>this.step_xMap(d.x)+this.margin.left)
                    .attr("y",(d)=>this.step_yMap(d.y)+this.margin.top+(j-1)*this.step_frameHeight + (j-1)*this.margin.betweenstep)
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
            }else{
                d3.select("#record"+j)
                    .style("visibility","hidden");
                
            }

        }
    }

    // **************** The following are well-written functions ****************

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

    find2MinPt(pt,pts){
        let pt1 = this.findMinPt(pt,pts);
        let idx1 = pts.indexOf(pt1);
        let pts1 = pts.slice(0,idx1);
        let pts2 = pts.slice(idx1+1);
        let pts_new = pts1.concat(pts2);
        let pt2 = this.findMinPt(pt,pts_new);
        return [pt1,pt2];
    }

    clearCanvas(){
        // clear both canvas and svg
        this.drawFlag = false;
        $('#animation').remove();
        $('#annotation').remove();
        $('#slidersSVG').remove();
        $('#phSVG').remove();
        $('#undoSVG').remove();
        $('#container').append('<canvas id="animation" style="position: absolute; top:160px; left:90px; z-index:1" width="1000" height="1000" ></canvas>');
        $('#container').append('<svg id="annotation" style="position: absolute; top:160px; left:90px; z-index:1" width="1000" height="1000"></svg>');
    }  
}