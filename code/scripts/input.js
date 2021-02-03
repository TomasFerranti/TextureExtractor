// IMAGE INPUT

var imgCanvas = document.getElementById("imagem_canvas");
var imgCtx = imgCanvas.getContext("2d");

var imgImagem = new Image();
imgImagem.crossOrigin = "";
imgImagem.src = "https://raw.githubusercontent.com/TomasFerranti/ImagineRio/main/code/sample_images/imagem_atilio.png";

imgImagem.onload = function(){
	imgCtx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
	imgCtx.drawImage(imgImagem, 0, 0, imgImagem.width, imgImagem.height,    
								0, 0, imgCanvas.width, imgCanvas.height); 
};


// BUTTOM INPUT

function carregarImagem() {
	x = prompt("Por favor insira a URL da imagem desejada.");
	imgImagem.src = x;
	clear_all();
	update();
};

function calcularCam() {
	calc();
	update();
	// tirar versão final
	point(pontos_de_fuga.get(0,0),pontos_de_fuga.get(0,1),10,"red");
	point(pontos_de_fuga.get(1,0),pontos_de_fuga.get(1,1),10,"green");
	point(pontos_de_fuga.get(2,0),pontos_de_fuga.get(2,1),10,"blue");
	point(C.get(0,0),C.get(0,1),10,"pink");
	// até aqui
};

lastButton = "";
function guiaX() {
	lastButton = "X";
	update();
};
function guiaY() {
	lastButton = "Y";
	update();
};
function guiaZ() {
	lastButton = "Z";
	update();
};
function extrairText() {
	lastButton = "extrair";
	update();
};

// POINT INPUT

// X, Y e Z
var pontos_guia = [nj.array([]).reshape(-1,2),nj.array([]).reshape(-1,2),nj.array([]).reshape(-1,2)];
// Extrair
var pontos_extrair = nj.array([]).reshape(-1,2);

// Clicou no canvas
imgCanvas.addEventListener("click", function (e) {
	var rect = imgCanvas.getBoundingClientRect();
	var mouse = nj.array([e.pageX-rect.x-window.pageXOffset,e.pageY-rect.y-window.pageYOffset]).reshape(2,-1);
	switch (lastButton){
		case "X":
			pontos_guia[0] = nj.concatenate(pontos_guia[0].T,mouse).T;
			clear_camera();
			break;
		case "Y":
			pontos_guia[1] = nj.concatenate(pontos_guia[1].T,mouse).T;
			clear_camera();
			break;
		case "Z":
			pontos_guia[2] = nj.concatenate(pontos_guia[2].T,mouse).T;
			clear_camera();
			break;
		case "extrair":
			if(pontos_de_fuga.shape[0]==0){
				alert("Primeiro se necessita do cálculo da câmera!");
			}else{
				switch (pontos_extrair.shape[0]){
					case 0:
						pontos_extrair = nj.concatenate(pontos_extrair.T,mouse).T;
						update();
						break;
					case 1:
						pontos_extrair = nj.concatenate(pontos_extrair.T,mouse).T;
						extract_texture();
						update();
						break;
					default:
						pontos_extrair = mouse.reshape(-1,2);
						update();
				}
			}				
			break;
		default:
			//pass
	}
	update();
});