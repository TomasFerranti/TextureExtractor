// Este script é responsável por criar funções bem verbosas para transmitir informação ao usuário

// -----------------------
// FUNÇÕES VERBOSAS

// Mostrar resultados da calibração
function mostrarResultados(){
    var str = 'Press T to swap between the 2D and 3D. <br/>';
    str = str + 'Use WASD to move camera position. <br/>';
    str = str + 'Use ARROW KEYS to move camera angle. <br/>';

    // Fx, Fy e Fz
    var strList = ['Fx','Fy','Fz'];
    for(var j=0; j<3; j++){
        str = str + strList[j] + ': (';
        str = str + arredondar(pontosDeFuga[j].x,3) + ', ' + arredondar(pontosDeFuga[j].y,3);
        str = str + '), <br/>';
    }

    // Camera
    str = str + '(Uc,Vc,Wc): (';
    str = str + arredondar(C.x,3) + ', ';
    str = str + arredondar(C.y,3) + ', ';
    str = str + arredondar(C.z,3) + ') <br/>';

    // Base XYZ
    str = str + 'XYZ transform matrix: <br/>'
    for(var i=0; i<3; i++){
        str = str + '[' + arredondar(baseXYZ.elements[3*i],3);
        for(var j=1; j<3; j++){
            str = str + ', ' + arredondar(baseXYZ.elements[3*i+j],3);
        }
        str = str + '] <br/>';
    }

    // Métrica do segmento escolhido
    if(segmentoMetricaTamanho != null){
        str = str + 'The current chosen segment for the metric has '+arredondar(segmentoMetricaTamanho,4)+' meters.';
    };

    document.getElementById('output').innerHTML = str;
}
// -----------------------