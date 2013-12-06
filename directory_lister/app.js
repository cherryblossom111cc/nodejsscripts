var sys = require("sys");
var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require("url"); 

function dirTree(filename) {
    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            name: path.basename(filename)
        };

    if (stats.isDirectory()) {
        info.type = "folder";
        info.children = fs.readdirSync(filename).map(function(child) {
            return dirTree(filename + '/' + child);
        });
    } else {
        info.type = "file";
    }

    return info;
}

http.createServer(function (req, res) {
  var uri = url.parse(req.url).pathname; 
  var filename = path.join(process.cwd(), uri); 
    fs.exists(filename, function(exists) {  
        if(!exists) { 
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.write("cannot find anything here");
            res.end();  
            return;  
        }  

        fs.readFile(filename, "binary", function(err, file) {  
            if(err) {  
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.write(JSON.stringify(dirTree(uri.substring(1)), false, null)); 
                res.end();  
                return;  
            }  

            res.writeHead(200);  
            res.write(file, "binary");  
            res.end();  
        });  
    });  
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');