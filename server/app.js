
/**
 * Module dependencies.
 */

var express = require('express');
var Router = require('./routes/index');
var provide = require('./routes/provide');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 13000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('assets', path.join(__dirname, 'assets'));

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(provide(app));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

new Router(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

/*process.on('uncaughtException', function(e) {
    console.log(e.message);
});*/