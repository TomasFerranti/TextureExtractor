// Este script é responsável por criar funções bem verbosas para transmitir informação ao usuário

// -----------------------
// FUNÇÕES VERBOSAS

// Mostrar resultados da calibração
function mostrarResultados(){
    var str = "";

    // Fx, Fy e Fz
    var strList = ["Fx","Fy","Fz"];
    var Fx = pontosDeFuga.slice([0,1]);
    var Fy = pontosDeFuga.slice([1,2]);
    var Fz = pontosDeFuga.slice([2,3]);
    for(var j=0; j<3; j++){
        str = str + strList[j] + ": (";
        str = str + arredondar(pontosDeFuga.get(j,0),3) + ", " + arredondar(pontosDeFuga.get(j,1),3);
        str = str + "), <br/>";
    }

    // Camera
    str = str + "C: (";
    str = str + arredondar(C.get(0,0),3) + ", ";
    str = str + arredondar(C.get(0,1),3) + ", ";
    str = str + arredondar(C.get(0,2),3) + ") <br/>";

    // Base XYZ
    str = str + "baseXYZ: <br/>"
    for(var i=0; i<baseXYZ.shape[0]; i++){
        str = str + "[" + arredondar(baseXYZ.get(i,0),3);
        for(var j=1; j<baseXYZ.shape[1]; j++){
            str = str + ", " + arredondar(baseXYZ.get(i,j),3);
        }
        str = str + "] <br/>";
    }

    document.getElementById('output').innerHTML = str;
}

// Mostrar o array no console
function mostrarArr(arr){
    for(var i=0; i<arr.shape[0]; i++){
        for(var j=0; j<arr.shape[1]; j++){
            console.log(arr.get(i,j));
        }
    }
}
// -----------------------