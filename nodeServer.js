"use strict";
const express = require('express');
const path = require('path');
const fs = require('fs');
const baseDir = 'public';

let app = express();
app.put('*', function(req, res) {
    console.log("saving:", req.path);
    let body = '';
    req.on('data', function(data) { body += data; });
    req.on('end', function() {
        fs.writeFileSync(path.join(baseDir, req.path), body);
        res.send('saved');
    });
});
app.use(express.static(baseDir));
app.listen(8000, function() {
    console.log("listening at http://localhost:8000");
});