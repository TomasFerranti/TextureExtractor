// Este script é responsável pelo cálculo da câmera e extração de texturas

// -----------------------
// CÁLCULO DA CÂMERA

// Variáveis globais de calibração da câmera (pontos de fuga, posição da câmera, matriz de transformação do sistema de coordenadas)
var pontosDeFuga = [];
var C = new THREE.Vector3();  
var baseXYZ = new THREE.Matrix3();
var CO = new THREE.Vector2();

// Função chamada quando se pede o cálculo
function calc(){
    // Número de pontos guias insuficientes
    if (pontosGuia[0].length < 4 || pontosGuia[1].length < 4 || pontosGuia[2].length < 4){
        alert('Por favor selecione dois segmentos para cada eixo!');
        return;
    }
    // Número de pontos guias ímpares para alguma dimensão (pontos soltos)
    if (pontosGuia[0].length % 2 == 1 || pontosGuia[1].length % 2 == 1 || pontosGuia[2].length % 2 == 1){
        alert('Por favor complete os pontos restantes!');
        return;
    }

    // Cálculo dos pontos de fuga
    // Para cada dimensão, ache a intersecção par a par dos pontos
    // Depois, tire a média dessas intersecções
    for(var j=0; j<3; j++){
        var pontosDeInters = [];
        var tam = pontosGuia[j].length;
        for(var i1=0; i1<tam/2; i1++){
            for(var i2=i1+1; i2<tam/2; i2++){
                pontoDeInters = inter_retas(pontosGuia[j][2*i1].clone(),
                                            pontosGuia[j][2*i1+1].clone(),
                                            pontosGuia[j][2*i2].clone(),
                                            pontosGuia[j][2*i2+1].clone());
                pontosDeInters.push(pontoDeInters);
            }
        }
        // Média dos pontos
        pontoDeFuga = new THREE.Vector2();
        for(var i=0; i<pontosDeInters.length; i++){
            pontoDeFuga.addVectors(pontoDeFuga,pontosDeInters[i]);
        }
        pontoDeFuga.multiplyScalar(1/pontosDeInters.length);

        pontosDeFuga.push(pontoDeFuga);
    }

    // Separando os pontos de fuga
    var Fx = pontosDeFuga[0].clone();
    var Fy = pontosDeFuga[1].clone();
    var Fz = pontosDeFuga[2].clone();
    
    // Projetar os vetores das arestas do triangulo formado
    // pelos centros ópticos para achar a base das alturas
    var hx = proj(Fx.clone().subVectors(Fx,Fy), Fz.clone().subVectors(Fz,Fy), Fy.clone());
    var hy = proj(Fy.clone().subVectors(Fy,Fz), Fx.clone().subVectors(Fx,Fz), Fz.clone());
    
    // Cálculo do centro óptico
    CO = inter_retas(Fx.clone(), hx.clone(), Fy.clone(), hy.clone());

    // Encontrando a altura tridimensional do centro óptico
    var z2 =  ((Fx.x - Fy.x)**2 + (Fx.y - Fy.y)**2) -
                ((Fx.x - CO.x)**2 + (Fx.y - CO.y)**2) -
                ((Fy.x - CO.x)**2 + (Fy.y - CO.y)**2);

    // Cálculo da câmera
    C.x = CO.x;
    C.y = CO.y;
    C.z = -1*(z2/2)**(1/2);

    // base XYZ        
    var Fx = adicHom(Fx.clone());
    var Fy = adicHom(Fy.clone());
    var Fz = adicHom(Fz.clone());
    var X = Fx.clone().subVectors(Fx,C).normalize();
    var Y = Fy.clone().subVectors(Fy,C).normalize();
    var Z = Fz.clone().subVectors(Fz,C).normalize();
    baseXYZ.elements = [X.x, X.y, X.z, Y.x, Y.y, Y.z, Z.x, Z.y, Z.z];

    statusCalibracao = 'calculada';
    mostrarResultados();
}
// -----------------------


// -----------------------
// EXTRAÇÃO DA TEXTURA

var coordDic = {'YZ':'x','XZ':'y','XY':'z'};
// Classe criada para representar os planos
class Plano {
    // v são os pontos do canvas 2D e P os pontos no espaço 3D
    // O array P possui três pontos inicialmente: dois de orientação do plano anterior e um para extensão
    constructor(v,P,planoParalelo) {
        this.v = criarCopia(v);
        this.P = criarCopia(P);
        this.planoParelelo = planoParalelo;
        this.obterPontos();
    }

    obterPontos(){
        var v = this.v;
        var P = this.P;
        // Ponto de orientação
        var auxPoint = desprojetarTela(this.v[2].clone(),
                                       this.planoParelelo,
                                       this.P[0][coordDic[this.planoParelelo]]);
        // Posição dos outros dois pontos dependendo do plano paralelo
        switch (this.planoParelelo){
            case 'XY':
                P[2] = new THREE.Vector3(auxPoint.x,P[0].y,P[0].z);
                P[3] = new THREE.Vector3(auxPoint.x,P[1].y,P[0].z);
                break;
            case 'XZ':
                P[2] = new THREE.Vector3(auxPoint.x,P[0].y,P[1].z);
                P[3] = new THREE.Vector3(auxPoint.x,P[0].y,P[0].z);
                break;
            case 'YZ':
                P[2] = new THREE.Vector3(P[0].x,auxPoint.y,P[1].z);
                P[3] = new THREE.Vector3(P[0].x,auxPoint.y,P[0].z);
                break;
            default:
        }
        // A posição deles na tela
        v[2] = projetarTela(P[2].clone());
        v[3] = projetarTela(P[3].clone());

        // Extrair a textura
        this.obterTextura();
    }

    obterTextura(){
        var v = this.v;
        var P = this.P;

        // Heurística de aspect ratio
        var dx = (v[0].clone().subVectors(v[0],v[1]).length() + v[2].clone().subVectors(v[2],v[3]).length())/2;
        var dy = (v[0].clone().subVectors(v[0],v[3]).length() + v[1].clone().subVectors(v[1],v[2]).length())/2;
        var Dx = P[0].clone().subVectors(P[0],P[1]).length();
        var Dy = P[1].clone().subVectors(P[1],P[2]).length();
        var a = Dy/Dx;
        if (dy/dx > a) {
            var w = arredondar(dx,0);
            var h = arredondar(dx*a,0); 
        }
        else {
            var h = arredondar(dy,0);
            var w = arredondar(h/a,0);   
        }            

        var curpix, pixproj, pixrgb, pos, curdt;
        var dt = P[2].clone().subVectors(P[2],P[0]);

        // Criar o buffer da imagem que irá receber os dados dos pixels. Variável in place
        var imgData = criarImagem(w,h);
        var buffer = imgData.data;

        // Preenchendo os dados da imagem para depois desenhar
        for (var i = 0; i < h; i++) {
            for (var j = 0; j < w; j++) {
                // A direção para onde os pixels andam depende do plano
                switch(this.planoParelelo){
                    case 'XY':
                        curdt = new THREE.Vector3(dt.x*j/w,
                                                  dt.y*i/h, 
                                                  dt.z);                
                        break;
                    case 'YZ':
                        curdt = new THREE.Vector3(dt.x,
                                                  dt.y*i/h,
                                                  dt.z*j/w);   
                        break;
                    case 'XZ':
                        curdt = new THREE.Vector3(dt.x*i/h,
                                                  dt.y, 
                                                  dt.z*j/w);   
                        break;
                }
                curpix = P[0].clone().addVectors(P[0],curdt);
                pixproj = projetarTela(curpix);
                pixrgb = imgCtxSec.getImageData(arredondar(pixproj.x,0),
                                            arredondar(pixproj.y,0),1,1).data;
                pos = 4*(i*w + j);
                buffer[pos] = pixrgb[0];
                buffer[pos+1] = pixrgb[1];
                buffer[pos+2] = pixrgb[2];
                buffer[pos+3] = pixrgb[3];
            }
        }

        // Adiciona a textura como atributo da classe
        this.textura = imgData;
    }
}

// Canvas secreto com a imagem original desenhada
var imgCanvasSec = document.createElement('canvas');
var imgCtxSec = imgCanvasSec.getContext('2d');
imgCanvasSec.width = imgCanvas.width;
imgCanvasSec.height = imgCanvas.height;

// Variáveis globais do canvas da textura
var planos = [];
var ultimaProf = 1;
// Função chamada quando se clica no canvas com extrair selecionado
function extrairTextura(mouse){
    // Caso não tenha o cálculo da câmera
    if(baseXYZ.equals(new THREE.Matrix3())){
        alert('Primeiro se necessita do cálculo da câmera!');
        return;
    }

    // Para cada quantidade de pontos já selecionada
    switch (pontosExtrair.length){
        case 0: case 1:
            if(planos.length==0){
                pontosExtrair.push(mouse.clone());
            }else{
                var pontosSeg = segmentoMaisProximo(mouse.clone());
                pontosExtrair.push(pontosSeg[0]);
                pontosExtrair.push(pontosSeg[1]);
                ultimaProf = pontosSeg[2];
            }
            break;
        default:
            // Adiciona o novo ponto
            pontosExtrair.push(mouse);
            
            // vert é o array com as coordenadas dos pontos na tela
            // pontos é o array com as coordenadas dos pontos no espaço            
            var vert = [pontosExtrair[0], pontosExtrair[1], pontosExtrair[2], 0];
            var pontos = [desprojetarTela(vert[0].clone(),lastButtonTex,ultimaProf), 
                          desprojetarTela(vert[1].clone(),lastButtonTex,ultimaProf), 
                          desprojetarTela(vert[2].clone(),lastButtonTex,ultimaProf), 
                          0];            

            // Obter os outros pontos e a textura através da classe Plano
            var novoPlano = new Plano(vert,pontos,lastButtonTex); 
            planos.push(novoPlano);

            // Colocar os dados no canvas
            adicQuadrilatero(novoPlano);
            atualizaCamera();

            // Atualizar pontosExtrair para receber próximos pontos
            pontosExtrair = [];
    }
}
// -----------------------