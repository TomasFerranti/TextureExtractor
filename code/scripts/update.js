function update(){
    // button
    document.getElementById("bt_guiaX").style.background=getColor(lastButton == "X");
    document.getElementById("bt_guiaY").style.background=getColor(lastButton == "Y");
    document.getElementById("bt_guiaZ").style.background=getColor(lastButton == "Z");        
    document.getElementById("bt_extrair").style.background=getColor(lastButton == "extrair");      

    // image
    imgCtx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
    try{
    imgCtx.drawImage(imgImagem, 0, 0, imgImagem.width, imgImagem.height,    
                                0, 0, imgCanvas.width, imgCanvas.height); 
    } catch(e){}
    
    // points
    for (var j = 0; j < 3; j++){        
        for (var i = 0; i < pontos_guia[j].shape[0]; i++) {
            point(pontos_guia[j].get(i,0), pontos_guia[j].get(i,1), 3,"black");
        }
    }
    
    // lines
    var lineColor = ["red","green","blue"];
    for (var j = 0; j < 3; j++){        
        var tam = pontos_guia[j].shape[0];
        for (var i = 0; i < (tam-tam%2)/2; i++) {
            line(pontos_guia[j].slice([2*i,2*i+1]),pontos_guia[j].slice([2*i+1,2*i+2]),lineColor[j]);
        }
    }
}