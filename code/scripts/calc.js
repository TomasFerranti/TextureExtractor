var pontos_de_fuga = nj.array([]).reshape(-1,2);
var C = nj.array([]).reshape(-1,3);  

function calc(){
    if (pontos_guia[0].shape[0] < 4 || pontos_guia[1].shape[0] < 4 || pontos_guia[2].shape[0] < 4){
        alert("Por favor selecione dois segmentos para cada eixo!");
    }else if (pontos_guia[0].shape[0] % 2 == 1 || pontos_guia[1].shape[0] % 2 == 1 || pontos_guia[2].shape[0] % 2 == 1){
        alert("Por favor complete os pontos restantes!");
    }else{
        // pontos de fuga
        for(var j=0; j<3; j++){
            var pontos_de_intersec = nj.array([]).reshape(-1,2);
            var tam = pontos_guia[j].shape[0];
            for(var i1=0; i1<tam/2; i1++){
                for(var i2=i1+1; i2<tam/2; i2++){
                    ponto_de_intersec = intersect(pontos_guia[j].slice([2*i1,2*i1+1]),
                                                    pontos_guia[j].slice([2*i1+1,2*i1+2]),
                                                    pontos_guia[j].slice([2*i2,2*i2+1]),
                                                    pontos_guia[j].slice([2*i2+1,2*i2+2]));
                    pontos_de_intersec = nj.concatenate(pontos_de_intersec.T,ponto_de_intersec.reshape(2,-1)).T;
                }
            }
            ponto_de_fuga = nj.array([nj.mean(pontos_de_intersec.slice(0,[0,1])),
                                        nj.mean(pontos_de_intersec.slice(0,[1,2]))]).reshape(2,-1);
            pontos_de_fuga = nj.concatenate(pontos_de_fuga.T,ponto_de_fuga).T;
        }

        // centro óptico
        var Fx = pontos_de_fuga.slice([0,1]);
        var Fy = pontos_de_fuga.slice([1,2]);
        var Fz = pontos_de_fuga.slice([2,3]);

        var hx = proj((Fx.subtract(Fy)), (Fz.subtract(Fy)), Fy);
        var hy = proj((Fy.subtract(Fz)), (Fx.subtract(Fz)), Fz);
        // Projetar os vetores das arestas do triangulo formado
        // pelos centros ópticos para achar a base das alturas

        var CO = intersect(Fx, hx, Fy, hy);

        // encontrando a altura tridimensional do CO
        var z2 =  ((Fx.get(0,0) - Fy.get(0,0))**2 + (Fx.get(0,1) - Fy.get(0,1))**2) -
                    ((Fx.get(0,0) - CO.get(0,0))**2 + (Fx.get(0,1) - CO.get(0,1))**2) -
                    ((Fy.get(0,0) - CO.get(0,0))**2 + (Fy.get(0,1) - CO.get(0,1))**2);

        C = nj.array([CO.get(0,0), CO.get(0,1), (z2/2)**(1/2)]).reshape(-1,3);        
    }
}


