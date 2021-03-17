// Este script é responsável por fazer conexões com o servidor criado pelo node.js

// -----------------------
// ARQUIVOS .JSON

// Salvar calibração
function salvarJson() {
    var filename = prompt('Digite o nome do arquivo:');
    filename = 'calib/' + filename;
    if (filename == ''){
        alert('Coloque um nome não vazio!');
        return;
    }
    filename += '.json';

    if (baseXYZ.equals(new THREE.Matrix3())){
        alert('Calibre a câmera antes de salvar!');
        return;
    }

    var data = {'imagem':imgCanvasSec.toDataURL(),
                'base':baseXYZ.toArray(),
                'centrooptico':CO.toArray(),
                'camera':C.toArray(),
                'pontosfuga':[pontosDeFuga[0].toArray(),pontosDeFuga[1].toArray(),pontosDeFuga[2].toArray()]};
    data = JSON.stringify(data);

    // Salvar dicionário 'data'
    salvarArquivo(filename, data, function(err) {
        if (err) {
            alert('failed to save: ' + filename + '\n' + err);
        } else {
            alert('saved: ' + filename);
        }
    });
    
    attElementosHTML();
}

// Carregar calibração
function carregarJson(){
    // Pegar o nome do arquivo
    var filename = prompt('Digite o nome do arquivo .json:');
    filename = 'calib/' + filename;
    if (filename == ''){
        alert('Coloque um nome não vazio!');
        return;
    }
    filename += '.json';

    // Carregá-lo
    carregarArquivo(filename, function(err, data) {
        if (err) {
            alert('failed to load: ' + filename + '\n' + err);
        } else {
            limparTodasVar();
            data = JSON.parse(data);
            baseXYZ = criarObjeto(data.base);
            C = criarObjeto(data.camera);
            CO = criarObjeto(data.centrooptico);
            pontosDeFuga = [criarObjeto(data.pontosfuga[0]),criarObjeto(data.pontosfuga[1]),criarObjeto(data.pontosfuga[2])];
            imgImagem.src = data.imagem;
            statusCalibracao = 'carregada';
            mostrarResultados();
            iniciar();
            animar();
            attElementosHTML();
            alert('loaded: ' + filename);
        }
    });
};
// -----------------------


// -----------------------
// CARREGAMENTO DE ARQUIVOS

// Carregar imagem local do usuário
function carregarImagemLocal(){
    // Pegar o nome do arquivo
    var filename = prompt('Digite o nome do arquivo (completo):');
    filename = 'images/' + filename;
    if (filename == ''){
        alert('Coloque um nome não vazio!');
        return;
    };

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