// Este script é responsável por fornecer diversas funções auxiliares úteis

// -----------------------
// ÚTEIS AO JAVASCRIPT

// Criar uma cópia de um array (JS) de vectors (numjs) para acabar com possíveis referências indesejadas
function criarCopia(arr){
    var novoArr = [];
    for (var i = 0; i < arr.length; i++) {
        if(typeof(arr[i])=='number'){
            novoArr.push(arr[i]);      
        }else{
            novoArr.push(arr[i].clone());            
        };
    };
    return novoArr;
};

// Criar um objeto imagedata para a textura a partir do buffer
function criarImagem(w,h){
    // Criar o elemento escondido da imagem da textura a ser preenchida
    var canvasEscondido = document.createElement('canvas');
    var contextoEscondido = canvasEscondido.getContext('2d');
    canvasEscondido.width = texCanvas.width;
    canvasEscondido.height = texCanvas.height;
    var imgEscondido = contextoEscondido.createImageData(w,h);
    return imgEscondido;
};

// Transformar um objeto imagedata em img
function imagedataParaImage(imagedataEscondido) {
    var canvasEscondido = document.createElement('canvas');
    var ctxEscondido = canvasEscondido.getContext('2d');
    canvasEscondido.width = imagedataEscondido.width;
    canvasEscondido.height = imagedataEscondido.height;
    ctxEscondido.putImageData(imagedataEscondido, 0, 0);

    var imageEscondido = new Image();
    imageEscondido.src = canvasEscondido.toDataURL();
    return imageEscondido;
};

// Limpar as variáveis de camera
function limparVarCamera(){
    statusCalibracao = 'naoCalculada';
    indiceTexturaPlanoAtual = null;
    pontosDeFuga = [];
    C = new THREE.Vector3();  
    baseXYZ = new THREE.Matrix3();
    CO = new THREE.Vector2();
    document.getElementById('output').innerHTML = 'Camera calibration is needed <br/> for variables to show up.';
    pontosMetrica = [];
    escalaMundoMetro = null;
    segmentoMetrica = [];
    segmentoMetricaTamanho = null;
    planos = [];
    texCanvasPlanoCtx.clearRect(0, 0, texCanvasPlano.width, texCanvasPlano.height);
    for (const [key, value] of Object.entries(tiposPlano)) {
        if(!(['XY','YZ','XZ'].includes(key))){
            value['objeto'].parentNode.removeChild(value['objeto']);
            delete(tiposPlano[key]);
        }
    };
};
// Limpar os pontos do canvas
function limparPontosCanvas(){
    pontosGuia = [[],[],[]];
    pontosExtrair = [];
};

// Limpar todas as variáveis, câmera e pontos guias
function limparTodasVar(){
    limparPontosCanvas();
    limparVarCamera();
};

// Desenha uma linha no canvas da imagem
function reta(A,B,cor){
	imgCtx.strokeStyle = cor;
	imgCtx.lineWidth = 3;
	imgCtx.beginPath();
	imgCtx.moveTo(A.x,A.y);
	imgCtx.lineTo(B.x,B.y);
	imgCtx.stroke();
};

// Desenha um ponto no canvas da imagem
function ponto(cx,cy,raio,cor){
	imgCtx.beginPath();
	imgCtx.arc(cx,cy, raio, 0, Math.PI * 2, false);
	imgCtx.fillStyle = cor;
	imgCtx.fill();
};

// Arredonda um número 'x' para 'n' casas decimais
function arredondar(x,n){
    return (Math.round((10**n)*x)/(10**n));
};

// Verificar se dois vetores são iguais com uma margem de 0.00001
function arr_igual(a1, a2){
    switch(a1.toArray().length){
        case 2:
            if (Math.abs(a1.x-a2.x)+Math.abs(a1.y-a2.y) > 0.00001){
                return false;
            };
            break;
        case 3:
            if (Math.abs(a1.x-a2.x)+Math.abs(a1.y-a2.y)+Math.abs(a1.z-a2.z) > 0.00001){
                return false;
            };
            break;
        default:
            // pass
    };
    return true;
};

// Realizar a interpolação bilinear do valor do pixel para cada coordenada
function bilinear_interpolation(pixprojs,pixprojs_rgb,pixproj){
    // Trocar para vetor
    for(var k=0; k<4; k++){
        pixprojs_rgb[k] = criarObjeto([pixprojs_rgb[k][0],pixprojs_rgb[k][1],pixprojs_rgb[k][2]]); 
    };
    // Fórmula presente em https://en.wikipedia.org/wiki/Bilinear_interpolation
    var c, dx1, dx2, dy1, dy2;
    c = 1/((pixprojs[3]['x']-pixprojs[0]['x'])*(pixprojs[3]['y']-pixprojs[0]['y']));
    dx1 = pixprojs[3]['x'] - pixproj['x'];
    dx2 = pixproj['x'] - pixprojs[0]['x'];
    dy1 = pixprojs[3]['y'] - pixproj['y'];
    dy2 = pixproj['y'] - pixprojs[0]['y'];

    var vec1, vec2;
    vec1 = new THREE.Vector2(dx1, dx2);
    var pixproj_rgb = new THREE.Vector3();
    for(var coord of ['x','y','z']){
        vec2 = new THREE.Vector2(dy1*pixprojs_rgb[0][coord] + dy2*pixprojs_rgb[1][coord], 
                                 dy1*pixprojs_rgb[2][coord] + dy2*pixprojs_rgb[3][coord]);
        pixproj_rgb[coord] = c * (vec1.dot(vec2));
    };
    return pixproj_rgb;
};

// Calcula a área do triangulo delimitado pelos três pontos no R^2
function area_triangulo(p,q,r){
    return(p.x*q.y + q.x*r.y + r.x*p.y - p.y*q.x - q.y*r.x - r.y*p.x);
};

// Calcula a interseção da reta determinada por dois segmentos de reta
// Esses segmentos são determinados por dois pontos cada, 'p' e 'q' para o primeiro, 'r' e 's' para o segundo
function inter_retas(p,q,r,s){
    var a1 = area_triangulo(p, q, r);
    var a2 = area_triangulo(q, p, s);
    var amp = a1/(a1+a2);
    var result = new THREE.Vector2();
    return result.addVectors(r.clone().multiplyScalar(1-amp),s.clone().multiplyScalar(amp));
};

// Projeta o vetor 'Va' no vetor 'Vb' e adiciona uma posição 'q'
function proj(Va, Vb, q){
    var c = Va.x*Vb.x + Va.y*Vb.y;
    var v = Vb.x*Vb.x + Vb.y*Vb.y;
    var P = Vb.clone().multiplyScalar(c/v);
    return (P.addVectors(P,q));
};

// Adiciona uma terceira coordenada zero ao 'vector'
function adicHom(vector){
    var result = new THREE.Vector3(vector.x,vector.y,0);
    return(result);
};

// Remove a terceira coordenada do 'Vector'
function remHom(vector){
    var result = new THREE.Vector2(vector.x,vector.y)
    return(result);
};

// Desprojeta um 'vector' do canvas da imagem dado seu 'plano' no espaço e a profundidade deste plano
function desprojetarTela(vector,plano,prof) {
    vector2 = adicHom(vector);
    var Q = vector2.subVectors(vector2,C);
    Q = Q.applyMatrix3(baseXYZ.clone().transpose());
    switch(plano){
        case 'YZ':
            Q.multiplyScalar(prof/Q.x);
            break;
        case 'XZ':
            Q.multiplyScalar(prof/Q.y);
            break;
        case 'XY':
            Q.multiplyScalar(prof/Q.z);
            break;
        default:
            // pass
    };
    return(Q);
};

// Projeta um 'vector' do sistema de coordenadas do espaço na tela
function projetarTela(vector){
    var Q = vector.clone().applyMatrix3(baseXYZ);
    Q.multiplyScalar(-C.z/Q.z);
    Q.addVectors(Q,C);
    Q = remHom(Q.clone());
    return(Q); 
}

// Dado um ponto e um segmento de reta (definido por dois pontos), calcula a distância minima entre estes
function distanciaSegmento(x,y,x1,y1,x2,y2){
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;
    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0){
        param = dot / len_sq;
    };

    var xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    }else if(param > 1) {
        xx = x2;
        yy = y2;
    }else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    };
    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
};

// Dado três pontos X, A e B, verifica se X está no segmento AB
function dentroSegmento(x,A,B){
    var dis1, dis2, dis3;
    dis1 = x.clone().subVectors(x,A).length()
    dis2 = x.clone().subVectors(x,B).length()
    dis3 = A.clone().subVectors(A,B).length()
    if(Math.abs(dis1 + dis2 - dis3) < 0.0000001){
        return true;
    } ;
    return false;
};

// Dado um ponto e quatro vértices de um paralelogramo, determina se o ponto está dentro
function dentroParalelogramo(p,p1,p2,p3,p4){
    var area_paralel = Math.abs(area_triangulo(p1,p2,p4)) + Math.abs(area_triangulo(p2,p3,p4));
    var area_triangulos = Math.abs(area_triangulo(p,p1,p2)) + 
                          Math.abs(area_triangulo(p,p2,p3)) + 
                          Math.abs(area_triangulo(p,p3,p4)) + 
                          Math.abs(area_triangulo(p,p4,p1));
    if(Math.abs(area_paralel - area_triangulos)<0.0000001){
        return true;
    };
    return false;
};

// Checa se um ponto X da tela está dentro do interior de algum dos paralelogramos definidos pelos planos
function dentroPlanos(x){
    for(var i=0; i < planos.length; i++){
        var plano = planos[i];
        // Checa se está em um dos segmentos
        for(var j=0; j<4; j++){
            if(dentroSegmento(x,plano.v[j],plano.v[(j+1)%4])){
                return [false,null];
            };
        };
        // Checa se está dentro do plano
        if(dentroParalelogramo(x,plano.v[0],plano.v[1],plano.v[2],plano.v[3])){
            return [true,i];
        };
    };

    return [false,null];
};

// Obtém os dois indices: do plano e do segmento pertencentes ao segmento mais próximo do mouse
function segmentoMaisProximo(mouse){
    var ci, cj, cd;
    var dist = 20000;
    for(var j=0; j<planos.length;j++){
        for(var i=0; i<4; i++){
            cd = distanciaSegmento(mouse.x, mouse.y,
                                   planos[j].v[i].x, planos[j].v[i].y,
                                   planos[j].v[(i+1)%4].x, planos[j].v[(i+1)%4].y);
            if(cd<dist){
                dist = cd;
                ci = i;
                cj = j;
            };
        };
    };
    return [cj, ci];
};

// Criar o objeto do THREE a partir de um array
function criarObjeto(arr){
    switch(arr.length){
        case 2:
            var objeto = new THREE.Vector2(arr[0],arr[1]);
            break;
        case 3:
            var objeto = new THREE.Vector3(arr[0],arr[1],arr[2]);
            break;
        case 9:
            var objeto = new THREE.Matrix3();
            objeto['elements'] = arr;
            break;
        default:
    };
    return(objeto);
};

// Criar o objeto do THREE a partir de um array de dicionários
function criarObjetoArrDic(arrDic){
    var arr = [];
    for(var dic of arrDic){
        if(Object.keys(dic).length == 2){
            arr.push(new THREE.Vector2(dic.x,dic.y));
        }else{
            arr.push(new THREE.Vector3(dic.x,dic.y,dic.z));
        };
    };
    return arr;
};

// Funções novas com a adição de planos paralelos à um eixo
// SCC para SCM
function cameraParaMundo(p) {
    var q = new THREE.Vector3();
    q = p.clone().applyMatrix3(baseXYZ.clone().transpose());
    return q;
};
  
// SCM para SCC
function mundoParaCamera(p) {
    var q = new THREE.Vector3();
    q = p.clone().applyMatrix3(baseXYZ);
    return q;
};

// Dado um ponto da tela, o vetor do plano ortogonal ao eixo, um ponto do plano e seu eixo pararelo
// Conseguimos obter suas coordenadas no espaço
// v ponto da tela, dw interseção com pontos de fuga, p0 ponto do plano, eixo paralelo
function desprojetarTela2(v, dw, p0, eixo) {
    var Q = adicHom(v);
    var Q = Q.subVectors(Q, C);
    var Qw = cameraParaMundo(Q);
    var e = new THREE.Vector3();
    e[eixo] = 1;
    var dwClone = dw.clone().normalize();
    var n = dwClone.clone().crossVectors(dw,e);
    var t = p0.dot(n)/Qw.dot(n);
    Qw.multiplyScalar(t);
    return Qw;
};

// Coloca textura de um plano no canvas lateral
var indiceTexturaPlanoAtual = null;
function plotarTexturaPlano(textura){
    var tempImg = imagedataParaImage(textura);
    tempImg.onload = function(){
        var [w,h] = [tempImg.width, tempImg.height];
        var cEscalaTex = 0, wInicioTex = 0, hInicioTex = 0;
        if(texCanvasPlano.width/texCanvasPlano.height > w/h){
            cEscalaTex = texCanvasPlano.height/h;
            wInicioTex = Math.trunc((texCanvasPlano.width - cEscalaTex*w)/2);
        }else{
            cEscalaTex = texCanvasPlano.width/w;
            hInicioTex = Math.trunc((texCanvasPlano.height - cEscalaTex*h)/2);
        };
        texCanvasPlanoCtx.clearRect(0, 0, texCanvasPlano.width, texCanvasPlano.height);
        texCanvasPlanoCtx.drawImage(tempImg, 0, 0, w, h,    
                                    wInicioTex, hInicioTex, cEscalaTex*w, cEscalaTex*h);
    };
};

// -----------------------