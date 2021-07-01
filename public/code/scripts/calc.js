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
    adicionarDadosPlanosOrts();
    mostrarResultados();
}
// -----------------------


// -----------------------
// EXTRAÇÃO DA TEXTURA

// Criar um novo tipo de plano a partir da reta origem e eixo paralelo
var tiposPlano = {};
var planoSeg = [];
var coordEixoInd = {'x':0, 'y':1, 'z':2}
function criarNovoPlano(mouse){
    if(baseXYZ.equals(new THREE.Matrix3())){
        alert('Primeiro se necessita do cálculo da câmera!');
        return;
    }
    planoSeg.push(mouse);
    if (planoSeg.length == 2){
        var nome = prompt('Insira o nome do novo tipo de plano');
        var eixoPar = prompt('Insira o eixo paralelo a esse plano ("x","y","z")');
        var divPlanos = document.getElementById('planos');
        var novoObjeto = document.createElement('a');
        novoObjeto.onclick = function (){
            lastButtonTex = nome;
            attElementosHTML();
        };
        novoObjeto.id = 'btPlano'+nome;
        novoObjeto.innerText = 'Plano ' + nome;
        var extrairChild = document.getElementById("btExtrair");
        novoObjeto = divPlanos.insertBefore(novoObjeto, extrairChild);

        var coordInd = coordEixoInd[eixoPar];
        var Fh = inter_retas(planoSeg[0], planoSeg[1], pontosDeFuga[(coordInd+1)%3], pontosDeFuga[(coordInd+2)%3]);
        tiposPlano[nome] = {'planoSeg':planoSeg, 'pontoDeFuga':Fh, 'eixoPar':eixoPar, 'objeto':novoObjeto};
        planoSeg = []
    }
}

// Adicionar os dados dos planos paralelos aos ortogonais comuns 'YZ', 'XZ' e 'XY'
var coordEixo = {'YZ':'z','XZ':'z','XY':'x'};
var coordFuga = {'XZ':0,'YZ':1,'XY':1}
function adicionarDadosPlanosOrts(){
    for(nome in coordEixo){
        tiposPlano[nome] = {'planoSeg':[pontosGuia[coordFuga[nome]][0],pontosGuia[coordFuga[nome]][1]], 
                            'pontoDeFuga':pontosDeFuga[coordFuga[nome]], 
                            'eixoPar':coordEixo[nome], 
                            'objeto':document.getElementById('btPlano'+nome)};
    }
}

var coordDic = {'YZ':'x','XZ':'y','XY':'z'};
// Classe criada para representar os planos
class Plano {
    // v são os pontos do canvas 2D e P os pontos no espaço 3D
    // O array P possui três pontos inicialmente: dois de orientação do plano anterior e um para extensão
    constructor(indPlano,indSeg) {
        this.indPlanoCon = indPlano;
        this.indSegCon = indSeg;
        this.tipoPlano = lastButtonTex;

        var v = [pontosExtrair[0], pontosExtrair[1], pontosExtrair[2], 0];

        if(indPlano==null){
            var P = [desprojetarTela(v[0].clone(),lastButtonTex,1), 
                     desprojetarTela(v[1].clone(),lastButtonTex,1), 
                     desprojetarTela(v[2].clone(),lastButtonTex,1), 
                     0]; 
        }else{
            var Fh = tiposPlano[lastButtonTex]['pontoDeFuga'];
            Fh = desprojetarTela(Fh,null,null);
            var pontoDoPlano = planos[indPlano].P[indSeg];
            var eixo = tiposPlano[lastButtonTex]['eixoPar'];
            var P = [desprojetarTela2(v[0].clone(),Fh,pontoDoPlano,eixo), 
                     desprojetarTela2(v[1].clone(),Fh,pontoDoPlano,eixo), 
                     desprojetarTela2(v[2].clone(),Fh,pontoDoPlano,eixo), 
                     0]; 
        }
        
        
        this.v = criarCopia(v);
        this.P = criarCopia(P);
        this.obterPontos();
    }

    // Obtém o restante dos pontos na tela e no espaço
    obterPontos(){
        // Pontos de orientação
        var subP = criarCopia(this.P);
        this.P = [];

        for(var j=0; j<4;j++){
            this.P.push(new THREE.Vector3());
        };

        // Pondo os dois pontos iniciais na posição correta
        if(this.indPlanoCon==null){
            this.P[0] = subP[0].clone();
            this.P[1] = subP[1].clone();
        }else{
            this.P[1] = subP[0].clone();
            this.P[0] = subP[1].clone();
        };

        // Preenchendo a posição dos outros dois pontos dependendo de quais coordenadas do ponto auxiliar
        var possibleCoords = [['x'],['y'],['z'],['x','y'],['x','z'],['y','z']];
        for(var coordsAux of possibleCoords){
            for(var coord of ['x','y','z']){
                if (coordsAux.includes(coord)){
                    this.P[2][coord] = subP[2][coord];
                    this.P[3][coord] = subP[2][coord];
                }else{
                    this.P[2][coord] = this.P[1][coord];
                    this.P[3][coord] = this.P[0][coord];
                }
            }
            var P = criarCopia(this.P);
            var a,b,c,d;
            var flag = false;
            // Testa se há pontos iguais
            if(!(arr_igual(P[0],P[2]) || arr_igual(P[0],P[3]) || arr_igual(P[1],P[2]) || arr_igual(P[1],P[3]) || arr_igual(P[2],P[3]))){
                // Testa se o ponto de fuga corresponde ao do plano
                var coordInd = coordEixoInd[tiposPlano[this.tipoPlano]['eixoPar']];
                var pontoDeFugaCorreto = tiposPlano[this.tipoPlano]['pontoDeFuga'];

                for(var j=0; j<4; j++){
                    [a,b,c,d] = [P[j%4],P[(j+3)%4],P[(j+1)%4],P[(j+2)%4]];
                    var pontoDeFuga1 = inter_retas(projetarTela(a),projetarTela(b), pontosDeFuga[(coordInd+1)%3], pontosDeFuga[(coordInd+2)%3]);
                    var pontoDeFuga2 = inter_retas(projetarTela(c),projetarTela(d), pontosDeFuga[(coordInd+1)%3], pontosDeFuga[(coordInd+2)%3]);
                    
                    if(arr_igual(pontoDeFuga1, pontoDeFugaCorreto) && arr_igual(pontoDeFuga2, pontoDeFugaCorreto)){
                        flag = true;
                        console.log('YEP COCK');
                        break;
                    };
                };
            };
            if(flag){
                break;
            };
        };

        // Corrigir índices dos pontos
        if(this.indPlanoCon!=null){
            var segInd = this.indSegCon;
            switch(segInd){
                case 0:
                    this.P = [this.P[2], this.P[3], this.P[0], this.P[1]];
                    break;
                case 1:
                    this.P = [this.P[1], this.P[2], this.P[3], this.P[0]];
                    break;
                case 3:
                    this.P = [this.P[3], this.P[0], this.P[1], this.P[2]];
                    break;
                default:
                    // pass
            }
        };

        // Atualizar posição deles na tela
        for(var j=0; j<4; j++){
            this.v[j] = projetarTela(this.P[j].clone());
        }

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

        var curpix, pixprojs, pixproj, pix_rgb, pos, pixprojs_rgb;
        var dt1 = P[3].clone().subVectors(P[3],P[0]);
        var dt2 = P[1].clone().subVectors(P[1],P[0]);

        // Criar o buffer da imagem que irá receber os dados dos pixels. Variável in place
        var imgData = criarImagem(w,h);
        var buffer = imgData.data;
        var curdt = new THREE.Vector3();

        // Preenchendo os dados da imagem para depois desenhar
        for (var i = 0; i < h; i++) {
            for (var j = 0; j < w; j++) {
                // A direção para onde os pixels andam
                curdt['x'] = dt1.x*i/h + dt2.x*j/w;
                curdt['y'] = dt1.y*i/h + dt2.y*j/w;
                curdt['z'] = dt1.z*i/h + dt2.z*j/w;
                curpix = P[0].clone().addVectors(P[0],curdt);

                pixproj = projetarTela(curpix);
                pixprojs = [];
                pixprojs.push(criarObjeto([Math.floor(pixproj['x']),Math.floor(pixproj['y'])]));
                pixprojs.push(criarObjeto([Math.floor(pixproj['x']),Math.ceil(pixproj['y'])]));
                pixprojs.push(criarObjeto([Math.ceil(pixproj['x']),Math.floor(pixproj['y'])]));
                pixprojs.push(criarObjeto([Math.ceil(pixproj['x']),Math.ceil(pixproj['y'])]));
                
                pixprojs_rgb = [];
                for(var k=0; k<4; k++){
                    pixprojs_rgb.push(imgCtxSec.getImageData(pixprojs[k]['x'],pixprojs[k]['y'],1,1).data);
                };

                pix_rgb = bilinear_interpolation(pixprojs,pixprojs_rgb,pixproj);

                pos = 4*(i*w + j);
                buffer[pos] = pix_rgb['x'];
                buffer[pos+1] = pix_rgb['y'];
                buffer[pos+2] = pix_rgb['z'];
                buffer[pos+3] = 255;
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
//var ultimaProf = 1;
var indPlano, indSeg;
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
                [indPlano, indSeg] = segmentoMaisProximo(mouse.clone());
                pontosExtrair.push(planos[indPlano].v[indSeg%4]);
                pontosExtrair.push(planos[indPlano].v[(indSeg+1)%4]);
            }
            break;
        default:
            // Adiciona o novo ponto
            pontosExtrair.push(mouse);

            // Obter os outros pontos e a textura através da classe Plano
            var novoPlano = new Plano(indPlano,indSeg); 
            planos.push(novoPlano);

            // Colocar os dados no canvas
            adicQuadrilatero(novoPlano);
            atualizaCamera();

            // Atualizar pontosExtrair para receber próximos pontos
            pontosExtrair = [];
    }
}
// -----------------------