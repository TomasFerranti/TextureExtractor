var pontos_de_fuga = nj.array([]).reshape(-1,2);
var C = nj.array([]).reshape(-1,3);  
var base_XYZ = nj.zeros([3,3]);

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

        C = nj.array([CO.get(0,0), CO.get(0,1), -1*(z2/2)**(1/2)]).reshape(-1,3);        

        // base XYZ        
        var Fx = add_hom(pontos_de_fuga.slice([0,1]));
        var Fy = add_hom(pontos_de_fuga.slice([1,2]));
        var Fz = add_hom(pontos_de_fuga.slice([2,3]));
        var X = normalize(nj.subtract(Fx, C));
        var Y = normalize(nj.subtract(Fy, C));
        var Z = normalize(nj.subtract(Fz, C));
        base_XYZ = nj.concatenate(X.reshape(3,-1),Y.reshape(3,-1),Z.reshape(3,-1));

        print_results();
    }
}

var v = [];
var P = [];
function extract_texture(){
    v = [pontos_extrair.slice([0,1]), 0, pontos_extrair.slice([1,2]), 0];
    P = [unProject(v[0],"Y"), 0, unProject(v[2],"Y"), 0];
    P[1] = nj.array([P[2].get(0,0),1,P[0].get(0,2)]).reshape(1,3);
    P[3] = nj.array([P[0].get(0,0),1,P[2].get(0,2)]).reshape(1,3);
    v[1] = project(P[1]);
    v[3] = project(P[3]);

    var dx = ( norm(v[0].subtract(v[1])) + norm(v[2].subtract(v[3])) )/2;
    var dy = ( norm(v[0].subtract(v[3])) + norm(v[1].subtract(v[2])) )/2;
    var Dx = norm(P[0].subtract(P[1]));
    var Dy = norm(P[1].subtract(P[2]));
    var a = Dy/Dx;
    if (dy/dx > a) {
      var w = round(dx,0);
      var h = round(dx*a,0); 
    }
    else {
      var h = round(dy,0);
      var w = round(h/a,0);   
    }
    console.log("Largura: "); 
    console.log(w);
    console.log("Altura: "); 
    console.log(h);

    var texCanvas = document.getElementById("textura_canvas");
    var texCtx = texCanvas.getContext("2d");

    var curpix, pixproj, pixrgb;
    Dx = P[1].get(0,0) - P[0].get(0,0);
    Dy = P[3].get(0,2) - P[0].get(0,2);
    imgCtx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
	imgCtx.drawImage(imgImagem, 0, 0, imgImagem.width, imgImagem.height,    
                                0, 0, imgCanvas.width, imgCanvas.height);
                                
    texCtx.clearRect(0, 0, texCanvas.width, texCanvas.height);
    for (var i = 0; i < w; i++) {
      for (var j = 0; j < h; j++) {
        curpix = nj.array([P[0].get(0,0) + Dx*i/w, 1, P[0].get(0,2)+Dy*j/h]).reshape(1,3);
        pixproj = project(curpix);
        pixrgb = imgCtx.getImageData(round(pixproj.get(0,0),0),round(pixproj.get(0,1),0),1,1).data;
        texCtx.fillStyle = "rgba("+pixrgb[0]+","+pixrgb[1]+","+pixrgb[2]+","+(pixrgb[3]/255)+")";
        texCtx.fillRect( i, j, 1, 1);
      }
    }

    // atualizar pontos_extrair para desenhar
    pontos_extrair = nj.concatenate(v).reshape(-1,2);
}