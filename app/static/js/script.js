function init(){
    // local minimum always equal to 0 
    let barcode = [{"birth":0,"death":5},{"birth":0,"death":-1}]

    let Anim = new anim();
    let Sliders = new sliders(Anim);
    let Persistence = new persistence(barcode,Anim,Sliders);
    let Moves = new moves(Anim,Sliders,Persistence);

    d3.select("#undobutton")
        .on("click",()=>{
            if(Anim.stepRecorder_Idx<Anim.stepRecorder.length-1){
                Anim.stepRecorder_Idx += 1;
                let currentStep = Anim.stepRecorder[Anim.stepRecorder_Idx];
                Anim.cp = [];
                currentStep.cp.forEach(p=>{
                    let new_p = new criticalPoint(p.id, p.x, p.y, p.type);
                    new_p.fv = p.fv;
                    new_p.fv_perb = p.fv_perb;
                    new_p.lvalue = p.lvalue;
                    new_p.uvalue = p.uvalue;
                    Anim.cp.push(new_p);
                })
                Anim.edges = {};
                for(let eid in currentStep.edges){
                    let ed = currentStep.edges[eid];
                    let startId = ed[0].id;
                    let startpoint = Anim.cp[startId];
                    let midpoint = {"x":ed[1].x, "y":ed[1].y}
                    let endpoint;
                    let type = ed[3];
                    if(ed[2].ifBound){
                        endpoint = {"x":ed[2].x, "y":ed[2].y, "id":ed[2].id, "type":ed[2].type, "ifBound":true};
                    } else{
                        let endId = ed[2].id;
                        endpoint = Anim.cp[endId];
                    }
                    Anim.edges[eid] = [startpoint, midpoint, endpoint,type];
                }
                Anim.cpReassignEdge();
                Anim.edgeMapper = {};
                Object.keys(Anim.edges).forEach(eid=>{
                    Anim.edgeMapper[eid] = Anim.initializeEdgeMapper(Anim.edges[eid]);
                })
                if(d3.select("#ifvf").property("checked")){
                    Anim.assignEdge();
                    Anim.constructMesh(Anim.sigma);
                }
                Anim.checkIntersection();
                Anim.drawAnnotation();
                Anim.drawStep();
            }
        })

    d3.select("#redobutton")
        .on("click",()=>{
            if(Anim.stepRecorder_Idx>0){
                Anim.stepRecorder_Idx -= 1;
                let currentStep = Anim.stepRecorder[Anim.stepRecorder_Idx];
                Anim.cp = [];
                currentStep.cp.forEach(p=>{
                    let new_p = new criticalPoint(p.id, p.x, p.y, p.type);
                    new_p.fv = p.fv;
                    new_p.fv_perb = p.fv_perb;
                    new_p.lvalue = p.lvalue;
                    new_p.uvalue = p.uvalue;
                    Anim.cp.push(new_p);
                })
                Anim.edges = {};
                for(let eid in currentStep.edges){
                    let ed = currentStep.edges[eid];
                    let startId = ed[0].id;
                    let startpoint = Anim.cp[startId];
                    let midpoint = {"x":ed[1].x, "y":ed[1].y}
                    let endpoint;
                    let type = ed[3];
                    if(ed[2].ifBound){
                        endpoint = {"x":ed[2].x, "y":ed[2].y, "id":ed[2].id, "type":ed[2].type, "ifBound":true};
                    } else{
                        let endId = ed[2].id;
                        endpoint = Anim.cp[endId];
                    }
                    Anim.edges[eid] = [startpoint, midpoint, endpoint,type];
                }
                Anim.cpReassignEdge();
                Anim.edgeMapper = {};
                Object.keys(Anim.edges).forEach(eid=>{
                    Anim.edgeMapper[eid] = Anim.initializeEdgeMapper(Anim.edges[eid]);
                })
                if(d3.select("#ifvf").property("checked")){
                    Anim.assignEdge();
                    Anim.constructMesh(Anim.sigma);
                }
                Anim.checkIntersection();
                Anim.drawAnnotation();
                Anim.drawStep();
            }
        })

    d3.select("#ifskeleton")
        .on("change", ()=>{
            if(d3.select("#ifskeleton").property("checked")){
                d3.select("#annotation").style("visibility", "visible");
            } else{
                d3.select("#annotation").style("visibility", "hidden");
            }
        })

    d3.select("#ifvf")
        .on("change", ()=>{
            if(d3.select("#ifvf").property("checked")){
                if(Anim.ifConfigAllowed()){
                    Anim.assignEdge();
                    Anim.drawAnnotation();
                    Anim.constructMesh(Anim.sigma);
                    Anim.drawFlag = true;
                    d3.select("#animation").style("visibility","visible");
                    d3.select("#ifflow").property("checked", true);
                } else{
                    d3.select("#ifvf").property("checked", false);
                }
            } else {
                Anim.drawFlag = false;
                d3.select("#animation").style("visibility","hidden");
                d3.select("#ifflow").property("checked", false);
            }
        })

    d3.select("#ifflow")
        .on("change",()=>{
            if(d3.select("#ifflow").property("checked")){
                Anim.assignEdge();
                Anim.drawAnnotation();
                Anim.constructMesh(Anim.sigma);
                Anim.drawFlag = true;
            } else {
                Anim.drawFlag = false;
            }
        })
    
    $("#import").click(function(){
        $("#files").click();
    });
    d3.select("#files")
        .on("change",()=>{
            let form = $('#upload')[0];
            let content = new FormData(form);
    //         let files = $('#files')[0].files[0]
    //         let fileReader = new FileReader();
    //         fileReader.onload = function(fileLoadedEvent) 
	// {
    //     var textFromFileLoaded = fileLoadedEvent.target.result;
    //     console.log(textFromFileLoaded)
	// };
    //         fileReader.readAsText(files, "UTF-8");

    //         console.log(files.target)
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
                    // To minimize the file size, only save the keys of cp's and edges
                    let edges_recover = [];
                    let cp_recover = [];
                    Object.keys(data.edge).forEach(eid=>{
                        let ed = data.edge[eid];
                        let ed_recover;
                        if(ed[2].ifBound){
                            ed_recover = [data.cp[ed[0]], ed[1], ed[2], ed[3]];
                        } else {
                            ed_recover = [data.cp[ed[0]], ed[1], data.cp[ed[2]], ed[3]];
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
        $("#export-dict").click();
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
            if(ed[2].ifBound){
                ed_new = [ed[0].id, ed[1], ed[2], ed[3]];
            } else {
                ed_new = [ed[0].id, ed[1], ed[2].id, ed[3]];
            }
            edges_new[eid] = ed_new;
        })
        let anim_info = {"cp":cp_new, "edge":edges_new, "edgeMapper":Anim.edgeMapper, "filename":v};
        console.log(anim_info)
        $.post( "/export", {
            javascript_data: JSON.stringify(anim_info)
        });
       
        alert("Configuration saved");
    })

    d3.select("#export-dict")
        .on("change",(e)=>{
            console.log(e)
        })


    $("#computeBarcode").click(()=>compute_barcode())

    function compute_barcode(){
        if(Anim.ifConfigAllowed()){
            Anim.assignEdge();
            Anim.constructMesh();
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
        }
    }

    $("#cpdetection").click(function(){
        $.post("/detection",{
            grad_data: JSON.stringify(Anim.grad)
        }, function(res){
            Anim.drawRcpd(res.data);
        })
    })

    d3.select("#reset")
        .on("click",()=>{
            d3.select("#ifflow").property("checked", false);
            d3.select("#ifvf").property("checked", false);
            d3.select("#iffv").property("checked", false);
            Anim.clearCanvas();
            Anim = new anim();
            Sliders = new sliders(Anim);
            Persistence = new persistence(barcode,Anim);
            Moves = new moves(Anim,Sliders,Persistence);
        })

    d3.select("#amoveplus")
        .on("click",()=>{
            if(Moves.apType==="" && Anim.ifConfigAllowed()){
                Anim.drawFlag=false;
                Moves.apType = "max";
                d3.select("#amoveplus")
                    .attr("value","Select a face")
                    .classed("small-label", true);
                Moves.amovePlus();
            }
        })

    d3.select("#amoveminus")
        .on("click",()=>{
            if(Moves.amType==="" && Anim.ifConfigAllowed()){
                Anim.drawFlag=false;
                Moves.amType = "min";
                d3.select("#amoveminus")
                    .attr("value","Select a face")
                    .classed("small-label", true);
                Moves.amoveMinus();

            }
        })

    d3.select("#bmoveplus")
        .on("click",()=>{
            if(Moves.bpType==="" && Anim.ifConfigAllowed()){
                Anim.drawFlag=false;
                Moves.bpType = "max";
                d3.select("#bmoveplus")
                    .attr("value","Select an edge")
                    .classed("small-label", true);   
                Moves.bmovePlus();
            }  
        })

    d3.select("#bmoveminus")
        .on("click",()=>{
            if(Moves.bmType==="" && Anim.ifConfigAllowed()){
                Anim.drawFlag=false;
                Moves.bmType = "min";
                d3.select("#bmoveminus")
                    .attr("value","Select an edge")
                    .classed("small-label", true); 
                Moves.bmoveMinus();   
            }
        })

    d3.select("#dmoveplus")
        .on("click",()=>{
            if(Moves.dpType==="" && Anim.ifConfigAllowed()){
                Anim.drawFlag=false;
                Moves.dpType = "add";
                d3.select("#dmoveplus")
                    .attr("value","select a max point")
                    .classed("small-label", true);
                Moves.dmovePlus();
            }
        })

    d3.select("#dmoveminus")
        .on("click",()=>{
            if(Moves.dmType==="" && Anim.ifConfigAllowed()){
                Anim.drawFlag=false;
                Moves.dmType = "add";
                d3.select("#dmoveminus")
                    .attr("value","select a min point")
                    .classed("small-label", true);
                Moves.dmoveMinus();
            } 
        })

    d3.select("#cancelmove")
        .on("click",()=>{
            Moves.resetAllMoves();
        })
} init();