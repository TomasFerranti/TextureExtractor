var imgCanvas = document.getElementById("imagem_canvas");
var imgCtx = imgCanvas.getContext("2d");

var imgImagem = new Image();
imgImagem.crossOrigin = "";
imgImagem.src = "";

function updateImagem(){
	x = prompt("Por favor insira a URL da imagem desejada.");
	imgImagem.src = x;
};

imgImagem.onload = function(){
	var hRatio = imgCanvas.width / imgImagem.width;
	var vRatio = imgCanvas.height / imgImagem.height;
	console.log(imgCanvas.width);
	console.log(imgImagem.width);
	console.log(vRatio);
	console.log(hRatio);
	imgCtx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
	imgCtx.drawImage(imgImagem, 0, 0, imgImagem.width, imgImagem.height,    
								0, 0, imgCanvas.width*hRatio, imgCanvas.height*vRatio); 
};