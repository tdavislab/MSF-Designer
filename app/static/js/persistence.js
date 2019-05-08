class persistence{
    constructor(barcode, anim){
        this.anim = anim;
        this.local_max = 10;
        this.local_min = 0;
        this.barcode = barcode;
        console.log(barcode)
        this.margin = {"top":20,"bottom":20,"left":10,"right":10};
        this.svgWidth = 1200;
        this.svgHeight = 300;
        this.svg = d3.select("#persistencegroup").append("svg")
            .attr("id","phSVG")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight);
        this.xAxisGroup = this.svg.append('g')
            .attr('id','xAxis');
        this.persistenceBarGroup = this.svg.append('g')
            .attr("id","persistencebargroup");

        // this.recoverCP();
        // this.birthID = [];
        this.drawPersistence();
        this.barcode.sort(function(a,b){
            if(a.death<0){
                return d3.descending(b.death,a.death);
            } else if(b.death<0){
                return d3.descending(a.death,b.death);
            } else {
                return d3.descending(a.death-a.birth,b.death-b.birth);
            }
            
        })
        console.log(this.barcode)
        this.recoverEdge();
        this.recoverPersisitence();
        
    }

    findTempEdge(){
        let cpidx = [];
        let tempidx = 1;
        this.anim.cp.forEach(p=>cpidx.push(p.id));
        this.anim.minBound.forEach(p=>cpidx.push(p.id));
        for(let eid in this.anim.edges){
            let ed = this.anim.edges[eid];
            console.log(ed)
            if(cpidx.indexOf(ed[2].id)===-1){ // if a saddle point is removed, all edges of this point will be removed.
                this.anim.deleteOldEdge(eid);
                this.anim.edges["temp"+tempidx] = ed
                tempidx += 1;
            }
        }
    }
    recoverPersisitence(){
        let that=this;
        d3.select("#simplifyBarcode")
            .on("click",()=>{
                console.log(that.barcode)
                for(let i=0;i<that.barcode.length;i++){
                    if(that.barcode[i].edge){
                        d3.select("#"+that.barcode[i].edge.key)
                            .style("stroke","red")
                            .style("stroke-width","10")
                            .on("mouseover",()=>{
                                d3.select("#"+that.barcode[i].edge.key)
                                    .style("stroke-width","15")
                            })
                            .on("mouseout",()=>{
                                d3.select("#"+that.barcode[i].edge.key)
                                    .style("stroke-width","10")
                            })
                            .on("click",()=>{
                                console.log("i am hre")
                                console.log(that.barcode[i])
                                // let birthid = that.barcode[i].birth_cp.id
                                // let deathid = that.barcode[i].death_cp.id
                                let birthid;
                                let deathid;
                                if(that.barcode[i].edge.value[3]==="max"){
                                    birthid = that.barcode[i].edge.value[2].id;
                                    deathid = that.barcode[i].edge.value[0].id;
                                } else if(that.barcode[i].edge.value[3]==="min"){
                                    birthid = that.barcode[i].edge.value[0].id;
                                    deathid = that.barcode[i].edge.value[2].id;
                                }
                                let saddle_edges = that.barcode[i].edge.value[0].edges;
                                for(let ed_key in saddle_edges){
                                    console.log(ed_key)
                                    that.anim.deleteOldEdge(ed_key);
                                }
                                let cp = that.anim.cp.slice();
                                that.anim.cp = []
                                for(let k=0; k<cp.length; k++){
                                    if(k!=birthid && k!= deathid){
                                        that.anim.cp.push(cp[k])
                                    }
                                }
                                that.findTempEdge()

                                // rename cp id
                                for(let k=0; k<that.anim.cp.length; k++){
                                    that.anim.cp[k].id = k;
                                }

                                // rename edge key
                                for(let eid in that.anim.edges){
                                    let ed = that.anim.edges[eid];
                                    // let newid = "edge"+ed[0].id+ed[2].id;
                                    that.anim.deleteOldEdge(eid);
                                    that.anim.addNewEdge(ed[0],ed[2],ed[3]);
                                }


                                
                                console.log(that.anim.cp)
                                console.log(that.anim.edges)
                                // that.anim.edges = that.anim.findEdges(that.anim.cp)
                                // that.anim.connNodes = that.anim.findConnNodes(that.anim.edges);
                                that.anim.assignEdge();
                                that.anim.constructMesh(that.anim.sigma)
                                that.anim.drawAnnotation();
                                that.anim.addedges();
                                d3.event.stopPropagation();
                            })
                    }
                }
            })

    }
    // recoverCP(){
    //     let birthID = [];
    //     for(let i=0;i<this.barcode.length;i++){
    //         let birth_fv = this.local_max - this.barcode[i].birth;
    //         // console.log(birthID)

    //         let birth_cp = this.findCP(birth_fv,birthID);
    //         // console.log(birth_fv,birth_cp)

    //         birthID.push(birth_cp.id);
    //         let death_cp = undefined;
    //         if(this.barcode[i].death>0){
    //             let death_fv = this.local_max - this.barcode[i].death;
    //             death_cp = this.findCP1(death_fv,birth_cp);
    //         }
    //         this.barcode[i].birth_cp = birth_cp;
    //         this.barcode[i].death_cp = death_cp;
    //     }
    // }

    recoverEdge(){
        let edgelist = [];
        let cplist = [];
        for(let i=0;i<this.barcode.length;i++){
            console.log(i)
            if(this.barcode[i].death>0){
                let min_dist = 100;
                let min_ed_key;
                let min_ed_value;
                for(let ed_key in this.anim.edges){
                    // console.log(ed_key)
                    let ed = this.anim.edges[ed_key];
                    if(ed[3]==="max"){ // compare the function value and period ?

                        let b_ed = ed[2].fv;
                        let d_ed = ed[0].fv;
                        // let life_ed = b_ed - d_ed;
                        let b_bar = this.local_max - this.barcode[i].birth;
                        let d_bar = this.local_max - this.barcode[i].death;
                        let dist = Math.abs(b_ed-b_bar)+Math.abs(d_ed-d_bar);
                        // console.log(b_ed,d_ed,b_bar,d_bar)
                        // console.log(dist)
                        // console.log(dist)
                        if(dist<=min_dist && edgelist.indexOf(ed_key)===-1 && cplist.indexOf(ed[0].id)===-1 && cplist.indexOf(ed[2].id)===-1){
                            min_dist = dist;
                            min_ed_key = ed_key;
                            min_ed_value = ed;
                        }

                        // console.log("min",min_dist)
                    
                    } else if(ed[3]==="min"){ 
                        let b_ed = ed[0].fv;
                        let d_ed = ed[2].fv;
                        // let life_ed = b_ed - d_ed;
                        // **** need to fill !!!!
                    }
                
                }
                // console.log(min_ed_key)

                
                this.barcode[i].edge = {"key":min_ed_key,"value":min_ed_value};
                edgelist.push(min_ed_key);
                cplist.push(min_ed_value[0].id);
                cplist.push(min_ed_value[2].id);
                console.log(this.barcode)
                console.log(edgelist)
                console.log(cplist)

            }

        }
    }

    // recoverEdge(){
    //     for(let i=0;i<this.barcode.length;i++){
    //         if(this.barcode[i].death>0){
    //             if(this.barcode[i].birth_cp.type==="saddle"){
    //                 this.barcode[i].edgeID = "edge"+this.barcode[i].birth_cp.id.toString()+this.barcode[i].death_cp.id.toString()
    //             } else {
    //                 this.barcode[i].edgeID = "edge"+this.barcode[i].death_cp.id.toString()+this.barcode[i].birth_cp.id.toString()
    //             }
    //         } else {
    //             this.barcode[i].edgeID = undefined;
    //         }
            
    //     }
    //     console.log(this.barcode)
    // }

    // findCP(fv,birthid){
    //     console.log(birthid)
    //     // given the function value, find the cp id
    //     let min_dist = 100;
    //     let cp = undefined;
    //     for(let i=0;i<this.anim.cp.length;i++){
    //         // console.log(i)
    //         // console.log(birthid.indexOf(i))
    //         // console.log(min_dist,this.anim.cp[i].fv - fv)
    //         if(Math.abs(this.anim.cp[i].fv - fv)<min_dist && birthid.indexOf(i)===-1){
    //             cp = this.anim.cp[i];
    //             min_dist = Math.abs(this.anim.cp[i].fv - fv);
                
    //         }
    //     }
    //     return cp
    // }
    // findCP1(fv,birthcp){
    //     // given the function value, find the cp id
    //     let np = []
    //     for(let i=0;i<birthcp.np.length;i++){
    //         np.push(birthcp.np[i].id)
    //     }
    //     let min_dist = 100;
    //     let cp = undefined;
    //     for(let i=0;i<this.anim.cp.length;i++){
    //         if(Math.abs(this.anim.cp[i].fv - fv)<min_dist && np.indexOf(i)!=-1){
    //             cp = this.anim.cp[i];
    //             min_dist = Math.abs(this.anim.cp[i].fv - fv);
                
    //         }
    //     }
    //     return cp
    // }
    
    drawPersistence(){
        this.barcode.sort(function(a,b){
            if(a.death<0){
                return d3.descending(b.death,a.death);
            } else if(b.death<0){
                return d3.descending(a.death,b.death);
            } else {
                return d3.descending(a.death-a.birth,b.death-b.birth);
            }
            
        })
        console.log("i am here")
        let xScale = d3.scaleLinear()
            .domain([this.local_min, this.local_max])
            .range([this.margin.left,this.svgWidth-this.margin.right]);
        // let yScale = d3.scaleLinear()

        let xAxis = d3.axisBottom(xScale);
        this.xAxisGroup
            .classed("axis", true)
            // .style("dominant-baseline", "central")
            // .attr("marker-end", "url(#arrowhead)")
            // .attr("transform", "translate(0, "+ (this.svgHeight-this.margin.bottom) + ")")
            .style("font-size","15px")
            .attr("transform", "translate(0, "+ this.margin.top + ")")
            .call(xAxis);
        let bars = this.persistenceBarGroup.selectAll("rect").data(this.barcode);
        bars.exit().remove();
        let newbars = bars.enter().append("rect");
        bars = newbars.merge(bars);
        bars
            .attr("x",d=>xScale(Math.round(d.birth*10)/10))
            .attr("y",(d,i)=>(i+1)*25+this.margin.top*2)
            .attr("width",d=>{
                if(d.death<0){
                    return xScale.range()[1]
                } else {
                    return xScale(d.death-d.birth)
                }
            })
            .attr("height",20)
            // .attr("transform", "translate("+this.margin.left+", 0)")
            // .attr("stroke","black")
            // .attr("fill","rgb(172,218,224)")
            .attr("fill","rgb(187,160,203)")
            .on("mouseover",mouseover)
            .on("mouseout",mouseout)

            function mouseover(d){
                d3.select(this).classed("phactive",true);
                console.log(d.edgeID)
                d3.select("#"+d.edgeID)
                    .style("stroke","red")
                    .style("stroke-width","10")
                // d3.select("#p0").style("stroke","red");
            }

            function mouseout(d){
                d3.select(this).classed("phactive",false);
                d3.select("#"+d.edgeID)
                    .style("stroke","black")
                    .style("stroke-width","2")
                // d3.select("#p0").style("stroke","black");
            }


    }
}