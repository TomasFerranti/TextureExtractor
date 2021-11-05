// Este script é responsável pelo cálculo da câmera e extração de texturas

// -----------------------
// CÁLCULO DA CÂMERA

// Variáveis globais de calibração da câmera (pontos de fuga, posição da câmera, matriz de transformação do sistema de coordenadas)
var pontosDeFuga = [];
var C = new THREE.Vector3();  
var baseXYZ = new THREE.Matrix3();
var CO = new THREE.Vector2();

// Função chamada quando se pede o cálculo da calibração da câmera 
// tipoCalc é normal quando se tem os três eixos e centrado quando o centro óptico está no centro da imagem
function calc(){
    // Determinar tipo de calc e qual indice do ponto de fuga está faltando
    var tipoCalc = 'normal';
    var indFalt = 0;
    for(var j=0; j<3; j++){
        if (pontosGuia[j%3].length == 0 && pontosGuia[(j+1)%3].length > 0 && pontosGuia[(j+2)%3].length > 0){
            tipoCalc = 'centrado';
            indFalt = j;
            break;
        }
    }

    // Número de pontos guias insuficientes
    if ((pontosGuia[indFalt].length < 4 && tipoCalc == 'normal') || pontosGuia[(indFalt+1)%3].length < 4 || pontosGuia[(indFalt+2)%3].length < 4){
        alert('Please choose two or more segments for each axis!');
        return;
    }

    // Número de pontos guias ímpares para alguma dimensão (pontos soltos)
    if (pontosGuia[0].length % 2 == 1 || pontosGuia[1].length % 2 == 1 || pontosGuia[2].length % 2 == 1){
        alert('Please finish the remaining segment points of the calibration!');
        return;
    }

    // Cálculo dos pontos de fuga
    // Para cada dimensão, ache a intersecção par a par dos pontos
    // Depois, tire a média dessas intersecções
    var casosInd = {0:[1,2], 1:[0,2], 2:[0,1]};
    var indsIte = tipoCalc == 'centrado' ? casosInd[indFalt] : [0,1,2];

    for(var j of indsIte){
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

    var Fx, Fy, Fz;
    // Dividindo os casos de calc para achar CO e os Fx, Fy, Fz
    if(tipoCalc == 'normal'){
        Fx = pontosDeFuga[0].clone();
        Fy = pontosDeFuga[1].clone();
        Fz = pontosDeFuga[2].clone();

        // Projetar os vetores das arestas do triangulo formado
        // pelos centros ópticos para achar a base das alturas
        var hx = proj(Fx.clone().subVectors(Fx,Fy), Fz.clone().subVectors(Fz,Fy), Fy.clone());
        var hy = proj(Fy.clone().subVectors(Fy,Fz), Fx.clone().subVectors(Fx,Fz), Fz.clone());

        // Cálculo do centro óptico
        CO = inter_retas(Fx.clone(), hx.clone(), Fy.clone(), hy.clone());
    }else if(tipoCalc == 'centrado'){
        Fx = pontosDeFuga[0].clone();
        Fy = pontosDeFuga[1].clone();

        // Centro óptico no centro da imagem
        CO = new THREE.Vector2(imgCanvas.width/2, imgCanvas.height/2);

        var n = Fy.clone().subVectors(Fy,Fx);
        
        // Rotaciona 90 graus
        n = new THREE.Vector2(-n.y,n.x)

        // Calcula t do Fz
        var t_par = (CO.length()**2 + Fx.dot(Fy) - CO.dot(Fx.clone().addVectors(Fx,Fy)))/(Fx.dot(n)-CO.dot(n));
        n.multiplyScalar(t_par);
        Fz = CO.clone().addVectors(CO,n); 

        // Reordena variáveis:
        var casosTroca = {0:[2,0,1], 1:[0,2,1], 2:[0,1,2]};
        pontosDeFuga = [Fx, Fy, Fz];
        var casoCorreto = casosTroca[indFalt];
        [Fx, Fy, Fz] = [pontosDeFuga[casoCorreto[0]], pontosDeFuga[casoCorreto[1]], pontosDeFuga[casoCorreto[2]]];
        pontosDeFuga = [Fx, Fy, Fz];
    }else{
        alert('Error, type of calc not specified!');
    }
    
    

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

    // Adicionar os planos XY, YZ e XZ como tipos de planos
    adicionarDadosPlanosOrts();

    // Mostrar resultados na tela no prompt à direita
    mostrarResultados();
}
// -----------------------


// -----------------------
// EXTRAÇÃO DA TEXTURA

// Canvas da textura
var texCanvasPlano = document.getElementById('texturaCanvasPlano');
var texCanvasPlanoCtx = texCanvasPlano.getContext('2d');


// Criar um novo tipo de plano a partir do segmento paralelo e eixo paralelo
var tiposPlano = {};
// Guardar os pontos em planoSeg
var planoSeg = [];
var coordEixoInd = {'x':0, 'y':1, 'z':2}
function criarNovoPlano(mouse){
    if(baseXYZ.equals(new THREE.Matrix3())){
        alert('Camera calibration is needed!');
        return;
    };
    planoSeg.push(mouse);
    if (planoSeg.length == 2){
        // Coletar dados do plano e criar seu objeto
        var nome = prompt('Insert the new plane type name!');
        var eixoPar = prompt('Insert the parallel axis to this plane (x,y or z)!');
        criarNovoTipoPlano(nome,eixoPar);
    };
};

// Criar o novo tipo de plano
function criarNovoTipoPlano(nome,eixoPar){
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

    // Calcular seu ponto de fuga e armazená-lo
    var coordInd = coordEixoInd[eixoPar];
    var Fh = inter_retas(planoSeg[0], planoSeg[1], pontosDeFuga[(coordInd+1)%3], pontosDeFuga[(coordInd+2)%3]);
    tiposPlano[nome] = {'planoSeg':planoSeg, 'pontoDeFuga':Fh, 'eixoPar':eixoPar, 'objeto':novoObjeto};
    planoSeg = [];
};

// Adicionar os dados dos planos paralelos aos ortogonais comuns 'YZ', 'XZ' e 'XY'
var coordEixo = {'YZ':'z','XZ':'z','XY':'x'};
var coordFuga = {'XZ':0,'YZ':1,'XY':1}
function adicionarDadosPlanosOrts(){
    for(nome in coordEixo){
        tiposPlano[nome] = {'planoSeg':[pontosGuia[coordFuga[nome]][0],pontosGuia[coordFuga[nome]][1]], 
                            'pontoDeFuga':pontosDeFuga[coordFuga[nome]], 
                            'eixoPar':coordEixo[nome], 
                            'objeto':document.getElementById('btPlano'+nome)};
    };
};

var coordDic = {'YZ':'x','XZ':'y','XY':'z'};
// Classe criada para representar os planos
class Plano {
    // Chamado na instanciação
    constructor(indPlano,indSeg,tipoPlano,v=[0,0,0,0],P=[0,0,0,0]) {
        // Atributos iniciais
        this.indPlanoCon = indPlano;
        this.indSegCon = indSeg;
        this.tipoPlano = tipoPlano;

        // Atribuir à classe
        this.v = v;
        this.P = P;
    };

    // Obtém o restante dos pontos na tela e no espaço
    obterPontos(){
        // v são os pontos do canvas 2D
        var v = [pontosExtrair[0], pontosExtrair[1], pontosExtrair[2], 0];

        // P são os pontos no espaço 3D, caso seja o primeiro plano desprojetar normalmente
        // Caso não, desprojetar pelo eixo paralelo
        var pontoDoPlano;
        if(indPlano==null){
            pontoDoPlano = new THREE.Vector3(1,1,1);
        }else{
            pontoDoPlano = planos[this.indPlanoCon].P[this.indSegCon];
        };
        var Fh = tiposPlano[this.tipoPlano]['pontoDeFuga'];
        Fh = desprojetarTela(Fh,null,null);
        var eixo = tiposPlano[this.tipoPlano]['eixoPar'];
        var P = [desprojetarTela2(v[0].clone(),Fh,pontoDoPlano,eixo), 
                 desprojetarTela2(v[1].clone(),Fh,pontoDoPlano,eixo), 
                 desprojetarTela2(v[2].clone(),Fh,pontoDoPlano,eixo), 
                 0]; 
        
        // Atribuir à classe
        this.v = criarCopia(v);
        this.P = criarCopia(P);

        // Preencher P corretamente
        var subP = criarCopia(this.P);
        this.P = [];

        // Vetores 3D
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
        // Testando todas as possíveis coordenadas dos dois pontos restantes de modo a projeção intersectar o ponto de fuga
        var possibleCoords = [['x'],['y'],['z'],['x','y'],['x','z'],['y','z']];
        for(var coordsAux of possibleCoords){
            // Preencher os dois últimos pontos
            for(var coord of ['x','y','z']){
                if (coordsAux.includes(coord)){
                    this.P[2][coord] = subP[2][coord];
                    this.P[3][coord] = subP[2][coord];
                }else{
                    this.P[2][coord] = this.P[1][coord];
                    this.P[3][coord] = this.P[0][coord];
                }
            }
            // Verificar projeção
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
                        break;
                    };
                };
            };
            // Caso tenha encontrado, parar de procurar
            if(flag){
                break;
            };
        };

        // Corrigir índices dos pontos dado o segmento conectado
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
    };

    obterTextura(){
        var v = this.v;
        var P = this.P;

        // Heurística de aspect ratio
        var dy = (v[0].clone().subVectors(v[0],v[1]).length() + v[2].clone().subVectors(v[2],v[3]).length())/2;
        var dx = (v[0].clone().subVectors(v[0],v[3]).length() + v[1].clone().subVectors(v[1],v[2]).length())/2;
        var Dy = P[0].clone().subVectors(P[0],P[1]).length();
        var Dx = P[1].clone().subVectors(P[1],P[2]).length();
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
                curdt['x'] = dt1.x*j/w + dt2.x*i/h;
                curdt['y'] = dt1.y*j/w + dt2.y*i/h;
                curdt['z'] = dt1.z*j/w + dt2.z*i/h;
                curpix = P[0].clone().addVectors(P[0],curdt);

                // Criar os objetos para interpolação bilinear
                // Quatro pixels e seus valores em pixprojs e pixprojs_rgb, enquanto pixproj corresponde ao nosso ponto
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

                // Interpolar e preencher
                pix_rgb = bilinear_interpolation(pixprojs,pixprojs_rgb,pixproj);
                pos = 4*(i*w + j);
                buffer[pos] = pix_rgb['x'];
                buffer[pos+1] = pix_rgb['y'];
                buffer[pos+2] = pix_rgb['z'];
                buffer[pos+3] = 255;
            };
        };
                          
        // Adiciona a textura como atributo da classe
        this.textura = imgData;
    };
};

// Variáveis globais do canvas da textura
var planos = [];
var indPlano, indSeg;

// Função chamada quando se clica no canvas com extrair selecionado
function extrairTextura(mouse){
    // Caso não tenha o cálculo da câmera
    if(baseXYZ.equals(new THREE.Matrix3())){
        alert('Camera calibration is needed!');
        return;
    };

    // Para cada quantidade de pontos já selecionada
    switch (pontosExtrair.length){
        case 0: case 1:
            if(planos.length==0){
                pontosExtrair.push(mouse.clone());
                [indPlano, indSeg] = [null, null];
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
            var novoPlano = new Plano(indPlano,indSeg,lastButtonTex); 

            // Terminar de preencher os pontos
            novoPlano.obterPontos();

            // Extrair a textura
            novoPlano.obterTextura();

            // Checar se o novo plano possui pontos de projeção dentro dos paralelogramos de outros planos
            var flagDentroPlanos = false;
            var centroPlano = new THREE.Vector2();
            for(var i=0; i<4; i++){
                centroPlano.addVectors(centroPlano, novoPlano.v[i]);
                if(dentroPlanos(novoPlano.v[i])[0]){
                    flagDentroPlanos = true;
                }
            }
            centroPlano.multiplyScalar(1/4);
            if(dentroPlanos(centroPlano)[0]){
                flagDentroPlanos = true;
            }

            // Se é um plano válido
            if(flagDentroPlanos){
                alert('Not a valid plane!');
            }else{
                plotarTexturaPlano(novoPlano.textura);
                indiceTexturaPlanoAtual = planos.length;
                planos.push(novoPlano);
                adicQuadrilatero(novoPlano);
            }

            // Atualizar pontosExtrair para receber próximos pontos
            pontosExtrair = [];
    };
}

var pontosMetrica = [];
var escalaMundoMetro = null;
// Função para uma nova métrica
function novaMetrica(mouse){
    if(statusCalibracao == 'naoCalculada' && planos.length==0){
        alert('Camera calibration and an initial plane is needed!');
        return;
    }
    if(pontosMetrica.length == 0 || pontosMetrica.length == 2){
        pontosMetrica = [mouse];
    }else{
        pontosMetrica.push(mouse);
        // Condições para cálculo
        var pontosMetricaRes = [dentroPlanos(pontosMetrica[0]),dentroPlanos(pontosMetrica[1])];
        var typeplane1 = null;
        var typeplane2 = null;
        if(pontosMetricaRes[0][1] != null){
            typeplane1 = planos[pontosMetricaRes[0][1]].tipoPlano;
        };
        if(pontosMetricaRes[1][1] != null){
            typeplane2 = planos[pontosMetricaRes[1][1]].tipoPlano;
        };
        if(pontosMetricaRes[0][0] == false || pontosMetricaRes[1][0] == false || typeplane1 != typeplane2){
            alert('Invalid segment! Please choose a valid one.');
            pontosMetrica = [];
            return;
        };

        // Descobrir escala no mundo tridimensional destes pontos
        var plano = planos[pontosMetricaRes[0][1]];
        var pontoDoPlano = plano.P[0];
        var Fh = tiposPlano[plano.tipoPlano]['pontoDeFuga'];
        Fh = desprojetarTela(Fh,null,null);
        var eixo = tiposPlano[plano.tipoPlano]['eixoPar'];
        var P = [desprojetarTela2(pontosMetrica[0].clone(),Fh,pontoDoPlano,eixo), 
                 desprojetarTela2(pontosMetrica[1].clone(),Fh,pontoDoPlano,eixo)];
        var escalaMundo = P[0].clone().subVectors(P[0],P[1]).length();

        // Definindo a razão da escala
        var escalaMetro = parseFloat(prompt("What's the length of this segment in meters?"));
        escalaMundoMetro = escalaMetro/escalaMundo;
    };
};

var segmentoMetrica = [];
var segmentoMetricaTamanho = null;
// Função para calcular o comprimento de um segmento
function calcularTamanho(mouse){
    if(escalaMundoMetro==null){
        alert('A metric is needed first!');
        return;
    };

    if(segmentoMetrica.length == 0 || segmentoMetrica.length == 2){
        segmentoMetrica = [mouse];
    }else{
        segmentoMetrica.push(mouse);
        // Condições para cálculo
        var segmentoMetricaRes = [dentroPlanos(segmentoMetrica[0]),dentroPlanos(segmentoMetrica[1])];
        var typeplane1 = null;
        var typeplane2 = null;
        if(segmentoMetricaRes[0][1] != null){
            typeplane1 = planos[segmentoMetricaRes[0][1]].tipoPlano;
        };
        if(segmentoMetricaRes[1][1] != null){
            typeplane2 = planos[segmentoMetricaRes[1][1]].tipoPlano;
        };
        if(segmentoMetricaRes[0][0] == false || segmentoMetricaRes[1][0] == false || typeplane1 != typeplane2){
            alert('Invalid segment! Please choose a valid one.');
            segmentoMetrica = [];
            return;
        };

        // Calcular seu tamanho e armazenar os seus dados
        var plano = planos[segmentoMetricaRes[0][1]];
        var pontoDoPlano = plano.P[0];
        var Fh = tiposPlano[plano.tipoPlano]['pontoDeFuga'];
        Fh = desprojetarTela(Fh,null,null);
        var eixo = tiposPlano[plano.tipoPlano]['eixoPar'];
        var P = [desprojetarTela2(segmentoMetrica[0].clone(),Fh,pontoDoPlano,eixo), 
                 desprojetarTela2(segmentoMetrica[1].clone(),Fh,pontoDoPlano,eixo)];
        segmentoMetricaTamanho = P[0].clone().subVectors(P[0],P[1]).length();
        segmentoMetricaTamanho = segmentoMetricaTamanho*escalaMundoMetro;
                        
        mostrarResultados();
    };


};
// -----------------------