var conf = require('../../../conf');
//,edge = require('edge');


var Login = function(config){
	this.config = config || {};
    console.log(conf.cnnSQL);
};

/*var param ={
    connectionString: conf.cnnSQL,
    source: "SELECT TOP 10 'Hola' FROM dbo.Empleado emp LEFT JOIN dbo.Login lgn ON lgn.idEmpleado = emp.idEmpleado LEFT JOIN dbo.Departamento dep ON dep.idDepartamento = emp.idDepartamento LEFT JOIN dbo.Area are ON are.idArea = dep.idArea where lgn.usuario = @user AND lgn.contrasena = @contrasena AND emp.idEmpresa = @idEmpresa"
};*/

//Funciones
/*var loginUser = edge.func('sql', param);*/

/*var loginUser = edge.func('sql', function () {/*
    SELECT emp.[idEmpleado]
          ,emp.[nombre]
          ,emp.[apellidoPaterno]
          ,emp.[apellidoMaterno]
          ,dep.[idDepartamento]
          ,dep.descripcion nombreDepartamento
          ,are.idArea
          ,are.descripcion nombreArea
          ,emp.[idTipo]
          ,emp.[email]
          ,emp.[file] as avatar
          ,'' as permisos
          ,emp.[estatus]
      FROM [dbo].[Empleado] emp
      LEFT JOIN [dbo].[Login] lgn ON lgn.idEmpleado = emp.idEmpleado
      LEFT JOIN [dbo].[Departamento] dep ON dep.idDepartamento = emp.idDepartamento
      LEFT JOIN [dbo].[Area] are ON are.idArea = dep.idArea
      where lgn.usuario = @user
      AND lgn.contrasena = @contrasena
      AND emp.idEmpresa = 1
});*/



Login.prototype.get = function(params,callback){
    /*loginUser(params, function (error, result) {
    	callback(error, result)
    });*/
}

module.exports = Login; 