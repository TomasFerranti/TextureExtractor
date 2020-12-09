function getColor(text) {
    return (text ? "darkgrey" : "lightgrey");
}

function clearVariables(){
    pontos_guia = [nj.array([]).reshape(-1,2),nj.array([]).reshape(-1,2),nj.array([]).reshape(-1,2)];
    pontos_extrair = nj.array([]).reshape(-1,2);
}

function line(A,B,cor){
	imgCtx.strokeStyle = cor;
	imgCtx.lineWidth = 3;
	imgCtx.beginPath();
	imgCtx.moveTo(A.get(0,0),A.get(0,1));
	imgCtx.lineTo(B.get(0,0),B.get(0,1));
	imgCtx.stroke();
};

function point(cx,cy,raio,cor){
	imgCtx.beginPath();
	imgCtx.arc(cx,cy, raio, 0, Math.PI * 2, false);
	imgCtx.fillStyle = cor;
	imgCtx.fill();
};

function triangle_area(p,q,r){
    return(p.get(0,0) * q.get(0,1) + q.get(0,0) * r.get(0,1) + 
    r.get(0,0) * p.get(0,1) - p.get(0,1) * q.get(0,0) - 
    q.get(0,1) * r.get(0,0) - r.get(0,1) * p.get(0,0)); 
}

function intersect(p,q,r,s){
    var a1 = triangle_area(p, q, r);
    var a2 = triangle_area(q, p, s);
    var amp = a1/(a1+a2);
    return (r.multiply(1-amp).add(s.multiply(amp)));
}

function print_array(arr){
    for(var i=0; i<arr.shape[0]; i++){
        for(var j=0; j<arr.shape[1]; j++){
            console.log(arr.get(i,j));
        }
    }
}

// função que projeta um vetor Va em um Vb
// partindo de um ponto q, retorna o ponto projetado
function proj(Va, Vb, q){
    var c = Va.get(0,0)*Vb.get(0,0) + Va.get(0,1)*Vb.get(0,1);
    // produto escalar (dot product) <Va, Vb>.
    var v = Vb.get(0,0)*Vb.get(0,0) + Vb.get(0,1)*Vb.get(0,1);
    // modulo ^2 de vB

    var P = Vb.multiply(c/v);
    // P vale Vb * (c/v)

    return (P.add(q));
    // (q[0] + p[0], q[1] + P[1])
}