class moves{
    constructor(anim, sliders, persistence){
        this.anim = anim;
        this.sliders = sliders;
        this.persistence = persistence;

        this.apType = "";
        this.amType = "";
        this.bpType = "";
        this.bmType = "";
        this.cpType = "";
        this.cmType = "";
        this.dpType = "";
        this.dmType = "";
        this.dpeType = "";
        this.dmeType = "";

    }

    amovePlus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = this.anim.xMapReverse(d3.event.x-80);
                let y = this.anim.yMapReverse(d3.event.y-100+7.5);
                let mincp = this.anim.findMinPt({"x":x,"y":y},this.anim.cp);
                if(this.apType === "max"){
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"max"))
                    this.apType = "saddle";
                    // d3.select("#amoveplus")
                        // .attr("value","Add a saddle point")
                    // this.anim.cp.push([(x+mincp[0])/2,(y+mincp[1])/2,-1,1,this.anim.fmax(1,0.25,0,this.anim.sigma)])
                    this.anim.cp.push(new criticalPoint(id+1,(x+mincp.x)/2,(y+mincp.y)/2,"saddle"))
                // }
                // else if(this.apType === "saddle"){
                    // this.anim.cp.push([x,y,-1,1]);
                    this.anim.drawFlag=true;
                    d3.select("#annotation")
                        .on("click", ()=>{this.anim.drawFlag = (this.anim.drawFlag) ? false : true;});
                    d3.select("#amoveplus")
                        .attr("value","A+ move")
                    this.apType="";
                    // let cp_new = []
                    // for(let i=0;i<this.cp.length;i++){
                    //     let type = this.cp[i].slice(2);
                    //     if(type.join()===[1,1].join()||type.join()===[-1,-1].join()){
                    //         cp_new.push(this.cp[i]);
                    //     }
                    // }
                    // cp_new.push([x,y,-1,1]);
                    // let edges_new = this.findEdges(cp_new); // in this way, the old edge information will not be overwritten
                    // for(let i=0;i<edges_new.length;i++){
                    //     this.edges.push(edges_new[i]);
                    // }
                    this.anim.edges = this.anim.findEdges(this.anim.cp);
                    for(let i=0;i<this.anim.edges.length;i++){
                        if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
                            this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
                        }
                    }
                    this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
                    this.anim.grad = this.anim.initializeMesh(this.anim.sigma);
                }
                this.anim.drawAnnotation();
                this.anim.addedges();
                this.sliders.addSlider();
                this.anim.findNearestPoint();
                this.anim.findRange();
                // this.persistence.calPersistence();
                // this.persistence.drawPersistence();
            })
    }

    amoveMinus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = this.anim.xMapReverse(d3.event.x-80);
                let y = this.anim.yMapReverse(d3.event.y-30+7.5);
                if(this.amType === "min"){
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"min"))
                    // this.anim.cp.push([x,y,-1,-1]);
                    this.amType = "saddle";
                    d3.select("#amoveminus")
                        .attr("value","Add a saddle point")
                }
                else if(this.amType === "saddle"){
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"saddle"))
                    // this.anim.cp.push([x,y,-1,1]);
                    this.anim.drawFlag=true;
                    d3.select("#annotation")
                        .on("click", ()=>{this.anim.drawFlag = (this.anim.drawFlag) ? false : true;});
                    d3.select("#amoveminus")
                        .attr("value","A- move")
                    this.amType="";
                    // let cp_new = []
                    // for(let i=0;i<this.cp.length;i++){
                    //     let type = this.cp[i].slice(2);
                    //     if(type.join()===[1,1].join()||type.join()===[-1,-1].join()){
                    //         cp_new.push(this.cp[i]);
                    //     }
                    // }
                    // cp_new.push([x,y,-1,1]);
                    // let edges_new = this.findEdges(cp_new);
                    // for(let i=0;i<edges_new.length;i++){
                    //     this.edges.push(edges_new[i]);
                    // }
                    this.anim.edges = this.anim.findEdges(this.anim.cp);
                    for(let i=0;i<this.anim.edges.length;i++){
                        if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
                            this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
                        }
                    }
                    this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
                    this.anim.grad = this.anim.constructMesh(this.anim.sigma);
                }
                this.anim.drawAnnotation();
                this.anim.addedges();
                this.sliders.addSlider();
                this.anim.findNearestPoint();
                this.anim.findRange();
            })
    }

    bmovePlus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = this.anim.xMapReverse(d3.event.x-80);
                let y = this.anim.yMapReverse(d3.event.y-30+7.5);
                if(this.bpType === "max"){
                    // this.anim.cp.push([x,y,1,1]);
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"max"))
                    this.bpType = "saddle1";
                    d3.select("#bmoveplus")
                        .attr("value","Add a saddle point");
                }
                else if(this.bpType === "saddle1"){
                    // this.anim.cp.push([x,y,-1,1]);  
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"saddle"))
                    this.bpType="min";                  
                    d3.select("#bmoveplus")
                        .attr("value","Add a min point");
                }
                else if(this.bpType === "min"){
                    // this.anim.cp.push([x,y,-1,-1]); 
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"min")) 
                    this.bpType="saddle2";                  
                    d3.select("#bmoveplus")
                        .attr("value","Add a saddle point");
                }
                else if(this.bpType === "saddle2"){
                    // this.anim.cp.push([x,y,-1,1]);
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"saddle"))
                    this.anim.drawFlag=true;
                    d3.select("#annotation")
                        .on("click", ()=>{this.anim.drawFlag = (this.anim.drawFlag) ? false : true;});
                    d3.select("#bmoveplus")
                        .attr("value","B+ move")
                    this.bpType="";
                    // let cp_new = []
                    // for(let i=0;i<this.cp.length;i++){
                    //     let type = this.cp[i].slice(2);
                    //     if(type.join()===[1,1].join()||type.join()===[-1,-1].join()){
                    //         cp_new.push(this.cp[i]);
                    //     }
                    // }
                    // cp_new.push([x,y,-1,1]);
                    // let edges_new = this.findEdges(cp_new);
                    // for(let i=0;i<edges_new.length;i++){
                    //     this.edges.push(edges_new[i]);
                    // }
                    this.anim.edges = this.anim.findEdges(this.anim.cp);

                }
                for(let i=0;i<this.anim.edges.length;i++){
                    if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
                        this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
                    }
                }
                this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
                this.anim.grad = this.anim.constructMesh(this.anim.sigma);
                this.anim.drawAnnotation();
                this.anim.addedges();
                this.sliders.addSlider();
                this.anim.findNearestPoint();
                this.anim.findRange();
            })
    }

    bmoveMinus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = this.anim.xMapReverse(d3.event.x-80);
                let y = this.anim.yMapReverse(d3.event.y-30+7.5);
                if(this.bmType === "min"){
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"min"))
                    // this.anim.cp.push([x,y,-1,-1]);
                    this.bmType = "saddle1";
                    d3.select("#bmoveminus")
                        .attr("value","Add a saddle point");
                }
                else if(this.bmType === "saddle1"){
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"saddle"))
                    // this.anim.cp.push([x,y,-1,1]);  
                    this.bmType="max";                  
                    d3.select("#bmoveminus")
                        .attr("value","Add a max point");
                }
                else if(this.bmType === "max"){
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"max"))
                    // this.anim.cp.push([x,y,1,1]);  
                    this.bmType="saddle2";                  
                    d3.select("#bmoveminus")
                        .attr("value","Add a saddle point");
                }
                else if(this.bmType === "saddle2"){
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"saddle"))
                    // this.anim.cp.push([x,y,-1,1]);
                    this.anim.drawFlag=true;
                    d3.select("#annotation")
                        .on("click", ()=>{this.anim.drawFlag = (this.anim.drawFlag) ? false : true;});
                    d3.select("#bmoveminus")
                        .attr("value","B- move")
                    this.bmType="";
                    // let cp_new = []
                    // for(let i=0;i<this.cp.length;i++){
                    //     let type = this.cp[i].slice(2);
                    //     if(type.join()===[1,1].join()||type.join()===[-1,-1].join()){
                    //         cp_new.push(this.cp[i]);
                    //     }
                    // }
                    // cp_new.push([x,y,-1,1]);
                    // let edges_new = this.findEdges(cp_new);
                    // for(let i=0;i<edges_new.length;i++){
                    //     this.edges.push(edges_new[i]);
                    // }
                    this.anim.edges = this.anim.findEdges(this.anim.cp);

                }
                for(let i=0;i<this.anim.edges.length;i++){
                    if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
                        this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
                    }
                }
                this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
                this.anim.grad = this.anim.constructMesh(this.anim.sigma);
                this.anim.drawAnnotation();
                this.anim.addedges();
                this.sliders.addSlider();
                this.anim.findNearestPoint();
                this.anim.findRange();
            })

    }

    cmovePlus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = this.anim.xMapReverse(d3.event.x-80);
                let y = this.anim.yMapReverse(d3.event.y-30+7.5);
                if(this.cpType === "max"){
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"max"))
                    // this.anim.cp.push([x,y,1,1]);
                    this.cpType = "saddle";
                    d3.select("#cmoveplus")
                        .attr("value","Add a saddle point")
                }
                else if(this.cpType === "saddle"){
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"saddle"))
                    // this.anim.cp.push([x,y,-1,1]);
                    this.anim.drawFlag=true;
                    d3.select("#annotation")
                        .on("click", ()=>{this.anim.drawFlag = (this.anim.drawFlag) ? false : true;});
                    d3.select("#cmoveplus")
                        .attr("value","C+ move")
                    this.cpType="";
                    // let cp_new = []
                    // for(let i=0;i<this.cp.length;i++){
                    //     let type = this.cp[i].slice(2);
                    //     if(type.join()===[1,1].join()||type.join()===[-1,-1].join()){
                    //         cp_new.push(this.cp[i]);
                    //     }
                    // }
                    // cp_new.push([x,y,-1,1]);
                    // let edges_new = this.findEdges(cp_new); // in this way, the old edge information will not be overwritten
                    // for(let i=0;i<edges_new.length;i++){
                    //     this.edges.push(edges_new[i]);
                    // }
                    this.anim.edges = this.anim.findEdges(this.anim.cp);
                }
                for(let i=0;i<this.anim.edges.length;i++){
                    if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
                        this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
                    }
                }
                this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
                this.anim.grad = this.anim.constructMesh(this.anim.sigma);
                this.anim.drawAnnotation();
                this.anim.addedges();
                this.sliders.addSlider();
                this.anim.findNearestPoint();
                this.anim.findRange();
            })
    }

    cmoveMinus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = this.anim.xMapReverse(d3.event.x-80);
                let y = this.anim.yMapReverse(d3.event.y-30+7.5);
                if(this.cmType === "min"){
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"min"))
                    // this.anim.cp.push([x,y,-1,-1]);
                    this.cmType = "saddle";
                    d3.select("#cmoveminus")
                        .attr("value","Add a saddle point")
                }
                else if(this.cmType === "saddle"){
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,x,y,"saddle"))
                    // this.anim.cp.push([x,y,-1,1]);
                    this.anim.drawFlag=true;
                    d3.select("#annotation")
                        .on("click", ()=>{this.anim.drawFlag = (this.anim.drawFlag) ? false : true;});
                    d3.select("#cmoveminus")
                        .attr("value","C- move")
                    this.cmType="";
                    // let cp_new = []
                    // for(let i=0;i<this.cp.length;i++){
                    //     let type = this.cp[i].slice(2);
                    //     if(type.join()===[1,1].join()||type.join()===[-1,-1].join()){
                    //         cp_new.push(this.cp[i]);
                    //     }
                    // }
                    // cp_new.push([x,y,-1,1]);
                    // let edges_new = this.findEdges(cp_new);
                    // for(let i=0;i<edges_new.length;i++){
                    //     this.edges.push(edges_new[i]);
                    // }
                    this.anim.edges = this.anim.findEdges(this.anim.cp);

                }
                for(let i=0;i<this.anim.edges.length;i++){
                    if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
                        this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
                    }
                }
                this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
                this.anim.grad = this.anim.constructMesh(this.anim.sigma);
                this.anim.drawAnnotation();
                this.anim.addedges();
                this.sliders.addSlider();
                this.anim.findNearestPoint();
                this.anim.findRange();
            })
    }
    dmovePlus(){
        d3.select("#annotation")
            .on("click",()=>{
                //****  need to check whether it is a max point !!****
                if(this.dpType="add"){
                    let x = this.anim.xMapReverse(d3.event.x-80);
                    let y = this.anim.yMapReverse(d3.event.y-30+7.5);
                    let cp = this.anim.findMinPt({"x":x,"y":y},this.anim.cp)
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,cp.x,cp.y,"saddle"))
                    this.anim.cp.push(new criticalPoint(id+1,cp.x+0.05,cp.y-0.05,"max"))
                    this.anim.cp[cp.id].x = cp.x - 0.05;
                    this.anim.cp[cp.id].y = cp.y + 0.05;
                    this.anim.drawFlag=true;
                    d3.select("#annotation")
                        .on("click", ()=>{this.anim.drawFlag = (this.anim.drawFlag) ? false : true;});
                    this.dpType=""
                    this.anim.edges = this.anim.findEdges(this.anim.cp);
                    d3.select("#dmoveplus")
                        .attr("value","D+ Move");


                }
                for(let i=0;i<this.anim.edges.length;i++){
                    if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
                        this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
                    }
                }
                this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
                this.anim.grad = this.anim.constructMesh(this.anim.sigma);
                this.anim.drawAnnotation();
                this.anim.addedges();
                this.sliders.addSlider();
                this.anim.findNearestPoint();
                this.anim.findRange();

                
                // console.log(cp)
            })
    }
    dmoveMinus(){
        d3.select("#annotation")
            .on("click",()=>{
                if(this.dmType="add"){
                    //****  need to check whether it is a min point !!****
                    let x = this.anim.xMapReverse(d3.event.x-80);
                    let y = this.anim.yMapReverse(d3.event.y-30+7.5);
                    let cp = this.anim.findMinPt({"x":x,"y":y},this.anim.cp)
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,cp.x,cp.y,"saddle"))
                    this.anim.cp.push(new criticalPoint(id+1,cp.x+0.05,cp.y-0.05,"min"))
                    this.anim.cp[cp.id].x = cp.x - 0.05;
                    this.anim.cp[cp.id].y = cp.y + 0.05;
                    this.anim.drawFlag=true;
                    d3.select("#annotation")
                        .on("click", ()=>{this.anim.drawFlag = (this.anim.drawFlag) ? false : true;});
                    this.dmType=""
                    this.anim.edges = this.anim.findEdges(this.anim.cp);
                    d3.select("#dmoveminus")
                        .attr("value","D- Move");


                }
                for(let i=0;i<this.anim.edges.length;i++){
                    if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
                        this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
                    }
                }
                this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
                this.anim.grad = this.anim.constructMesh(this.anim.sigma);
                this.anim.drawAnnotation();
                this.anim.addedges();
                this.sliders.addSlider();
                this.anim.findNearestPoint();
                this.anim.findRange();

                
                // console.log(cp)
            })
    }
    dmoveEvenPlus(){
        d3.select("#annotation")
            .on("click",()=>{
                if(this.dpeType="add"){
                    //****  need to check whether it is a min point !!****
                    let x = this.anim.xMapReverse(d3.event.x-80);
                    let y = this.anim.yMapReverse(d3.event.y-30+7.5);
                    let cp = this.anim.findMinPt({"x":x,"y":y},this.anim.cp)
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,cp.x,cp.y,"max"))
                    this.anim.cp.push(new criticalPoint(id+1,cp.x+0.05,cp.y-0.05,"saddle"))
                    this.anim.cp[cp.id].x = cp.x - 0.05;
                    this.anim.cp[cp.id].y = cp.y + 0.05;
                    this.anim.drawFlag=true;
                    d3.select("#annotation")
                        .on("click", ()=>{this.anim.drawFlag = (this.anim.drawFlag) ? false : true;});
                    this.dpeType=""
                    this.anim.edges = this.anim.findEdges(this.anim.cp);
                    d3.select("#dmoveevenplus")
                        .attr("value","D+ Even Move");


                }
                for(let i=0;i<this.anim.edges.length;i++){
                    if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
                        this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
                    }
                }
                this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
                this.anim.grad = this.anim.constructMesh(this.anim.sigma);
                this.anim.drawAnnotation();
                this.anim.addedges();
                this.sliders.addSlider();
                this.anim.findNearestPoint();
                this.anim.findRange();

                
                // console.log(cp)
            })
    }

    dmoveEvenMinus(){
        d3.select("#annotation")
            .on("click",()=>{
                if(this.dmeType="add"){
                    //****  need to check whether it is a min point !!****
                    let x = this.anim.xMapReverse(d3.event.x-80);
                    let y = this.anim.yMapReverse(d3.event.y-30+7.5);
                    let cp = this.anim.findMinPt({"x":x,"y":y},this.anim.cp)
                    let id = this.anim.cp.length;
                    this.anim.cp.push(new criticalPoint(id,cp.x,cp.y,"min"))
                    this.anim.cp.push(new criticalPoint(id+1,cp.x+0.05,cp.y-0.05,"saddle"))
                    this.anim.cp[cp.id].x = cp.x - 0.05;
                    this.anim.cp[cp.id].y = cp.y + 0.05;
                    this.anim.drawFlag=true;
                    d3.select("#annotation")
                        .on("click", ()=>{this.anim.drawFlag = (this.anim.drawFlag) ? false : true;});
                    this.dmeType=""
                    this.anim.edges = this.anim.findEdges(this.anim.cp);
                    d3.select("#dmoveevenminus")
                        .attr("value","D- Even Move");


                }
                for(let i=0;i<this.anim.edges.length;i++){
                    if(Object.keys(this.anim.edgeMapper).indexOf("p"+i)===-1){
                        this.anim.edgeMapper["p"+i] = this.anim.initializeEdgeMapper(this.anim.edges[i]);
                    }
                }
                this.anim.connNodes = this.anim.findConnNodes(this.anim.edges);
                this.anim.grad = this.anim.constructMesh(this.anim.sigma);
                this.anim.drawAnnotation();
                this.anim.addedges();
                this.sliders.addSlider();
                this.anim.findNearestPoint();
                this.anim.findRange();

                
                // console.log(cp)
            })
    }
}