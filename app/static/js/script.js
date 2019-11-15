function init(){
    // local minimum always equal to 0 
    let barcode = [{"birth":0,"death":5},{"birth":0,"death":-1}]

    let Anim = new anim();
    let Sliders = new sliders(Anim);
    let Persistence = new persistence(barcode,Anim);
    let Moves = new moves(Anim,Sliders,Persistence);

    d3.select("#undobutton")
        .on("click",()=>{
            if(Anim.stepRecorder.length>1){
                Anim.stepRecorder.pop();
            }
            let currentStep = Anim.stepRecorder[Anim.stepRecorder.length-1];
            Anim.cp = currentStep.cp;
            Anim.edges = currentStep.edges;
            Anim.edgeMapper = {};
            Object.keys(Anim.edges).forEach(eid=>{
                Anim.edgeMapper[eid] = Anim.initializeEdgeMapper(Anim.edges[eid]);
            })
            Anim.assignEdge();
            Anim.constructMesh(Anim.sigma);
            Anim.drawAnnotation();
            Anim.addedges();
            Anim.drawStep();
        })
    d3.select("#ifskeleton")
        .on("click",()=>{
            if(d3.select("#ifskeleton").node().value === "Only Display Skeleton"){
                d3.select("#ifskeleton").node().value = "Show Flow";
                d3.select("#animation")
                    .style("visibility","hidden");
                d3.select("#ifflow")
                    .classed("disabled",true);
                Anim.drawFlag = false;
            } else if(d3.select("#ifskeleton").node().value === "Show Flow"){
                d3.select("#ifskeleton").node().value = "Only Display Skeleton";
                d3.select("#animation")
                    .style("visibility","visible");
                d3.select("#ifflow")
                    .classed("disabled",false)
                    .attr("value","Disable Flow");
                Anim.grad = Anim.constructMesh(Anim.sigma);
                Anim.drawFlag = true;                
            }
        })

    d3.select("#ifflow")
        .on("click", ()=>{
            if(!d3.select("#ifflow").classed("disabled")){
                if(d3.select("#ifflow").node().value === "Disable Flow"){
                    d3.select("#ifflow").node().value = "Enable Flow";
                    Anim.drawFlag = false;
                } else if (d3.select("#ifflow").node().value === "Enable Flow"){
                    d3.select("#ifflow").node().value = "Disable Flow";
                    Anim.drawFlag = true;
                }
            }
        })


    
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
                    console.log(data);
                    // recover cp and edges
                    let edges_recover = [];
                    let cp_recover = [];
                    Object.keys(data.edge).forEach(eid=>{
                        let ed = data.edge[eid];
                        let ed_recover;
                        if(data.cp[ed[2]]!=undefined){
                            ed_recover = [data.cp[ed[0]], ed[1], data.cp[ed[2]], ed[3]];
                        } else {
                            ed_recover = [data.cp[ed[0]], ed[1], ed[2], ed[3]];
                        }
                        edges_recover[eid] = ed_recover;
                    })
                    data.cp.forEach(p=>{
                        let ed_new = {};
                        p.edges.forEach(eid=>{
                            ed_new[eid] = edges_recover[eid];
                        })
                        p.edges = ed_new;
                        cp_recover.push(p);
                    })
                    Anim.clearCanvas();
                    Anim = new anim(cp_recover,edges_recover,data.edgeMapper);
                    Sliders = new sliders(Anim);
                    Persistence = new persistence(barcode,Anim);
                    Moves = new moves(Anim,Sliders,Persistence);
                },
                error: function (error) {
                    console.log("error",error);
                }
            });

        })
    $("#export").click(function(){
        console.log("cp",Anim.cp)
        let v = $("#exFilename").val();
        console.log(v)
        // avoid circular structure
        let cp_new = [];
        let edges_new = {};
        Anim.cp.forEach(p=>{
            let p_new = {"fv":p.fv, "fv_perb":p.fv_perb, "id":p.id, "lvalue":p.lvalue, "uvalue":p.uvalue, "type":p.type, "x":p.x, "y":p.y};
            p_new.edges = Object.keys(p.edges);
            cp_new.push(p_new);
        })
        Object.keys(Anim.edges).forEach(eid=>{
            let ed = Anim.edges[eid];
            let ed_new;
            if(ed[2].type!=undefined){
                ed_new = [ed[0].id, ed[1], ed[2].id, ed[3]];
            } else {
                ed_new = [ed[0].id, ed[1], ed[2], ed[3]];
            }
            edges_new[eid] = ed_new;
        })
        // console.log(cp_new)
        let anim_info = {"cp":cp_new, "edge":edges_new, "edgeMapper":Anim.edgeMapper, "filename":v}
        console.log(anim_info)
        $.post( "/export", {
            javascript_data: JSON.stringify(anim_info)
        });
        alert("Configuration saved")
    })

    $("#computeBarcode").click(function(){
        d3.select("#loadergroup").classed("loader",true)
        d3.select("#persistencegroup").select("svg").style("visibility","hidden")
        $.post( "/grad", {
            grad_data: JSON.stringify(Anim.grad)
        }, function(res){
            Persistence.barcode = res.data;
            Persistence.drawPersistence();
            Persistence.recoverPairs();
            Persistence.recoverPersisitence();
            d3.select("#loadergroup").classed("loader",false)
            d3.select("#persistencegroup").select("svg").style("visibility","visible")
            console.log("response",res)
        });
    })

    $("#cpdetection").click(function(){
        $.post("/detection",{
            grad_data: JSON.stringify(Anim.grad)
        }, function(res){
            Anim.criticalPointsDetection(res);
        })
    })

    d3.select("#reset")
    .on("click",()=>{
        Anim.clearCanvas();
        Anim = new anim();
        Sliders = new sliders(Anim);
        Persistence = new persistence(barcode,Anim);
        Moves = new moves(Anim,Sliders,Persistence);
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

    d3.select("#dmoveplus")
        .on("click",()=>{
            if(Moves.dpType===""){
                Anim.drawFlag=false;
                Moves.dpType = "add";
                Moves.dmovePlus();
                d3.select("#dmoveplus")
                    .attr("value","Click a max point");
            }
        })

    d3.select("#dmoveminus")
        .on("click",()=>{
            if(Moves.dmType===""){
                Anim.drawFlag=false;
                Moves.dmType = "add";
                Moves.dmoveMinus();
                d3.select("#dmoveminus")
                    .attr("value","Click a min point");
            } 
        })
} init();