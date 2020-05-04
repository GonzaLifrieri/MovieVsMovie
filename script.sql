CREATE TABLE `competencias`.`competencia` (
      `id` INT NOT NULL AUTO_INCREMENT,
      `nombre` VARCHAR(100) NOT NULL,
       PRIMARY KEY (`id`));

INSERT INTO `competencia` (`id`,`nombre`) VALUES (1,'Mejor pelicula de acción');
INSERT INTO `competencia` (`id`,`nombre`) VALUES (2,'Mejor pelicula del año 2007');
INSERT INTO `competencia` (`id`,`nombre`) VALUES (3,'Pelicula para llorar de risa');
INSERT INTO `competencia` (`id`,`nombre`) VALUES (4,'Mejor pochoclera');
INSERT INTO `competencia` (`id`,`nombre`) VALUES (5,'Pelicula más dramática');
INSERT INTO `competencia` (`id`,`nombre`) VALUES (6,'Mejor VFX');
INSERT INTO `competencia` (`id`,`nombre`) VALUES (7,'Mejor documental');
INSERT INTO `competencia` (`id`,`nombre`) VALUES (8,'Mejor de mejores');


CREATE TABLE `votos_peli_competencia` (
	`competencia_id` INT NOT NULL,
	`pelicula_id` INT(11) unsigned NOT NULL,
    FOREIGN KEY (competencia_id) REFERENCES competencia(id),
    FOREIGN KEY (pelicula_id) REFERENCES pelicula(id)
) DEFAULT CHARSET=latin1;

ALTER TABLE competencia ADD COLUMN genero_id INT DEFAULT 0;
ALTER TABLE competencia ADD COLUMN actor_id INT DEFAULT 0;
ALTER TABLE competencia ADD COLUMN director_id INT DEFAULT 0;
ALTER TABLE competencia ADD FOREIGN KEY (genero_id) REFERENCES genero(id);
ALTER TABLE competencia ADD FOREIGN KEY (actor_id) REFERENCES actor(id);
ALTER TABLE competencia ADD FOREIGN KEY (director_id) REFERENCES director(id);


