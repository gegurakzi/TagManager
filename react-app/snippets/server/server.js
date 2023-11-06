let http = require('http');

let fs = require('fs');
let script = fs.readFileSync('../snippet.js', 'utf-8');
let html = fs.readFileSync('./index.html', 'utf-8');

let getJs = function(request,response){
    setTimeout(() => {

    response.writeHead(200,{'Content-Type':'application/javascript;charset=utf-8'});
    response.write(script);
    response.end();

    }, 2000);
}

let getHtml = function(request,response){
    setTimeout(() => {

        response.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
        response.write(html);
        response.end();

    }, 2000);
}

let controller = compose([
    wrapHandler('/TM-KOR12/snippet.js', getJs),
    wrapHandler('/', getHtml),
]);

let server = http.createServer(controller);

server.listen(8000, function(){
    console.log('Server is running...');
});

function compose(middleware) {
    return function (req, res){
        let next = function () {
            notFoundHandler.call(this, req, res);
        };

        let i = middleware.length;
        while (i--) {
            let thisMiddleware = middleware[i];
            let nextMiddleware = next;
            next = function () {
                thisMiddleware.call(this, req, res, nextMiddleware);
            }
        }
        return next();
    }
}

function wrapHandler(path, cb) {
    return function (req, res, next) {
        if (req.url === path) {
            cb(req, res);
        } else {
            next();
        }
    };
}

function notFoundHandler(req, res) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.write('No Path found');
    res.end();
};