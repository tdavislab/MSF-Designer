d3.json('static/assets/export.json').then(d=>{
    console.log(d);
})

let Anim = new anim();
let Sliders = new sliders(Anim);
let Moves = new moves(Anim,Sliders);
let Persistence = new persistence(Anim);

function init(){
    
    $("#import").click(function(){
        $("#files").click();
    });
    d3.select("#files")
        .on("change",()=>{
            let form = $('#upload')[0];
            let content = new FormData(form);
            $.ajax({
                type: "POST",
                enctype: 'multipart/form-data',
                url: "/import",
                data: content,
                processData: false, //prevent jQuery from automatically transforming the data into a query string
                contentType: false,
                cache: false,
                dataType:'json',
                success: function (response) {
                    data=response;
                    Anim.clearCanvas();
                    Anim = new anim(data.cp,data.edge);
                    Sliders = new sliders(Anim);
                    Moves = new moves(Anim,Sliders);
                    Persistence = new persistence(Anim);
                },
                error: function (error) {
                    console.log("error",error);
                }
            });

        })
    $("#export").click(function(){
        console.log("cp",Anim.cp)
        let v = $("#exFilename").val();
        let anim_info = {"cp":Anim.cp, "edge":Anim.edges, "filename":v}
        $.post( "/export", {
            javascript_data: JSON.stringify(anim_info)
        });
        alert("Configuration saved")
    })
}
init();


d3.select("#reset")
    .on("click",()=>{
        Anim.clearCanvas();
        Anim = new anim();
        Sliders = new sliders(Anim);
        Moves = new moves(Anim,Sliders);
        Persistence = new persistence(Anim);
        
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
