// Este script é responsável por criar funções bem verbosas para transmitir informação ao usuário

// -----------------------
// FUNÇÕES VERBOSAS

// Atualizar dica
function atualizarDica(){
    var str = '';

    if(statusCalibracao=='naoCalculada'){
        if(!(lastButton == 'X' || lastButton == 'Y' || lastButton == 'Z')){
            // Comece a calibrar uma imagem
            str += 'Choose an axis in the "Calibration" tab to select its edges. <br/>';
        }else{
            if(pontosGuia[coordEixoInd[lastButton.toLowerCase()]].length % 2 == 0){
                // Escolha um ponto inicial do segmento de calibração do eixo na tela
                str += 'Click on the canvas to indicate the first point of the new segment parallel to axis '+lastButton+'. <br/>';
            }else{
                // Escolha outro ponto final do segmento de calibração do eixo na tela
                str += 'Click on the canvas to indicate the second point of the previous segment parallel to axis '+lastButton+'. <br/>';
            };
        };

        // Calibre a câmera após 2 segmentos ou mais para 2 eixos ou mais
        var auxDic = {0:'X', 1:'Y', 2:'Z'}
        for(var i=0; i<3; i++){
            str += 'Total: '+Math.floor(pontosGuia[i].length/2)+'/2 segments for axis '+auxDic[i]+'. <br/>';
        };

        // Indicar que já se pode calibrar a câmera
        var tipoCalc = 'normal';
        var indFalt = 0;
        for(var j=0; j<3; j++){
            if (pontosGuia[j%3].length == 0 && pontosGuia[(j+1)%3].length > 0 && pontosGuia[(j+2)%3].length > 0){
                tipoCalc = 'centrado';
                indFalt = j;
                break;
            };
        };

        // Número de pontos guias insuficientes
        if ((pontosGuia[indFalt].length < 4 && tipoCalc == 'normal') || pontosGuia[(indFalt+1)%3].length < 4 || pontosGuia[(indFalt+2)%3].length < 4){
            str += 'At least two segments are needed for two axes or more. The more information, the better. <br/>';
        }else{
            str += 'The camera is now ready to be calibrated at "Calibrate" under "Calibration". <br/>';
        };

    }else{
        if(planos.length == 0){
            str += 'You have '+pontosExtrair.length+'/3 points remaining to select for the first plane. <br/>';
            if(lastButton == 'extrair' && lastButtonTex != ''){
                str += 'Click on the canvas to add the three points belonging to the first plane. <br/>';
            }else if(lastButton != 'extrair'){
                str += 'Choose the option "Extract" under "Extraction" if you want to add points to the first plane. <br/>';
            };
        }else{
            str += 'You have '+pontosExtrair.length+'/3 points remaining to select for the next plane. <br/>';
            if(lastButton == 'extrair'){
                if(pontosExtrair.length==0){
                    str += 'Click on the canvas to select the adjacent edge belonging to the next plane. <br/>';
                }else{
                    str += 'Click on the canvas to add the extension point belonging to the next plane. <br/>';
                    str += 'You can also move the purple points along their line by clicking and dragging the points. <br/>'
                };
            }else{
                str += 'Choose the option "Extract" under "Extraction" if you want to add the next plane. <br/>';
            };
        };
        str += '<br/>';
        if(lastButtonTex == ''){
            str += 'Choose the plane type under "Extraction". <br/>';
        }else{
            str += 'The selected plane type is '+lastButtonTex+'. <br/>';
        };
        str += '<br/>';
        if(lastButton == 'novoPlano'){
            if(planoSeg.length == 0){
                str += 'Click on the canvas to select the first point of a segment orthogonal to the axis within the new plane. <br/>';
            }else{
                str += 'Click on the canvas to select the second point of a segment orthogonal to the axis within the new plane. <br/>';
            };
        }else{
            str += 'Choose the option "New Plane Type" under "Extraction" if you want to create a new type of plane. <br/>';
        };

        // Escolher o ponto inicial de um segmento para a escala   'novaescala' 'calculartamanho'
        if(planos.length>0){
            str += '<br/>';
            if(lastButton == 'novaescala'){
                if(pontosMetrica.length == 0){
                    str += 'Click on the canvas to select the first point of the segment whose length is known. <br/>';
                }else{
                    str += 'Click on the canvas to select the second point of the segment whose length is known. <br/>';
                };
            }else{
                if(escalaMundoMetro == null){
                    str += 'Choose the option "Defining Scale" under "Scaling" to create your first scale. <br/>';
                }else{
                    str += 'Choose the option "Defining Scale" under "Scaling" to change your current scale. <br/>';
                };
            };
        };

        if(escalaMundoMetro != null){
            str += '<br/>';
            if(lastButton == 'calculartamanho'){
                if(segmentoMetrica.length == 0){
                    str += 'Click on the canvas to select the first point of the segment which you want to calculate its length. <br/>';
                }else{
                    str += 'Click on the canvas to select the second point of the segment which you want to calculate its length (must be in the same plane type). <br/>';
                };
            }else{
                str += 'Choose the option "Calculate Segment Length" under "Scaling" to find the length of a segment. <br/>';
            };
        };

        if(indiceTexturaPlanoAtual != null){
            str += '<br/>';
            if(lastButton == 'texturaPlano'){
                str += 'Click on the canvas inside a plane to select it for texture highlighting. <br/>';
            }else{
                str += 'Choose the option "Check Plane Texture" under "Extraction" if you want to pick another plane for texture highlighting. <br/>';
            };
        };
    };
    
    document.getElementById('dica').innerHTML = str;
};

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
        str = str + 'The current chosen segment for the scale has '+arredondar(segmentoMetricaTamanho,4)+' meters.';
    };

    document.getElementById('output').innerHTML = str;
}

// -----------------------