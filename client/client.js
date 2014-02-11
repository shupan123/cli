var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    path = require('path'),
    URI = 'http://localhost:3000/';

function Client() {
    this.args = process.argv.slice(2); //取出node的默认参数
    this.moduleRoot = path.join(__dirname, 'modules');
    this.parseArgs();
}
/**
 * 解析命令行参数
 * @return {[type]}
 */
Client.prototype.parseArgs = function() {
    var invoke = this.args[0];
    if (!invoke || typeof this[invoke] != 'function') {
        console.log('Can not find invoke method');
    } else {
        this[invoke].apply(this);
    }
};

Client.prototype.resolve = function() {
    var pathname = Array.prototype.slice.apply(arguments).join('/'),
        uri = url.resolve(URI, pathname);

    console.log(uri);

    return uri;
};

/**
 * 列出服务端的可用的模块
 * @return {[type]}
 */
Client.prototype.search = function(callback) {
    var part, uri;

    part = this.args.slice(0, 2);
    uri = this.resolve.apply(this, part);

    http.get(uri, function(res) {
        var chunks = [];
        var size = 0;

        console.log('status:', res.statusCode);
        // res.setEncoding('utf8');
        // res.pipe(process.stdout);

        res.on('data', function(chunk) {
            chunks.push(chunk);
            size += chunk.length;
        });
        res.on('end', function() {
            var buf = Buffer.concat(chunks, size);
            var result = JSON.parse(buf.toString());

            if (Array.isArray(result)) {
                console.log(result.join(', '));
            } else {
                var key = Object.keys(result)[0];
                console.log(key, ':', result[key].join(', '));
            }

            typeof callback == 'function' && callback(result);
            
        });
    }).on('error', function(e) {
        console.log('Got error:', e.message);
    });
};
/**
 * 安装模块到本地，是带版本的zip压缩文件，模块与版本间用中横线(-)分割
 * @return {[type]} [description]
 */
Client.prototype.install = function() {
    var part, uri;

    var self = this;

    if (this.args.length < 2) {
        console.log('Command paramter error.');
        return;
    }

    part = this.args.slice(0, 3);
    uri = this.resolve.apply(this, part);

    http.get(uri, function(res) {

        console.log('status:', res.statusCode);
        
        var error = res.headers['content-error']; //自定义头

        if (error) {
            console.log(error);
            res.on('data', function() {}); //必须写，哪怕是空数据，否则客户端会一直等待服务端数据
            return;
        }

        //从响应头提取文件名
        var contentDisposition = res.headers['content-disposition'],
            filename = contentDisposition.split(';')[1].split('=')[1],
            //去除时间戳
            clearFileName = filename.replace(/(.*)-\d+(\.zip)/, function(a, b, c) {
                return b + c;
            }),
            writeStream = fs.createWriteStream(path.join(self.moduleRoot, clearFileName));

        console.log(clearFileName, 'installed.');

        res.pipe(writeStream);

    }).on('error', function(e) {
        console.log('Got error:', e.message);
    });
};

Client.prototype.publish = function() {


    if (this.args.length < 3) {
        console.log('Command paramter error.');
        return;
    }
    var module = this.getModule.apply(this, this.args.slice(1));

    var part = this.args.slice(0, 3);
    var moduleName = part[1] + '-' + part[2] + '.zip';

    if (module) {

        this.checkVersionExist(function(exist) {
            // console.log(this.args);
            if (exist) {
                console.log(moduleName, 'version repeat.');
            } else {
                
                var uri = this.resolve.apply(this, part);
                var options = url.parse(uri, true);
                var readStream = fs.createReadStream(path.join(this.moduleRoot, moduleName));
                // console.log(options);
                var req = http.request({
                    hostname: options.hostname,
                    port: options.port,
                    path: options.path,
                    method: 'POST'
                }, function(res) {
                    var chunks = [];
                    var size = 0;
                    
                    console.log('status:', res.statusCode);
                    res.on('data', function(chunk) {
                        chunks.push(chunk);
                        size += chunk.length;
                    });
                    res.on('end', function() {
                        var buffer = Buffer.concat(chunks, size);
                        console.log(buffer.toString());
                    });
                    // res.pipe(process.stdout);
                });

                req.on('error', function(e) {
                    console.log('Problem with request: ' + e.message);
                });

                readStream.pipe(req);

            }
        });
        
    } else {
        console.log(moduleName, 'not exist.');
    }
};
Client.prototype.checkVersionExist = function(callback) {
    var oldArgs = this.args.slice();
    var self = this;
    this.args.splice(0, 1, 'search');

    this.search(function(result) {

        self.args = oldArgs;

        var versions = result[Object.keys(result)[0]];

        if (versions.indexOf(self.args[2]) > -1) {
            typeof callback == 'function' && callback.call(self, true);
        } else {
            typeof callback == 'function' && callback.call(self, false);
        }
        
    });
};
Client.prototype.getModule = function(moduleName, version) {
    var modulePath;

    moduleName = moduleName + '-' + version + '.zip'; 
    modulePath = path.join(this.moduleRoot, moduleName);

    console.log('Module path', modulePath);
    return fs.existsSync(modulePath);
};

Client.prototype.remove = function() {};


new Client();