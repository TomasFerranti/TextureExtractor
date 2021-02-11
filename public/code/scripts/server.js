function salvarJson() {
    var filename = prompt("Digite o nome do arquivo:");
    if (filename == ""){
        alert("Coloque um nome não vazio!");
        return;
    }
    filename += ".json";

    if (arrays_equal(base_XYZ,nj.zeros([3,3]))){
        alert("Calibre a câmera antes de salvar!");
        return;
    }
    
    var data = {"base":base_XYZ.toJSON(),
                "camera":C.toJSON()};
    data = JSON.stringify(data);
    // save
    saveFile(filename, data, function(err) {
        if (err) {
            alert("failed to save: " + filename + "\n" + err);
        } else {
            alert("saved: " + filename);
        }
    });
    
}

function carregarJson(){
    // get the filename
    var filename = prompt("Digite o nome do arquivo .json:");
    if (filename == ""){
        alert("Coloque um nome não vazio!");
        return;
    }
    filename += ".json";

    // load 
    loadFile(filename, function(err, data) {
        if (err) {
            alert("failed to load: " + filename + "\n" + err);
        } else {
            data = JSON.parse(data);
            base_XYZ = nj.array(JSON.parse(data.base));
            C = nj.array(JSON.parse(data.camera));
            print_results();
            update();
            alert("loaded: " + filename);
        }
    });

};

function carregarImagemLocal(){
    var filename = prompt("Digite o nome do arquivo (completo):");
    if (filename == ""){
        alert("Coloque um nome não vazio!");
        return;
    };

    // load 
    imgImagem.src = filename;  
    clear_all();
	update();
}

function saveFile(filename, data, callback) {
    doXhr(filename, 'PUT', data, callback);
}
 
function loadFile(filename, callback) {
    doXhr(filename, 'GET', '', callback);
}

function doXhr(url, method, data, callback) {
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