var path = require('path'),
    fs = require('fs'),
    archiver = require('archiver'),
    util = require('util'),
    unzip = require('unzip'),
    output = path.resolve(__dirname, '../tmp');

function Router(app) {
    //模块目录
    this.moduleRoot = path.join(app.get('assets'), 'modules');

    //创建tmp目录
    fs.exists(output, function(exist) {
        if (!exist) {
            fs.mkdir(output, function(error) {
                if (error) {
                    throw new Error(error);
                }

            });
        }
    });

    app.get('/', function(req, res) {
        res.render('index', {title: 'CLI'});
    });

    app.get('/install/:module/:version?', this.install.bind(this));
    app.get('/search/:module?', this.search.bind(this));
    app.post('/publish/:module/:version', this.publish.bind(this));
}
/**
 * 得到当前版本，如果不指定版本，默认用最新的版本
 * @param  {[type]} version    [description]
 * @param  {[type]} moduleName [description]
 * @return {[type]}            [description]
 */
Router.prototype.getVersion = function(version, moduleName) {
    var versions = fs.readdirSync(path.join(this.moduleRoot, moduleName));

    if (version) {
        if (versions.indexOf(version) > -1) {
            return version;
        } else {
            throw new Error('version can not exist.');
        }
    } else {
        //过滤掉不是版本的目录
        versions = versions.filter(function(value) {
            return !isNaN(value.replace(/\./g, ''));
        });
        //版本从大到小排序
        versions.sort(function(a, b) {
            a = a.replace(/\./g, '');
            b = b.replace(/\./g, '');
            return b - a;
        });
        console.log(versions);
        return versions[0];
    }
};
/**
 * 服务端首先在tmp目录生成对应模块版本的zip压缩包，然后发送压缩包到客户端
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
Router.prototype.install = function(req, res) {

    var moduleName = req.params.module,
        version = req.params.version,
        file, archiverFile, archive,
        fullName;

    try {
        version = this.getVersion(version, moduleName);

    } catch (e) {
        res.set('Content-Error', e.message);
        return res.end();
    }
    //文件名加上时间戳，防止并发重名
    file = [moduleName, version, Date.now()].join('-');
    fullName = path.join(output, file + '.zip');

    archiverFile = fs.createWriteStream(fullName);

    //close事件表示压缩完毕
    archiverFile.on('close', function() {
        var fileStream;

        console.log('archiver has been finalized and the output file descriptor has closed.');
        
        fileStream = fs.createReadStream(fullName);

        //设置下载头文件
        res.set('Content-Type', 'application/octet-stream');
        res.set('Content-Transfer-Encoding', 'binary');
        res.set('Content-disposition', 'attachment; filename=' + path.basename(fullName));
        res.set('Content-Length', fs.statSync(fullName).size);

        //通过管道流向响应
        fileStream.pipe(res);

        //流读取完成时需要删除tmp生成的压缩文件
        fileStream.on('end', function() {
            fs.unlink(fullName, function(error) {
                if (error) {
                    throw new Error(error);
                }
            });
        });

        // fileStream.on('data', function(chunk) {
        //     res.write(chunk, 'binary');
        // });

        // fileStream.on('end', function() {
        //     res.end();
        // });

    });

    archive = archiver('zip');
    archive.on('error', function(err) {
        throw new Error(err);
    });
    archive.pipe(archiverFile);
    //模块版本下的所以文件通过zip压缩
    archive.bulk([{
        expand: true,
        cwd: path.join(this.moduleRoot, moduleName, version),
        src: ['**']
    }]);
    archive.finalize(function(err, bytes) {

        if (err) {
            throw new Error(err);
        }

        console.log(bytes + ' total bytes');
        
    });
};
/**
 * 查询模块列表，如果有版本参数，查询具体模块的版本列表
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
Router.prototype.search = function(req, res) {
    var moduleName = req.params.module || '';
    var modulePath = path.join(this.moduleRoot, moduleName);
    var result;

    // this.makeFolder(modulePath, 'modules');

    if (!fs.existsSync(modulePath)) {
        return res.send([]);
    }

    fs.readdir(modulePath, function(error, files) {
        if (error) {
            throw new Error(error);
        }
        var fileSize = files.length;
        // console.log(files);
        if (!fileSize) {
            return res.send([]);
        }
        files.forEach(function(file, index) {
            fs.stat(path.join(modulePath, file), function(error, stats) {
                if (error) {
                    throw new Error(error);
                }
                //排除文件夹
                if (!stats.isDirectory()) {
                    files.splice(0, 1);
                }
                //只有在最后一次才发送数据
                if (fileSize == index + 1) {
                    if (moduleName) {
                        result = {};
                        result[moduleName] = files; 
                    } else {
                        result = files;
                    }
                    res.send(result);
                }
                
            });         
        });
        
    });

};

Router.prototype.makeFolder = function(filePath, start) {
    var filePaths = filePath.split('/');
    var startIndex = filePaths.indexOf(start);
    var loop = startIndex + 1;

    function make() {
        var currentPath = filePaths.slice(0, loop + 1).join('/');
        if (loop <= filePath.length) {
            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath);
            }
            loop++;
            make();
        }
        
    }
    make();

};

Router.prototype.publish = function(req, res) {
    var fileName = req.params.module + '-' + req.params.version + '.zip';
    var filePath = path.join(output, fileName);
    var moduleRoot = this.moduleRoot;
    var extractPath = path.join(moduleRoot, req.params.module, req.params.version);
    var writeStream = fs.createWriteStream(filePath);
    var self = this;

    req.pipe(writeStream);
    req.on('end', function() {

        self.makeFolder(extractPath, 'modules');

        var readStream = fs.createReadStream(filePath);

        var extract = unzip.Extract({ path: extractPath });
        extract.on('error', function(err) {  
            //解压异常处理
            throw new Error(error); 
        });  
        extract.on('finish', function() {
            //解压完成处理  
            console.log('Extract ' + fileName + ' success.');
        });  
        readStream.pipe(extract);
        readStream.on('end', function() {
            fs.unlink(filePath, function(error) {
                if (error) {
                    throw new Error(error);
                }
            });
        });

        res.send('Publish ' + fileName + ' successed.');
    });
};

module.exports = Router;