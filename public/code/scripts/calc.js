// Este script é responsável pelo cálculo da câmera e extração de texturas

// -----------------------
// CÁLCULO DA CÂMERA

// Variáveis globais de calibração da câmera (pontos de fuga, posição da câmera, matriz de transformação do sistema de coordenadas)
var pontosDeFuga = nj.array([]).reshape(-1,2);
var C = nj.array([]).reshape(-1,3);  
var baseXYZ = nj.zeros([3,3]);
var CO;

// Função chamada quando se pede o cálculo
function calc(){
    // Número de pontos guias insuficientes
    if (pontosGuia[0].shape[0] < 4 || pontosGuia[1].shape[0] < 4 || pontosGuia[2].shape[0] < 4){
        alert('Por favor selecione dois segmentos para cada eixo!');
        return;
    }
    // Número de pontos guias ímpares para alguma dimensão (pontos soltos)
    if (pontosGuia[0].shape[0] % 2 == 1 || pontosGuia[1].shape[0] % 2 == 1 || pontosGuia[2].shape[0] % 2 == 1){
        alert('Por favor complete os pontos restantes!');
        return;
    }

    // Cálculo dos pontos de fuga
    // Para cada dimensão, ache a intersecção par a par dos pontos
    // Depois, tire a média dessas intersecções
    for(var j=0; j<3; j++){
        var pontosDeInters = nj.array([]).reshape(-1,2);
        var tam = pontosGuia[j].shape[0];
        for(var i1=0; i1<tam/2; i1++){
            for(var i2=i1+1; i2<tam/2; i2++){
                pontoDeInters = inter_retas(pontosGuia[j].slice([2*i1,2*i1+1]),
                                                pontosGuia[j].slice([2*i1+1,2*i1+2]),
                                                pontosGuia[j].slice([2*i2,2*i2+1]),
                                                pontosGuia[j].slice([2*i2+1,2*i2+2]));
                pontosDeInters = nj.concatenate(pontosDeInters.T,pontoDeInters.reshape(2,-1)).T;
            }
        }
        pontoDeFuga = nj.array([nj.mean(pontosDeInters.slice(0,[0,1])),
                                    nj.mean(pontosDeInters.slice(0,[1,2]))]).reshape(2,-1);
        pontosDeFuga = nj.concatenate(pontosDeFuga.T,pontoDeFuga).T;
    }

    // Separando os pontos de fuga
    var Fx = pontosDeFuga.slice([0,1]);
    var Fy = pontosDeFuga.slice([1,2]);
    var Fz = pontosDeFuga.slice([2,3]);
    
    // Projetar os vetores das arestas do triangulo formado
    // pelos centros ópticos para achar a base das alturas
    var hx = proj((Fx.subtract(Fy)), (Fz.subtract(Fy)), Fy);
    var hy = proj((Fy.subtract(Fz)), (Fx.subtract(Fz)), Fz);

    // Cálculo do centro óptico
    CO = inter_retas(Fx, hx, Fy, hy);

    // Encontrando a altura tridimensional do centro óptico
    var z2 =  ((Fx.get(0,0) - Fy.get(0,0))**2 + (Fx.get(0,1) - Fy.get(0,1))**2) -
                ((Fx.get(0,0) - CO.get(0,0))**2 + (Fx.get(0,1) - CO.get(0,1))**2) -
                ((Fy.get(0,0) - CO.get(0,0))**2 + (Fy.get(0,1) - CO.get(0,1))**2);

    // Cálculo da câmera
    C = nj.array([CO.get(0,0), CO.get(0,1), -1*(z2/2)**(1/2)]).reshape(-1,3);        

    // base XYZ        
    var Fx = adicHom(pontosDeFuga.slice([0,1]));
    var Fy = adicHom(pontosDeFuga.slice([1,2]));
    var Fz = adicHom(pontosDeFuga.slice([2,3]));
    var X = normalizar(nj.subtract(Fx, C));
    var Y = normalizar(nj.subtract(Fy, C));
    var Z = normalizar(nj.subtract(Fz, C));
    baseXYZ = nj.concatenate(X.reshape(3,-1),Y.reshape(3,-1),Z.reshape(3,-1));

    statusCalibracao = 'calculada';
    mostrarResultados();
}
// -----------------------


// -----------------------
// EXTRAÇÃO DA TEXTURA

var auxDic = {'YZ':0,'XZ':1,'XY':2};
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
                                       this.P[0].get(0,auxDic[this.planoParelelo]));
        // Posição dos outros dois pontos dependendo do plano paralelo
        switch (this.planoParelelo){
            case 'XY':
                P[2] = nj.array([auxPoint.get(0,0),P[0].get(0,1),P[0].get(0,2)]).reshape(1,3);
                P[3] = nj.array([auxPoint.get(0,0),P[1].get(0,1),P[0].get(0,2)]).reshape(1,3);
                break;
            case 'XZ':
                P[2] = nj.array([auxPoint.get(0,0),P[0].get(0,1),P[1].get(0,2)]).reshape(1,3);
                P[3] = nj.array([auxPoint.get(0,0),P[0].get(0,1),P[0].get(0,2)]).reshape(1,3);
                break;
            case 'YZ':
                P[2] = nj.array([P[0].get(0,0),auxPoint.get(0,1),P[1].get(0,2)]).reshape(1,3);
                P[3] = nj.array([P[0].get(0,0),auxPoint.get(0,1),P[0].get(0,2)]).reshape(1,3);
                break;
            default:
        }
        // A posição deles na tela
        v[2] = projetarTela(P[2]);
        v[3] = projetarTela(P[3]);

        // Extrair a textura
        this.obterTextura();
    }

    obterTextura(){
        var v = this.v;
        var P = this.P;

        // Heurística de aspect ratio
        var dx = ( norma(v[0].subtract(v[1])) + norma(v[2].subtract(v[3])) )/2;
        var dy = ( norma(v[0].subtract(v[3])) + norma(v[1].subtract(v[2])) )/2;
        var Dx = norma(P[0].subtract(P[1]));
        var Dy = norma(P[1].subtract(P[2]));
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
        var dt = P[2].subtract(P[0]);

        // Criar o buffer da imagem que irá receber os dados dos pixels. Variável in place
        var imgData = criarImagem(w,h);
        var buffer = imgData.data;

        // Preenchendo os dados da imagem para depois desenhar
        for (var i = 0; i < h; i++) {
            for (var j = 0; j < w; j++) {
                // A direção para onde os pixels andam depende do plano
                switch(this.planoParelelo){
                    case 'XY':
                        curdt = nj.array([dt.get(0,0)*j/w,
                                          dt.get(0,1)*i/h, 
                                          dt.get(0,2)]).reshape(1,3);                
                        break;
                    case 'YZ':
                        curdt = nj.array([dt.get(0,0),
                                          dt.get(0,1)*i/h, 
                                          dt.get(0,2)*j/w]).reshape(1,3);   
                        break;
                    case 'XZ':
                        curdt = nj.array([dt.get(0,0)*i/h,
                                          dt.get(0,1), 
                                          dt.get(0,2)*j/w]).reshape(1,3);   
                        break;
                }
                curpix = P[0].add(curdt);
                pixproj = projetarTela(curpix);
                pixrgb = imgCtxSec.getImageData(arredondar(pixproj.get(0,0),0),
                                            arredondar(pixproj.get(0,1),0),1,1).data;
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
    if(arr_igual(baseXYZ, nj.zeros([3,3]))){
        alert('Primeiro se necessita do cálculo da câmera!');
        return;
    }

    // Para cada quantidade de pontos já selecionada
    switch (pontosExtrair.length){
        case 0: case 1:
            if(planos.length==0){
                pontosExtrair.push(mouse);
            }else{
                var pontosSeg = segmentoMaisProximo(mouse);
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
            var pontos = [desprojetarTela(vert[0],lastButtonTex,ultimaProf), 
                            desprojetarTela(vert[1],lastButtonTex,ultimaProf), 
                            desprojetarTela(vert[2],lastButtonTex,ultimaProf), 
                            0];            

            // Obter os outros pontos e a textura através da classe Plano
            var novoPlano = new Plano(vert,pontos,lastButtonTex); 
            planos.push(novoPlano);

            // Colocar os dados no canvas
            adicQuadrilatero(novoPlano);

            // Atualizar pontosExtrair para receber próximos pontos
            pontosExtrair = [];
    }
}
// -----------------------