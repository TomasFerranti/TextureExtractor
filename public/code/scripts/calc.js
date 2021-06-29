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
        tiposPlano[nome] = {'planoSeg':planoSeg, 'eixoPar':eixoPar, 'objeto':novoObjeto};
        planoSeg = []
    }
}

// Adicionar os dados dos planos paralelos aos ortogonais comuns 'YZ', 'XZ' e 'XY'
var coordEixo = {'YZ':'z','XZ':'z','XY':'x'};
var coordFuga = {'XZ':0,'YZ':1,'XY':1}
function adicionarDadosPlanosOrts(){
    for(nome in coordEixo){
        tiposPlano[nome] = {'planoSeg':[pontosGuia[coordFuga[nome]][0],pontosGuia[coordFuga[nome]][1]], 
                            'eixoPar':coordEixo[nome], 
                            'objeto':document.getElementById('btPlano'+nome)};
    }
}

var coordDic = {'YZ':'x','XZ':'y','XY':'z'};
var coordEixoInd = {'x':0, 'y':1, 'z':2}
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
            var coordInd = coordEixoInd[tiposPlano[lastButtonTex]['eixoPar']];
            var h1 = tiposPlano[lastButtonTex]['planoSeg'][0];
            var h2 = tiposPlano[lastButtonTex]['planoSeg'][1];
            var Fh = inter_retas(h1, h2, pontosDeFuga[(coordInd+1)%3], pontosDeFuga[(coordInd+2)%3]);
            Fh = desprojetarTela(Fh,null,null)
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

    // Fornece os índices dos pontos para cálculo posterior
    obterIndice(){
        var casoBase = {'YZ':[1,['x','y']], 'XZ':[1,['x','y']] ,'XY':[1,['z']]};
        if(this.indPlanoCon==null){
            return casoBase[this.tipoPlano];
        }

        
        // retorna [indice P0, ]
        var eixoParPlano1 = tiposPlano[this.tipoPlano]['eixoPar'];
        var eixoParPlano2 = tiposPlano[planos[this.indPlanoCon].tipoPlano]['eixoPar'];
        var seg = this.indSegCon;

        // Eixo do plano atual, eixo do plano conectado, segmento conectado
        // Novo índice do primeiro ponto do segmento, coordenadas do ponto auxiliar
        var casos = [
                    ['z','z',0,3,['x','y']], ['z','z',2,1,['x','y']], ['z','z',1,0,['z']], ['z','z',3,2,['z']],         // 'z' para 'z'
                    ['y','y',0,3,['y']], ['y','y',2,1,['y']], ['y','y',1,0,['x','z']], ['y','y',3,2,['x','z']],         // 'y' para 'y'
                    ['x','x',0,3,['y','z']], ['x','x',2,1,['y','z']], ['x','x',1,0,['x']], ['x','x',3,2,['x']],         // 'x' para 'x'
                    ['x','z',3,1,['y','z']], ['x','z',1,3,['y','z']], ['y','z',3,0,['x','z']], ['y','z',1,2,['x','z']], // 'z' para resto
                    ['z','y',0,3,['z']], ['z','y',2,1,['z']],         // 'y' para resto
                    ['z','x',1,3,['z']], ['z','x',3,1,['z']]          // 'x' para resto
                    ];

        console.log("Plano",planos.length);
        console.log(eixoParPlano1, eixoParPlano2, seg);
        
        for(var j=0; j<casos.length; j++){
            var caso = casos[j];
            if(eixoParPlano1==caso[0] && eixoParPlano2==caso[1] && seg==caso[2]){
                return [caso[3],caso[4]];
            }
        };
    }

    // Obtém o restante dos pontos na tela e no espaço
    obterPontos(){
        // Pontos de orientação
        var subP = criarCopia(this.P);
        this.P = [];

        for(var j=0; j<4;j++){
            this.P.push(new THREE.Vector3());
        }

        // Corrigir orientação
        var [indP0, coordsAux] = this.obterIndice();
        indP0 = indP0 + 4;

        // Pondo os dois pontos iniciais na posição correta
        if(this.indPlanoCon==null){
            this.P[(indP0-1)%4] = subP[0].clone();
            this.P[indP0%4] = subP[1].clone();
        }else{
            this.P[indP0%4] = subP[0].clone();
            this.P[(indP0-1)%4] = subP[1].clone();
        };

        // Preenchendo a posição dos outros dois pontos dependendo de quais coordenadas do ponto auxiliar
        for(var coord of ['x','y','z']){
            if (coordsAux.includes(coord)){
                this.P[(indP0+1)%4][coord] = subP[2][coord];
                this.P[(indP0+2)%4][coord] = subP[2][coord];
            }else{
                this.P[(indP0+1)%4][coord] = this.P[(indP0)%4][coord];
                this.P[(indP0+2)%4][coord] = this.P[(indP0-1)%4][coord];
            }
        }

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

        var curpix, pixprojs, pixproj, pixrgb, pos, curdist, totaldist, rgba;
        var dt = P[2].clone().subVectors(P[2],P[0]);

        // Criar o buffer da imagem que irá receber os dados dos pixels. Variável in place
        var imgData = criarImagem(w,h);
        var buffer = imgData.data;
        var curdt = new THREE.Vector3();

        // Preenchendo os dados da imagem para depois desenhar
        for (var i = 0; i < h; i++) {
            for (var j = 0; j < w; j++) {
                // A direção para onde os pixels andam depende do eixo paralelo
                switch(tiposPlano[this.tipoPlano]['eixoPar']){
                    case 'z':
                        curdt['x'] = dt.x*i/h;
                        curdt['y'] = dt.y*i/h;
                        curdt['z'] = dt.z*j/w;
                        break;
                    case 'y':
                        curdt['x'] = dt.x*i/h;
                        curdt['y'] = dt.y*j/w;
                        curdt['z'] = dt.z*i/h;
                        break;
                    case 'x':
                        curdt['x'] = dt.x*j/w;
                        curdt['y'] = dt.y*i/h;
                        curdt['z'] = dt.z*i/h;  
                        break;  
                }
                curpix = P[0].clone().addVectors(P[0],curdt);
                pixproj = projetarTela(curpix);
                pixprojs = [];
                pixprojs.push(criarObjeto([Math.floor(pixproj['x']),Math.floor(pixproj['y'])]));
                pixprojs.push(criarObjeto([Math.floor(pixproj['x']),Math.ceil(pixproj['y'])]));
                pixprojs.push(criarObjeto([Math.ceil(pixproj['x']),Math.floor(pixproj['y'])]));
                pixprojs.push(criarObjeto([Math.ceil(pixproj['x']),Math.ceil(pixproj['y'])]));
                totaldist = 0;
                for(var pix of pixprojs){
                    totaldist = totaldist + 1/(1+pixproj.clone().subVectors(pixproj, pix).length());
                };
                rgba = [0,0,0,0];
                for(var pix of pixprojs){
                    pixrgb = imgCtxSec.getImageData(pix['x'],pix['y'],1,1).data;
                    curdist = 1/((1+pixproj.clone().subVectors(pixproj, pix).length())*totaldist);
                    rgba[0] = rgba[0] + pixrgb[0]*curdist;
                    rgba[1] = rgba[1] + pixrgb[1]*curdist;
                    rgba[2] = rgba[2] + pixrgb[2]*curdist;
                    rgba[3] = rgba[3] + pixrgb[3]*curdist;
                };
                pos = 4*(i*w + j);
                buffer[pos] = rgba[0];
                buffer[pos+1] = rgba[1];
                buffer[pos+2] = rgba[2];
                buffer[pos+3] = rgba[3];
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

            // Atualizar profundidade
            //if(planos.length!=0){
            //    ultimaProf = planos[indPlano].P[indSeg][coordDic[lastButtonTex]];
            //}

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