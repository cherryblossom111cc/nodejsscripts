var sys = require("sys");
var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require("url");


// filename - path of directory structure 
// level - level to transverse into the directory structure -1 = inifnite
// rule [0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9] some regex to match
function dirTree(filename, level, runningLevel, rule) {
    console.log(filename);
    var regexPattern;

    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            name: path.basename(filename)
        };

    if (stats.isDirectory()) {
            info.type = "folder";
        }

    if(runningLevel < level || level == -1){
        if (stats.isDirectory()) {
            info.children = fs.readdirSync(filename).map(function(child) {
                runningLevel++;
                 if(rule != ""){
                    regexPattern = new RegExp(rule);
                    if(!child.match(regexPattern)){
                        console.log(child);
                        console.log(rule);
                        return null;
                    }else{
                       return dirTree(filename + '/' + child, level, runningLevel, rule);  
                    }
                }else{
                   return dirTree(filename + '/' + child, level, runningLevel, rule); 
                }
                
            });
        } else {
            info.type = "file";
        }
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
                if(uri.substring(1) != ""){
                    res.write(JSON.stringify(dirTree(uri.substring(1), -1, 1, ""), false, null)); 
                }else{
                   res.write(JSON.stringify(dirTree("escenic", 2, 1, "^[0-9][0-9]-[0-9][0-9]-[0-9][0-9][0-9][0-9]$"), false, null));  
                }
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