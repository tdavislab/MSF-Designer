class sliders{
    constructor(anim){
        this.anim = anim;
        this.svgWidth = 300;
        this.svgHeight = 800;
        this.svg = d3.select("#functionValues").append("svg")
            .attr("id","slidersSVG")
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
        this.lowrangegroup = this.svg.append("g")
            .attr("id","lowrangegroup")
        this.highrangegroup = this.svg.append("g")
            .attr("id","highrangegroup")
        
        d3.select("#enableFV").attr("value","Enable Function Value Control");
        
        
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
                    
                } else {
                    ifShow = true;
                    d3.select("#functionValues").select("svg")
                        .style("opacity",1)
                    d3.select("#enableFV")
                        .attr("value","Disable Function Value Control")
                }
            })
    }
    addSlider(){
        this.xMap = [];
        for(let i=0;i<this.anim.cp.length;i++){
            let map = d3.scaleLinear()
                        .domain([this.anim.cp[i].lvalue, this.anim.cp[i].uvalue])
                        .range([0, this.svgWidth-60]);
            this.xMap.push(map)
        } 
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
            .attr("x1", (d,i)=>this.xMap[i](d.lvalue))
            .attr("x2", (d,i)=>this.xMap[i](d.uvalue))
            .attr("y1", (d,i)=>this.yMap(i+0.5))
            .attr("y2",(d,i)=>this.yMap(i+0.5))

        let handles = this.sliderhandlegroup.selectAll("circle").data(this.anim.cp);
        handles.exit().remove();
        let newhandles = handles.enter().append("circle");
        handles = newhandles.merge(handles);
        handles
            .attr("class", (d)=>"handle "+d.type)
            .attr("id",(d,i)=>"handle"+i)
            .attr("cx",(d,i)=>this.xMap[i](d.fv))
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
            .attr("x1", (d,i)=>this.xMap[i](d.lvalue))
            .attr("x2", (d,i)=>this.xMap[i](d.fv))
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
            .text(d=>Math.round(d.fv*10)/10)
            ;
        
        let labels = this.sliderlabelgroup.selectAll("text").data(this.anim.cp);
        labels.exit().remove();
        let newlabels = labels.enter().append("text");
        labels = newlabels.merge(labels);
        labels
            .attr("class",(d)=>"label "+d.type)
            .attr("x",(d,i)=>this.xMap[i].range()[d.lvalue])
            .attr("y",(d,i)=>this.yMap(i+0.5)-10)
            .text((d,i)=>(i+1));

        let ranges_low = this.lowrangegroup.selectAll("text").data(this.anim.cp);
        ranges_low.exit().remove();
        let newranges_low = ranges_low.enter().append("text");
        ranges_low = newranges_low.merge(ranges_low);
        ranges_low
            // .attr("class",(d)=>"label "+d.type)
            .attr("x",(d,i)=>this.xMap[i](d.lvalue))
            .attr("y",(d,i)=>this.yMap(i+0.5)+25)
            .attr("id",(d,i)=>"low"+i)
            .text((d)=>Math.round(d.lvalue*10)/10)

        
        let ranges_high = this.highrangegroup.selectAll("text").data(this.anim.cp);
        ranges_high.exit().remove();
        let newranges_high = ranges_high.enter().append("text");
        ranges_high = newranges_high.merge(ranges_high);
        ranges_high
            // .attr("class",(d)=>"label "+d.type)
            .attr("x",(d,i)=>this.xMap[i](d.uvalue))
            .attr("y",(d,i)=>this.yMap(i+0.5)+25)
            .attr("id",(d,i)=>"high"+i)
            .text((d)=>Math.round(d.uvalue*10)/10)
        
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
            if (p<that.xMap[i](d.lvalue)){
                p=that.xMap[i](d.lvalue);
            } else if(p>that.xMap[i](d.uvalue)){
                p=that.xMap[i](d.uvalue);
            }
            
            d.fv = that.xMap[i].invert(p);
            that.anim.findRange();
            // that.anim.constructMesh();
            for(let j=0;j<that.anim.cp.length;j++){
                let map = d3.scaleLinear()
                            .domain([that.anim.cp[j].lvalue, that.anim.cp[j].uvalue])
                            .range([0, that.svgWidth-60]);
                that.xMap[j] = map;
            } 
            for(let j=0;j<that.anim.cp.length;j++){
                d3.select("#high"+j).text(Math.round(that.anim.cp[j].uvalue*10)/10)
                d3.select("#low"+j).text(Math.round(that.anim.cp[j].lvalue*10)/10)

            }

            d3.select("#high")
            d3.select(this).attr("cx",p);
            d3.select("#value"+i).text(Math.round(that.xMap[i].invert(p)*10)/10);
            // console.log(that.xMap[i].invert(p))
            d3.select("#showbar"+i).attr("x2",p);
            console.log("critical point",that.anim.cp)
            that.anim.grad = that.anim.constructMesh(that.anim.sigma)
        }

        function dragended(d) {
            d3.select(this).classed("active", false)
                .classed("mouseover",false);
        }

    }
}