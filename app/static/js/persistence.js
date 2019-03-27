class persistence{
    constructor(barcode, anim){
        this.anim = anim;
        // this.cp = anim.cp;
        this.local_max = 10;
        this.local_min = 0;
        this.barcode = barcode;
        console.log(barcode)
        this.margin = {"top":20,"bottom":20,"left":10,"right":10};
        this.svgWidth = 1200;
        this.svgHeight = 300;
        this.svg = d3.select("#persistencegroup").append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight)
            // .style("position","relative")
            // .style("top","5px");
        this.xAxisGroup = this.svg.append('g')
            .attr('id','xAxis');
        this.persistenceBarGroup = this.svg.append('g')
            .attr("id","persistencebargroup")
        // this.arrowMarker = this.svg.append("marker")
        //     .attr("id","arrowmarker")
        //     .attr("markerUnits","strokeWidth")
        //     .attr("markerWidth",12)
        //     .attr("markerHeight",12)
        //     .attr("viewBox","10 10 12 12")
        //     .attr("refX",20)
        //     .attr("refY",20)
        //     .attr("orient","auto")


        // console.log(this.cp)
        // this.calPersistence();
        // this.recoverCP();
        this.drawPersistence();
    }
    recoverCP(){
        for(let i=0;i<this.barcode.length;i++){
            let birth_fv = this.local_max - this.barcode[i].birth;
            let birth_cp = this.findCP(birth_fv);
            let death_cp = undefined;
            if(this.barcode[i].death>0){
                let death_fv = this.local_max - this.barcode[i].death;
                death_cp = this.findCP(death_fv);
            }
            this.barcode[i].birth_cp = birth_cp;
            this.barcode[i].death_cp = death_cp;
        }
    }

    findCP(fv){
        // given the function value, find the cp id
        let min_dist = Math.abs(this.anim.cp[0] - fv);
        let cp = this.anim.cp[0];
        for(let i=1;i<this.anim.cp.length;i++){
            if(Math.abs(this.anim.cp[i].fv - fv)<min_dist){
                cp = this.anim.cp[i];
                min_dist = this.anim.cp[i].fv - fv;
            }
        }
        return cp
    }
    // calPersistence(){
    //     console.log("calculatings")
    //     let cp_new = [];
    //     for(let i=0;i<this.cp.length;i++){
    //         // cp_new.push({"id":this.cp[i].id,"type":this.cp[i].type,"fv":this.cp[i].fv})
    //         cp_new.push(this.cp[i])
    //     }
    //     // To avoid two critical points have the same function value.
    //     let cp_fv = [this.local_min,this.local_max];
    //     for(let i=0;i<cp_new.length;i++){
    //         if(cp_fv.indexOf(cp_new[i].fv)!=-1){
    //             if(cp_new[i].fv === this.local_max){
    //                 cp_new[i].fv -= Math.random()/100;
    //             } else {
    //                 cp_new[i].fv += Math.random()/100;
    //             }
    //         }
    //         cp_fv.push(cp_new[i].fv);
    //         cp_new[i].fv_new = this.local_max - cp_new[i].fv;
    //     }
    //     // cp_new.push({"id":"local_min","fv":this.local_min,"fv_new":this.local_max-this.local_min});
    //     // cp_new.push({"id":"local_max","fv":this.local_max,"fv_new":0});
    //     cp_new.sort((a,b)=>d3.ascending(a.fv_new,b.fv_new))

    //     this.pc = [];
    //     let numCC = 0;

        // for(let i=0;i<cp_new.length;i++){
        //     if(cp_new[i].type === "max"){ // max is corresponding to the birth of a component
        //         this.pc.push({"id":this.pc.length, "birth":cp_new[i].fv_new, "death":undefined,"max_id":i});
        //         numCC += 1;
        //     } else if(cp_new[i].type === "saddle"){ // saddle/min: corresponding to the death of a component
        //         let candidate_max = this.anim.findMinPt(cp_new[i],cp_new[i].np.max);
        //         for(let j=0;j<this.pc.length;j++){
        //             if(this.pc[j].max_id===candidate_max.id){
        //                 this.pc[j].death = cp_new[i].fv_new
        //             }
        //         }
        //         numCC -= 1;
        //     } else if (cp_new[i].type === "min"){
        //         // **** need modification ****
        //         // let candidata_saddle = this.anim.findMinPt(cp_new[i],cp_new[i].np);
        //         // let candidate_max = this.anim.findMinPt(candidata_saddle,candidata_saddle.np.max);
        //     }
        // }
        
        // console.log(numCC)
        // console.log(this.pc)
        // console.log(Math.random()/100)

        // expected output: [{"id":0,"birth":0.1,"death":inf},...]
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
                // d3.select("#p0").style("stroke","red");
            }

            function mouseout(d){
                d3.select(this).classed("phactive",false);
                // d3.select("#p0").style("stroke","black");
            }


    }
}