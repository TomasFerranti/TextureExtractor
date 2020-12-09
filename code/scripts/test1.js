var a = nj.array([2,3,4]);
console.log(a.get(0))

var imagem = document.getElementById("imagem_canvas");
var ctxImagem = imagem.getContext("2d");

var imgImagem = new Image();
imgImagem.crossOrigin = '';
imgImagem.src = "";

imgImagem.onload = function(){
	w=2*imgImagem.width;
	h=2*imgImagem.height;
	ctxImagem.drawImage(imgImagem, 0, 0,w,h); 
};

function updateImagem(){
	x = prompt("Por favor insira a URL da imagem desejada.");
	imgImagem.src = x;
};