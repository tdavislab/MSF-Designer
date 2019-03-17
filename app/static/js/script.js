d3.json('static/assets/export.json').then(d=>{
    console.log(d);
})

let Anim = new anim();
let Sliders = new sliders(Anim);
let Moves = new moves(Anim,Sliders);

function init(){
    
    $("#import").click(function(){
        $("#files").click();
    });
    d3.select("#files")
        .on("change",()=>{
            let selectedFile = document.getElementById("files").files[0];
            console.log(selectedFile)
            let reader = new FileReader();
            reader.readAsText(selectedFile);
            reader.onload = function(){
                console.log(this)
                console.log(this.result);
            };
        })
    $("#export").click(function(){
        console.log("cp",Anim.cp)
        let v = $("#exFilename").val();
        let anim_info = {"cp":Anim.cp, "edge":Anim.edges, "filename":v}
        $.post( "/export", {
            javascript_data: JSON.stringify(anim_info)
        });
    })
}
init();


d3.select("#reset")
    .on("click",()=>{
        Anim.clearCanvas();
        Anim = new anim();
        Moves = new moves(Anim);
        
    })
d3.select("#amoveplus")
    .on("click",()=>{
        if(Moves.apType===""){
            Anim.drawFlag=false;
            Moves.apType = "max";
            Moves.amovePlus();
            d3.select("#amoveplus")
                .attr("value","Add a max point")
        }
    })

d3.select("#amoveminus")
    .on("click",()=>{
        if(Moves.amType===""){
            Anim.drawFlag=false;
            Moves.amType = "min";
            Moves.amoveMinus();
            d3.select("#amoveminus")
                .attr("value","Add a min point")
        }
    })
d3.select("#bmoveplus")
    .on("click",()=>{
        if(Moves.bpType===""){
            Anim.drawFlag=false;
            Moves.bpType = "max";
            Moves.bmovePlus();
            d3.select("#bmoveplus")
                .attr("value","Add a max point");
            
        }
        
    })

d3.select("#bmoveminus")
    .on("click",()=>{
        if(Moves.bmType===""){
            Anim.drawFlag=false;
            Moves.bmType = "min";
            Moves.bmoveMinus();
            d3.select("#bmoveminus")
                .attr("value","Add a min point");
            
        }
        
    })

d3.select("#cmoveplus")
    .on("click",()=>{
        if(Moves.cpType===""){
            Anim.drawFlag=false;
            Moves.cpType = "max";
            Moves.cmovePlus();
            d3.select("#cmoveplus")
                .attr("value","Add a max point");
        }
        
    })

d3.select("#cmoveminus")
    .on("click",()=>{
        if(Moves.cmType===""){
            Anim.drawFlag=false;
            Moves.cmType = "min";
            Moves.cmoveMinus();
            d3.select("#cmoveminus")
                .attr("value","Add a min point");
        }
        
    })
