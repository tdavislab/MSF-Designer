class anim{
    constructor() {
        this.canvasWidth = document.getElementById('animation').offsetWidth;
        this.canvasHeight = document.getElementById('animation').offsetHeight;
        this.svg = d3.select("#annotation");
        this.pointsGroup = this.svg.append("g")
            .attr("id","pointgroup")

        this.drawFlag = true;
        // this.cp = [[0.25,0.5,1,1],[0.75,0.5,1,1],[0.5,0.5,-1,1]];
        this.cp = [[0.5,0.5,1,1]];
        this.sigma = 0.1;

        //// curve ////
        let N = 60; // 25^2 curves
        // discretize the vfield coords
        this.xp = d3.range(N).map(
                function (i) {
                    return i/N;
                });
        this.yp = d3.range(N).map(
                function (i) {
                    return i/N;
                });

        this.xMap = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.canvasWidth]);
        this.yMap = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.canvasHeight]);
        this.xMapReverse = d3.scaleLinear()
            .domain([0, this.canvasWidth])
            .range([0, 1]);
        this.yMapReverse = d3.scaleLinear()
            .domain([0, this.canvasHeight])
            .range([0, 1]);
        


        this.cellBound = {"upper":[0.5,0], "lower":[0.5,1]};
        this.edges = this.findEdges(this.cp);
        this.animation("original");
       

        this.adbound = false;
        d3.select("#adbound")
            .on("click",()=>{
                if(this.adbound === false){
                    d3.select("#adbound")
                        .attr("class","btn btn-primary")
                        .attr("value","Finish Adjustment")
                    this.adbound = true;
                    this.adjustBound();
                } else { 
                    d3.select("#adbound")
                        .attr("class","btn btn-secondary")
                        .attr("value","Adjust Bound")
                    this.adbound = false;
                }
            })
  
        this.gradmax = this.constructMesh(this.sigma,[1,1])
        this.gradsaddle1 = this.constructMesh(this.sigma, [-1,1])
        this.gradsaddle2 = this.constructMesh(this.sigma, [1,-1])
        this.gradmin = this.constructMesh(this.sigma,[-1,-1])

        this.apType = "";
        this.amType = "";
        
    }

    amovePlus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = Anim.xMapReverse(d3.event.x-10);
                let y = Anim.yMapReverse(d3.event.y-100);
                if(this.apType === "max"){
                    this.cp.push([x,y,1,1]);
                    this.apType = "saddle";
                    d3.select("#amoveplus")
                        .attr("value","Add a saddle point")
                }
                else if(this.apType === "saddle"){
                    this.cp.push([x,y,-1,1]);
                    this.drawFlag=true;
                    d3.select("#annotation")
                        .on("click", ()=>{this.drawFlag = (this.drawFlag) ? false : true;});
                    d3.select("#amoveplus")
                        .attr("value","A+ move")
                    this.apType="";
                }
                this.drawAnnotation();
            })
    }
    amoveMinus(){
        d3.select("#annotation")
            .on("click", ()=>{
                let x = Anim.xMapReverse(d3.event.x-10);
                let y = Anim.yMapReverse(d3.event.y-100);
                if(this.amType === "min"){
                    this.cp.push([x,y,-1,-1]);
                    this.amType = "saddle";
                    d3.select("#amoveminus")
                        .attr("value","Add a saddle point")
                }
                else if(this.amType === "saddle"){
                    this.cp.push([x,y,-1,1]);
                    this.drawFlag=true;
                    d3.select("#annotation")
                        .on("click", ()=>{this.drawFlag = (this.drawFlag) ? false : true;});
                    d3.select("#amoveminus")
                        .attr("value","A- move")
                    this.amType="";
                }
                this.drawAnnotation();
            })
    }

    drawAnnotation(){
        let circles = this.pointsGroup.selectAll("circle").data(this.cp)
        circles.exit().remove();
        let newcircles = circles.enter().append("circle")
        circles = newcircles.merge(circles);
        circles
            .attr("cx",(d)=>this.xMap(d[0]))
            .attr("cy",(d)=>this.yMap(d[1]))
            .attr("r",10)
            .attr("fill",(d)=>{
                if(d[2]===1&&d[3]===1){
                    return "red"
                } else if ((d[2]===-1&&d[3]===1)||(d[2]===1&&d[3]===-1)){
                    return "green"
                } else if (d[2]===-1&&d[3]===-1){
                    return "blue"
                }
            })
            .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            let that=this;

            function dragstarted(d) {
                d3.select(this).raise().classed("active", true);
              }
              
              function dragged(d,i) {
                d3.select(this).attr("cx", d[0] = that.xMapReverse(d3.event.x)).attr("cy", d[1] = that.yMapReverse(d3.event.y));
                that.cp[i][0] = that.xMapReverse(d3.event.x);
                that.cp[i][1] = that.yMapReverse(d3.event.y);
              }
              
              function dragended(d) {
                d3.select(this).classed("active", false);
              }
    }

    adjustBound(){
        document.getElementById("animation").addEventListener("click",event=>{
            if(this.adbound === true){
                this.drawFlag = true;
                let x = this.xMapReverse(event.x);
                let y = this.yMapReverse(event.y);
                console.log("x,y",x,y)
                if(y<=0.5){
                    this.cellBound.upper[0] = x;
                } else { this.cellBound.lower[0] = x;}
            }
        })   
    }


    drawCellBound(bound){
        let g = d3.select("#animation").node().getContext("2d");
        g.beginPath();
        g.moveTo(this.xMap(0.5), this.yMap(0.5)); 
        g.lineTo(this.xMap(bound.upper[0]), this.yMap(bound.upper[1]));
        g.lineWidth = 1;
        g.strokeStyle = "white";
        g.stroke();

        g.beginPath();
        g.moveTo(this.xMap(0.5), this.yMap(0.5)); 
        g.lineTo(this.xMap(bound.lower[0]), this.yMap(bound.lower[1]));
        g.lineWidth = 1;
        g.strokeStyle = "white";
        g.stroke();
    }

    

    constructMesh(sigma,idx){
        let grad_new = [];
        for(let x=0;x<=1;x+=0.025){
            for(let y=0;y<=1;y+=0.05){
                let dx = idx[0]*(1/sigma) * (x-0.5) * Math.exp(-(Math.pow(x-0.5,2)+Math.pow(y-0.5,2))/sigma);
                let dy = idx[1]*(1/sigma) * (y-0.5) * (Math.exp(-(Math.pow(x-0.5,2)+Math.pow(y-0.5,2))/sigma));
                grad_new.push([x,y,dx,dy]);
            }
        }
        grad_new.sort(function(x,y){
            return d3.ascending(x[0],y[0]) || d3.ascending(x[1],y[1]);
        })
        console.log(grad_new)
        return grad_new;

    }

    findV(x,y, grad){
        let x1 = Math.floor(x/0.025);
        let x2 = x1+1;
        let y1 = Math.floor(y/0.05);
        let y2 = y1+1;

        let triang = [grad[x1*20+y1], grad[x2*20+y1], grad[x2*20+y2]];

        let ex_v = [0,0]
        for(let i=0;i<3;i++){
            if(typeof triang[i]!="undefined"){
                ex_v[0] += 1/3*triang[i][2]
                ex_v[1] += 1/3*triang[i][3]
            }
        }
        return ex_v;
    }

    animation(type){
        this.clearCanvas()
        // this.edges = this.findEdges(this.cp);
            
        let N = 60;
        var dt = 0.001;
        var X0 = [], Y0 = []; // to store initial starting locations
        var X  = [], Y  = []; // to store current point for each curve

        // array of starting positions for each curve on a uniform grid
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                X.push(this.xp[j]), Y.push(this.yp[i]);
                X0.push(this.xp[j]), Y0.push(this.yp[i]);
            }
        }
        // console.log("X",X)
        // console.log("Y",Y)
        function randage() {
            // to randomize starting ages for each curve
            return Math.round(Math.random()*100);
        }

        let g = d3.select("#animation").node().getContext("2d"); // initialize a "canvas" element
        g.fillStyle = "rgba(0, 0, 0, 0.05)"; // for fading curves
        g.lineWidth = 0.7;
        g.strokeStyle = "#FF8000"; // html color code
        //// mapping from vfield coords to web page coords

        

        let that = this;

        //// animation setup
        var frameRate = 500; // ms per timestep (yeah I know it's not really a rate)
        var M = X.length;
        var MaxAge = 200; // # timesteps before restart
        var age = [];
        for (var i=0; i<M; i++) {
            age.push(randage());
        }
        // let drawFlag = this.drawFlag
        setInterval(function () {if (that.drawFlag) {draw(type);}}, frameRate);
        d3.timer(function () {if (that.drawFlag) {draw(type);}}, frameRate);
        d3.select("#annotation")
            .on("click", function() {that.drawFlag = (that.drawFlag) ? false : true;});
            
        g.globalCompositeOperation = "source-over";
        
        function draw(type) {
            let width = document.getElementById('animation').offsetWidth;
            let height = document.getElementById('animation').offsetHeight;
            g.fillStyle = "rgba(0, 0, 0, 0.05)";
            g.fillRect(0, 0, width, height); // fades all existing curves by a set amount determined by fillStyle (above), which sets opacity using rgba
            
            
          
            // that.drawCellBound(that.cellBound);
            // that.addnodes(that.cp);
            // that.addedges(that.edges)

            that.drawAnnotation();

            
            for (let i=0; i<M; i++) { // draw a single timestep for every curve
                let dr = [0,0];
                let X_new = X[i];
                let Y_new = Y[i];
                if(type === "original"){ 
                    // dr = that.gradF(that.cp, X[i],Y[i],0.1);
                    
                    // console.log(that.grad)
                    let minCP = that.findMinPt([X[i],Y[i]],that.cp);
                    if(minCP[2]===1&&minCP[3]===1){
                        dr = that.findV(X[i]+(0.5-minCP[0]),Y[i]+(0.5-minCP[1]),that.gradmax)
                    }
                    else if(minCP[2]===-1&&minCP[3]===1){
                        dr = that.findV(X[i]+(0.5-minCP[0]),Y[i]+(0.5-minCP[1]),that.gradsaddle1)
                    }
                    else if(minCP[2]===1&&minCP[3]===-1){
                        dr = that.findV(X[i]+(0.5-minCP[0]),Y[i]+(0.5-minCP[1]),that.gradsaddle2)
                    }
                    else if(minCP[2]===-1&&minCP[3]===-1){
                        dr = that.findV(X[i]+(0.5-minCP[0]),Y[i]+(0.5-minCP[1]),that.gradmin)
                    }
                    // + that.findV([X[i]+(0.5-that.cp[2][0]),Y[i]+(0.5-that.cp[2][1])],that.gradmax);

                    // if(X_new>=0 && X_new<=0.5 && Y_new>=0 && Y_new <= 0.5){
                    //     X_new = X_new*(that.cellBound.upper[0]+(0.5-that.cellBound.upper[0])*Y_new/0.5)/0.5
                    // }
                    // else if(X_new>0.5 && X_new<=1 && Y_new>=0 && Y_new <= 0.5){
                    //     X_new = 1-(1-X_new)*((1-2*Y_new)*(0.5-that.cellBound.upper[0])+0.5)/0.5
                    // }
                    // else if(X_new>=0 && X_new<=0.5 && Y_new>0.5 && Y_new <= 1){
                    //     X_new = X_new*(0.5-(2*Y_new-1)*(0.5-that.cellBound.lower[0]))/0.5
                    // }
                    // else if(X_new>0.5 && X_new<=1 && Y_new>0.5 && Y_new <= 1){
                    //     X_new = 1-(1-X_new)*((2*Y_new-1)*(0.5-that.cellBound.lower[0])+0.5)/0.5
                    // }

                    
                }
                else if (type === "amove"){
                    // dr = that.gradF(that.cp, X[i], Y[i],0.1);
                    dr = that.findV([Math.max(X[i],0),Math.max(Y[i],0)],that.grad);
                }
                else if (type === "bmove"){
                    dr = that.gradF(that.cp, X[i], Y[i],0.05);
                    // dr = that.findV([Math.max(X[i],0),Math.max(Y[i],0)],that.grad);
                }
                else if (type === "cmove"){
                    dr = that.gradF(that.cp,X[i], Y[i],0.05);
                }

                g.setLineDash([1, 0])
                g.beginPath();
                g.moveTo(that.xMap(X_new), that.yMap(Y[i])); // the start point of the path
                g.lineTo(that.xMap(X_new+dr[0]*dt), that.yMap(Y[i]+=dr[1]*dt)); // the end point
                X[i]+=dr[0]*dt
                g.lineWidth = 0.7;
                g.strokeStyle = "#FF8000";
                g.stroke(); // final draw command
                if (age[i]++ > MaxAge) {
                    // increment age of each curve, restart if MaxAge is reached
                    age[i] = randage();
                    X[i] = X0[i], Y[i] = Y0[i];
                }
            }
        }
    }

    addnodes(cp){
        let g = d3.select("#animation").node().getContext("2d");
        
        for(let i=0;i<cp.length;i++){
            let type = cp[i].slice(2);
            let arcX = this.xMap(cp[i][0]);
            let arcY = this.yMap(cp[i][1]);

            if (type.join() === "1,1"){ // maximum
                g.setLineDash([1, 0])
                g.beginPath();
                g.arc(arcX,arcY,15,0,2*Math.PI);
                g.strokeStyle = "#E24E42";
                g.lineWidth = 2;
                g.stroke();
    
                g.beginPath();
                g.arc(arcX,arcY,8,0,2*Math.PI);
                g.fillStyle = "#E24E42"
                g.fill();
                g.lineWidth = 0.7;
                g.strokeStyle = "#E24E42";
                g.stroke();
            }

            if ((type.join() === "-1,1")||(type.join() === "1,-1")) { // saddle
                g.setLineDash([1, 0])
                g.beginPath();
                g.arc(arcX,arcY,15,0,2*Math.PI);
                g.strokeStyle = "#3CC47C";
                g.stroke();
    
                g.beginPath();
                g.moveTo(arcX,arcY-8); 
                g.lineTo(arcX,arcY+8);
                g.strokeStyle = "#3CC47C";
                g.stroke();
    
                g.beginPath();
                g.moveTo(arcX-8,arcY); 
                g.lineTo(arcX+8,arcY);
                g.strokeStyle = "green";
                g.stroke();
            }

            if (type.join() === "-1,-1"){ // minimum
                g.setLineDash([1, 0])
                g.beginPath();
                g.arc(arcX,arcY,8,0,2*Math.PI);
                g.strokeStyle = "blue";
                g.stroke();
    
                g.beginPath();
                g.arc(arcX,arcY,4,0,2*Math.PI);
                g.strokeStyle = "blue";
                g.stroke();
            }
        }  
    }

    findMinPt(pt0, pts){
        function calDist(loc1, loc2){
            let dist = Math.sqrt(Math.pow(loc1[0]-loc2[0],2)+Math.pow(loc1[1]-loc2[1],2))
            return dist
        }
        let dist = calDist(pt0,pts[0]);
        let minPt = pts[0];
        for(let i=1;i<pts.length;i++){
            let disti = calDist(pt0,pts[i]);
            if(disti < dist){
                dist = disti;
                minPt = pts[i]
            }
        }
        return minPt
    }

    addedges(edges){
        let g = d3.select("#animation").node().getContext("2d");
        g.beginPath();
        g.moveTo(this.xMap(0), this.yMap(0)); 
        g.lineTo(this.xMap(0), this.yMap(1));
        g.lineWidth = 6;
        g.strokeStyle = "#1E90FF";
        g.stroke();

        g.beginPath();
        g.moveTo(this.xMap(0), this.yMap(1)); 
        g.lineTo(this.xMap(1), this.yMap(1));
        g.strokeStyle = "#1E90FF";
        g.stroke();

        g.beginPath();
        g.moveTo(this.xMap(1), this.yMap(0)); 
        g.lineTo(this.xMap(1), this.yMap(1));
        g.strokeStyle = "#1E90FF";
        g.stroke();

        
        g.beginPath();
        g.moveTo(this.xMap(0), this.yMap(0)); 
        g.lineTo(this.xMap(1), this.yMap(0));
        g.strokeStyle = "#328CC1";
        g.stroke();


        g.lineWidth = 0.7;
        // let cp_new = {"max":[], "min":[], "saddle":[]};

        // for(let i=0;i<cp.length;i++){
        //     let loc = cp[i].slice(0,2);
        //     let type = cp[i].slice(2);

        //     if(type.join()==="1,1"){
        //         cp_new.max.push(loc);
        //     }
        //     else if ((type.join()==="-1,1")||(type.join()==="1,-1")){
        //         cp_new.saddle.push(loc);
        //     }
        //     else if(type.join()==="-1,-1"){
        //         cp_new.min.push(loc);
        //     }    
        // }
        for (let i=0;i<edges.length;i++){
            let bp = [this.xMap(edges[i][0][0]),this.yMap(edges[i][0][1])]; // begin point
            let ep = [this.xMap(edges[i][1][0]),this.yMap(edges[i][1][1])] // end point
            if(edges[i][2]==="max"){
                g.setLineDash([5, 5]);
                g.beginPath();
                g.moveTo(bp[0], bp[1]); 
                g.lineTo(ep[0], ep[1]);
                g.strokeStyle = "white";
                g.stroke();

            } else {g.setLineDash([1, 0]);}
            
            

        }
        // if(cp_new.saddle.length>0){
        //     for(let i=0;i<cp_new.saddle.length;i++){
        //         // draw line between saddle and max
        //         if(cp_new.max.length>0){
        //             let cp_new_max = cp_new.max.slice(0);
        //             let pts = [];
        //             if(cp_new_max.length>2){
        //                 let pt1 = this.findMinPt(cp_new.saddle[i],cp_new_max);
        //                 let idx1 = cp_new_max.indexOf(pt1);
        //                 cp_new_max.splice(idx1,1);
        //                 let pt2 = this.findMinPt(cp_new.saddle[i],cp_new_max);
        //                 pts = [pt1,pt2];
        //             } else { pts = cp_new_max; }
        //             for(let j=0;j<pts.length;j++){
        //                 let bp = [this.xMap(cp_new.saddle[i][0]),this.yMap(cp_new.saddle[i][1])]; // begin point
        //                 let ep = [this.xMap(pts[j][0]),this.yMap(pts[j][1])] // end point
        //                 g.setLineDash([5, 5])
        //                 g.beginPath();
        //                 g.moveTo(bp[0], bp[1]); 
        //                 g.lineTo(ep[0], ep[1]);
        //                 g.strokeStyle = "white";
        //                 g.stroke();
        //             }
        //         }
                // if(cp_new.min.length === 0){
                //     let pts = [[cp_new.saddle[i][0],0],[cp_new.saddle[i][0],1]];
                //     for(let j=0;j<pts.length;j++){
                //         let bp = [this.xMap(cp_new.saddle[i][0]),this.yMap(cp_new.saddle[i][1])]; // begin point
                //         let ep = [this.xMap(pts[j][0]),this.yMap(pts[j][1])] // end point
                //         g.setLineDash([1, 0])
                //         g.beginPath();
                //         g.moveTo(bp[0], bp[1]); 
                //         g.lineTo(ep[0], ep[1]);
                //         g.strokeStyle = "white";
                //         g.stroke();
                //     }

                // }
        //         if(cp_new.min.length>0){
        //             for(let j=0;j<cp_new.min.length;j++){
        //                 let bp = [this.xMap(cp_new.saddle[i][0]),this.yMap(cp_new.saddle[i][1])]; // begin point
        //                 let ep = [this.xMap(cp_new.min[j][0]),this.yMap(cp_new.min[j][1])] // end point
        //                 g.setLineDash([1, 0])
        //                 g.beginPath();
        //                 g.moveTo(bp[0], bp[1]); 
        //                 g.lineTo(ep[0], ep[1]);
        //                 g.strokeStyle = "white";
        //                 g.stroke();
        //             }
        //         }
        //     }
        // }

    }

    findEdges(cp){
        let cp_new = {"max":[], "min":[], "saddle":[]};
        for(let i=0;i<cp.length;i++){
            let loc = cp[i].slice(0,2);
            let type = cp[i].slice(2);

            if(type.join()==="1,1"){
                cp_new.max.push(loc);
            }
            else if ((type.join()==="-1,1")||(type.join()==="1,-1")){
                cp_new.saddle.push(loc);
            }
            else if(type.join()==="-1,-1"){
                cp_new.min.push(loc);
            }    
        }
        let edges = [];
        if(cp_new.saddle.length>0){
            for(let i=0;i<cp_new.saddle.length;i++){
                // draw line between saddle and max
                if(cp_new.max.length>0){
                    let cp_new_max = cp_new.max.slice(0);
                    let pts = [];
                    if(cp_new_max.length>2){
                        let pt1 = this.findMinPt(cp_new.saddle[i],cp_new_max);
                        let idx1 = cp_new_max.indexOf(pt1);
                        cp_new_max.splice(idx1,1);
                        let pt2 = this.findMinPt(cp_new.saddle[i],cp_new_max);
                        pts = [pt1,pt2];
                    } else { pts = cp_new_max; }
                    for(let j=0;j<pts.length;j++){
                        edges.push([cp_new.saddle[i],pts[j],"max"])
                    }
                }
                // draw line between saddle and min
                if(cp_new.min.length === 0){
                    let pts = [[cp_new.saddle[i][0],0],[cp_new.saddle[i][0],1]];
                    for(let j=0;j<pts.length;j++){
                        edges.push([cp_new.saddle[i],pts[j],"min"]);
                    }
                }
                if(cp_new.min.length>0){
                    let cp_new_min = cp_new.min.slice(0);
                    let pts = [];
                    if(cp_new_min.length>2){
                        let pt1 = this.findMinPt(cp_new.saddle[i],cp_new_min);
                        let idx1 = cp_new_min.indexOf(pt1);
                        cp_new_min.splice(idx1,1);
                        let pt2 = this.findMinPt(cp_new.saddle[i],cp_new_min);
                        pts = [pt1,pt2];
                    } else { pts = cp_new_min; }
                    for(let j=0;j<pts.length;j++){
                        edges.push([cp_new.saddle[i],pts[j],"min"]);
                    }
                }
            }
        }
        return edges;
    }

    clearCanvas(){  
        // $('#animation').remove();
        // $('#canvas-container').append('<canvas id="animation" width="1000" height="600"></canvas>');
    }  
}