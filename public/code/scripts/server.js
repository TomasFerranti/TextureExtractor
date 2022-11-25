// Este script é responsável por fazer conexões com o servidor criado pelo node.js

// -----------------------
// ARQUIVOS .JSON

// Salvar calibração
function salvarJson() {
    if(nomeArquivoImagem == ''){
        alert("You can't save progress of a non local image file.");
        return;
    };

    var nomeImagem = nomeArquivoImagem.split('.')[0];
    var filename = 'calib/' + 'cab-' + nomeImagem + '.json';
    var extensao = nomeArquivoImagem.split('.')[1];

    // Salvar pontos guia em um formato de leitura aceitável
    var pontosGuiaData = []
    for(var j=0; j<3; j++){
        pontosGuiaData.push([])
        for(var i=0; i<pontosGuia[j].length; i++){
            pontosGuiaData[j].push(pontosGuia[j][i].toArray());
        };
    };

    var planosData = JSON.parse(JSON.stringify(planos));
    for(var j=0; j<planosData.length; j++){
        delete(planosData[j].textura);
    };
    planosData = JSON.stringify(planosData);

    var tiposPlanosData = JSON.parse(JSON.stringify(tiposPlano));
    for(var tipoPlano of ['XY','YZ','XZ']){
        delete(tiposPlanosData[tipoPlano]);
    };
    for(var tipoPlano of Object.keys(tiposPlanosData)){
        delete(tiposPlanosData[tipoPlano]['objeto']);
    };

    // Dados salvos no .json
    var data = {'nomeImagem':nomeImagem,
                'extensao':extensao,
                'pontosguia':pontosGuiaData,
                'pontosfuga':[pontosDeFuga[0].toArray(),pontosDeFuga[1].toArray(),pontosDeFuga[2].toArray()],
                'base':baseXYZ.toArray(),
                'centrooptico':CO.toArray(),
                'camera':C.toArray(),
                'tiposPlanos':tiposPlanosData,
                'planos':planosData};
    data = JSON.stringify(data);

    // Salvar dicionário 'data'
    salvarArquivo(filename, data, function(err) {
        if (err) {
            alert('Failed to save: ' + filename + '\n' + err);
        } else {
            alert('Saved: ' + filename);
        }
    });
    
    attElementosHTML();
}

// Carregar calibração
function carregarJson(){
    // Pegar o nome do arquivo
    if (nomeArquivoImagem == ''){
        alert("You can't load progress of a non local image file.");
        return;
    };

    var filename = 'calib/' + 'cab-' + nomeArquivoImagem.split('.')[0] + '.json';

    // Carregá-lo
    carregarArquivo(filename, function(err, data) {
        if (err) {
            alert('Failed to load: ' + filename + '\n' + err);
        } else {
            // Carregar os dados nas respectivas variáveis
            data = JSON.parse(data);
            carregarImagemLocal(data.nomeImagem+'.'+data.extensao);
            baseXYZ = criarObjeto(data.base);
            C = criarObjeto(data.camera);
            CO = criarObjeto(data.centrooptico);
            pontosDeFuga = [criarObjeto(data.pontosfuga[0]),criarObjeto(data.pontosfuga[1]),criarObjeto(data.pontosfuga[2])];
            pontosGuia = [[],[],[]];
            var pontosGuiaData = data.pontosguia;
            for(var j=0; j<3; j++){
                for(var i=0; i<pontosGuiaData[j].length; i++){
                    pontosGuia[j].push(criarObjeto(pontosGuiaData[j][i]));
                };
            };
            statusCalibracao = 'carregada';

            // Atualizar as variáveis gerais
            adicionarDadosPlanosOrts();
            mostrarResultados();
            iniciar();
            animar();

            // Carregar tipos de planos
            var tiposPlanosData = data.tiposPlanos;
            for(var tipoPlano of Object.keys(tiposPlanosData)){
                planoSeg = criarObjetoArrDic(tiposPlanosData[tipoPlano]['planoSeg']);
                criarNovoTipoPlano(tipoPlano,tiposPlanosData[tipoPlano]['eixoPar']);
            };
            planoSeg = [];

            // Carregar planos
            var planosData = JSON.parse(data.planos);
            for(var plano of planosData){
                var novoPlano = new Plano(plano.indPlanoCon,
                                          plano.indSegCon,
                                          plano.tipoPlano,
                                          criarObjetoArrDic(plano.v),
                                          criarObjetoArrDic(plano.P));
                novoPlano.obterTextura();
                plotarTexturaPlano(novoPlano.textura);
                planos.push(novoPlano);
                adicQuadrilatero(novoPlano);
            };

            if (planosData.length == 0){
                indiceTexturaPlanoAtual = null;
            }else{
                indiceTexturaPlanoAtual = planosData.length - 1;
            }
            
            attElementosHTML();
            alert('Loaded: ' + filename);
        };  
    });
};
// -----------------------


// -----------------------
// CARREGAMENTO DE ARQUIVOS

// Salvar imagem atual do canvas
function baixarImagem(){
    var downloadCanvas = curCanvas == '3d' ? texCanvas : imgCanvas;
    var dataURL = downloadCanvas.toDataURL("image/png", 1.0);
    var filename = prompt('Insert the file name for the image (.png not needed):');
    filename = filename + '.png';
    var a = document.createElement('a');
    a.href = dataURL;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
}

// Carregar imagem local do usuário
function carregarImagemLocal(nomeImg = ''){
    // Pegar o nome do arquivo
    var filename;
    if(nomeImg==''){
        filename = prompt('Insert the file name for the image (with extension):');
        if (filename == ''){
            alert('Empty name not valid!');
            return;
        };
    }else{
        filename = nomeImg;
    };
    nomeArquivoImagem = filename;

    filename = 'images/' + filename;

    // Carregá-lo
    imgImagem.src = filename;  
    limparTodasVar();
	attElementosHTML();
}

// Protocolo de salvar
function salvarArquivo(filename, data, callback) {
    requestXml(filename, 'PUT', data, callback);
}

// Protocolo de carregar
function carregarArquivo(filename, callback) {
    requestXml(filename, 'GET', '', callback);
}

// Lidar com os requests
function requestXml(url, method, data, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function() {
        if (xhr.status === 200) {
            callback(null, xhr.responseText);
        }  else {
            callback('Request failed.  Returned status of ' + xhr.status);
        }
    };
    xhr.send(data);
}
// -----------------------