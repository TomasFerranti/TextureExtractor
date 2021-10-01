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

function calcularCam(tipoCalc) {
	calc(tipoCalc);
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
function botaoNovaMetrica() {
	lastButton = 'novametrica';
	attElementosHTML();
};
function botaoCalcularTamanho(){
	lastButton = 'calculartamanho';
	attElementosHTML();
}
// -----------------------


// -----------------------
// ENTRADA DOS PONTOS CALIBRAÇÃO / EXTRAÇÃO E BOTÕES

// Declarando variáveis globais: pontos guias da calibração e pontos de extração
var pontosGuia = [[],[],[]];
var pontosExtrair = [];


var mouseA = {vec : new THREE.Vector2(0,0), button : 0, status : 0, prevVec : new THREE.Vector2(0,0), update : true};
function mouseEvents(e){
	const bounds = imgCanvas.getBoundingClientRect();
	mouseA.vec.x = e.pageX - bounds.left - scrollX;
	mouseA.vec.y = e.pageY - bounds.top - scrollY;
	mouseA.button = e.type;
	mouseA.status = e.type === "mousedown" ? true : e.type === "mouseup" ? false : mouseA.status;
    mouseA.update = true;
}
["mousedown","mouseup","mousemove"].forEach(name => imgCanvas.addEventListener(name,mouseEvents));

requestAnimationFrame(updateBotao);
var movimento = false;
var indCerto;
// Clicou no canvas
function updateBotao() {
	if(mouseA.update == true){
		var cursor = "crosshair";

		// Caso esteja movendo algum ponto
		var ponto;
		for (var i=0; i<Math.min(2, pontosExtrair.length); i++){
			ponto = pontosExtrair[i];
			if ((ponto.clone().subVectors(mouseA.vec,ponto).length() < 6) && (mouseA.button == 'mousedown')){
				indCerto = i;
				movimento = true;
				break;
			}
		}

		// Mover o ponto
		if ((movimento) && (mouseA.button == 'mousemove')){
			pontosExtrair[indCerto] = proj(mouseA.vec.clone().subVectors(mouseA.vec,mouseA.prevVec),
								    pontosExtrair[(indCerto+1)%2].clone().subVectors(pontosExtrair[(indCerto+1)%2],pontosExtrair[indCerto]), 
									pontosExtrair[indCerto]);
			cursor = "move";
		}
		if (!mouseA.status){
			movimento = false;
		}
		imgCanvas.style.cursor = cursor;

		if ((!movimento) && (mouseA.button == 'mousedown')){
			// Limpar câmera caso esteja calibrando com uma calibração já existente
			if ((lastButton == 'X' || lastButton == 'Y' || lastButton == 'Z') && (statusCalibracao == 'calculada' || statusCalibracao == 'carregada')){
				limparTodasVar();
			}

			// Caso esteja fazendo outra coisa depois de criar um novo plano
			if ((planoSeg.length > 0) && (lastButton != 'novoPlano')){
				alert('Finish the segment points of the new plane before using another tool!');
				attElementosHTML();
				return;
			}

			// Último botão clicado
			switch (lastButton){
				case 'X':
					pontosGuia[0].push(mouseA.vec.clone());
					break;
				case 'Y':
					pontosGuia[1].push(mouseA.vec.clone());
					break;
				case 'Z':
					pontosGuia[2].push(mouseA.vec.clone());
					break;
				case 'novoPlano':
					criarNovoPlano(mouseA.vec.clone());
					break;
				case 'extrair':
					extrairTextura(mouseA.vec.clone());							
					break;
				case 'novametrica':
					novaMetrica(mouseA.vec.clone());
					break;
				case 'calculartamanho':
					calcularTamanho(mouseA.vec.clone());
					break;
				default:
					// Pass
			}

		}

		// Atualizar a tela
		attElementosHTML();

		mouseA.prevVec = mouseA.vec.clone();
		mouseA.update = false;
	}
	requestAnimationFrame(updateBotao);
};

var curCanvas = '2d';
// Pressionou T para trocar o canvas
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