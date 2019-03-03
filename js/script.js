let Anim = new anim()

d3.select("#reset")
    .on("click",()=>{
        Anim.clearCanvas()
        Anim = new anim()
        
    })
d3.select("#amoveplus")
    .on("click",()=>{
        if(Anim.apType===""){
            Anim.drawFlag=false;
            Anim.apType = "max";
            Anim.amovePlus();
            d3.select("#amoveplus")
                .attr("value","Add a max point")
        }
    })

d3.select("#amoveminus")
    .on("click",()=>{
        if(Anim.amType===""){
            Anim.drawFlag=false;
            Anim.amType = "min";
            Anim.amoveMinus();
            d3.select("#amoveminus")
                .attr("value","Add a min point")
        }
    })
d3.select("#bmoveplus")
    .on("click",()=>{
        if(Anim.bpType===""){
            Anim.drawFlag=false;
            Anim.bpType = "max";
            Anim.bmovePlus();
            d3.select("#bmoveplus")
                .attr("value","Add a max point");
            
        }
        
    })

d3.select("#bmoveminus")
    .on("click",()=>{
        if(Anim.bmType===""){
            Anim.drawFlag=false;
            Anim.bmType = "min";
            Anim.bmoveMinus();
            d3.select("#bmoveminus")
                .attr("value","Add a min point");
            
        }
        
    })

// d3.select("#cmoveplus")
//     .on("click",()=>{
//         Anim.cp = [[0.8,0.5,1,1],[0.7,0.5,-1,1],[0.5,0.5,1,1],[0.3,0.5,-1,1],[0.2,0.5,1,1]]
//         // Anim.cp = [[0.9,0.5,1,1],[0.7,0.5,-1,1], [0.5,0.5,1,1],[0.3,0.5,-1,1],[0.1,0.5,1,1]]
//         Anim.animation("cmove")
//     })
