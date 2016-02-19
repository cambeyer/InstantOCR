var express = require('express');
var app = express();
var fs = require('fs-extra');
var busboy = require('connect-busboy');
var path = require('path');
var http = require('http').Server(app);
const vision = require('node-cloud-vision-api');

vision.init({auth: 'AIzaSyD0N8BLT3iSEiUaBr7uAnSqldFKg5rQLG4'});

app.use(busboy());

var dir = __dirname + '/temp/';
fs.mkdir(dir, function(err) {
    if (err && err.code !== 'EEXIST') {
    	console.log("Error creating folder");
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.route('/upload').post(function (req, res, next) {
	var fstream;
	var filename;
	req.on('close', function () {
		if (fstream && filename) {
			fstream.end();
	        fs.unlinkSync(filename);
		}
        console.log("Client disconnected while uploading");
	});
	req.busboy.on('file', function (fieldname, stream, name) {
		filename = dir + getName(path.basename(name));
		fstream = fs.createWriteStream(filename);
		fstream.on('close', function () {
			vision.annotate(new vision.Request({
				image: new vision.Image(filename),
				features: [
					new vision.Feature('TEXT_DETECTION', 1)
				]
			})).then((resp) => {
				res.writeHead(200, { Connection: 'close' });
      			res.end(JSON.stringify(resp.responses));
      			fs.unlinkSync(filename);
			}, (e) => {
				console.log(e);
				res.sendStatus(404);
				fs.unlinkSync(filename);
			});
		});
		stream.pipe(fstream);
	});
	req.pipe(req.busboy);
});

var getName = function(filename) {
	var num = 0;
	var exists = true;
	while (exists) {
		try {
			fs.statSync(dir + filename + num);
			num = num + 1;
		} catch (e) {
			filename = filename + num;
			exists = false;
		}
	}
	return filename;
};

http.listen(8080, "0.0.0.0", function (){
	console.log('listening on *:8080');
});