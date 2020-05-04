var con = require("../lib/conexionbd");

function listaCompetencias(req, res){
    con.query("SELECT * FROM competencia", function(err, result, fields){
         if(err){
            console.log("Hubo un error en la obtencion de competencias",err);
            res.status(404).send("Hubo un error en la obtencion de competencias " + err);
        }

        res.json(result);
    })
}

function generarConsultaFiltros(genero, director, actor){
    let queryPelicula = 'SELECT p.id, p.poster, p.titulo FROM pelicula AS p LEFT JOIN director AS d ON p.director = d.nombre INNER JOIN actor_pelicula AS ap ON p.id = ap.pelicula_id ';
    let filtros = [];
    if(genero != 0) { filtros.push(` p.genero_id = ${genero} `)}
    if(director != 0) { filtros.push(` d.id = ${director} `)}
    if(actor != 0) { filtros.push(` ap.actor_id = ${actor} `)}
    if(filtros.length > 0){
         queryPelicula += ' WHERE ' + filtros.join(' AND ')
    }
    queryPelicula += ' GROUP BY p.id ORDER BY rand() LIMIT 2;'
    return queryPelicula;
}


function obtenerPeliculas(req,res){
    var id = req.params.id;
    var sqlDatospelicula = `SELECT genero_id, director_id, actor_id FROM competencia WHERE id = ${id}`;
    var sqlCompetencia = `SELECT nombre FROM competencia WHERE id = ${id}`;
    //comas invertidas alt + 96
    con.query(sqlCompetencia, function(err, result1, fields){
        if(err){
           console.log("Hubo un error en la obtencion de  competencia",err);
           res.status(404).send("Hubo un error en la obtencion de competencia " + err);
       }
       if(result1.length == 0){
           res.status(404).json("No existe la competencia");
       }
        var resultCompetencia = result1;
        con.query(sqlDatospelicula, function(err, result2, fields){
            if(err){
               console.log("Hubo un error en la obtencion de datos de la competencia",err);
                res.status(404).send("Hubo un error en la obtencion de datos de la competencia " + err);
           }
        var generoCompetencia = result2[0].genero_id;
        var directorCompetencia = result2[0].director_id;
        var actorCompetencia = result2[0].actor_id;
        var sqlPelis = generarConsultaFiltros(generoCompetencia, directorCompetencia, actorCompetencia);
        con.query(sqlPelis, function(err, result3, fields){
            if(err){
           console.log("Hubo un error en la obtencion de peliculas",err);
           res.status(404).send("Hubo un error en la obtencion de peliculas " + err);
         }

       var response ={
            'peliculas': result3,
            'competencia': resultCompetencia[0].nombre
       }

       res.json(response);
    })
})
    })
}

function votarPelicula(req, res){
    let idCompetencia = req.params.idCompetencia;
    let idPelicula = req.body.idPelicula;
    let sql = `INSERT INTO votos_peli_competencia (competencia_id,pelicula_id) VALUES (${idCompetencia}, ${idPelicula});`;

    con.query(sql, function (err, result){
        if(err){
            console.log('Error al traer la competencia. Error '+err);
             res.status(500).send('Ocurrió un error al intentar cargar el voto.')
        }
    
        res.send('Tu voto fue cargado con éxito');
    });
}
function obtenerResultados (req, res){
    let competencia_id = req.params.id;
    let queryResultados = `SELECT c.nombre, p.titulo AS titulo, p.poster AS poster, p.id AS pelicula_id, COUNT(vpc.pelicula_id) AS votos
    FROM votos_peli_competencia AS vpc
        LEFT JOIN competencia AS c ON vpc.competencia_id = c.id
        LEFT JOIN pelicula AS p ON vpc.pelicula_id = p.id 
        WHERE c.id = ?
        GROUP BY c.nombre, p.titulo, p.poster, p.id, vpc.pelicula_id
        ORDER BY votos DESC LIMIT 3`
    con.query(queryResultados, [competencia_id], function(err, result){
        if(err){
            console.log('Error al obtener resultados de encuestas. Error '+ err)
             res.send(404).send('Ocurrió un error al obtener los resultados.')
        }
        if(result.length != 0) {
            let data = {
                competencia: result[0].nombre,
                resultados: result
            }
            res.json(data);
        }
    });
}

function crearCompetencia(req, res){
    var nombreCompetencia = req.body.nombre;
    var generoCompetencia = req.body.genero;
    var directorCompetencia = req.body.director;
    var actorCompetencia = req.body.actor;
    var sqlParaChequear = generarConsultaFiltros(generoCompetencia, directorCompetencia, actorCompetencia);
    var sqlParaChequearNombre = `SELECT * FROM competencia WHERE nombre = '${nombreCompetencia}'`;
    let queryInsert = `INSERT INTO competencia (nombre, genero_id, director_id, actor_id) VALUES (?, ?, ?, ?)`;
    let valores = [nombreCompetencia];
    (generoCompetencia != 0 ) ? valores[1] = [generoCompetencia] : valores[1] = [0];
    (directorCompetencia != 0 ) ? valores[2] = [directorCompetencia] : valores[2] = [0];
    (actorCompetencia != 0) ? valores[3] = [actorCompetencia] : valores[3] = [0];
    con.query(sqlParaChequear,function (err, result1){
        if(result1.length <= 1){
            console.log('Error al intentar chequear la cantidad de peliculas disponibles. Error '+ err)
             res.status(422).json("No se puede armar la competencia ya que la base de datos no posee dos pelicula con ese criterio");
        }
        con.query(sqlParaChequearNombre,function (err, result2){
                 if(result2.length >= 1){
                     console.log('Error al intentar chequear la existencia del nombre de competencia. Error '+ err)
                      res.status(422).send('Ocurrió un error al intentar crear la competencia.Ya existe el nombre de competencia que desea crear')
                 } else{  
            con.query(queryInsert,valores,function (err, result3){
                if(err){
                    console.log('Error al intentar crear la competencia. Error '+ err)
                    res.status(500).send('Ocurrió un error al intentar crear la competencia.')
                }
            res.send('Tu competencia fue cargado con éxito');
            })
            }
        })
    })
}

function listarGeneros(req, res){
    var sql = "SELECT * FROM genero"
    con.query(sql, function(err, result,fields){
        if(err){
            console.log('Error al obtener generos. Error '+ err)
            res.status(404).send('Ocurrió un error al obtener los generos.')
        }
        res.json(result);
    })
}
function listarDirectores(req, res){
    var sql = "SELECT * FROM director"
    con.query(sql, function(err, result,fields){
        if(err){
            console.log('Error al obtener directores. Error '+ err)
            res.status(404).send('Ocurrió un error al obtener los directores.')
        }
        res.json(result);
    })
}
function listarActores(req, res){
    var sql = "SELECT * FROM actor"
    con.query(sql, function(err, result,fields){
        if(err){
            console.log('Error al obtener actores. Error '+ err)
            res.status(404).send('Ocurrió un error al obtener los actores.')
        }
        res.json(result);
    })
}
function reiniciarCompetencia(req,res){
    let idCompetencia =  req.params.id;
    var sql = `DELETE FROM votos_peli_competencia WHERE competencia_id = ${idCompetencia}`;
    con.query(sql, function(err, result,fields){
        if(err){
            console.log('Error al intentar reiniciar la competencia. Error '+ err)
             res.status(500).send('Ocurrió un error al intentar reiniciar la competencia.')
        }
        res.send("La competencia ha sido reiniciada con exito");
    })    
}
function editarCompetencia(req,res){
    let idCompetencia =  req.params.id;
    var nombreCompetencia = req.body.nombre;
    var sql = `UPDATE competencia SET nombre = "${nombreCompetencia}" WHERE id = ${idCompetencia}`;
    con.query(sql, function(err, result,fields){
        if(err){
            console.log('Error al intentar editar la competencia. Error '+ err)
            res.status(500).send('Ocurrió un error al intentar editar la competencia.')
        }
        res.send("La competencia ha sido modificada con exito");
    })    
}
function eliminarCompetencia(req,res){
    let idCompetencia =  req.params.id;
    var sql = `DELETE FROM votos_peli_competencia WHERE competencia_id = ${idCompetencia};DELETE FROM competencia WHERE id = ${idCompetencia}`;
    con.query(sql, function(err, result,fields){
        if(err){
            console.log('Error al intentar borrar la competencia. Error '+ err)
            res.status(500).send('Ocurrió un error al intentar borrar la competencia.')
        }
        res.send("La competencia ha sido borrada con exito");
    })
}       
   
function obtenerCompetencia(req,res){
    var id = req.params.id;
    let sqlObtener = `SELECT c.nombre, d.nombre AS director_nombre, g.nombre AS genero_nombre, a.nombre AS actor_nombre FROM competencia c
    LEFT JOIN director d ON d.id = c.director_id
    LEFT JOIN genero g ON g.id = c.genero_id
    LEFT JOIN actor a ON a.id = c.actor_id
    WHERE c.id = ?`;
    con.query(sqlObtener,[id],function(err,result){
        if(err){
            console.log("Error al traer la competencia. Error" + err);
            res.status(404).send("No se pudo obtener la competencia")
        }
        let resultado = result[0]
        res.send(resultado);
    });
}


module.exports = {
    listaCompetencias,
    obtenerPeliculas,
    votarPelicula,
    obtenerResultados,
    crearCompetencia,
    listarGeneros,
    listarDirectores,
    listarActores,
    reiniciarCompetencia,
    editarCompetencia,
    eliminarCompetencia,
    obtenerCompetencia
}


