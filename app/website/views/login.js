var Login = function(conf){
	conf = conf || {};
}

function logError(err, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("Error: " + err);
    res.end("");
}  

Login.prototype.see = function(res, object){
	/*res.render('article_see', object);*/
	if (object.error) { logError(object.error, res); return; }
	
	if (object.result) {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.write(JSON.stringify(object.result));
		res.end("");
	}
	else {
	}
}
Login.prototype.add = function(res, object){
	/*res.render('article_add', object);*/
}
Login.prototype.edit = function(res, object){
	/*res.render('article_edir', object);*/
}
Login.prototype.list = function(res, object){
	/*res.render('article_list', object);*/
}

module.exports = Login; 
