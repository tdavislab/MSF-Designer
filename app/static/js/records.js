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

        this.margin = {"top":20,"bottom":20,"left":10,"right":10};
        this.svgWidth = 1500;
        this.svgHeight = 300;
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
        console.log(this.stepRecorder)

    }
    
    addStep(){
        let step = new editStep(this.anim.cp, this.anim.edges, this.anim.edgeMapper);
        this.stepRecorder.push(step);

    }

    drawStep(step){
        if(this.figureIdx===1){
            // select recordgroup1
            this.figureIdx = 2;
        } else if (this.figureIdx === 2){
            // select recordgroup2
            this.figureIdx = 3;
        } else if (this.figureIdx === 3){
            // select recordgroup3
        }

    }

    undoStep(){
        
    }
}