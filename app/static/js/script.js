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
        // console.log("i am here")
        // var w = window.open("", "export", "height=0,width=0,toolbar=no,menubar=no,scrollbars=no,resizable=on,location=no,status=no");
 
        //     // var dt = new Date();
        // w.document.charset = "UTF-8";
        // w.document.write("just try");
        // w.document.execCommand("SaveAs", false,  "export.txt");
        // w.close();
    
        let content = {"cp":[1,2]};
        $.ajax({
            type: "GET",
            enctype: 'multipart/form-data',
            url: "/export",
            data: content,
            processData: false, //prevent jQuery from automatically transforming the data into a query string
            contentType: false,
            cache: false,
            dataType:'json',
            success: function (response) {
                console.log(response)
            //   data=response;
            //   onChartTypechange()
            },
            error: function (error) {
                  console.log("error",error);
            }
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
