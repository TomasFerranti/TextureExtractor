// Este script é responsável por todo tipo de entrada do usuário no HTML

// -----------------------
// CARREGAMENTO DE IMAGENS

// Elementos dos canvas
var imgCanvas = document.getElementById('imagemCanvas');
var imgCtx = imgCanvas.getContext('2d');

var statusCalibracao = 'naoCalculada';
var imgImagem = new Image();
imgImagem.crossOrigin = '';

// Imagem padrão
imgImagem.src = 'images/ex1.png';

// Troca de imagem
imgImagem.onload = function(){
	imgCtx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
	imgCtx.drawImage(imgImagem, 0, 0, imgImagem.width, imgImagem.height,    
								0, 0, imgCanvas.width, imgCanvas.height); 

	imgCtxSec.clearRect(0, 0, imgCanvasSec.width, imgCanvasSec.height);
	imgCtxSec.drawImage(imgImagem, 0, 0, imgImagem.width, imgImagem.height,    
								0, 0, imgCanvasSec.width, imgCanvasSec.height);
	
	attElementosHTML();
};

// -----------------------


// -----------------------
// ENTRADA DE BOTÕES
// Grande parte dessas funções estão atribuídas no elemento HTML manualmente

function carregarImagemWeb() {
	x = prompt('Insert the URL of the desired image!');
	imgImagem.src = x;
	limparTodasVar();
	attElementosHTML();
};

function calcularCam() {
	calc();
	iniciar();
	animar();
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
function botaoNovoPlano() {
	lastButton = 'novoPlano';
	attElementosHTML();
}
function botaoExtrairTextura() {
	lastButton = 'extrair';
	attElementosHTML();
};
// -----------------------


// -----------------------
// ENTRADA DOS PONTOS CALIBRAÇÃO / EXTRAÇÃO

// Declarando variáveis globais: pontos guias da calibração e pontos de extração
var pontosGuia = [[],[],[]];
var pontosExtrair = [];

// Clicou no canvas
imgCanvas.addEventListener('click', function (e) {
	// Limpar câmera caso esteja calibrando com uma calibração já existente
	if ((lastButton == 'X' || lastButton == 'Y' || lastButton == 'Z') && (statusCalibracao == 'calculada' || statusCalibracao == 'carregada')){
		limparTodasVar();
	}

	// Posição do mouse
	var rect = imgCanvas.getBoundingClientRect();
	var mouse = new THREE.Vector2(e.pageX-rect.x-window.pageXOffset,e.pageY-rect.y-window.pageYOffset);

	// Caso esteja fazendo outra coisa depois de criar um novo plano
	if ((planoSeg.length > 0) && (lastButton != 'novoPlano')){
		alert('Finish the segment points of the new plane before using another tool!');
		attElementosHTML();
		return;
	}

	// Último botão clicado
	switch (lastButton){
		case 'X':
			pontosGuia[0].push(mouse.clone());
			break;
		case 'Y':
			pontosGuia[1].push(mouse.clone());
			break;
		case 'Z':
			pontosGuia[2].push(mouse.clone());
			break;
		case 'novoPlano':
			criarNovoPlano(mouse.clone());
			break;
		case 'extrair':
			extrairTextura(mouse.clone());							
			break;
		default:
			// Pass
	}

	// Atualizar a tela
	attElementosHTML();
});

var curCanvas = '2d';
// Clicou para trocar os canvas
document.addEventListener("keyup", function(event) {	
	if(event.keyCode == 84){
		if(statusCalibracao == 'naoCalculada'){
			alert('Camera calibration is needed!');
			return;
		}
		if(curCanvas == '2d'){
			imgCanvas.parentNode.insertBefore(texCanvas, imgCanvas.nextSibling);
        	imgCanvas.parentNode.removeChild(imgCanvas);
			curCanvas = '3d';
		}else{
			texCanvas.parentNode.insertBefore(imgCanvas, texCanvas.nextSibling);
        	texCanvas.parentNode.removeChild(texCanvas);
			curCanvas = '2d';
            attElementosHTML();
		};
	};
});
// -----------------------