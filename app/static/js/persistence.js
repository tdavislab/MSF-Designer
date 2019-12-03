class persistence{
    constructor(barcode, anim){
        this.anim = anim;
        this.local_max = 10;
        this.local_min = 0;
        this.barcode = barcode;
        this.margin = {"top":5,"bottom":5,"left":10,"right":10};
        this.svgWidth = 600;
        this.svgHeight = 50;
        this.svg = d3.select("#persistencegroup").append("svg")
            .attr("id","phSVG")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight);
        this.xAxisGroup = this.svg.append('g')
            .attr('id','xAxis');
        this.persistenceBarGroup = this.svg.append('g')
            .attr("id","persistencebargroup");

        this.xScale = d3.scaleLinear()
            .domain([this.local_min, this.local_max])
            .range([this.margin.left,this.svgWidth-this.margin.right]);

        // this.sortBarcode();
        this.drawPersistence();
        this.recoverPairs();
        this.recoverPersisitence();
        
    }

    recoverPersisitence(){
        let that=this;
        d3.select("#simplifyBarcode")
            .on("click",()=>{
                if(this.anim.ifConfigAllowed()){
                    for(let i=0;i<that.barcode.length;i++){
                        if(that.barcode[i].edge){
                            d3.select("#"+that.barcode[i].edge.key)
                                .style("stroke","red")
                                .style("stroke-width","3")
                                .on("mouseover",()=>{
                                    d3.select("#"+that.barcode[i].edge.key)
                                        .style("stroke-width","6")
                                })
                                .on("mouseout",()=>{
                                    d3.select("#"+that.barcode[i].edge.key)
                                        .style("stroke-width","3")
                                })
                                .on("click",()=>{
                                    that.anim.drawFlag = false;
                                    // delete saddle, saddle edges, and max/min
                                    let birthid;
                                    let deathid;
                                    let edgeType = that.barcode[i].edge.value[3]
                                    if(edgeType==="max"){
                                        birthid = that.barcode[i].edge.value[2].id;
                                        deathid = that.barcode[i].edge.value[0].id;
                                    } else if(edgeType ==="min"){
                                        birthid = that.barcode[i].edge.value[0].id;
                                        deathid = that.barcode[i].edge.value[2].id;
                                    }
                                    let saddle_edges = that.barcode[i].edge.value[0].edges;
                                    let point2reassign;
                                    for(let ed_key in saddle_edges){
                                        if(edgeType==="max" && saddle_edges[ed_key][3]==="max" && that.barcode[i].edge.value[2].id != saddle_edges[ed_key][2].id){
                                            point2reassign = saddle_edges[ed_key][2];
                                        } else if(edgeType==="min" && saddle_edges[ed_key][3]==="min" && that.barcode[i].edge.value[2].id != saddle_edges[ed_key][2].id){
                                            points2reassign = saddle_edges[ed_key][2];
                                        }
                                        that.anim.deleteOldEdge(ed_key);
                                    }
    
                                    let edges2reassign = that.barcode[i].edge.value[2].edges;
                                    for(let i=0; i<Object.keys(edges2reassign).length; i++){
                                        let ed_key = Object.keys(edges2reassign)[i];
                                        let temp = [...edges2reassign[ed_key]];
                                        that.anim.addNewEdge(temp[0], point2reassign, point2reassign.type);
                                        that.anim.deleteOldEdge(ed_key);
                                    }
                                
                                    let cp = [...that.anim.cp];
                                    that.anim.cp = []
                                    for(let k=0; k<cp.length; k++){
                                        if(k!=birthid && k!= deathid){
                                            console.log("k",k)
                                            that.anim.cp.push(cp[k])
                                        }
                                    }
                                    that.anim.cp.forEach(p=>{console.log(p)})
                                    for(let eid in that.anim.edges){
                                        console.log(eid)
                                    }
                                    that.anim.cpReorganize();
                                    that.anim.drawAnnotation();
                                    if(!that.anim.checkIntersection()){
                                        that.anim.assignEdge();
                                        that.anim.constructMesh(that.anim.sigma);
                                        that.anim.drawFlow();
                                    }
                                    that.anim.addStep();
                                })
                        }
                    }
                }
                
            })

    }

    recoverPairs(){
        // recover persistence pairs from barcode (based on function values)
        let edgelist = [];
        let cplist = [];
        for(let i=0;i<this.barcode.length;i++){
            if(this.barcode[i].death>0){
                let min_dist = 100;
                let min_ed_key;
                let min_ed_value;
                
                for(let ed_key in this.anim.edges){
                    let ed = this.anim.edges[ed_key];
                    let b_ed;
                    let d_ed;
                    if(ed[3]==="max"){ // compare the function value and period ?
                        b_ed = ed[2].fv;
                        d_ed = ed[0].fv;                    
                    } else if(ed[3]==="min"){ 
                        b_ed = ed[0].fv;
                        d_ed = ed[2].fv;
                    }
                    let b_bar = this.local_max - this.barcode[i].birth;
                    let d_bar = this.local_max - this.barcode[i].death;
                    let dist = Math.abs(b_ed-b_bar)+Math.abs(d_ed-d_bar);
                    if(dist<=min_dist && edgelist.indexOf(ed_key)===-1 && cplist.indexOf(ed[0].id)===-1 && cplist.indexOf(ed[2].id)===-1){
                        min_dist = dist;
                        min_ed_key = ed_key;
                        min_ed_value = ed;
                    }
                }
                
                if(min_ed_key){
                    this.barcode[i].edge = {"key":min_ed_key,"value":min_ed_value};
                    edgelist.push(min_ed_key);
                    cplist.push(min_ed_value[0].id);
                    cplist.push(min_ed_value[2].id);
                }
                
            }
        }
    }
    
    drawPersistence(){
        this.sortBarcode();
        let barHeight = 8;
        let barGap = 5;

        this.svgHeight = (barHeight+barGap)*this.barcode.length + 30;
        d3.select("#phSVG").attr("height",this.svgHeight);

        let xAxis = d3.axisBottom(this.xScale);
        this.xAxisGroup
            .classed("axis", true)
            .style("font-size","7px")
            .style("color","dimgray")
            .attr("transform", "translate(0, "+ this.margin.top + ")")
            .call(xAxis);
        let bars = this.persistenceBarGroup.selectAll("rect").data(this.barcode);
        bars.exit().remove();
        let newbars = bars.enter().append("rect");
        bars = newbars.merge(bars);
        bars
            .attr("x",d=>this.xScale(Math.round(d.birth*10)/10))
            .attr("y",(d,i)=>(i+1)*(barHeight+barGap)+this.margin.top*2)
            .attr("width",d=>{
                if(d.death<0){
                    return this.xScale.range()[1]
                } else {
                    return this.xScale(d.death-d.birth)
                }
            })
            .attr("height",barHeight)
            .attr("id",(d,i)=>"barcode"+i)
            .attr("fill","rgba(187,160,203,1)")
            .on("mouseover",mouseover)
            .on("mouseout",mouseout)

        function mouseover(d){
            d3.select(this).classed("phactive",true);
            if(d.edge!=undefined){
                d3.select("#"+d.edge.key)
                    .style("stroke","red")
                    .style("stroke-width","10");
            }                
        }

        function mouseout(d){
            d3.select(this).classed("phactive",false);
            if(d.edge!=undefined){
                d3.select("#"+d.edge.key)
                    .style("stroke","black")
                    .style("stroke-width","2");
            }
        }

        // **** seems to deal with tiny bars ****
        let cpmax = [];
        this.anim.cp.forEach(p=>{
            if(p.type==="max"){
                cpmax.push(p);
            }
        })
        console.log(cpmax)
        if(this.barcode.length > cpmax.length){
            let unpairNum = this.barcode.length - cpmax.length;
            console.log(unpairNum)
            for(let k=0; k<unpairNum; k++){
                let barId = this.barcode.length-1-k;
                d3.select("#barcode"+barId)
                    .attr("fill","rgb(212,58,129)")
                    .style("visibility","hidden")
            }

        }


    }

    sortBarcode(){ // sort barcode from longest to shortest
        this.barcode.sort(function(a,b){
            if(a.death<0){
                return d3.descending(b.death,a.death);
            } else if(b.death<0){
                return d3.descending(a.death,b.death);
            } else {
                return d3.descending(a.death-a.birth,b.death-b.birth);
            }
            
        })
    }
}