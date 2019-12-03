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
                        this.anim.findEdges();
                        this.anim.addStep();
                        // check edge intersection
                        if(!this.anim.checkIntersection() && d3.select("#ifvf").property("checked")){
                            this.anim.assignEdge();
                            this.anim.constructMesh(this.anim.sigma);
                            this.anim.drawFlow();
                        }
                    }     
                    this.anim.drawAnnotation();
                    this.sliders.addSlider();
                    this.anim.findRange();
                }
            })
    }

    amoveMinus(){
        d3.select("#annotation")
            .on("click", ()=>{
                if(this.amType === "min"){
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
                        // this.anim.findEdges();
                        this.anim.drawAnnotation();
                        this.anim.addStep();
                        // check edge intersection
                        if(!this.anim.checkIntersection() && d3.select("#ifvf").property("checked")){
                            this.anim.assignEdge();
                            this.anim.constructMesh(this.anim.sigma);
                            this.anim.drawFlow();
                        }
                    }
                    this.anim.drawAnnotation();
                    this.sliders.addSlider();
                    this.anim.findRange();
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
                            this.anim.drawAnnotation();
                        } else if(d3.select('input[name="mode-type"]:checked').node().value==="semi-automatic"){
                            let min1 = this.anim.findMinPt({"x":pt_saddle.x, "y":0}, this.anim.minBound)
                            let min2 = this.anim.findMinPt({"x":pt_saddle.x, "y":1}, this.anim.minBound)
                            this.anim.addNewEdge(pt_saddle,min1,"min");
                            this.anim.addNewEdge(pt_saddle,min2,"min");
                            this.anim.drawAnnotation();
                            this.anim.addStep();

                            // check edge intersection
                            if(!this.anim.checkIntersection() && d3.select("#ifvf").property("checked")){
                                    this.anim.assignEdge();
                                    this.anim.constructMesh(this.anim.sigma);
                                    this.anim.drawFlow();
                            }                            
                        }
                    }
                    this.sliders.addSlider();
                    this.anim.findRange();
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
                            this.anim.drawAnnotation();
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
                            // this.anim.findEdges();
                            this.anim.drawAnnotation();
                            this.anim.addStep();
                            // check edge intersection
                            if(!this.anim.checkIntersection() && d3.select("#ifvf").property("checked")){
                                this.anim.assignEdge();
                                this.anim.constructMesh(this.anim.sigma);
                                this.anim.drawFlow();
                            }
                        }
                        this.sliders.addSlider();
                        this.anim.findRange();
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
                        this.anim.drawAnnotation();
                    } else if(d3.select('input[name="mode-type"]:checked').node().value==="semi-automatic"){
                        let min1 = this.anim.findMinPt({"x":pt_saddle.x, "y":0}, this.anim.minBound)
                        let min2 = this.anim.findMinPt({"x":pt_saddle.x, "y":1}, this.anim.minBound)
                        this.anim.addNewEdge(pt_saddle,min1,"min");
                        this.anim.addNewEdge(pt_saddle,min2,"min");
                        // this.anim.findEdges();
                        this.anim.drawAnnotation();
                        this.anim.addStep();
                        // check edge intersection
                        if(!this.anim.checkIntersection() && d3.select("#ifvf").property("checked")){
                            this.anim.assignEdge();this.anim.constructMesh(this.anim.sigma);
                            this.anim.drawFlow();
                        }
                    }
                                    
                }
                this.sliders.addSlider();
                this.anim.findRange();
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
                        this.anim.drawAnnotation();
                    } else if(d3.select('input[name="mode-type"]:checked').node().value==="semi-automatic"){
                        this.anim.findEdges();
                        this.anim.drawAnnotation();
                        this.anim.addStep();
                        // check edge intersection
                        if(!this.anim.checkIntersection() && d3.select("#ifvf").property("checked")){
                            this.anim.assignEdge();
                            this.anim.constructMesh(this.anim.sigma);
                            this.anim.drawFlag = true;
                        }
                    }
                }
                this.sliders.addSlider();
                this.anim.findRange();
            })
        this.anim.dragTerminal = true;
    }
}