class anim{
    constructor() {
        // this.type = type;
        this.canvasWidth = document.getElementById('animation').offsetWidth;
        this.canvasHeight = document.getElementById('animation').offsetHeight;
        this.drawFlag = true;
        this.animation("original")
    }
    animation(type){
        // console.log(type)
        this.clearCanvas()

        // var dt = 0.5;
        var dt = 0.05;
        var X0 = [], Y0 = []; // to store initial starting locations
        var X  = [], Y  = []; // to store current point for each curve

        //// curve ////
        var N = 60; // 25^2 curves
        // discretize the vfield coords
        let xp = d3.range(N).map(
                function (i) {
                    return (gridWidth-1)*(i/N);
                });
        let yp = d3.range(N).map(
                function (i) {
                    return (gridHeight-1)*(i/N);
                });
        // array of starting positions for each curve on a uniform grid
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                X.push(xp[j]), Y.push(yp[i]);
                X0.push(xp[j]), Y0.push(yp[i]);
            }
        }
        console.log("xp",xp)
        console.log("yp",yp)

        function gradF(cp, x, y, sigma){
            let xIdx = x/(gridWidth-1);
            let yIdx = y/(gridHeight-1);

            let dx = 0;
            let dy = 0;

            for(let i=0;i<cp.length;i++){
                let point = cp[i];
                // e.g. point = [0.25, 0.25, 1, 1]
                dx += point[2] * (1/sigma) * (xIdx-point[0])*Math.exp(-(Math.pow(xIdx-point[0],2)+Math.pow(yIdx-point[1],2))/sigma)
                dy += point[3] * (1/sigma) * (yIdx-point[1]) * (Math.exp(-(Math.pow(xIdx-point[0],2)+Math.pow(yIdx-point[1],2))/sigma))
            }

            return [dx, dy]

        }

        function randage() {
            // to randomize starting ages for each curve
            return Math.round(Math.random()*100);
        }

        var g = d3.select("#animation").node().getContext("2d"); // initialize a "canvas" element
        g.fillStyle = "rgba(0, 0, 0, 0.05)"; // for fading curves
        // g.fillStyle = ""
        g.lineWidth = 0.7;
        g.strokeStyle = "#FF8000"; // html color code
        //// mapping from vfield coords to web page coords

        var xMap = d3.scaleLinear()
            .domain([0, gridWidth-1])
            .range([0, this.canvasWidth]);
        var yMap = d3.scaleLinear()
            .domain([0, gridHeight-1])
            .range([0, this.canvasHeight]);

        //// animation setup
        var frameRate = 300; // ms per timestep (yeah I know it's not really a rate)
        var M = X.length;
        var MaxAge = 200; // # timesteps before restart
        var age = [];
        for (var i=0; i<M; i++) {
            age.push(randage());
        }
        let drawFlag = this.drawFlag
        setInterval(function () {if (drawFlag) {draw(type);}}, frameRate);
        d3.timer(function () {if (drawFlag) {draw(type);}}, frameRate);
        d3.select("#animation")
            .on("click", function() {drawFlag = (drawFlag) ? false : true;});
        
        // console.log("X0", X0)
        // console.log("Y0",Y0)
        // console.log("X",X)
        // console.log("Y",Y)
            
        g.globalCompositeOperation = "source-over";
        function draw(type) {
            let width = document.getElementById('animation').offsetWidth;
            let height = document.getElementById('animation').offsetHeight;
            g.fillRect(0, 0, width, height); // fades all existing curves by a set amount determined by fillStyle (above), which sets opacity using rgba
            for (let i=0; i<M; i++) { // draw a single timestep for every curve
                let dr = [0,0];
                let cp = [];
                if(type === "original"){ 
                    cp = [[0.25,0.5,1,1],[0.5,0.5,-1,1],[0.75,0.5,1,1]]  
                    dr = gradF(cp, X[i],Y[i],0.1);
                }
                else if (type === "amove"){
                    cp = [[0.25,0.75,1,1],[0.25,0.25,1,1],[0.25,0.5,1,-1],[0.75,0.75,1,1],[0.5,0.75,-1,1]]
                    dr = gradF(cp, X[i], Y[i],0.1);
                }
                else if (type === "bmove"){
                    cp = [[0.75,0.75,1,1],[0.25,0.75,1,1],[0.5,0.75,-1,1],[0.5,0.525,-1,-1],[0.3,0.5,1,-1],[0.7,0.5,1,-1],[0.5,0.25,1,1]]
                    dr = gradF(cp, X[i], Y[i],0.1);
                }
                else if (type === "cmove"){
                    cp = [[0.8,0.5,1,1],[0.7,0.5,-1,1],[0.5,0.5,1,1],[0.3,0.5,-1,1],[0.2,0.5,1,1]]
                    dr = gradF(cp,X[i], Y[i],0.05);
                }

                g.beginPath();
                g.moveTo(xMap(X[i]), yMap(Y[i])); // the start point of the path
                g.lineTo(xMap(X[i]+=dr[0]*dt), yMap(Y[i]+=dr[1]*dt)); // the end point
                g.stroke(); // final draw command
                if (age[i]++ > MaxAge) {
                    // increment age of each curve, restart if MaxAge is reached
                    age[i] = randage();
                    X[i] = X0[i], Y[i] = Y0[i];
                }
            }
        }
    }
    clearCanvas(){  
        console.log("cleaning")
        $('#animation').remove();
        $('#container').append('<canvas id="animation" width="1000" height="600"></canvas>');  
    }  
}