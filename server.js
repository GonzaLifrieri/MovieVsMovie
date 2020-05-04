require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const controlador = require('./controladores/controlador.js');
var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
        extended: true
}));

app.use(bodyParser.json());
//vista Cliente
app.get('/competencias',controlador.listaCompetencias);
app.get('/competencias/:id/peliculas',controlador.obtenerPeliculas);
app.get('/competencias/:id/resultados',controlador.obtenerResultados);
app.post('/competencias/:idCompetencia/voto',controlador.votarPelicula);
//Vista Administrador
app.get('/generos',controlador.listarGeneros);
app.get('/directores',controlador.listarDirectores);
app.get('/actores',controlador.listarActores);
app.post('/competencias',controlador.crearCompetencia);
app.get('/competencias/:id',controlador.obtenerCompetencia);
app.delete('/competencias/:id',controlador.eliminarCompetencia);
app.put('/competencias/:id',controlador.editarCompetencia);
app.delete('/competencias/:id/votos',controlador.reiniciarCompetencia);


var puerto = process.env.PORT || 8080;
app.listen(puerto, function () {  console.log( "Escuchando en el puerto " + puerto );});