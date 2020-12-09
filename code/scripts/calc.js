var a = nj.array([2,3,4]);


function calc(){
    if (pontos_guia[0].shape[0] < 4 || pontos_guia[1].shape[0] < 4 || pontos_guia[2].shape[0] < 4){
        alert("Por favor selecione dois segmentos para cada eixo!");
    }else if (pontos_guia[0].shape[0] % 2 == 1 || pontos_guia[1].shape[0] % 2 == 1 || pontos_guia[2].shape[0] % 2 == 1){
        alert("Por favor complete os pontos restantes!");
    }else{
        // pass
        
    }
}


