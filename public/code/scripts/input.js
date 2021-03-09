// Este script é responsável por todo tipo de entrada do usuário no HTML

// -----------------------
// CARREGAMENTO DE IMAGENS

var imgCanvas = document.getElementById('imagemCanvas');
var imgCtx = imgCanvas.getContext('2d');

var statusCalibracao = 'naoCalculada';
var imgImagem = new Image();
imgImagem.crossOrigin = '';

// Imagem padrão
imgImagem.src = 'images/ex1.png';

imgImagem.onload = function(){
	imgCtx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
	imgCtx.drawImage(imgImagem, 0, 0, imgImagem.width, imgImagem.height,    
								0, 0, imgCanvas.width, imgCanvas.height); 

	imgCtxSec.clearRect(0, 0, imgCanvasSec.width, imgCanvasSec.height);
	imgCtxSec.drawImage(imgImagem, 0, 0, imgImagem.width, imgImagem.height,    
								0, 0, imgCanvasSec.width, imgCanvasSec.height);
};

// -----------------------


// -----------------------
// ENTRADA DE BOTÕES

function carregarImagemWeb() {
	x = prompt('Por favor insira a URL da imagem desejada.');
	imgImagem.src = x;
	limparTodasVar();
	attElementosHTML();
};

function calcularCam() {
	calc();
	attElementosHTML();
};

var lastButtonTex = '';
function botaoPlanoYZ() {
	lastButtonTex = 'YZ';
	attElementosHTML();
};
function botaoPlanoXZ() {
	lastButtonTex = 'XZ';
	attElementosHTML();
};
function botaoPlanoXY() {
	lastButtonTex = 'XY';
	attElementosHTML();
};

var lastButton = '';
function guiaX() {
	lastButton = 'X';
	attElementosHTML();
};
function guiaY() {
	lastButton = 'Y';
	attElementosHTML();
};
function guiaZ() {
	lastButton = 'Z';
	attElementosHTML();
};
function botaoExtrairTextura() {
	lastButton = 'extrair';
	attElementosHTML();
};
// -----------------------


// -----------------------
// ENTRADA DOS PONTOS CALIBRAÇÃO / EXTRAÇÃO

// Declarando variáveis globais: pontos guias da calibração e pontos de extração
var pontosGuia = [nj.array([]).reshape(-1,2),nj.array([]).reshape(-1,2),nj.array([]).reshape(-1,2)];
var pontosExtrair = [];

// Clicou no canvas
imgCanvas.addEventListener('click', function (e) {
	// Limpar câmera caso esteja calibrando com uma calibração já existente
	if ((lastButton == 'X' || lastButton == 'Y' || lastButton == 'Z') && (statusCalibracao == 'calculada' || statusCalibracao == 'carregada')){
		limparTodasVar();
	}

	// Posição do mouse
	var rect = imgCanvas.getBoundingClientRect();
	var mouse = nj.array([e.pageX-rect.x-window.pageXOffset,e.pageY-rect.y-window.pageYOffset]).reshape(1,2);

	// Último botão clicado
	switch (lastButton){
		case 'X':
			pontosGuia[0] = nj.concatenate(pontosGuia[0].T,mouse.T).T;
			break;
		case 'Y':
			pontosGuia[1] = nj.concatenate(pontosGuia[1].T,mouse.T).T;
			break;
		case 'Z':
			pontosGuia[2] = nj.concatenate(pontosGuia[2].T,mouse.T).T;
			break;
		case 'extrair':
			extrairTextura(mouse);							
			break;
		default:
			// Pass
	}

	// Atualizar a tela
	attElementosHTML();
});
// -----------------------