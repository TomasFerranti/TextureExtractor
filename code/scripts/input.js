// IMAGE INPUT

var imgCanvas = document.getElementById("imagem_canvas");
var imgCtx = imgCanvas.getContext("2d");

var imgImagem = new Image();
imgImagem.crossOrigin = "";
imgImagem.src = "";

imgImagem.onload = function(){
	imgCtx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
	imgCtx.drawImage(imgImagem, 0, 0, imgImagem.width, imgImagem.height,    
								0, 0, imgCanvas.width, imgCanvas.height); 
};


// BUTTOM INPUT

document.getElementById("bt_carregar").addEventListener("click", function () {
	x = prompt("Por favor insira a URL da imagem desejada.");
	imgImagem.src = x;
	clearVariables();
	update();
});

document.getElementById("bt_calcular").addEventListener("click", function () {
	calc();
	update();
});

lastButton = "";
document.getElementById("bt_guiaX").addEventListener("click", function () {
	lastButton = "X";
	update();
});
document.getElementById("bt_guiaY").addEventListener("click", function () {
	lastButton = "Y";
	update();
});
document.getElementById("bt_guiaZ").addEventListener("click", function () {
	lastButton = "Z";
	update();
});
document.getElementById("bt_extrair").addEventListener("click", function () {
	lastButton = "extrair";
	update();
});


// POINT INPUT

// X, Y e Z
var pontos_guia = [nj.array([]).reshape(-1,2),nj.array([]).reshape(-1,2),nj.array([]).reshape(-1,2)];
// Extrair
var pontos_extrair = nj.array([]).reshape(-1,2);

// Clicou no canvas
imgCanvas.addEventListener("click", function (e) {
	var rect = imgCanvas.getBoundingClientRect();
	var mouse = nj.array([e.pageX-rect.x,e.pageY-rect.y]).reshape(2,-1);
	switch (lastButton){
		case "X":
			pontos_guia[0] = nj.concatenate(pontos_guia[0].T,mouse).T;
			break;
		case "Y":
			pontos_guia[1] = nj.concatenate(pontos_guia[1].T,mouse).T;
			break;
		case "Z":
			pontos_guia[2] = nj.concatenate(pontos_guia[2].T,mouse).T;
			break;
		case "extrair":
			pontos_extrair = nj.concatenate(pontos_extrair.T,mouse).T;
			break;
		default:
			//pass
	}
	update();
});