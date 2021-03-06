var path = require('path');
var fs = require('fs');

function provide(app) {
    var output = path.resolve(__dirname, '../tmp');

    app.set('output', output);

    return function(res, req, next) {
        fs.exists(output, function(exist) {
            if (!exist) {
                fs.mkdir(output, function(error) {
                    if (error) {
                        next(new Error(error));
                    } else {
                        next();
                    }
                });
            } else {
                next();
            }
        });
    };    
}

module.exports = provide;