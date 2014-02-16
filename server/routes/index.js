var path = require('path'),
    fs = require('fs'),
    when = require('when'),
    sequence = require('when/sequence'),
    // nodefn = require('when/node/function'),
    archiver = require('archiver'),
    util = require('util'),
    unzip = require('unzip');

function Router(app) {

    //tmp目录
    this.output = path.resolve(__dirname, '../tmp');
    //模块目录
    this.moduleRoot = path.join(app.get('assets'), 'modules');

    app.get('/', function(req, res) {
        res.render('index', {title: 'CLI'});
    });

    this.createTmp(app).then(this.invokeRouter.bind(this, app), function(error) {
        console.log(error.stack);
    });
}
Router.prototype.createTmp = function(app) {
    
    function invokeExists() {
        var defer = when.defer();

        fs.exists(this.output, function(exist) {

            if (exist) {
                this.invokeRouter(app);
            } else {
                defer.resolve();
            }
        }.bind(this));

        return defer.promise;
    }

    function invokeMkdir() {
        var defer = when.defer();

        fs.mkdir(this.output, function(error) {

            if (error) {
                defer.reject(new Error(error));
            } else {
                defer.resolve('Create temp folder success.');
            }
        });

        return defer.promise;
    }

    // nodefn.call(fs.mkdir, this.output); 和sequence结合起来用好像有问题，成功后走到错误里面

    return sequence([invokeExists.bind(this), invokeMkdir.bind(this)]);
};
Router.prototype.invokeRouter = function(app) {

    console.log('Invoke router');

    app.get('/install/:module/:version?', this.install.bind(this));
    app.get('/search/:module?', this.search.bind(this));
    app.post('/publish/:module/:version', this.publish.bind(this));

};
/**
 * 得到当前版本，如果不指定版本，默认用最新的版本
 * @param  {[type]} version    [description]
 * @param  {[type]} moduleName [description]
 * @return {[type]}            [description]
 */
Router.prototype.getVersion = function(version, moduleName) {
    var pathVersion = path.join(this.moduleRoot, moduleName);

    function invokePath() {
        var defer = when.defer();
        fs.exists(pathVersion, function(exist) {
            if (exist) {
                defer.resolve();
            } else {
                defer.reject('Module can not exist.');
            }
        });
        return defer.promise;
    }
    function readdir() {
        var defer = when.defer();
        fs.readdir(pathVersion, function(error) {
            if (error) {
                defer.reject(new Error('Version can not exist.'));
            } else {
                defer.resolve(versions);
            }
        });
    }

    // sequence([invokePath, readdir]);

    // var defer = when.defer();

    if (!fs.existsSync(pathVersion)) {
        throw new Error('Module can not exist.');
    }
    var versions = fs.readdirSync(pathVersion);

    
};
Router.prototype.judgeVersion = function(version, versions) {
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
        // console.log(versions);
        return versions[0];
    }
};
/**
 * 服务端首先在tmp目录生成对应模块版本的zip压缩包，然后发送压缩包到客户端
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
Router.prototype.install = function(req, res, next) {

    var moduleName = req.params.module,
        version = req.params.version,
        file, archiverFile, archive,
        fullName;

    this.getVersion(version, moduleName)
        .then(this.judgeVersion.bind(this, version))
        .then(function(version) {
            var file = [moduleName, version, Date.now()].join('-');
            var fullName = path.join(this.output, file + '.zip');

            this.invokeInstall.call(this, fullName, req, res);

        }.bind(this), function(error) {
            res.send({error: e.message});
        });
    
};
Router.prototype.invokeInstall = function(fullName, req, res) {
    var archiverFile = fs.createWriteStream(fullName);

    var defer = when.defer();

    //close事件表示压缩完毕
    archiverFile.on('close', function() {

        console.log('archiver has been finalized and the output file descriptor has closed.');
        
        var fileStream = fs.createReadStream(fullName);

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
                    defer.reject(new Error(error));
                } else {
                    defer.resolve('Download success.');
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
    archive.on('error', function(error) {
        defer.reject(new Error(error));
    });
    archive.pipe(archiverFile);
    //模块版本下的所以文件通过zip压缩
    archive.bulk([{
        expand: true,
        cwd: path.join(this.moduleRoot, moduleName, version),
        src: ['**']
    }]);
    archive.finalize(function(error, bytes) {

        defer.reject(new error(error));
        // console.log(bytes + ' total bytes');
        
    });
};
/**
 * 查询模块列表，如果有版本参数，查询具体模块的版本列表
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
Router.prototype.search = function(req, res, next) {
    var moduleName = req.params.module || '';
    var modulePath = path.join(this.moduleRoot, moduleName);
    var result;

    // this.makeFolder(modulePath, 'modules');

    if (!fs.existsSync(modulePath)) {
        return res.send('module error.');
    }

    fs.readdir(modulePath, function(error, files) {
        if (error) {
            next(new Error(error));
        }
        var fileSize = files.length;
        // console.log(files);
        if (!fileSize) {
            return res.send('file size error.');
        }
        files.forEach(function(file, index) {
            fs.stat(path.join(modulePath, file), function(error, stats) {
                if (error) {
                    next(new Error(error));
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
    var filePaths = filePath.split('/'),
        startIndex = filePaths.indexOf(start),
        loop = startInex + 1;

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

Router.prototype.publish = function(req, res, next) {

    var params = req.params,
        fileName = params.module + '-' + params.version + '.zip',
        filePath = path.join(this.output, fileName),
        moduleRoot = this.moduleRoot,
        extractPath = path.join(moduleRoot, module, version),
        writeStream = fs.createWriteStream(filePath),
        self = this;

    req.pipe(writeStream);
    req.on('end', function() {

        var readStream, extract;

        self.makeFolder(extractPath, 'modules');

        readStream = fs.createReadStream(filePath);

        extract = unzip.Extract({ path: extractPath });
        extract.on('error', function(error) {  
            //解压异常处理
            next(new Error(error)); 
        });  
        extract.on('finish', function() {
            //解压完成处理  
            console.log('Extract ' + fileName + ' success.');
        });  
        readStream.pipe(extract);
        readStream.on('end', function() {
            fs.unlink(filePath, function(error) {
                if (error) {
                    next(new Error(error));
                }
            });
        });

        res.send('Publish ' + fileName + ' successed.');
    });
};

module.exports = Router;