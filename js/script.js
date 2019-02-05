//background grid information
var gridWidth = 60;
var gridHeight = 60;

let Anim = new anim()

d3.select("#original")
    .on("click",()=>{
        Anim.animation("original")
    })
d3.select("#amove")
    .on("click",()=>{
        Anim.animation("amove")
    })
d3.select("#bmove")
    .on("click",()=>{
        Anim.animation("bmove")
    })

d3.select("#cmove")
    .on("click",()=>{
        Anim.animation("cmove")
    })
