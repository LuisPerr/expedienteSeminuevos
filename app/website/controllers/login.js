var LoginView = require('../views/login'),
	LoginModel = require('../models/login');

var Login = function(config){
	this.config = config || {};

	this.view = new LoginView();
	this.model = new LoginModel({connection: this.config.connection});

	this.response = function(){
		this[this.config.funcionalidad](this.config.req,this.config.res,this.config.next);
	}
}


Login.prototype.get_see_data = function(req,res,next){
	var object = {};
	var params = {}; 
	var self = this;

	var parameters = JSON.parse(req.params.data);

	this.model.get(parameters,function(error,result){
		
		object.error = error;
		object.result = result;
		
		self.view.see(res, object);
	});
}


module.exports = Login;