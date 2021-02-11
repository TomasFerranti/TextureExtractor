function print_results(){
    var str = "";

    // Fx, Fy e Fz
    var strList = ["Fx","Fy","Fz"];
    var Fx = pontos_de_fuga.slice([0,1]);
    var Fy = pontos_de_fuga.slice([1,2]);
    var Fz = pontos_de_fuga.slice([2,3]);
    for(var j=0; j<3; j++){
        str = str + strList[j] + ": (";
        str = str + round(pontos_de_fuga.get(j,0),3) + ", " + round(pontos_de_fuga.get(j,1),3);
        str = str + "), <br/>";
    }

    // Camera
    str = str + "C: (";
    str = str + round(C.get(0,0),3) + ", ";
    str = str + round(C.get(0,1),3) + ", ";
    str = str + round(C.get(0,2),3) + ") <br/>";

    // Base XYZ
    str = str + "Base_XYZ: <br/>"
    for(var i=0; i<base_XYZ.shape[0]; i++){
        str = str + "[" + round(base_XYZ.get(i,0),3);
        for(var j=1; j<base_XYZ.shape[1]; j++){
            str = str + ", " + round(base_XYZ.get(i,j),3);
        }
        str = str + "] <br/>";
    }

    document.getElementById('output').innerHTML = str;
}

function print_array(arr){
    for(var i=0; i<arr.shape[0]; i++){
        for(var j=0; j<arr.shape[1]; j++){
            console.log(arr.get(i,j));
        }
    }
}