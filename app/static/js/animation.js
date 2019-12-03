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
            return 10;
        } else if(type === "saddle"){
            // if(x_new<0){
            //     x_new = x - 0.25
            // } else{ x_new = x-0.75}
            // return w*Math.exp(-(Math.pow(x_new,2)+Math.pow(y_new,2))/sigma);
            return 5;
        } else if(type === "min"){
            return 0;
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
        this.svgWidth = 570;
        this.svgHeight = 570;
        this.rcpdGroup = this.svg.append("g")
            .attr("id","rcpdgroup");
        this.edgeGroup = this.svg.append("g")
            .attr("id","edgegroup");
        this.pointsGroup = this.svg.append("g")
            .attr("id","pointgroup");
        this.labelsGroup = this.svg.append("g")
            .attr("id","labelsgroup");
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
        this.margin = {"top":10,"bottom":10,"left":15,"right":10,"betweenstep":20};
        this.step_svgWidth = 180;
        this.step_svgHeight = 300;
        this.step_frameWidth = 160;
        this.step_frameHeight = 160;
        this.step_svg = d3.select("#stepSVG")
            .attr("width", this.step_svgWidth)
            .attr("height", this.step_svgHeight);
        
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
        
        this.drawFlag = false;
        this.step = 0.025;
        // this.step = 0.05;
        this.numSeg = 20;
        this.sigma = 0.1;
        if(cp===undefined){
            this.cp = [];
            this.cp.push(new criticalPoint(0,0.25,0.5,"max"));
            this.cp.push(new criticalPoint(1,0.5,0.5,"saddle"));
            this.cp.push(new criticalPoint(2,0.75,0.5,"max"));
        } else {
            this.cp = cp;
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
        this.cp_min = this.cp_min.concat(this.minBound);

        console.log("cp_max", this.cp_max)
        console.log("cp_min", this.cp_min)
        console.log("cp_saddle", this.cp_saddle)


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
        let N = Math.round(1/this.step);
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
            .range([0, this.svgWidth]);
        this.yMap = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.svgHeight]);
        this.xMapReverse = d3.scaleLinear()
            .domain([0, this.svgWidth])
            .range([0, 1]);
        this.yMapReverse = d3.scaleLinear()
            .domain([0, this.svgHeight])
            .range([0, 1]);
        this.curve0 = d3.line()
            .x(d=>this.xMap(d.x))
            .y(d=>this.yMap(d.y))
            .curve(d3.curveCardinal.tension(0));

        this.dragTerminal = false;
        this.edgeInterArray = [];
        this.grad = this.initializeMesh();

        this.assignEdge();
        this.constructMesh(this.sigma);
        this.animation();
        this.findRange();
        this.drawAnnotation();
        this.drawStep();

        

        // console.log(this.ifArcViolate(this.cp[1])) // false
        console.log("grad",this.grad)
        console.log('cp', this.cp)

    }

    ifConfigAllowed(){
        let ifAllowed = !(this.ifTempEdge() || this.checkIntersection()) // no temp edges and no intersections
        if(!ifAllowed){
            alert("Please modify current configuration first!")
        }
        return ifAllowed;
    }

    drawRcpd(cp_detection){ // draw robust critical points detection
        console.log(cp_detection)
        let rcp = this.rcpdGroup.selectAll("circle").data(cp_detection);
        rcp.exit().remove();
        rcp = rcp.enter().append("circle").merge(rcp)
            .attr("id",(d,i)=>"rcp"+i)
            .attr("cx", d=>this.xMap(d.x))
            .attr("cy", d=>this.yMap(d.y))
            .attr("r",5)
            .attr("fill","red")
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
        // console.log("edgeid",edgeid)
        // add to this.edges
        if(Object.keys(that_edges).indexOf(edgeid)!=-1){
            // console.log(edgeid)
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
        this.cpReassignEdge();

        
        // add this edge to this.edgeMapper
        that_edgeMapper[edgeid] = this.initializeEdgeMapper(that_edges[edgeid]);
        if(edgeid!="edge"+startpoint.id+endpoint.id){
            this.addedges();
            this.mapEdges(edgeid);
            this.mapEdges("edge"+startpoint.id+endpoint.id);
        }
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
        console.log("cpmax",this.cp_max)
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
                this.deleteOldEdge(ed_key);
                this.addNewEdge(ed[0],ed[2],ed[3],this.cp,this.edges,this.edgeMapper,ed[1]);
            }
        }
    }

    mapEdges(edgeid){
        // update edgeMapper when change the edge curve
        let ed = this.edges[edgeid];
        let totalLength = d3.select("#"+edgeid).node().getTotalLength();
        let stepLength = totalLength/this.numSeg;
        let newPoints = [];
        let pt;
        for(let i=0;i<this.numSeg+1;i++){
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
        for(let i=0;i<this.numSeg+1;i++){
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
        this.addedges();
        let edgelist = d3.entries(this.edges);
        // draw frames (local minimum)
        this.frameGroup.selectAll("line")
            .data(this.frames)
            .enter().append("line")
            .attr("x1",(d)=>this.xMap(d[0]))
            .attr("y1",(d)=>this.yMap(d[1]))
            .attr("x2",(d)=>this.xMap(d[2]))
            .attr("y2",(d)=>this.yMap(d[3]))
            .attr("class","frame");
        // draw critical points
        let circles = this.pointsGroup.selectAll("circle").data(this.cp);
        circles.exit().remove();
        circles = circles.enter().append("circle").merge(circles)
            .attr("id",(d)=>"cpbackground"+d.id)
            .attr("cx",(d)=>this.xMap(d.x))
            .attr("cy",(d)=>this.yMap(d.y))
            .attr("r",12)
            .attr("fill","white")
        
        let circletext = this.pointsGroup.selectAll("text").data(this.cp);
        circletext.exit().remove();
        circletext = circletext.enter().append("text").merge(circletext)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', '30px')
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
                    .on("start", dragstartedText)
                    .on("drag", draggedText)
                    .on("end", dragendedText)) 
            .on("mouseover",mouseover)
            .on("mouseout",mouseout)
        
        let labels = this.labelsGroup.selectAll("text").data(this.cp);
        labels.exit().remove();
        labels = labels.enter().append("text").merge(labels)
            .attr("id",(d)=>"cplabel"+d.id)
            .attr("x",(d)=>this.xMap(d.x)-15)
            .attr("y",(d)=>this.yMap(d.y)-15)
            .text((d,i)=>i+1)
            .attr("class",(d)=>"label "+d.type)
        
        // draw midpoint nodes
        let nodes = this.connNodesGroup.selectAll("circle").data(edgelist);
        nodes.exit().remove();
        nodes = nodes.enter().append("circle").merge(nodes)
            .attr("id",(d)=>"conn_"+d.key)
            .attr("cx",(d)=>this.xMap(d.value[1].x))
            .attr("cy",(d)=>this.yMap(d.value[1].y))
            .attr("class","connNode")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", draggedConnNode)
                .on("end", dragendedConnNode))
            .on("mouseover",mouseover)
            .on("mouseout",mouseout);

        // draw terminal nodes
        let terminalNodes = this.terminalNodesGroup.selectAll("circle").data(edgelist)
        terminalNodes.exit().remove();
        terminalNodes = terminalNodes.enter().append("circle").merge(terminalNodes)
            .attr("id",(d,i)=>"terminal_"+d.key)
            .attr("cx",(d)=>this.terminalPosition(d.key)[0])
            .attr("cy",(d)=>this.terminalPosition(d.key)[1])
            .attr("class","terminalNode")
            .on("mouseover",mouseover)
            .on("mouseout",mouseout)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", draggedTerminal)
                .on("end", dragendedTerminal));

        let that=this;
  
        function dragstartedText(d){
            this.dragText = true;
        }

        function draggedText(d) {
            // just draw, do not actually change values
            if(that.ifInsideCanvas(d3.mouse(this))){
                d3.select(this)
                    .attr("x",d3.mouse(this)[0])
                    .attr("y",d3.mouse(this)[1]);
                d3.select("#cplabel"+d.id)
                    .attr("x",d3.mouse(this)[0]-15)
                    .attr("y",d3.mouse(this)[1]-15);
                d3.select("#cpbackground"+d.id)
                    .attr("cx",d3.mouse(this)[0])
                    .attr("cy",d3.mouse(this)[1]);
                for(let eid in d.edges){
                    let ed = d.edges[eid];
                    let ed_new;
                    if(d.type==="saddle"){
                        ed_new = [{"x":that.xMap.invert(d3.mouse(this)[0]),"y":that.yMap.invert(d3.mouse(this)[1])},ed[1],ed[2]];
                    } else{
                        ed_new = [ed[0],ed[1],{"x":that.xMap.invert(d3.mouse(this)[0]),"y":that.yMap.invert(d3.mouse(this)[1])}];
                    }
                    d3.select("#"+eid)
                        .attr("d",that.curve0(ed_new))
                    d3.select("#conn_"+eid)
                        .attr("cx", ()=>that.xMap(ed_new[1].x))
                        .attr("cy", ()=>that.xMap(ed_new[1].y))
                    d3.select("#terminal_"+eid)
                        .style("visibility","hidden");
                }
            }
        }

        function dragendedText(d) {
            if(this.dragText){
                if(that.ifInsideCanvas(d3.mouse(this))){
                    d.x = that.xMap.invert(d3.mouse(this)[0]);
                    d.y = that.yMap.invert(d3.mouse(this)[1]);
                    for(let eid in d.edges){
                        that.mapEdges(eid);
                    }
                    // check edge intersection
                    if(!that.checkIntersection()){
                        if(d3.select("#ifvf").property("checked")){
                            that.assignEdge();
                            that.constructMesh(that.sigma);
                            that.drawFlow();
                        }
                    } else { that.drawFlag = false; }
                    that.addStep();
                }
                that.drawAnnotation();
                for(let eid in d.edges){
                    d3.select("#terminal_"+eid).style("visibility","visible");
                }
                this.dragText = false;
            }
        }

        function draggedConnNode(d){
            // just draw, do not actually change values
            if(that.ifInsideCanvas(d3.mouse(this))){
                d3.select(this)
                    .attr("cx",d3.mouse(this)[0])
                    .attr("cy",d3.mouse(this)[1]);
                let edgeid = d.key;
                d3.select("#"+edgeid)
                    .attr("d",(d)=>that.curve0([d.value[0],{"x":that.xMap.invert(d3.mouse(this)[0]),"y":that.yMap.invert(d3.mouse(this)[1])},d.value[2]]))
            } 
        }

        function dragendedConnNode(d){
            d3.select(this).classed("active", false);
            if(that.ifInsideCanvas(d3.mouse(this))){
                d.value[1].x = that.xMap.invert(d3.mouse(this)[0]);
                d.value[1].y = that.yMap.invert(d3.mouse(this)[1]);
                that.mapEdges(d.key);
                if(!that.checkIntersection()){
                    if(d3.select("#ifvf").property("checked")){
                        that.assignEdge();
                        that.constructMesh(that.sigma);
                        that.drawFlow();
                    }
                } else { that.drawFlag = false; }
                that.addStep();
            }
            that.drawAnnotation();
        }

        function draggedTerminal(d){
            // just draw, do not actually change values
            if(that.ifInsideCanvas(d3.mouse(this))){
                d3.select(this)
                    .attr("cx",d3.mouse(this)[0])
                    .attr("cy",d3.mouse(this)[1])
                let edgeid = d.key;
                let endPt = {"x":that.xMap.invert(d3.mouse(this)[0]),"y":that.yMap.invert(d3.mouse(this)[1])};
                let midPt = {"x":(d.value[0].x+endPt.x)/2,"y":(d.value[0].y+endPt.y)/2};
                d3.select("#"+edgeid)
                    .attr("d",(d)=>that.curve0([d.value[0],midPt,endPt]));
                d3.select("#conn_"+d.key)
                    .attr("cx",that.xMap(midPt.x))
                    .attr("cy",that.yMap(midPt.y));
            }
        }

        function dragendedTerminal(d,i) {
            d3.select(this).classed("active", false);
            if(that.ifInsideCanvas(d3.mouse(this)) && !that.ifLastEdge(d.key)){
                let pt = {"x":that.xMap.invert(d3.mouse(this)[0]),"y":that.yMap.invert(d3.mouse(this)[1])};
                let cpm;
                if(d.value[3]==="max"){
                    cpm = that.findMinPt(pt,that.cp_max);
                } else if (d.value[3]==="min"){
                    cpm = that.findMinPt(pt,that.cp_min);
                }
                if(that.calDist(pt,cpm)<0.1){
                    that.addNewEdge(d.value[0],cpm,d.value[3]);
                    that.deleteOldEdge(d.key);
                    let ifTemp = that.ifTempEdge();
                    let ifInter = that.checkIntersection();
                    // that.drawAnnotation();
                    // check the line order
                    if(!ifTemp && !ifInter){
                        if(d3.select("#ifvf").property("checked")){
                            that.assignEdge();
                            that.constructMesh(that.sigma);
                            that.drawFlow();
                        }
                    }
                }
                
                that.addStep();


            }
            that.drawAnnotation();
        }

        function dragstarted() {
            // d3.select(this).raise().classed("active", true);
        }

        function mouseover() {
            d3.select(this).classed("active", true);
        }
        
        function mouseout(){
            d3.select(this).classed("active", false);
        }

    }

    ifLastEdge(eid){
        // avoid to have isolated critical points
        console.log(this.edges[eid][2].edges)
        let pt = this.edges[eid][2];
        if(!pt.ifBound){
            let edge_keys = Object.keys(pt.edges);
            if(edge_keys.length<=1){
                alert("The critical point cannot be isolated!")
                return true;
            }
        }
        return false;
    }

    checkIntersection(){
        console.log("checking intersection")
        this.edgeInterArray = [];
        let ifInter = false;
        let edgelist = d3.entries(this.edges);
        for(let i=0; i<edgelist.length-1; i++){
            for(let j=i+1; j<edgelist.length; j++){
                let eid1 = edgelist[i].key;
                let eid2 = edgelist[j].key;
                if(!eid1.startsWith("temp") && !eid2.startsWith("temp")){
                    if(this.ifCurvesIntersect(this.edgeMapper[eid1], this.edgeMapper[eid2])){
                        this.edgeInterArray.push([eid1,eid2])
                        ifInter = true;
                    }
                }
            }
        }
        if(!ifInter & !this.ifTempEdge()){
            this.cp.forEach(p=>{
                if(p.type==="saddle"){
                    if(this.ifArcViolate(p)){
                        alert("Lines are not in correct order!");
                        this.edgeInterArray.push(Object.keys(p.edges))
                        ifInter = true;
                    }
                }
            })
        }
        return ifInter;
    }

    drawFlow(){
        this.drawFlag = true;
        // d3.select("#ifflow").node().value = "Disable Flow";
    }

    highlightIntersection(){
        console.log("highlight", this.edgeInterArray)
        this.edgeInterArray.forEach(eid_list=>{
            console.log(eid_list)
            eid_list.forEach(eid=>{
                d3.select("#"+eid).style("stroke", "red");
            })
        })
    }

    ifInsideCanvas(node_coord){
        // When dragging a node, check whether it is still inside the canvas or not.
        let xcoord = node_coord[0];
        let ycoord = node_coord[1];
        let x = this.xMap.invert(xcoord);
        let y = this.yMap.invert(ycoord);
        if(x>=0 && x<=1 && y>=0 && y<=1){
            return true;
        } else{ return false; }
    }

    ifTempEdge(){
        // let temp_list = ["temp1","temp2","temp3","temp4"];
        for(let eid in this.edges){
            if(eid.startsWith("temp")){
                return true;
            }
        }
        return false;
    }

    terminalPosition(eid){
        let ed = this.edges[eid];
        let edMapper = this.edgeMapper[eid];
        let tx = 0.95*ed[2].x+0.05*ed[0].x;
        let ty = 0.95*ed[2].y+0.05*ed[0].y;
        if(eid.startsWith("temp")){
            tx = ed[2].x;
            ty = ed[2].y;
        }
        else if(edMapper){
            let pt1;
            let pt2;
            if(ed[2].x === edMapper[0].x_new && ed[2].y === edMapper[0].y_new){
                if(ed[2].ifBound){
                    pt1 = edMapper[0];
                    pt2 = edMapper[1];
                    tx = 0.8*pt1.x_new+0.2*pt2.x_new
                    ty = 0.8*pt1.y_new+0.2*pt2.y_new;
                }
                else{ 
                    pt1 = edMapper[0];
                    pt2 = edMapper[2];
                    tx = pt2.x_new;
                    ty = pt2.y_new;
                }
            }
            if(ed[2].x === edMapper[this.numSeg].x_new && ed[2].y === edMapper[this.numSeg].y_new){
                if(ed[2].ifBound){
                    pt1 = edMapper[this.numSeg];
                    pt2 = edMapper[this.numSeg-1];
                    tx = 0.8*pt1.x_new+0.2*pt2.x_new;
                    ty = 0.8*pt1.y_new+0.2*pt2.y_new;
                }
                else{ 
                    pt1 = edMapper[this.numSeg];
                    pt2 = edMapper[this.numSeg-2];
                    tx = pt2.x_new;
                    ty = pt2.y_new;
                }
            }
            if(!ed[2].ifBound){
                let cp_r = this.xMap.invert(12.5);
                let dist = this.calDist({"x":tx, "y":ty},ed[2])
                let rate = cp_r / dist;
                tx = (1-rate)*ed[2].x + rate*tx;
                ty = (1-rate)*ed[2].y + rate*ty;
            }
        }

        tx = this.xMap(tx);
        ty = this.yMap(ty);

        return [tx,ty];
    }
    

    initializeEdgeMapper(edge){
        let em = [];
        let ed = edge.slice(0,3);
        ed.sort(function(a,b){
            return d3.ascending(a.x,b.x) || d3.ascending(a.y,b.y);
        })
        let xRange = ed[2].x-ed[0].x;
        let yRange = ed[2].y-ed[0].y;
        for(let j=0;j<this.numSeg+1;j++){
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
            let b2 = pt3.y - a2*pt3.x;
            x = pt1.x;
            y = a2*x+b2;
        } else if(pt3.x===pt4.x){ // if line2 is vertical
            let a1 = (pt1.y-pt2.y)/(pt1.x-pt2.x);
            let b1 = pt1.y - a1*pt1.x;
            x = pt3.x;
            y = a1*x+b1;
        } else {
            let a1 = (pt1.y-pt2.y)/(pt1.x-pt2.x);
            let b1 = pt1.y - a1*pt1.x;
            let a2 = (pt3.y-pt4.y)/(pt3.x-pt4.x);
            let b2 = pt3.y - a2*pt3.x;
            if(a1===a2){
                if(b1 === b2){ // if two lines are identical
                    if(pt3.x<=Math.max(pt1.x, pt2.x) && pt3.x>=Math.min(pt1.x, pt2.x)){
                        return true;
                    }else{
                        return false;
                    }
                } else{
                    return false;
                }
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
                let pt1 = {"x":curve1[i-1].x_new,"y":curve1[i-1].y_new};
                let pt2 = {"x":curve1[i].x_new,"y":curve1[i].y_new};
                let pt3 = {"x":curve2[j-1].x_new,"y":curve2[j-1].y_new};
                let pt4 = {"x":curve2[j].x_new,"y":curve2[j].y_new};
                if(i===1 && j===1){
                    pt1.x = 0.999*pt1.x + 0.001*pt2.x;
                    pt1.y = 0.999*pt1.y + 0.001*pt2.y;
                    pt3.x = 0.999*pt3.x + 0.001*pt4.x;
                    pt3.y = 0.999*pt3.y + 0.001*pt4.y;
                }
                if(i===1 && j===(curve2.length-1)){
                    pt1.x = 0.999*pt1.x + 0.001*pt2.x;
                    pt1.y = 0.999*pt1.y + 0.001*pt2.y;
                    pt4.x = 0.001*pt3.x + 0.999*pt4.x;
                    pt4.y = 0.001*pt3.y + 0.999*pt4.y;
                }
                if(i===(curve1.length-1) && j===1){
                    pt2.x = 0.001*pt1.x + 0.999*pt2.x;
                    pt2.y = 0.001*pt1.y + 0.999*pt2.y;
                    pt3.x = 0.999*pt3.x + 0.001*pt4.x;
                    pt3.y = 0.999*pt3.y + 0.001*pt4.y;
                }
                if(i===(curve1.length-1) && j===(curve2.length-1)){
                    pt2.x = 0.001*pt1.x + 0.999*pt2.x;
                    pt2.y = 0.001*pt1.y + 0.999*pt2.y;
                    pt4.x = 0.001*pt3.x + 0.999*pt4.x;
                    pt4.y = 0.001*pt3.y + 0.999*pt4.y;
                }
                let line1 = [pt1, pt2];
                let line2 = [pt3, pt4];
                if(this.ifLinesIntersect(line1,line2)){
                    console.log(i,j,line1,line2)
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
            // .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-width",3)
            // .style("stroke-dasharray",(d)=>{
            //     if(d.value[3]==="max"){
            //         return "5,5";
            //     } else {return "";}
            // })
            // .style("opacity",0.8)
            .on("mouseover",(d,i)=>{
                d3.select("#"+d.key)
                    .classed("edgeactive",true);
            })
            .on("mouseout",(d,i)=>{
                d3.select("#"+d.key)
                    .classed("edgeactive",false);
            })
            this.highlightIntersection();
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
                    let gradid = Math.round(x/this.step*(1/this.step)+y/this.step);
                    let edpoint = this.findMinPt({"x":x,"y":y},edgepoints);
                    this.grad[gradid]["ed"] = edpoint;
                }
            }
        } else {
            for(let x=0;x<=1;x+=this.step){
                for(let y=0;y<=1;y+=this.step){
                    let gradid = Math.round(x/this.step*(1/this.step)+y/this.step);
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
                let gradid = Math.round(x/this.step*(1/this.step)+y/this.step);
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
                        if(cpCandi.length>0){
                            cpt = this.findMinPt({"x":x, "y":y}, cpCandi);
                        }
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
                                dx2 = (edp[idx-1].x_new - edp[idx].x_new)*20;
                                dy2 = (edp[idx-1].y_new - edp[idx].y_new)*20;
                            } else{
                                dx2 = (edp[0].x_new - edp[1].x_new)*20;
                                dy2 = (edp[0].y_new - edp[1].y_new)*20;
                            }
                        } else if(edp[0].direction==="out"){
                            if(this.grad[gradid].ed.inedgeid>0){
                                let idx = this.grad[gradid].ed.inedgeid;
                                dx2 = (edp[idx].x_new - edp[idx-1].x_new)*20;
                                dy2 = (edp[idx].y_new - edp[idx-1].y_new)*20;
                            } else{
                                dx2 = (edp[1].x_new - edp[0].x_new)*20;
                                dy2 = (edp[1].y_new - edp[0].y_new)*20;
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
        // let sigma = 0.1;
        let x_new = x-cp.x;
        let y_new = y-cp.y;
        let fv = 0;
        if(cp.type === "max"){
            fv = -Math.pow(x_new,2) - Math.pow(y_new,2);
        } else if(cp.type === "saddle"){
            fv = Math.pow(x_new,2) - Math.pow(y_new,2);
        } else if(cp.type === "min"){
            fv = Math.pow(x_new,2) + Math.pow(y_new,2);
        }
        return w*fv + cp.fv
        // return w*Math.exp(-(Math.pow(x,2)+Math.pow(y,2))/sigma)
    }

    animation(){            
        let N = Math.round(1/this.step);
        let dt = 0.0008;
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
        console.log(g)
        // g.scale(0.72,0.38)
        // g.translate(10,10)
        let that = this;

        //// animation setup
        let frameRate = 400; // ms per timestep (yeah I know it's not really a rate)
        let M = X.length;
        let MaxAge = 200; // # timesteps before restart
        var age = [];
        for (var i=0; i<M; i++) {
            age.push(randage());
        }

        setInterval(function () {if (that.drawFlag) {draw();}}, frameRate);
        d3.timer(function () {if (that.drawFlag) {draw();}}, frameRate);
            
        g.globalCompositeOperation = "source-over";
        function draw() {
            let width = document.getElementById('animation').offsetWidth;
            let height = document.getElementById('animation').offsetHeight;
            g.fillStyle = "rgba(255,255, 255, 0.05)";
            g.fillRect(0, 0, width, height); // fades all existing curves by a set amount determined by fillStyle (above), which sets opacity using rgba   

            for (let i=0; i<M; i++) { // draw a single timestep for every curve
                let V = that.findV(X[i],Y[i],that.grad)
                let dr = V[0]
                let pt_new = V[1]
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
        console.log("finding edges")
        console.log(this.cp_max)
        console.log(this.cp_min)
        console.log(this.cp_saddle);
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

    // **************** Draw "undo/redo" sketch ****************

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
        for(let eid in this.edges){
            let startId = this.edges[eid][0].id;
            let startpoint = cp[startId];
            let midpoint = {"x":this.edges[eid][1].x, "y":this.edges[eid][1].y}
            let endpoint;
            
            let type = this.edges[eid][3];
            if(eid.startsWith("temp")){
                endpoint={"x":this.edges[eid][2].x, "y":this.edges[eid][2].y};
            }
            else if(this.edges[eid][2].ifBound){
                endpoint = {"x":this.edges[eid][2].x, "y":this.edges[eid][2].y, "id":this.edges[eid][2].id, "type":this.edges[eid][2].type, "ifBound":true};
            } else{
                let endId = this.edges[eid][2].id;
                endpoint = cp[endId];
            }
            edges[eid] = [startpoint, midpoint, endpoint,type];
        }
        let step = new editStep(cp, edges);
        this.stepRecorder = this.stepRecorder.slice(this.stepRecorder_Idx)
        this.stepRecorder.unshift(step);
        this.stepRecorder_Idx =  0;
        this.drawStep();
    }

    drawStep(){
        // draw legend
        
        let current_stepRecorder = this.stepRecorder.slice(this.stepRecorder_Idx)

        this.step_svgHeight = (this.step_frameHeight+this.margin.betweenstep)*current_stepRecorder.length + this.margin.top*2 + this.margin.bottom*2;

        d3.select("#stepSVG")
            .attr("height",this.step_svgHeight);
        
        let stepGroup = this.step_svg.selectAll('g')
            .data(current_stepRecorder)
        stepGroup.exit().remove();
        stepGroup = stepGroup.enter().append('g').merge(stepGroup)
            .attr("id",(d,i)=>"record"+i);
        
        
        for(let j=0;j<=current_stepRecorder.length;j++){
            let idx = j;
            if(current_stepRecorder[j]!=undefined){
                // d3.select("#record"+j)
                //     .style("visibility","visible");
                let stepRect = d3.select("#record"+j).selectAll('rect')
                        .data([j])
                stepRect.exit().remove();
                stepRect = stepRect.enter().append('rect').merge(stepRect)
                    .attr("x",this.margin.left)
                    .attr("y",d=>this.margin.top+d*this.step_frameHeight+d*this.margin.betweenstep)
                    .attr("width",this.step_frameWidth)
                    .attr("height",this.step_frameHeight)
                    .attr("class","step_frame")

                let step = current_stepRecorder[idx]
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
                    .attr("transform","translate("+this.margin.left+","+(this.margin.top+j*this.step_frameHeight + j*this.margin.betweenstep)+")")
                    .style("fill", "none")
                    .style("stroke", "dimgray")
                    // .attr("stroke",(d)=>{
                    //     // d3.select("#"+d.key).attr("stroke")
                    //     console.log()

                    // })
                    .style("stroke-width",1)
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
                    .attr("cy",(d)=>this.step_yMap(d.y)+this.margin.top+j*this.step_frameHeight + j*this.margin.betweenstep)
                    .attr("r",5)
                    .attr("fill","white");
            
                let circletext = d3.select("#record"+j).selectAll("text").data(step.cp);
                circletext.exit().remove();
                let newcircletext = circletext.enter().append("text");
                circletext = newcircletext.merge(circletext);
                circletext
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'central')
                    .attr('font-size', '12px')
                    .attr("x",(d)=>this.step_xMap(d.x)+this.margin.left)
                    .attr("y",(d)=>this.step_yMap(d.y)+this.margin.top+j*this.step_frameHeight + j*this.margin.betweenstep)
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
        $('#stepSVG').remove();
        $('#content_main_drawing').append('<canvas id="animation" style="position: absolute;" width="570px" height="570px" ></canvas>');
        $('#content_main_drawing').append('<svg id="annotation" style="position: absolute; z-index:1;" width="570px" height="570px"></svg>');
        $('#stepSVG-cover').append('<svg id="stepSVG"></svg>')
    }  
}