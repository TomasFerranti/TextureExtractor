// Este script é responsável por fornecer diversas funções auxiliares úteis

// -----------------------
// CONFIGURAÇÃO AMBIENTE 3D
var cena, camera, renderizador, controles;
var texCanvas = document.createElement('canvas');
texCanvas.id = 'texturaCanvas';
texCanvas.height = 800;
texCanvas.width = 1200;
// Função chamada após calibrar a câmera, fazendo o setup do ambiente 3D
function iniciar(){
    cena = new THREE.Scene();
	var w, h, x0, y0, FOV;
    if (C.x > texCanvas.width - C.x){
		w = C.x;
		x0 = 0;
	}
	else{
		w = texCanvas.width - C.x;
		x0 = w - C.x;
	}
	if (C.y > texCanvas.height - C.y){
		h = C.y;
		y0 = 0;
	}
	else{
		h = texCanvas.height - C.y;
		y0 = h - C.y;
	}
	FOV = 2*Math.atan2(h, -C.z)*180.0/Math.PI;
	camera = new THREE.PerspectiveCamera(
        FOV, // FOV
        w/h, // Aspect
        0.1, // Near
        1000 // Far
    );
	camera.setViewOffset(2*w, 2*h, x0, y0, texCanvas.width, texCanvas.height);
	var up = new THREE.Vector3(0, 1, 0);
	var upW = cameraParaMundo(up);
	upW.z = - upW.z;
	camera.up = upW;
	var lookAt = new THREE.Vector3(0, 0, 1);
	var lookAtW = cameraParaMundo(lookAt);
	camera.lookAt(lookAtW);
	camera.updateProjectionMatrix();
    renderizador = new THREE.WebGLRenderer({ canvas: texCanvas, preserveDrawingBuffer: true });
    renderizador.setSize(texCanvas.width,texCanvas.height);
    
    // Renderizar cena pela primeira vez
    renderizador.render(cena, camera);

    // Permite controle da câmera do tipo "Órbita"
    controles = new THREE.FlyControls(camera, renderizador.domElement );
    
    // Configurações desse controle
    controles.movementSpeed = 0.002;
    controles.rollSpeed = 0.002;
    controles.autoForward = false;
    controles.dragToLook = true;
}

// Função responsável por desenhar os planos dado um objeto da classe Plano criado em calc.js
function adicQuadrilatero(plano){
    var quad_vertices_vec = criarCopia(plano.P);
    var imagem = imagedataParaImage(plano.textura);
    var quad_vertices = [];
    var correct_order = [1,2,3,0]; // lower-left, lower-right, upper-right, upper-left
    for(var i of correct_order){
        quad_vertices.push(quad_vertices_vec[i].x);
        quad_vertices.push(quad_vertices_vec[i].y);
        quad_vertices.push(quad_vertices_vec[i].z);
    };
    
    // Designa ordem dos vértices para desenho
    var quad_uvs = [
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
    ];
    
    // Designa ordem dos vértices para desenho dos triângulos
    var quad_indices = [
    0, 1, 2, 2, 3, 0
    ];

    // Cria a textura e objeto
    var geometria = new THREE.BufferGeometry();

    var vertices = new Float32Array( quad_vertices );
    var uvs = new Float32Array( quad_uvs);
    var indices = new Uint32Array( quad_indices );

    geometria.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometria.setAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
    geometria.setIndex( new THREE.BufferAttribute( indices, 1 ) );

    var textura = new THREE.Texture( imagem );
    textura.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial( { map : textura } );
    var quadri = new THREE.Mesh(geometria, material);
    quadri.material.side = THREE.DoubleSide;

    // Adicionar à cena
    cena.add(quadri);
}


// -----------------------
// FUNÇÕES DE UPDATE DA CENA 3D
// Função animar chamado a cada frame de animação
function animar(){
    requestAnimationFrame(animar);
    controles.update(1);
    renderizador.render(cena, camera);
}

// Função atribuída ao "resize" da janela, atualizando o aspecto da câmera
function onWindowResize() {
    if(statusCalibracao == 'naoCalculada'){
        return;
    }
    camera.aspect = texCanvas.width / texCanvas.height;
    camera.updateProjectionMatrix();
    renderizador.setSize(texCanvas.width ,texCanvas.height);
}
//window.addEventListener('resize', onWindowResize, false);