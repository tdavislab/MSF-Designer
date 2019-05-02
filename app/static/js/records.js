class editStep{
    constructor(cp,edges,edgeMapper){
        this.cp = cp;
        this.edges = edges;
        this.edgeMapper = edgeMapper;
    }
}

class records{
    constructor(anim){
        this.anim = anim;

        this.margin = {"top":20,"bottom":20,"left":20,"right":20,"betweenstep":50};
        this.svgWidth = 1500;
        this.svgHeight = 350;
        this.frameWidth = 300;
        this.frameHeight = 300;
        this.svg = d3.select("#undogroup").append("svg")
            .attr("id","undoSVG")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight);
        this.recordgroup1 = this.svg.append("g")
            .attr("id","record1");
        this.recordgroup2 = this.svg.append("g")
            .attr("id","record2");
        this.recordgroup3 = this.svg.append("g")
            .attr("id","record3");

        this.stepRecorder = [];
        this.figureIdx = 1;
        this.addStep();
        // this.addStep();
        console.log(this.stepRecorder)

        this.xMap = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.frameWidth]);
        this.yMap = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.frameHeight]);
        this.curveMap = d3.line()
            .x(d=>this.xMap(d.x))
            .y(d=>this.yMap(d.y))
            .curve(d3.curveCardinal.tension(0));

        this.recordgroup1.append("rect")
            .attr("x",this.margin.left)
            .attr("y",this.margin.top)
            .attr("width",this.frameWidth)
            .attr("height",this.frameHeight)
            .attr("stroke","white")
            .attr("fill", "none");
        
        this.recordgroup2.append("rect")
            .attr("x",this.margin.left+this.frameWidth+this.margin.betweenstep)
            .attr("y",this.margin.top)
            .attr("width",this.frameWidth)
            .attr("height",this.frameHeight)
            .attr("stroke","white")
            .attr("fill", "none");
        
        this.recordgroup3.append("rect")
            .attr("x",this.margin.left+2*this.frameWidth+2*this.margin.betweenstep)
            .attr("y",this.margin.top)
            .attr("width",this.frameWidth)
            .attr("height",this.frameHeight)
            .attr("stroke","white")
            .attr("fill", "none");
        
        this.drawStep()
            


    }
    
    addStep(){
        let step = new editStep(this.anim.cp, this.anim.edges, this.anim.edgeMapper);
        this.stepRecorder.push(step);

    }

    drawStep(){
        for(let j=1;j<=3;j++){
            console.log(j)
            if(this.stepRecorder[j-1]!=undefined){
                d3.select("#record"+j).select("rect")
                    .attr("stroke","rgb(44,123,246)")
                let step = this.stepRecorder[j-1]
                let edgelist = d3.entries(step.edges);
                console.log(d3.select("#record"+j))
                let edges = d3.select("#record"+j).selectAll("path").data(edgelist);
                edges.exit().remove();
                let newedges = edges.enter().append("path");
                edges = newedges.merge(edges);
                edges
                    .attr("d",(d)=>{
                        let d_new = d.value.slice(0,3);
                        return this.curveMap(d_new);
                    })
                    .attr("class",(d)=>d.value[3]+"edge") // minedge/maxedge
                    .attr("transform","translate("+(this.margin.left+(j-1)*this.frameWidth + (j-1)*this.margin.betweenstep)+","+this.margin.top+")")
                    // .attr("id",(d)=>d.key)
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
                    .attr("cx",(d)=>this.xMap(d.x)+this.margin.left+(j-1)*this.frameWidth + (j-1)*this.margin.betweenstep)
                    .attr("cy",(d)=>this.yMap(d.y)+this.margin.top)
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
                    .attr("x",(d)=>this.xMap(d.x)+this.margin.left+(j-1)*this.frameWidth + (j-1)*this.margin.betweenstep)
                    .attr("y",(d)=>this.yMap(d.y)+this.margin.top)
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

    undoStep(){

    }
}