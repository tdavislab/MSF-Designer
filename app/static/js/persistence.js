class persistence{
    constructor(anim){
        // this.anim = anim;
        this.cp = anim.cp;
        this.local_max = 1;
        this.local_min = 0;
        this.margin = {"top":10,"bottom":20,"left":10,"right":10};
        this.svgWidth = 600;
        this.svgHeight = 200;
        this.svg = d3.select("#persistencegroup").append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight);
        this.xAxisGroup = this.svg.append('g')
            .attr('id','xAxis');
        this.persistenceBarGroup = this.svg.append('g')
            .attr("id","persistencebargroup")

        // console.log(this.cp)
        this.calPersistence();
        this.drawPersistence();
    }
    calPersistence(){
        let cp_new = [];
        for(let i=0;i<this.cp.length;i++){
            cp_new.push({"id":this.cp[i].id,"type":this.cp[i].type,"fv":this.cp[i].fv})
        }
        // To avoid two critical points have the same function value.
        let cp_fv = [this.local_min,this.local_max];
        for(let i=0;i<cp_new.length;i++){
            if(cp_fv.indexOf(cp_new[i].fv)!=-1){
                if(cp_new[i].fv === this.local_max){
                    cp_new[i].fv -= Math.random()/100;
                } else {
                    cp_new[i].fv += Math.random()/100;
                }
            }
            cp_fv.push(cp_new[i].fv);
            cp_new[i].fv_new = this.local_max - cp_new[i].fv;
        }
        // cp_new.push({"id":"local_min","fv":this.local_min,"fv_new":this.local_max-this.local_min});
        // cp_new.push({"id":"local_max","fv":this.local_max,"fv_new":0});
        cp_new.sort((a,b)=>d3.ascending(a.fv_new,b.fv_new))

        this.pc = [];
        let numCC = 0;

        for(let i=0;i<cp_new.length;i++){
            if(cp_new[i].type === "max"){ // max is corresponding to the birth of a component
                this.pc.push({"id":this.pc.length, "birth":cp_new[i].fv_new, "death":undefined});
                numCC += 1;
            } else { // saddle/min: corresponding to the death of a component
                // **** need modification ****
                this.pc[0].death = cp_new[i].fv_new;
                numCC -= 1;

            }
        }
        
        console.log(numCC)
        console.log(this.pc)
        // console.log(Math.random()/100)

        // expected output: [{"id":0,"birth":0.1,"death":inf},...]
    }
    drawPersistence(){
        let xScale = d3.scaleLinear()
            .domain([this.local_min, this.local_max])
            .range([0,this.svgWidth-this.margin.right]);
        // let yScale = d3.scaleLinear()

        let xAxis = d3.axisBottom(xScale);
        this.xAxisGroup
            .classed("axis", true)
            .attr("transform", "translate(0," + (this.svgHeight-this.margin.bottom) + ")")
            .call(xAxis);
        let bars = this.persistenceBarGroup.selectAll("rect").data(this.pc);
        bars.exit().remove();
        let newbars = bars.enter().append("rect");
        bars = newbars.merge(bars);
        bars
            .attr("x",d=>xScale(Math.round(d.birth*10)/10))
            .attr("y",(d,i)=>-(i+1)*20+(this.svgHeight-this.margin.bottom))
            .attr("width",d=>{
                if(d.death===undefined){
                    return xScale(1)
                } else {
                    return xScale(d.death-d.birth)
                }
            })
            .attr("height",15)
            .attr("stroke","black")
            .attr("fill","none")


    }
}