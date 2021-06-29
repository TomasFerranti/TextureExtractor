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
    camera = new THREE.PerspectiveCamera(
        75, // FOV
        texCanvas.width/texCanvas.height, // Aspect
        0.1, // Near
        1000 // Far
    );
    renderizador = new THREE.WebGLRenderer({ canvas: texCanvas });
    renderizador.setSize(texCanvas.width,texCanvas.height);
    
    // Renderizar cena pela primeira vez
    renderizador.render(cena, camera);

    // Pacote que permite controle da câmera do tipo "Órbita"
    controles = new THREE.FlyControls( camera, renderizador.domElement );
    
    // Configurações desse controle
    controles.movementSpeed = 0.01;
    controles.rollSpeed = 0.01;
    controles.autoForward = false;
    controles.dragToLook = true;
}

// Função responsável por desenhar os planos dado um objeto da classe Plano criado em calc.js
function adicQuadrilatero(plano){
    var quad_vertices_vec = criarCopia(plano.P);
    var imagem = imagedataParaImage(plano.textura);
    var quad_vertices = [];
    for(var i=0; i<=3; i++){
        quad_vertices.push(quad_vertices_vec[i].x);
        quad_vertices.push(quad_vertices_vec[i].y);
        quad_vertices.push(quad_vertices_vec[i].z);
    };
    
    // Designa ordem dos vértices para desenho
    var quad_uvs = [
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0
    ];
    
    // Designa ordem dos vértices para desenho dos triângulos
    var quad_indices = [
    0, 2, 1, 0, 3, 2
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
window.addEventListener('resize', onWindowResize, false);

// ATUALIZA CÂMERA
function atualizaCamera(){
    var ultimoPlano = planos[planos.length-1];
    
    var centro = new THREE.Vector3();
    for(var j=0; j<4; j++){
        centro.addVectors(centro,ultimoPlano.P[j]);
    }
    centro.multiplyScalar(1/4);

    var maxDist = centro.clone().subVectors(centro,planos[0].P[0]).length();
    var curDist;
    for(var j=0; j<planos.length; j++){
        for(var i=0; i<4; i++){
            curDist = centro.clone().subVectors(centro,planos[j].P[i]).length();
        } 
    }

    var v1 = ultimoPlano.P[0].clone().subVectors(ultimoPlano.P[1],ultimoPlano.P[0]);
    var v2 = ultimoPlano.P[0].clone().subVectors(ultimoPlano.P[3],ultimoPlano.P[0]);
    var normalPlano = v1.clone().crossVectors(v1,v2);
    normalPlano.multiplyScalar(3/2*maxDist/normalPlano.length());
    var posCamera = centro.clone().addVectors(centro,normalPlano);
    
    camera.position.x = posCamera.x;
    camera.position.y = posCamera.y;
    camera.position.z = posCamera.z;
    camera.lookAt(centro.x,centro.y,centro.z);

    var angulos = camera.rotation.toVector3();
    if(tiposPlano[ultimoPlano['tipoPlano']]['eixoPar'] == 'z'){
        angulos.x = Math.PI/2;
        angulos.z = 0;
    }
    camera.rotation.setFromVector3(angulos);
}