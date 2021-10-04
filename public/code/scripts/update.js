// Este script é responsável por atualizar todos os elementos do HTML

// -----------------------
// FUNÇÃO ATUALIZAR

// Quando ela é chamada, atualiza todos os elementos do HTML
function attElementosHTML(){

    // Botões guia calibração
    var textoCorreto = (texto) => (texto ? ' ✓' : '');
    document.getElementById('btGuiaX').innerHTML=('Axis X' + textoCorreto(lastButton == 'X'));
    document.getElementById('btGuiaY').innerHTML=('Axis Y' + textoCorreto(lastButton == 'Y'));
    document.getElementById('btGuiaZ').innerHTML=('Axis Z' + textoCorreto(lastButton == 'Z'));        
    document.getElementById('btExtrair').innerHTML=('Extract' + textoCorreto(lastButton == 'extrair'));      

    // Botões textura
    document.getElementById('btNovoPlano').innerHTML=('New Plane Type' + textoCorreto(lastButton == 'novoPlano'));
    document.getElementById('btPlanoYZ').innerHTML=('Plane YZ' + textoCorreto(lastButtonTex == 'YZ'));
    document.getElementById('btPlanoXZ').innerHTML=('Plane XZ' + textoCorreto(lastButtonTex == 'XZ'));
    document.getElementById('btPlanoXY').innerHTML=('Plane XY' + textoCorreto(lastButtonTex == 'XY'));

    // Botões métrica
    document.getElementById('btNovaMetrica').innerHTML=('Defining Scale' + textoCorreto(lastButton == 'novaescala'));
    document.getElementById('btCalcularTamanho').innerHTML=('Calculate Segment Length' + textoCorreto(lastButton == 'calculartamanho'));

    // Botões de novos planos
    for(nome in tiposPlano){
        tiposPlano[nome]['objeto'].innerHTML=('Plane ' + nome + textoCorreto(lastButtonTex == nome));
    };

    // Imagem
    imgCtx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
    try{
    imgCtx.drawImage(imgImagem, 0, 0, imgImagem.width, imgImagem.height,    
                     wInicio, hInicio, cEscala*imgImagem.width, cEscala*imgImagem.height); 
    } catch(e){};
    
    // Pontos dos eixos
    for (var j = 0; j < 3; j++){        
        for (var i = 0; i < pontosGuia[j].length; i++) {
            ponto(pontosGuia[j][i].x, pontosGuia[j][i].y, 3,'black');
        };
    };
    
    // Linhas
    var corLinha = ['red','green','blue'];
    for (var j = 0; j < 3; j++){        
        var tam = pontosGuia[j].length;
        for (var i = 0; i < (tam-tam%2)/2; i++) {
            reta(pontosGuia[j][2*i],pontosGuia[j][2*i+1],corLinha[j]);
        };
    };

    // Pontos do novo tipo de plano atual
    for (var i = 0; i < planoSeg.length; i++){
        ponto(planoSeg[i].x, planoSeg[i].y, 3, 'violet');
    };

    // Pontos e Segmentos dos novos planos já adicionados
    for (nomePlano in tiposPlano){
        if(['XY','YZ','XZ'].includes(nomePlano)){
            continue;
        };
        var p1 = tiposPlano[nomePlano]['planoSeg'][0];
        var p2 = tiposPlano[nomePlano]['planoSeg'][1];
        ponto(p1.x, p1.y, 3, 'violet');
        ponto(p2.x, p2.y, 3, 'violet');
        reta(p1, p2, 'violet');
    };

    // Pontos do novo plano a concatenar
    for (var i = 0; i < pontosExtrair.length; i++) {
        ponto(pontosExtrair[i].x, pontosExtrair[i].y, 5,'purple');
    };
    
    // Planos
    for (var j = 0; j < planos.length; j++) {
        for (var i = 0; i < 4; i++) {
            ponto(planos[j].v[i].x, planos[j].v[i].y, 3,'orange');
        };
        for (var i = 0; i < 3; i++) {
            reta(planos[j].v[i],planos[j].v[i+1],'yellow');
        };
        reta(planos[j].v[3],planos[j].v[0],'yellow');
    };

    // Ortocentro
    if(!C.equals(new THREE.Vector3())){
        ponto(C.x,C.y,10,'pink');
    };

    // Pontos da definição da métrica
    if(pontosMetrica.length>0){
        for(var p of pontosMetrica){
            ponto(p.x,p.y,3,'black');
        };
    };

    // Segmento definido pela métrica
    if(pontosMetrica.length==2){
        reta(pontosMetrica[0],pontosMetrica[1],'brown');
    };

    // Pontos da definição do segmento que calculamos pela métrica
    if(segmentoMetrica.length>0){
        for(var p of segmentoMetrica){
            ponto(p.x,p.y,3,'black');
        };
    };

    // Segmento definido por esses pontos
    if(segmentoMetrica.length==2){
        reta(segmentoMetrica[0],segmentoMetrica[1],'teal');
    };
};
// -----------------------