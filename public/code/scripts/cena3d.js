
var cena, camera, renderizador, controle, regular;
function iniciar(){
    cena = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75, //FOV
        texCanvas.width/texCanvas.height, // aspect
        0.1, //near
        1000 //far
    );
    renderizador = new THREE.WebGLRenderer({ canvas: texCanvas });
    renderizador.setSize(texCanvas.width,texCanvas.height);
    
    regular = 1/C.get(0,1);
    camera.position.x = C.get(0,0)*regular;
    camera.position.y = C.get(0,1)*regular;
    camera.position.z = C.get(0,2)*regular;
    camera.lookAt(CO.get(0,0)*regular,CO.get(0,1)*regular,0);
    
    renderizador.render(cena, camera);
    controle = new THREE.OrbitControls( camera, renderizador.domElement );
}

function adicQuadrilatero(quad_vertices_vec, imagem){
    var quad_vertices = [];
    for(var i=0; i<=3; i++){
        quad_vertices.push(quad_vertices_vec[i].get(0,0));
        quad_vertices.push(quad_vertices_vec[i].get(0,1));
        quad_vertices.push(quad_vertices_vec[i].get(0,2));
    };

    var quad_uvs =
    [
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
    ];
    
    var quad_indices =
    [
    0, 2, 1, 0, 3, 2
    ];

    var geometria = new THREE.BufferGeometry();

    var vertices = new Float32Array( quad_vertices );
    // Each vertex has one uv coordinate for texture mapping
    var uvs = new Float32Array( quad_uvs);
    // Use the four vertices to draw the two triangles that make up the square.
    var indices = new Uint32Array( quad_indices )

    geometria.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometria.setAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
    geometria.setIndex( new THREE.BufferAttribute( indices, 1 ) );

    var textura = new THREE.Texture( imagem );
    textura.needsUpdate = true;
    var material = new THREE.MeshBasicMaterial( { map : textura } );
    var quadri = new THREE.Mesh(geometria, material);
    quadri.material.side = THREE.DoubleSide;
    cena.add(quadri);
    
    camera.lookAt(quad_vertices[0],quad_vertices[1],quad_vertices[2]);
}

function animar(){
    requestAnimationFrame(animar);
    controle.update();
    renderizador.render(cena, camera);
}

function onWindowResize() {
    camera.aspect = texCanvas.width / texCanvas.height;
    camera.updateProjectionMatrix();
    renderizador.setSize(texCanvas.width ,texCanvas.height);
}

window.addEventListener('resize', onWindowResize, false);