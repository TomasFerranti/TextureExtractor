// Este script é responsável por fornecer diversas funções auxiliares úteis

// -----------------------
// ÚTEIS AO JAVASCRIPT

// Cria um cópia de um array (JS) de arrays (numjs) para acabar com possíveis referências indesejadas
function criarCopia(arr){
    var novoArr = [];
    for (var i = 0; i < arr.length; i++) {
        if(typeof(arr[i])=='number'){
            novoArr.push(arr[i]);      
        }else{
            novoArr.push(arr[i].clone());            
        }
    }
    return novoArr;
}

// Criar um objeto imagedata para a texturar a partir do buffer
function criarImagem(w,h){
    // Criar o elemento escondido da imagem da textura a ser preenchida
    var canvasEscondido = document.createElement('canvas');
    var contextoEscondido = canvasEscondido.getContext('2d');
    canvasEscondido.width = texCanvas.width;
    canvasEscondido.height = texCanvas.height;
    var imgEscondido = contextoEscondido.createImageData(w,h);
    return imgEscondido;
}

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
}

// Limpar as variáveis de camera
function limparVarCamera(){
    statusCalibracao = 'naoCalculada';
    // texCtx.clearRect(0, 0, texCanvas.width, texCanvas.height);
    pontosDeFuga = nj.array([]).reshape(-1,2);
    C = nj.array([]).reshape(-1,3);  
    baseXYZ = nj.zeros([3,3]);
    document.getElementById('output').innerHTML = 'Realize o cálculo da câmera para <br/> as variáveis aparecerem aqui.';
}

// Limpar os pontos do canvas
function limparPontosCanvas(){
    pontosGuia = [nj.array([]).reshape(-1,2),nj.array([]).reshape(-1,2),nj.array([]).reshape(-1,2)];
    pontosExtrair = [];
}

// Limpar todas as variáveis, câmera e pontos guias
function limparTodasVar(){
    limparPontosCanvas();
    limparVarCamera();
}

// Desenha uma linha no canvas da imagem
function reta(A,B,cor){
	imgCtx.strokeStyle = cor;
	imgCtx.lineWidth = 3;
	imgCtx.beginPath();
	imgCtx.moveTo(A.get(0,0),A.get(0,1));
	imgCtx.lineTo(B.get(0,0),B.get(0,1));
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
}

// Verificar se dois arrays são iguais
function arr_igual(a1, a2){
    if ((a1.shape[0] != a2.shape[0]) || (a1.shape[1] != a2.shape[1])){
        return false;
    }
    for (var i=0; i<a1.shape[0];  i++){
        for (var j=0; j<a1.shape[1]; j++){
            if(a1.get(i,j)!=a2.get(i,j)){
                return false;
            }
        }
    }
    return true;
}

// Calcula a área do triangulo delimitado pelos três pontos no R^2
function area_triangulo(p,q,r){
    return(p.get(0,0) * q.get(0,1) + q.get(0,0) * r.get(0,1) + 
    r.get(0,0) * p.get(0,1) - p.get(0,1) * q.get(0,0) - 
    q.get(0,1) * r.get(0,0) - r.get(0,1) * p.get(0,0)); 
}

// Calcula a interseção da reta determinada por dois segmentos de reta
// Esses segmentos são determinados por dois pontos cada, 'p' e 'q' para o primeiro, 'r' e 's' para o segundo
function inter_retas(p,q,r,s){
    var a1 = area_triangulo(p, q, r);
    var a2 = area_triangulo(q, p, s);
    var amp = a1/(a1+a2);
    return (r.multiply(1-amp).add(s.multiply(amp)));
}

// Projeta o vetor 'Va' no vetor 'Vb' e adiciona uma posição 'q'
function proj(Va, Vb, q){
    var c = Va.get(0,0)*Vb.get(0,0) + Va.get(0,1)*Vb.get(0,1);
    var v = Vb.get(0,0)*Vb.get(0,0) + Vb.get(0,1)*Vb.get(0,1);
    var P = Vb.multiply(c/v);
    return (P.add(q));
}

// Retorna a norma do 'vector'
function norma(vector){
    return( nj.sum(vector.pow(2))**(1/2));
}

// Retorna o 'vector' normalizado
function normalizar(vector){
    return(vector.multiply(1/norma(vector)));
}

// Adiciona uma terceira coordenada zero ao 'vector'
function adicHom(vector){
    return(nj.array([vector.get(0,0),vector.get(0,1),0]).reshape(1,3));
}

// Remove a terceira coordenada do 'Vector'
function remHom(vector){
    return(nj.array([vector.get(0,0),vector.get(0,1)]).reshape(1,2));
}

// Desprojeta um 'vector' do canvas da imagem dado seu 'plano' no espaço e a profundidade deste plano
function desprojetarTela(vector,plano,prof) {
    var Q = adicHom(vector).subtract(C);
    Q = nj.dot(baseXYZ.T,Q.reshape(3,1)).reshape(1,3);
    switch(plano){
        case 'YZ':
            Q = Q.multiply(prof/Q.get(0,0));
            break;
        case 'XZ':
            Q = Q.multiply(prof/Q.get(0,1));
            break;
        case 'XY':
            Q = Q.multiply(prof/Q.get(0,2));
            break;
        default:
            // pass
    }
    return(Q);
}
  
// Projeta um 'vector' do sistema de coordenadas do espaço na tela
function projetarTela(vector){
    var Q = nj.dot(baseXYZ,vector.reshape(3,1)).reshape(1,3);
    Q = Q.multiply(-C.get(0,2)/Q.get(0,2)).add(C);
    Q = remHom(Q);
    return(Q); 
}

// Dado um ponto e um segmento de reta (definido por dois pontos), calcula a distância
function distanciaSegmento(x,y,x1,y1,x2,y2){
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;
    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0)
        param = dot / len_sq;
    
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
    }
    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

// Obtém os dois pontos pertencentes aos segmentos mais próximos do mouse
function segmentoMaisProximo(mouse){
    var ci, cj, cd;
    var dist = 20000;
    for(var j=0; j<planos.length;j++){
        for(var i=0; i<4; i++){
            cd = distanciaSegmento(mouse.get(0,0), mouse.get(0,1),
                                   planos[j].v[i].get(0,0), planos[j].v[i].get(0,1),
                                   planos[j].v[(i+1)%4].get(0,0), planos[j].v[(i+1)%4].get(0,1));
            if(cd<dist){
                dist = cd;
                ci = i;
                cj = j;
            }
        }
    }
    var ponto1 = planos[cj].v[ci].clone();
    var ponto2 = planos[cj].v[(ci+1)%4].clone();
    var profundidade = planos[cj].P[(ci+1)%4].get(0,auxDic[lastButtonTex]);
    return [ponto1, ponto2, profundidade];
}
// -----------------------