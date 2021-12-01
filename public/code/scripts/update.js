// Este script é responsável por atualizar todos os elementos do HTML

// -----------------------
// FUNÇÃO ATUALIZAR

var desenharCab = true;
// Quando ela é chamada, atualiza todos os elementos do HTML
function attElementosHTML(){

    // Atualizar dica
    atualizarDica();

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

    // Botão textura plano
    document.getElementById('btTexturaPlano').innerHTML=('Check Plane Texture' + textoCorreto(lastButton == 'texturaPlano'));

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
    
    if(desenharCab){
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
        
        // Ortocentro
        if(!C.equals(new THREE.Vector3())){
            ponto(C.x,C.y,10,'pink');
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
    };

    // Pontos do novo tipo de plano atual
    for (var i = 0; i < planoSeg.length; i++){
        ponto(planoSeg[i].x, planoSeg[i].y, 3, 'violet');
    };

    // Pontos do novo plano a concatenar
    for (var i = 0; i < pontosExtrair.length; i++) {
        ponto(pontosExtrair[i].x, pontosExtrair[i].y, 5,'purple');
    };
    
    // Planos
    for (var j = 0; j < planos.length; j++) {
        if(j != indiceTexturaPlanoAtual){
            for (var i = 0; i < 4; i++) {
                ponto(planos[j].v[i].x, planos[j].v[i].y, 3,'orange');
            };
            for (var i = 0; i < 3; i++) {
                reta(planos[j].v[i],planos[j].v[i+1],'yellow');
            };
            reta(planos[j].v[3],planos[j].v[0],'yellow');
        };
    };

    // Plano destacado
    if(indiceTexturaPlanoAtual != null){
        for (var i = 0; i < 4; i++) {
            ponto(planos[indiceTexturaPlanoAtual].v[i].x, planos[indiceTexturaPlanoAtual].v[i].y, 3,'darkgreen');
        };
        for (var i = 0; i < 3; i++) {
            reta(planos[indiceTexturaPlanoAtual].v[i],planos[indiceTexturaPlanoAtual].v[i+1],'lime');
        };
        reta(planos[indiceTexturaPlanoAtual].v[3],planos[indiceTexturaPlanoAtual].v[0],'lime');
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