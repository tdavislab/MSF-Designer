//background grid information
var gridWidth = 100;
var gridHeight = 60;

let Anim = new anim()

d3.select("#original")
    .on("click",()=>{
        Anim.cp = [[0.25,0.5,1,1],[0.5,0.5,-1,1],[0.75,0.5,1,1]]
        Anim.cellBound = {"upper":[0.5,0], "lower":[0.5,1]};
        Anim.animation("original")
        
    })
d3.select("#original1")
    .on("click",()=>{
        Anim.cp = [[0.25,0.5,1,1],[0.5,0.5,-1,1],[0.75,0.5,1,1]]
        Anim.animation("original1")
    })
d3.select("#amoveplus")
    .on("click",()=>{
        Anim.cp = [[0.25,0.75,1,1],[0.25,0.25,1,1],[0.25,0.5,1,-1],[0.75,0.75,1,1],[0.5,0.75,-1,1]]
        // Anim.amoveplus();
        Anim.animation("amove")
    })
d3.select("#bmoveplus")
    .on("click",()=>{
        Anim.cp = [[0.75,0.75,1,1],[0.25,0.75,1,1],[0.5,0.75,-1,1],[0.5,0.525,-1,-1],[0.3,0.5,1,-1],[0.7,0.5,1,-1],[0.5,0.25,1,1]]
        Anim.animation("bmove")
    })

d3.select("#cmoveplus")
    .on("click",()=>{
        Anim.cp = [[0.8,0.5,1,1],[0.7,0.5,-1,1],[0.5,0.5,1,1],[0.3,0.5,-1,1],[0.2,0.5,1,1]]
        // Anim.cp = [[0.9,0.5,1,1],[0.7,0.5,-1,1], [0.5,0.5,1,1],[0.3,0.5,-1,1],[0.1,0.5,1,1]]
        Anim.animation("cmove")
    })
