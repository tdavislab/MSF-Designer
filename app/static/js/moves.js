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

    }

    amovePlus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = this.anim.xMapReverse(d3.event.x-80);
                let y = this.anim.yMapReverse(d3.event.y-100+7.5);
                let mincp = this.anim.findMinPt({"x":x,"y":y},this.anim.cp);
                if(this.apType === "max"){
                    // this.anim.cp.push([x,y,1,1,this.anim.fmax(1,0,0,this.anim.sigma)]);
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
                this.persistence.calPersistence();
                this.persistence.drawPersistence();
            })
    }

    amoveMinus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = this.anim.xMapReverse(d3.event.x-80);
                let y = this.anim.yMapReverse(d3.event.y-30+7.5);
                if(this.amType === "min"){
                    this.anim.cp.push([x,y,-1,-1]);
                    this.amType = "saddle";
                    d3.select("#amoveminus")
                        .attr("value","Add a saddle point")
                }
                else if(this.amType === "saddle"){
                    this.anim.cp.push([x,y,-1,1]);
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
            })
    }

    bmoveMinus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = this.anim.xMapReverse(d3.event.x-80);
                let y = this.anim.yMapReverse(d3.event.y-30+7.5);
                if(this.bmType === "min"){
                    this.anim.cp.push([x,y,-1,-1]);
                    this.bmType = "saddle1";
                    d3.select("#bmoveminus")
                        .attr("value","Add a saddle point");
                }
                else if(this.bmType === "saddle1"){
                    this.anim.cp.push([x,y,-1,1]);  
                    this.bmType="max";                  
                    d3.select("#bmoveminus")
                        .attr("value","Add a max point");
                }
                else if(this.bmType === "max"){
                    this.anim.cp.push([x,y,1,1]);  
                    this.bmType="saddle2";                  
                    d3.select("#bmoveminus")
                        .attr("value","Add a saddle point");
                }
                else if(this.bmType === "saddle2"){
                    this.anim.cp.push([x,y,-1,1]);
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
            })

    }

    cmovePlus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = this.anim.xMapReverse(d3.event.x-80);
                let y = this.anim.yMapReverse(d3.event.y-30+7.5);
                if(this.cpType === "max"){
                    this.anim.cp.push([x,y,1,1]);
                    this.cpType = "saddle";
                    d3.select("#cmoveplus")
                        .attr("value","Add a saddle point")
                }
                else if(this.cpType === "saddle"){
                    this.anim.cp.push([x,y,-1,1]);
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
            })
    }

    cmoveMinus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = this.anim.xMapReverse(d3.event.x-80);
                let y = this.anim.yMapReverse(d3.event.y-30+7.5);
                if(this.cmType === "min"){
                    this.anim.cp.push([x,y,-1,-1]);
                    this.cmType = "saddle";
                    d3.select("#cmoveminus")
                        .attr("value","Add a saddle point")
                }
                else if(this.cmType === "saddle"){
                    this.anim.cp.push([x,y,-1,1]);
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
            })
    }
}