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