class sliders{
    constructor(anim){
        this.anim = anim;
        this.svgWidth = 300;
        this.svgHeight = 400;
        this.svg = d3.select("#functionValues").append("svg")
            .attr("width",this.svgWidth)
            .attr("height",this.svgHeight)
            .style("opacity",0);
        this.slidersgroup = this.svg.append("g")
            .attr("id","slidersgroup");
        this.slidershowgroup = this.svg.append("g")
            .attr("id","slidershowgroup");
        this.sliderhandlegroup = this.svg.append("g")
            .attr("id","sliderhandlegroup");
        this.sliderlabelgroup = this.svg.append("g")
            .attr("id","sliderlabelgroup")
        this.xMap = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.svgWidth-60]);
        
        this.addSlider();
        let ifShow = false;
        d3.select("#enableFV")
            .on("click",()=>{
                if(ifShow){
                    ifShow = false;
                    d3.select("#functionValues").select("svg")
                        .style("opacity",0)
                    d3.select("#enableFV")
                        .attr("value","Enable Function Value Control")
                        // .attr("class", "btn btn-outline-primary btn-block")
                    
                } else {
                    ifShow = true;
                    d3.select("#functionValues").select("svg")
                        .style("opacity",1)
                    d3.select("#enableFV")
                        .attr("value","Disable Function Value Control")
                        // .attr("class","btn btn-primary btn-block")
                }
            })
    }
    addSlider(){
        this.yMap = d3.scaleLinear()
            .domain([0, this.anim.cp.length])
            .range([0, this.svgHeight]);
        let that = this;
        let sliders = this.slidersgroup.selectAll("line").data(this.anim.cp);
        sliders.exit().remove();
        let newsliders = sliders.enter().append("line");
        sliders = newsliders.merge(sliders);
        sliders
            .attr("class", "track")
            .attr("x1", this.xMap.range()[0])
            .attr("x2", this.xMap.range()[1])
            .attr("y1", (d,i)=>this.yMap(i+0.5))
            .attr("y2",(d,i)=>this.yMap(i+0.5))

        let handles = this.sliderhandlegroup.selectAll("circle").data(this.anim.cp);
        handles.exit().remove();
        let newhandles = handles.enter().append("circle");
        handles = newhandles.merge(handles);
        handles
            .attr("class", (d)=>"handle "+d.type)
            .attr("id",(d,i)=>"handle"+i)
            .attr("cx",d=>this.xMap(d.fv))
            .attr("cy",(d,i)=>this.yMap(i+0.5))
            .attr("r", 12)
            .on("mouseover",mouseover)
            .on("mouseout",mouseout)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
        
        let showbars = this.slidershowgroup.selectAll("line").data(this.anim.cp);
        showbars.exit().remove();
        let newshowbars = showbars.enter().append("line");
        showbars = newshowbars.merge(showbars);
        showbars
            .attr("class", (d)=>"showbar "+d.type)
            .attr("id",(d,i)=>"showbar"+i)
            .attr("x1", this.xMap.range()[0])
            .attr("x2", (d,i)=>(d3.select("#handle"+i).attr("cx")))
            .attr("y1", (d,i)=>this.yMap(i+0.5))
            .attr("y2",(d,i)=>this.yMap(i+0.5))

        
        let values = this.slidersgroup.selectAll("text").data(this.anim.cp);
        values.exit().remove();
        let newvalues = values.enter().append("text");
        values = newvalues.merge(values);
        values
            .attr("class","values")
            .attr("id",(d,i)=>"value"+i)
            .attr("x",this.svgWidth-40)
            .attr("y",(d,i)=>this.yMap(i+0.5)+6)
            .text((d,i)=>Math.round(that.xMap.invert(d3.select("#handle"+i).attr("cx")*100))/100);
        
        let labels = this.sliderlabelgroup.selectAll("text").data(this.anim.cp);
        labels.exit().remove();
        let newlabels = labels.enter().append("text");
        labels = newlabels.merge(labels);
        labels
            .attr("class",(d)=>"label "+d.type)
            .attr("x",this.xMap.range()[0])
            .attr("y",(d,i)=>this.yMap(i+0.4))
            .text((d,i)=>(i+1));
        
        function mouseover(){
            d3.select(this)
                .classed("mouseover",true);
        }

        function mouseout(){
            d3.select(this)
                .classed("mouseover",false);

        }
        
        function dragstarted(d) {
            d3.select(this).raise().classed("active", true)
                .classed("mouseover",true);
        }
        function dragged(d,i){
            d3.select(this)
                .classed("mouseover",true);
            let p = d3.mouse(this)[0];
            if (p<that.xMap(0)){
                p=that.xMap(0);
            } else if(p>that.xMap(1)){
                p=that.xMap(1);
            }
            d3.select(this).attr("cx",p);
            d3.select("#value"+i).text(Math.round(that.xMap.invert(p)*100)/100);
            d3.select("#showbar"+i).attr("x2",p);
        }

        function dragended(d) {
            d3.select(this).classed("active", false)
                .classed("mouseover",false);
        }

    }
    findValueRange(){
        
    }
}