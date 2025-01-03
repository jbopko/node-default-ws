const http = require('node:http');

const PORT=8000;
const HOST='0.0.0.0';
const ACTION_STRING="<{{action}} statusCode={{statusCode}}>{{params}}</{{action}}>";
const PARAM_STRING = "<{{key}}>{{value}}</{{key}}>";
const ACTION = /\{\{action}}/g;
const PARAMS = /\{\{params}}/g;
const KEY = /\{\{key}}/g;
const VALUE = /\{\{value}}/g;
const STATUS_CODE = /\{\{statusCode}}/g;

function extractParams(url) {
    let params = new Map();
    if (url.split('?')[1]) {
        url.split('?')[1].split('&').forEach(param => {
            const [key, value] = param.split('=');
            params.set(key, value);
        })
    }
    return params;
}

http.createServer((request, response) => {
    const { headers, method, url } = request;
    let body = [];
    request.on('error', err => {
        console.error(err);
    })
    .on('data', chunk => {
        body.push(chunk);
    })
    .on('end', () => {
        body = Buffer.concat(body).toString();
        response.on('error', err => {
            console.error(err);
        });
        // Request body is ready
        const action = url.split('?')[0].substring(1);
        if (action === 'echo'){
            let paramString='';
            const params = extractParams(url);
            const iterator = params.keys();
            for (const key of iterator) {
                paramString = paramString.concat(PARAM_STRING.replace(KEY, key).replace(VALUE, params.get(key)));
            }
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');

            const payload = ACTION_STRING
                .replace(ACTION, action)
                .replace(PARAMS, paramString)
                .replace(STATUS_CODE, "200");
            // request loaded, build response
            const responseBody = { headers, method, url, body, payload };
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.write(JSON.stringify(responseBody));
            // response.write(payload);
            response.end();
        } else {
            response.statusCode = 404;
            response.end();
        }
    })
}).listen(PORT, HOST, () => {
    console.log(`Service started on port ${PORT}`);
});