// Este script é responsável por atualizar todos os elementos do HTML

// -----------------------
// FUNÇÃO ATUALIZAR

// Quando ela é chamada, atualiza todos os elementos do HTML
function attElementosHTML(){
    var textoCorreto = (texto) => (texto ? ' ✓' : '');
    document.getElementById('btGuiaX').innerHTML=('Eixo X' + textoCorreto(lastButton == 'X'));
    document.getElementById('btGuiaY').innerHTML=('Eixo Y' + textoCorreto(lastButton == 'Y'));
    document.getElementById('btGuiaZ').innerHTML=('Eixo Z' + textoCorreto(lastButton == 'Z'));        
    document.getElementById('btExtrair').innerHTML=('Extrair' + textoCorreto(lastButton == 'extrair'));      

    // Imagem
    imgCtx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
    try{
    imgCtx.drawImage(imgImagem, 0, 0, imgImagem.width, imgImagem.height,    
                                0, 0, imgCanvas.width, imgCanvas.height); 
    } catch(e){}
    
    // Pontos dos eixos
    for (var j = 0; j < 3; j++){        
        for (var i = 0; i < pontosGuia[j].shape[0]; i++) {
            ponto(pontosGuia[j].get(i,0), pontosGuia[j].get(i,1), 3,'black');
        }
    }
    
    // Linhas
    var corLinha = ['red','green','blue'];
    for (var j = 0; j < 3; j++){        
        var tam = pontosGuia[j].shape[0];
        for (var i = 0; i < (tam-tam%2)/2; i++) {
            reta(pontosGuia[j].slice([2*i,2*i+1]),pontosGuia[j].slice([2*i+1,2*i+2]),corLinha[j]);
        }
    }

    // Pontos da textura
    if(pontosExtrair.shape[0]<3){
        for (var i = 0; i < pontosExtrair.shape[0]; i++) {
            ponto(pontosExtrair.get(i,0), pontosExtrair.get(i,1), 5,'orange');
        }
    }else{
        for (var i = 0; i < pontosExtrair.shape[0]; i++) {
            ponto(pontosExtrair.get(i,0), pontosExtrair.get(i,1), 5,'orange');
        }
        for (var i = 0; i < pontosExtrair.shape[0]-1; i++) {
            reta(pontosExtrair.slice([i,i+1]),pontosExtrair.slice([i+1,i+2]),'yellow');
        }
        reta(pontosExtrair.slice([0,1]),pontosExtrair.slice([pontosExtrair.shape[0]-1,pontosExtrair.shape[0]]),'yellow');
    }

    // Ortocentro
	ponto(C.get(0,0),C.get(0,1),10,'pink');
}
// -----------------------