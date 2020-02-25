class moves{
    constructor(anim, sliders, persistence){
        this.anim = anim;
        this.sliders = sliders;
        this.persistence = persistence;

        this.margin = {"left":60, "top":80};
        this.apType = "";
        this.amType = "";
        this.bpType = "";
        this.bmType = "";
        this.dpType = "";
        this.dmType = "";

    }

    resetAllMoves(){
        let move_list = ["amoveplus", "amoveminus", "bmoveplus", "bmoveminus", "dmoveplus", "dmoveminus"];
        move_list.forEach(mv=>{
            this.resetMove(mv);
        })
    }

    resetMove(moveId){
        if(moveId === "amoveplus"){
            this.apType="";
            d3.select("#amoveplus")
                .attr("value","Face-Max")
                .classed("small-label", false);
        }
        if(moveId === "amoveminus"){
            this.amType="";
            d3.select("#amoveminus")
                .attr("value","Face-Min")
                .classed("small-label",false);
        }
        if(moveId === "bmoveplus"){
            this.bpType="";
            d3.select("#bmoveplus")
                .attr("value","Edge-Max")
                .classed("small-label",false);
        }
        if(moveId === "bmoveminus"){
            this.bmType="";
            d3.select("#bmoveminus")
                .attr("value","Edge-Min")
                .classed("small-label", false);
        }
        if(moveId === "dmoveplus"){
            this.dpType=""
            d3.select("#dmoveplus")
                .attr("value","Vertex-Max")
                .classed("small-label", false);   
        }
        if(moveId === "dmoveminus"){
            this.dmType=""
            d3.select("#dmoveminus")
                .attr("value","Vertex-Min")
                .classed("small-label", false);
        }
    }

    amovePlus(){
        d3.select("#annotation")
            .on("click", ()=>{
                if(this.apType === "max"){
                    this.anim.onMove = true;
                    this.resetMove("amoveplus");
                    let x = this.anim.xMapReverse(d3.event.x-this.margin.left);
                    let y = this.anim.yMapReverse(d3.event.y-this.margin.top);
                    let mincp = this.anim.findMinPt({"x":x,"y":y},this.anim.cp_max);
                    let id = this.anim.cp.length;
                    let pt_max = new criticalPoint(id,x,y,"max");
                    this.anim.cp.push(pt_max);
                    this.anim.cp_max.push(pt_max);
                    let pt_saddle = new criticalPoint(id+1,(x+mincp.x)/2,(y+mincp.y)/2,"saddle");
                    this.anim.cp.push(pt_saddle);
                    this.anim.cp_saddle.push(pt_saddle);
                    if(d3.select('input[name="mode-type"]:checked').node().value==="manual"){
                        this.anim.edges["temp1"] = [pt_saddle,{"x":pt_saddle.x-0.04,"y":pt_saddle.y+0.04},{"x":pt_saddle.x-0.06,"y":pt_saddle.y+0.06},"max"];
                        this.anim.edges["temp2"] = [pt_saddle,{"x":pt_saddle.x+0.04,"y":pt_saddle.y-0.04},{"x":pt_saddle.x+0.06,"y":pt_saddle.y-0.06},"max"];
                        this.anim.edges["temp3"] = [pt_saddle,{"x":pt_saddle.x-0.04,"y":pt_saddle.y-0.04},{"x":pt_saddle.x-0.06,"y":pt_saddle.y-0.06},"min"];
                        this.anim.edges["temp4"] = [pt_saddle,{"x":pt_saddle.x+0.04,"y":pt_saddle.y+0.04},{"x":pt_saddle.x+0.06,"y":pt_saddle.y+0.06},"min"];
                        // this.anim.drawAnnotation();
                    } else if(d3.select('input[name="mode-type"]:checked').node().value==="semi-automatic"){
                        // this.anim.findEdges();
                        this.anim.addNewEdge(pt_saddle, pt_max, "max");
                        let cp_max = [];
                        this.anim.cp_max.forEach(p=>{
                            if(p.id!=pt_max.id){
                                cp_max.push(p);
                            }
                        })
                        let max2 = this.anim.findMinPt(pt_saddle, cp_max);
                        this.anim.addNewEdge(pt_saddle, max2, "max");
                        let min1;
                        let min2;
                        let cp_min = [];
                        this.anim.cp_min.forEach(p=>{
                            if(!p.ifBound) { cp_min.push(p); }
                        })
                        for(let i=0; i<cp_min.length;i++){
                            let min_tmp = cp_min[i];
                            let em_tmp = this.anim.initializeEdgeMapper([pt_saddle, {"x":(pt_saddle.x+min_tmp.x)/2, "y":(pt_saddle.x+min_tmp.x)/2}, min_tmp])
                            let ifInter = false;
                            for(let eid in this.anim.edges){
                                if(this.anim.ifCurvesIntersect(em_tmp, this.anim.edgeMapper[eid])){
                                    ifInter = true;
                                }
                            }
                            if(!ifInter && min1===undefined){
                                min1 = min_tmp;
                            } else if(!ifInter && min2===undefined){
                                min2 = min_tmp;
                            }
                            if(min1 && min2){
                                break;
                            }
                        }
                        if(min1===undefined){
                            min1 = this.anim.findMinPt({"x":pt_saddle.x, "y":0}, this.anim.minBound);
                            min2 = this.anim.findMinPt({"x":pt_saddle.x, "y":1}, this.anim.minBound)
                        } else if(min2 === undefined){
                            let min2_tmp1 = this.anim.findMinPt({"x":pt_saddle.x, "y":0}, this.anim.minBound);
                            let min2_tmp2 = this.anim.findMinPt({"x":pt_saddle.x, "y":1}, this.anim.minBound);
                            if(this.anim.calDist(min2_tmp1, min1)>this.anim.calDist(min2_tmp2, min1)){
                                min2 = min2_tmp1;
                            } else { min2 = min2_tmp2; }
                        }
                        this.anim.addNewEdge(pt_saddle,min1,"min");
                        this.anim.addNewEdge(pt_saddle,min2,"min");
                        let ifConfig = this.anim.ifConfigAllowed();
                        if(ifConfig){
                            this.anim.onMove = false;
                            this.anim.computeBarcode();
                            if(d3.select("#ifvf").property("checked")){
                                this.anim.assignEdge();
                                this.anim.constructMesh(this.anim.sigma);
                                this.anim.drawFlow();
                            }
                        }
                    }    
                    this.anim.addStep(); 
                    this.anim.drawAnnotation();
                    this.anim.findRange();
                    this.sliders.addSlider();
                }
            })
    }

    amoveMinus(){
        d3.select("#annotation")
            .on("click", ()=>{
                if(this.amType === "min"){
                    this.anim.onMove = true;
                    this.resetMove("amoveminus");
                    let x = this.anim.xMapReverse(d3.event.x-this.margin.left);
                    let y = this.anim.yMapReverse(d3.event.y-this.margin.top);
                    let maxPt = this.anim.findMinPt({"x":x,"y":y},this.anim.cp_max);
                    let id = this.anim.cp.length;
                    let pt_saddle = new criticalPoint(id,x,y,"saddle");
                    this.anim.cp.push(pt_saddle);
                    this.anim.cp_saddle.push(pt_saddle);
                    let pt_min = new criticalPoint(id+1,(x+maxPt.x)/2,(y+maxPt.y)/2,"min");
                    this.anim.cp.push(pt_min)
                    this.anim.cp_min.push(pt_min);
                    
                    if(d3.select('input[name="mode-type"]:checked').node().value==="manual"){
                        this.anim.edges["temp1"] = [pt_saddle,{"x":pt_saddle.x-0.04,"y":pt_saddle.y+0.04},{"x":pt_saddle.x-0.06,"y":pt_saddle.y+0.06},"max"];
                        this.anim.edges["temp2"] = [pt_saddle,{"x":pt_saddle.x+0.04,"y":pt_saddle.y-0.04},{"x":pt_saddle.x+0.06,"y":pt_saddle.y-0.06},"max"];
                        this.anim.edges["temp3"] = [pt_saddle,{"x":pt_saddle.x-0.04,"y":pt_saddle.y-0.04},{"x":pt_saddle.x-0.06,"y":pt_saddle.y-0.06},"min"];
                        this.anim.edges["temp4"] = [pt_saddle,{"x":pt_saddle.x+0.04,"y":pt_saddle.y+0.04},{"x":pt_saddle.x+0.06,"y":pt_saddle.y+0.06},"min"];
                    } else if(d3.select('input[name="mode-type"]:checked').node().value==="semi-automatic"){
                        this.anim.addNewEdge(pt_saddle, maxPt, "max");
                        this.anim.addNewEdge(pt_saddle, maxPt, "max");
                        this.anim.addNewEdge(pt_saddle, pt_min, "min");
                        let min2 = this.anim.findMinPt(pt_saddle, this.anim.minBound);
                        this.anim.addNewEdge(pt_saddle, min2, "min");
                        let ifConfig = this.anim.ifConfigAllowed();
                        if(ifConfig){
                            this.anim.onMove = false;
                            this.anim.computeBarcode();
                            if(d3.select("#ifvf").property("checked")){
                                this.anim.assignEdge();
                                this.anim.constructMesh(this.anim.sigma);
                                this.anim.drawFlow();
                            }
                        }
                    }
                    this.anim.addStep();
                    this.anim.drawAnnotation();
                    this.anim.findRange();
                    this.sliders.addSlider();
                }
            })
    }

    bmovePlus(){
        // error check
        let ifMaxEdge = false;
        for(let eid in this.anim.edges){
            if (this.anim.edges[eid][3] === "max"){
                ifMaxEdge = true;
            }
        }
        if(!ifMaxEdge){
            alert("Cannot add this move, because there is no max edge!");
            this.resetMove("bmoveplus");
            return;
        }
        d3.select("#edgegroup").selectAll("path")
            .on("click", (d)=>{
                if(d.value[3]==="max"){
                    let x = d.value[1].x;
                    let y = d.value[1].y;
                    if(this.bpType === "max"){
                        this.anim.onMove = true;
                        this.resetMove("bmoveplus");
                        let id = this.anim.cp.length;
                        let pt_max = new criticalPoint(id,x,y,"max");
                        this.anim.cp.push(pt_max);
                        this.anim.cp_max.push(pt_max);
                        let pt_saddle = new criticalPoint(id+1,(x+d.value[2].x)/2,(y+d.value[2].y)/2,"saddle");
                        this.anim.cp.push(pt_saddle);
                        this.anim.cp_saddle.push(pt_saddle);
                        this.anim.addNewEdge(pt_saddle,d.value[2],"max");
                        this.anim.addNewEdge(pt_saddle,pt_max,"max");
                        this.anim.addNewEdge(d.value[0],pt_max,"max");
                        this.anim.deleteOldEdge(d.key);
                        if(d3.select('input[name="mode-type"]:checked').node().value==="manual"){
                            this.anim.edges["temp1"] = [pt_saddle,{"x":pt_saddle.x-0.04,"y":pt_saddle.y-0.04},{"x":pt_saddle.x-0.06,"y":pt_saddle.y-0.06},"min"]; // new min edge 1
                            this.anim.edges["temp2"] = [pt_saddle,{"x":pt_saddle.x+0.04,"y":pt_saddle.y+0.04},{"x":pt_saddle.x+0.06,"y":pt_saddle.y+0.06},"min"]; // new min edge 2
                            // this.anim.drawAnnotation();
                        } else if(d3.select('input[name="mode-type"]:checked').node().value==="semi-automatic"){
                            let min1;
                            let min2;
                            let cp_min = [];
                            this.anim.cp_min.forEach(p=>{
                                if(!p.ifBound) { cp_min.push(p); }
                            })
                            for(let i=0; i<cp_min.length;i++){
                                let min_tmp = cp_min[i];
                                let em_tmp = this.anim.initializeEdgeMapper([pt_saddle, {"x":(pt_saddle.x+min_tmp.x)/2, "y":(pt_saddle.x+min_tmp.x)/2}, min_tmp])
                                let ifInter = false;
                                for(let eid in this.anim.edges){
                                    if(this.anim.ifCurvesIntersect(em_tmp, this.anim.edgeMapper[eid])){
                                        ifInter = true;
                                    }
                                }
                                if(!ifInter && min1===undefined){
                                    min1 = min_tmp;
                                } else if(!ifInter && min2===undefined){
                                    min2 = min_tmp;
                                }
                                if(min1 && min2){
                                    break;
                                }
                            }
                            if(min1===undefined){
                                min1 = this.anim.findMinPt({"x":pt_saddle.x, "y":0}, this.anim.minBound);
                                min2 = this.anim.findMinPt({"x":pt_saddle.x, "y":1}, this.anim.minBound)
                            } else if(min2 === undefined){
                                let min2_tmp1 = this.anim.findMinPt({"x":pt_saddle.x, "y":0}, this.anim.minBound);
                                let min2_tmp2 = this.anim.findMinPt({"x":pt_saddle.x, "y":1}, this.anim.minBound);
                                if(this.anim.calDist(min2_tmp1, min1)>this.anim.calDist(min2_tmp2, min1)){
                                    min2 = min2_tmp1;
                                } else { min2 = min2_tmp2; }
                                
                            }
                        
                            this.anim.addNewEdge(pt_saddle,min1,"min");
                            this.anim.addNewEdge(pt_saddle,min2,"min");

                            let ifConfig = this.anim.ifConfigAllowed();
                            if(ifConfig){
                                this.anim.onMove = false;
                                this.anim.computeBarcode();
                                if(d3.select("#ifvf").property("checked")){
                                    this.anim.assignEdge();
                                    this.anim.constructMesh(this.anim.sigma);
                                    this.anim.drawFlow();
                                }
                            }                        
                        }
                    }
                    this.anim.drawAnnotation();
                    this.anim.addStep();
                    this.anim.findRange();
                    this.sliders.addSlider();
                    }
            })
    }

    bmoveMinus(){
        // error check
        let ifMinEdge = false;
        for(let eid in this.anim.edges){
            if (this.anim.edges[eid][3] === "min"){
                ifMinEdge = true;
            }
        }
        if(!ifMinEdge){
            alert("Cannot add this move, because there is no min edge!");
            this.resetMove("bmoveminus");
            return;
        }
        d3.select("#edgegroup").selectAll("path")
            .on("click",(d)=>{
                if(d.value[3]==="min"){   
                    if(this.bmType === "min"){
                        this.anim.onMove = true;
                        this.resetMove("bmoveminus");
                        let x = d.value[1].x;
                        let y = d.value[1].y;
                        let id = this.anim.cp.length;
                        let pt_min = new criticalPoint(id,x,y,"min");
                        this.anim.cp.push(pt_min);
                        this.anim.cp_min.push(pt_min);
                        let pt_saddle = new criticalPoint(id+1,(x+d.value[2].x)/2,(y+d.value[2].y)/2,"saddle");
                        this.anim.cp.push(pt_saddle);
                        this.anim.cp_saddle.push(pt_saddle);

                        this.anim.deleteOldEdge(d.key);
                        this.anim.addNewEdge(pt_saddle,d.value[2],"min");
                        this.anim.addNewEdge(pt_saddle,pt_min,"min");
                        this.anim.addNewEdge(d.value[0],pt_min,"min");
                        
                        if(d3.select('input[name="mode-type"]:checked').node().value==="manual"){
                            this.anim.edges["temp1"] = [pt_saddle,{"x":pt_saddle.x-0.04,"y":pt_saddle.y-0.04},{"x":pt_saddle.x-0.06,"y":pt_saddle.y-0.06},"max"]; // new max edge 1
                            this.anim.edges["temp2"] = [pt_saddle,{"x":pt_saddle.x+0.04,"y":pt_saddle.y+0.04},{"x":pt_saddle.x+0.06,"y":pt_saddle.y+0.06},"max"]; // new max edge 2
                        } else if(d3.select('input[name="mode-type"]:checked').node().value==="semi-automatic"){
                            let max2connect = [];
                            let saddle_edges = d.value[0].edges;
                            for(let eid in saddle_edges){
                                if(saddle_edges[eid][3]==="max"){
                                    max2connect.push(saddle_edges[eid][2]);
                                }
                            }
                            this.anim.addNewEdge(pt_saddle,max2connect[0],"max");
                            this.anim.addNewEdge(pt_saddle,max2connect[1],"max");
                            let ifConfig = this.anim.ifConfigAllowed();
                            if(ifConfig){
                                this.anim.onMove = false;
                                this.anim.computeBarcode();
                                if(d3.select("#ifvf").property("checked")){
                                    this.anim.assignEdge();
                                    this.anim.constructMesh(this.anim.sigma);
                                    this.anim.drawFlow();
                                }
                            }   
                        }
                        this.anim.drawAnnotation();
                        this.anim.addStep();
                        this.anim.findRange();
                        this.sliders.addSlider();
                    }
                }
            })
    }
        
    dmovePlus(){
        // error check
        let ifMaxPoint = false;
        this.anim.cp.forEach(p=>{
            if(p.type === "max"){
                ifMaxPoint = true;
            }
        })
        if(!ifMaxPoint){
            alert("Cannot add this move, because there is no max point!");
            this.resetMove("dmoveplus");
            return;
        }

        this.anim.dragTerminal = false;
        d3.select("#pointgroup").selectAll("text")
            .on("click",(d)=>{ // d is a critical point, not an edge
                if(this.dpType==="add" && d.type==="max"){
                    if(Object.keys(d.edges).length > 1){
                        this.face2split = [];
                        console.log(d)
                        let faces = this.faceDetection_max(d);
                        console.log(faces);
                        this.highlightFaces(d, faces);
                    } else{
                        this.anim.onMove = true;
                        this.resetMove("dmoveplus");
                        let x=d.x;
                        let y=d.y;
                        let id = this.anim.cp.length;
                        let pt_saddle = new criticalPoint(id,x,y,"saddle");
                        this.anim.cp.push(pt_saddle);
                        this.anim.cp_saddle.push(pt_saddle);
                        let pt_max = new criticalPoint(id+1,x-0.08,y+0.08,"max");
                        this.anim.cp.push(pt_max);
                        this.anim.cp_max.push(pt_max);
                        d.x = d.x + 0.08;
                        d.y = d.y - 0.08;    
                        this.anim.addNewEdge(pt_saddle,d,"max");
                        this.anim.addNewEdge(pt_saddle,pt_max,"max");
    
                        if(d3.select('input[name="mode-type"]:checked').node().value==="manual"){
                            let tempIdx = 1;
                            for(let eid in d.edges){
                                let dirc_x = (d.edges[eid][0].x - d.edges[eid][2].x)/Math.abs((d.edges[eid][0].x - d.edges[eid][2].x))*0.06;
                                let dirc_y = (d.edges[eid][0].y - d.edges[eid][2].y)/Math.abs((d.edges[eid][0].y - d.edges[eid][2].y))*0.06;
                                this.anim.edges["temp"+tempIdx] = [d.edges[eid][0],{"x":d.edges[eid][0].x-dirc_x*2/3,"y":d.edges[eid][0].y-dirc_y*2/3},{"x":d.edges[eid][0].x-dirc_x,"y":d.edges[eid][0].y-dirc_y},d.edges[eid][3]];
                                this.anim.deleteOldEdge(eid);
                                tempIdx+=1;
                            }
                            
                            this.anim.edges["temp"+tempIdx] = [pt_saddle,{"x":pt_saddle.x-0.04,"y":pt_saddle.y-0.04},{"x":pt_saddle.x-0.06,"y":pt_saddle.y-0.06},"min"]; // new min edge 1
                            this.anim.edges["temp"+(tempIdx+1)] = [pt_saddle,{"x":pt_saddle.x+0.04,"y":pt_saddle.y+0.04},{"x":pt_saddle.x+0.06,"y":pt_saddle.y+0.06},"min"]; // new min edge 2 
                        } else if(d3.select('input[name="mode-type"]:checked').node().value==="semi-automatic"){
                            let min1 = this.anim.findMinPt({"x":pt_saddle.x, "y":0}, this.anim.minBound)
                            let min2 = this.anim.findMinPt({"x":pt_saddle.x, "y":1}, this.anim.minBound)
                            this.anim.addNewEdge(pt_saddle,min1,"min");
                            this.anim.addNewEdge(pt_saddle,min2,"min");
                            
                            let ifConfig = this.anim.ifConfigAllowed();
                            if(ifConfig){
                                this.anim.onMove = false;
                                this.anim.computeBarcode();
                                if(d3.select("#ifvf").property("checked")){
                                    this.anim.assignEdge();
                                    this.anim.constructMesh(this.anim.sigma);
                                    this.anim.drawFlow();
                                }
                            }   
                        }
                        this.anim.drawAnnotation();
                        this.anim.addStep();
                        this.anim.findRange();
                        this.sliders.addSlider();
                    }
                    
                                    
                }
                
            })
        this.anim.dragTerminal = true;
    }
    dmoveMinus(){
        // error check
        let ifMinPoint = false;
        this.anim.cp.forEach(p=>{
            if(p.type === "min"){
                ifMinPoint = true;
            }
        })
        if(!ifMinPoint){
            alert("Cannot add this move, because there is no min point!");
            this.resetMove("dmoveminus");
            return;
        }
        this.anim.dragTerminal = false;
        d3.select("#pointgroup").selectAll("text")
            .on("click",(d)=>{
                if(this.dmType==="add" && d.type==="min"){
                    this.anim.onMove = true;
                    this.resetMove("dmoveminus");
                    let x = d.x;
                    let y = d.y;
                    let id = this.anim.cp.length;
                    let pt_saddle = new criticalPoint(id,x,y,"saddle");
                    this.anim.cp.push(pt_saddle);
                    this.anim.cp_saddle.push(pt_saddle);
                    let pt_min = new criticalPoint(id+1,x+0.08,y+0.08,"min")
                    this.anim.cp.push(pt_min);
                    this.anim.cp_min.push(pt_min);
                    d.x = d.x - 0.08;
                    d.y = d.y - 0.08;                  
                    this.anim.addNewEdge(pt_saddle,d,"min");
                    this.anim.addNewEdge(pt_saddle,pt_min,"min");
                    
                    if(d3.select('input[name="mode-type"]:checked').node().value==="manual"){
                        let tempIdx = 1;
                        for(let eid in d.edges){
                            let dirc_x = (d.edges[eid][0].x - d.edges[eid][2].x)/Math.abs((d.edges[eid][0].x - d.edges[eid][2].x))*0.06;
                            let dirc_y = (d.edges[eid][0].y - d.edges[eid][2].y)/Math.abs((d.edges[eid][0].y - d.edges[eid][2].y))*0.06;
                            this.anim.edges["temp"+tempIdx] = [d.edges[eid][0],{"x":d.edges[eid][0].x-dirc_x*2/3,"y":d.edges[eid][0].y-dirc_y*2/3},{"x":d.edges[eid][0].x-dirc_x,"y":d.edges[eid][0].y-dirc_y},d.edges[eid][3]];
                            this.anim.deleteOldEdge(eid);
                            tempIdx+=1;
                        }

                        // this.anim.edges["temp1"] = [pt_saddle,pt_saddle,{"x":pt_saddle.x-0.04,"y":pt_saddle.y+0.04},"max"];
                        // this.anim.edges["temp2"] = [pt_saddle,pt_saddle,{"x":pt_saddle.x+0.04,"y":pt_saddle.y-0.04},"max"];
                        // this.anim.edges["temp3"] = [pt_saddle,pt_saddle,{"x":pt_saddle.x-0.04,"y":pt_saddle.y-0.04},"min"];
                        // this.anim.edges["temp4"] = [pt_saddle,pt_saddle,{"x":pt_saddle.x+0.04,"y":pt_saddle.y+0.04},"min"];
                        this.anim.edges["temp"+tempIdx] = [pt_saddle,{"x":pt_saddle.x+0.04,"y":pt_saddle.y-0.04},{"x":pt_saddle.x+0.06,"y":pt_saddle.y-0.06},"max"]; // new max edge 1
                        this.anim.edges["temp"+(tempIdx+1)] = [pt_saddle,{"x":pt_saddle.x-0.04,"y":pt_saddle.y+0.04},{"x":pt_saddle.x-0.06,"y":pt_saddle.y+0.06},"max"]; // new max edge 2 
                    } else if(d3.select('input[name="mode-type"]:checked').node().value==="semi-automatic"){
                        let maxPt = this.anim.findMinPt(pt_min, this.anim.cp_max);
                        this.anim.addNewEdge(pt_saddle, maxPt, "max");
                        this.anim.addNewEdge(pt_saddle, maxPt, "max");
                        // let min_ed_keys = Object.keys(d.edges);
                        // let eid2move = min_ed_keys[0]; // no isolated cp
                        // this.anim.addNewEdge(d.edges[eid2move][0],)
                        // this.anim.delete(eid2move)
                        
                        let ifConfig = this.anim.ifConfigAllowed();
                        if(ifConfig){
                            this.anim.onMove = false;
                            this.anim.computeBarcode();
                            if(d3.select("#ifvf").property("checked")){
                                this.anim.assignEdge();
                                this.anim.constructMesh(this.anim.sigma);
                                this.anim.drawFlow();
                            }
                        }   
                    }
                }
                this.anim.drawAnnotation();
                this.anim.addStep();
                this.anim.findRange();
                this.sliders.addSlider();
            })
        this.anim.dragTerminal = true;
    }

    faceDetection_max(v){
        // faces: vertices order matters !!!
        let saddles = [];
        for(let eKey in v.edges){
            saddles.push(v.edges[eKey][0]);
        }
        let faces = [];
        console.log(saddles)
        for(let i=0; i<saddles.length; i++){
            let saddle_i = saddles[i];
            let min_i = [];
            Object.keys(saddle_i.edges).forEach(eKey=>{
                if(saddle_i.edges[eKey][3]==="min"){
                    min_i.push(saddle_i.edges[eKey][2]);
                }
            })
            for(let j=i+1; j<saddles.length; j++){
                let saddle_j = saddles[j];
                let min_j = [];
                Object.keys(saddle_j.edges).forEach(eKey=>{
                    if(saddle_j.edges[eKey][3]==="min"){
                        min_j.push(saddle_j.edges[eKey][2]);
                    }
                })
                min_i.forEach(mi=>{
                    min_j.forEach(mj=>{
                        if(mi.ifBound){
                            if(mj.ifBound){
                                if(this.anim.ifLinesIntersect([mi,mj], [saddle_i, saddle_j])=== false){
                                    faces.push([v, saddle_j, mj, mi, saddle_i]);
                                }
                            }
                        } else { // if not boundary, mi and mj have to be the same min point
                            if(mi.id === mj.id){
                                faces.push([v, saddle_j, mi, saddle_i]);
                            }
                        }
                    })
                })

            }
        }
        return faces;
    }

    highlightFaces(v, faces){
        this.anim.faceGroup.selectAll('path').remove();
        let pg = this.anim.faceGroup.selectAll('path').data(faces);
        pg.exit().remove();
        pg = pg.enter().append('path').merge(pg)
            .attr('d', d=>{
                let p = d3.path();
                p.moveTo(this.anim.xMap(d[0].x), this.anim.yMap(d[0].y))
                for(let i=1; i<d.length; i++){
                    let edgeid;
                    if(d[i].type==="saddle"){
                        edgeid = "edge"+d[i].id+d[i-1].id;
                    } else {
                        edgeid = "edge"+d[i-1].id+d[i].id;
                    }
                    if(this.anim.edgeMapper[edgeid]){
                        let em = this.anim.edgeMapper[edgeid];
                        if(this.anim.calDist(d[i-1], {"x":em[0].x_new, "y":em[0].y_new}) <= this.anim.calDist(d[i], {"x":em[0].x_new, "y":em[0].y_new})){
                            // start with em[0]
                            for(let j=1; j<em.length; j++){
                                p.lineTo(this.anim.xMap(em[j].x_new), this.anim.yMap(em[j].y_new));
                            }

                        } else { // start with em[-1]
                            for(let j=1; j<em.length; j++){
                                let j_new = em.length-1-j;
                                p.lineTo(this.anim.xMap(em[j_new].x_new), this.anim.yMap(em[j_new].y_new));
                            }
                        }

                    } else {
                        p.lineTo(this.anim.xMap(d[i].x), this.anim.yMap(d[i].y));
                    }
                    console.log(edgeid)
                }
                // the last path is saddle-max edge
                let em = this.anim.edgeMapper["edge"+d[d.length-1].id+d[0].id];
                if(this.anim.calDist(d[d.length-1], {"x":em[0].x_new, "y":em[0].y_new}) <= this.anim.calDist(d[0], {"x":em[0].x_new, "y":em[0].y_new})){
                    // start with em[0]
                    for(let j=1; j<em.length; j++){
                        p.lineTo(this.anim.xMap(em[j].x_new), this.anim.yMap(em[j].y_new));
                    }
                } else { // start with em[-1]
                    for(let j=1; j<em.length; j++){
                        let j_new = em.length-1-j;
                        p.lineTo(this.anim.xMap(em[j_new].x_new), this.anim.yMap(em[j_new].y_new));
                    }
                }
                return p.toString();
            })
            .attr('stroke', 'none')
            .attr("id", (d,i)=>"face"+i)
            .attr('fill', 'Gainsboro')
            .style("opacity", 0.2)
            .on("mouseover", (d,i)=>{
                if(this.face2split.length < 2){
                    d3.select("#face"+i).style("opacity", 0.6);
                }
            })
            .on("mouseout", (d,i)=>{
                if(this.face2split.length < 2) {
                    d3.select("#face"+i).style("opacity", 0.2);
                }
            })
            .on("click", (d,i)=>{
                if(d3.select("#face"+i).classed("selected-face")){
                    if(this.face2split.length === 1){
                        d3.select("#face"+i).classed("selected-face", false);
                        this.face2split = [];
                    }
                } else{
                    d3.select("#face"+i).classed("selected-face", true);
                    if(this.face2split.length < 2){
                        this.face2split.push(i);
                        if(this.face2split.length === 2){
                            let selected_faces = [faces[this.face2split[0]], faces[this.face2split[1]]];
                            this.splitVertex(v, selected_faces);
                            this.anim.faceGroup.selectAll("path").remove();
                        }
                    }
                }
            })

    }
    splitVertex(v, selected_faces){
        if(v.type==="max"){
            this.anim.onMove = true;
            this.resetMove("dmoveplus");

            // firstly, add a new saddle
            let id = this.anim.cp.length;
            let x_saddle = v.x;
            let y_saddle = v.y;
            let new_saddle = new criticalPoint(id, x_saddle, y_saddle, "saddle");
            this.anim.cp.push(new_saddle);
            this.anim.cp_saddle.push(new_saddle);

            // split faces
            let f1 = selected_faces[0];
            let saddle_11 = f1[1];
            let pt_min1 = f1[2];
            let saddle_12 = f1[3];
            if(f1.length === 5){
                saddle_11 = f1[1];
                pt_min1 = this.anim.findMinPt({"x":(f1[2].x+f1[3].x)/2, "y":(f1[2].y+f1[3].y)/2}, this.anim.minBound);
                saddle_12 = f1[4];
            }
            // new_face_1 : [v, saddle_11, pt_min, new_saddle]
            // new_face_2 : [new_max, new_saddle, pt_min, saddle_12]
            this.anim.addNewEdge(new_saddle, pt_min1, "min");
            
            let x_max1 = (saddle_11.x + new_saddle.x)/2;
            let y_max1 = (saddle_11.y + new_saddle.y)/2;

            let x_max2 = (saddle_12.x + new_saddle.x)/2;
            let y_max2 = (saddle_12.y + new_saddle.y)/2;

            v.x = x_max1;
            v.y = y_max1;

            let new_max = new criticalPoint(id+1, x_max2, y_max2, "max");
            this.anim.cp.push(new_max);
            this.anim.cp_max.push(new_max);

            // delete edge between v and saddle_12
            this.anim.deleteOldEdge("edge"+saddle_12.id+v.id);
            this.anim.addNewEdge(saddle_12, new_max, "max");
            this.anim.addNewEdge(new_saddle, v, "max");
            this.anim.addNewEdge(new_saddle, new_max, "max");


            let f2 = selected_faces[1];
            let saddle_21 = f2[1];
            let pt_min2 = f2[2];
            let saddle_22 = f2[3];
            if(f2.length === 5){
                saddle_21 = f2[1];
                pt_min2 = this.anim.findMinPt({"x":(f2[2].x+f2[3].x)/2, "y":(f2[2].y+f2[3].y)/2}, this.anim.minBound);
                saddle_22 = f2[4];
            }

            this.anim.addNewEdge(new_saddle, pt_min2, "min");

            if(this.anim.ifLinesIntersect([v,saddle_21], [new_max, saddle_22]) === false){
                this.anim.deleteOldEdge("edge"+saddle_22.id+v.id);
                if(saddle_12.id != saddle_22.id){
                    this.anim.addNewEdge(saddle_22, new_max, "max");
                }
            } else {
                this.anim.deleteOldEdge("edge"+saddle_21.id+v.id);
                if(saddle_12.id != saddle_21.id){
                    this.anim.addNewEdge(saddle_21, new_max, "max");
                }
            }


            // let x_max1 = (new_saddle.x + 




            // let x1=0;
            // let y1=0;
            // let x2=0;
            // let y2=0;
            // let saddles = [];
            // selected_faces[0].forEach(v1=>{
            //     x1 += v1.x;
            //     y1 += v1.y;
            // })
            // selected_faces[1].forEach(v2=>{
            //     x2 += v2.x;
            //     y2 += v2.y;
            // })
            // x1 = x1 / parseFloat(selected_faces[0].length);
            // y1 = y1 / parseFloat(selected_faces[0].length);
            // x2 = x2 / parseFloat(selected_faces[1].length);
            // y2 = y2 / parseFloat(selected_faces[1].length);

            

            // let pt_max = new criticalPoint(id+1, x1, y1, "max");
            // this.anim.cp.push(pt_max);
            // this.anim.cp_max.push(pt_max);

            // v.x = x2;
            // v.y = y2;

            // this.anim.addNewEdge(pt_saddle, v, "max");
            // this.anim.addNewEdge(pt_saddle, pt_max, "max");

            // if(d3.select('input[name="mode-type"]:checked').node().value==="manual"){
            //     let tempIdx = 1;
            //     for(let eid in v.edges){
            //         let dirc_x = (v.edges[eid][0].x - v.edges[eid][2].x)/Math.abs((v.edges[eid][0].x - v.edges[eid][2].x))*0.06;
            //         let dirc_y = (v.edges[eid][0].y - v.edges[eid][2].y)/Math.abs((v.edges[eid][0].y - v.edges[eid][2].y))*0.06;
            //         this.anim.edges["temp"+tempIdx] = [v.edges[eid][0],{"x":v.edges[eid][0].x-dirc_x*2/3,"y":v.edges[eid][0].y-dirc_y*2/3},{"x":v.edges[eid][0].x-dirc_x,"y":v.edges[eid][0].y-dirc_y},v.edges[eid][3]];
            //         this.anim.deleteOldEdge(eid);
            //         tempIdx+=1;
            //     }
                            
            //     this.anim.edges["temp"+tempIdx] = [pt_saddle,{"x":pt_saddle.x-0.04,"y":pt_saddle.y-0.04},{"x":pt_saddle.x-0.06,"y":pt_saddle.y-0.06},"min"]; // new min edge 1
            //     this.anim.edges["temp"+(tempIdx+1)] = [pt_saddle,{"x":pt_saddle.x+0.04,"y":pt_saddle.y+0.04},{"x":pt_saddle.x+0.06,"y":pt_saddle.y+0.06},"min"]; // new min edge 2 
            // } else if(d3.select('input[name="mode-type"]:checked').node().value==="semi-automatic"){
            //     let min1 = this.anim.findMinPt({"x":(x1+x2)/2, "y":0}, this.anim.minBound)
            //     let min2 = this.anim.findMinPt({"x":(x1+x2)/2, "y":1}, this.anim.minBound)
            //     this.anim.addNewEdge(pt_saddle,min1,"min");
            //     this.anim.addNewEdge(pt_saddle,min2,"min");

            //     let ifConfig = this.anim.ifConfigAllowed();
            //     if(ifConfig){
            //         this.anim.onMove = false;
            //         this.anim.computeBarcode();
            //         if(d3.select("#ifvf").property("checked")){
            //             this.anim.assignEdge();
            //             this.anim.constructMesh(this.anim.sigma);
            //             this.anim.drawFlow();
            //         }
            //     }   
            // }
            let ifConfig = this.anim.ifConfigAllowed();
            if(ifConfig){
                        this.anim.onMove = false;
                        this.anim.computeBarcode();
                        if(d3.select("#ifvf").property("checked")){
                            this.anim.assignEdge();
                            this.anim.constructMesh(this.anim.sigma);
                            this.anim.drawFlow();
                        }
                    }  



            this.anim.drawAnnotation();
            this.anim.addStep();
            this.anim.findRange();
            this.sliders.addSlider();
        }
    }
}