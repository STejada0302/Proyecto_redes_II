export default class PremioPuntos {
    constructor(escena, escala = 0.1) {
        // Escena de Phaser
        this.escena = escena;
        // Escala para ajustar tamaño de los premios
        this.escala = escala;

        // Grupo que tendrá todos los premios
        this.grupoPremiosPuntos = null;

        // Próxima posición en X donde aparece un premio
        this.siguientePosX = 800;
    }

    // Carga de sprites de premios
    preCargar() {
        this.escena.load.image('premioPuntos1', './assets/premioPuntos1.png');
        this.escena.load.image('premioPuntos2', './assets/premioPuntos2.png');
    }

    // Crear premios iniciales y configurar colisiones
    crear() {
        // Creamos el grupo de premios
        this.grupoPremiosPuntos = this.escena.physics.add.group();

        // Generamos unos cuantos premios al inicio (puedes ajustar valores a tu gusto)
        for (let i = 300; i < 1800; i += 500) {
            this.crearPremioPuntos(i);
        }

        // Si se quiere hacer que el jugador colisione con el premio (otorgando puntos, etc.)
        if (this.escena.jugador && this.escena.jugador.sprite) {
            this.escena.physics.add.collider(
                this.escena.jugador.sprite,
                this.grupoPremiosPuntos,
                this.colisionConJugador,
                null,
                this
            );
        }
    }

    // Actualizamos según la posición del jugador para generar nuevos premios
    actualizar() {
        const posJugadorX = this.escena.jugador.sprite.x;

        // Cuando el jugador supere cierta distancia, generamos un nuevo premio
        if (posJugadorX > this.siguientePosX) {
            this.generarPremioPuntos();
            this.siguientePosX = posJugadorX + Phaser.Math.Between(400, 1000);
        }
    }

    // Genera un premio en una posición más adelante del jugador
    generarPremioPuntos() {
        let posJugadorX = this.escena.jugador.sprite.x;
        let posAparicionX = posJugadorX + Phaser.Math.Between(400, 800);

        // Intentamos varias veces colocar el premio sin que se solapen
        let intentos = 5;
        while (intentos > 0) {
            if (this.sePuedeColocarPremioPuntos(posAparicionX, 80)) {
                this.crearPremioPuntos(posAparicionX);
                break;
            } else {
                intentos--;
            }
        }
    }

    // Crea un premio en la coordenada X dada, asegurándose de que esté sobre plataformas o el suelo
    crearPremioPuntos(xPos) {
        // Escogemos al azar entre premioPuntos1 y premioPuntos2
        let tipo = Phaser.Math.Between(1, 2) === 1 ? 'premioPuntos1' : 'premioPuntos2';
        let premioPuntos = this.grupoPremiosPuntos.create(xPos, 0, tipo);

        premioPuntos.setImmovable(false);  // Ya no será inmovible, se moverá con la física
        premioPuntos.body.allowGravity = true;  // Activamos la gravedad

        // Escalado responsivo
        this.ajustarEscala(premioPuntos);

        // Ajustamos la posición vertical aleatoria, asegurándonos que esté en la parte superior
        let yPos = this.obtenerPosicionVerticalAleatoria();
        premioPuntos.y = yPos;

        // Configuramos las colisiones con el mundo (suelo y plataformas)
        premioPuntos.body.setCollideWorldBounds(true);  // Aseguramos que no se escape fuera del mundo
        this.escena.physics.add.collider(premioPuntos, this.escena.objetoFondo.cuerpoSuelo, this.detenerPremio, null, this);
        this.escena.physics.add.collider(premioPuntos, this.escena.plataformasAereas, this.detenerPremio, null, this);
    }

    // Método para obtener una posición Y aleatoria sobre plataformas o sobre el suelo
    obtenerPosicionVerticalAleatoria() {
        // Generamos una posición Y en la parte superior de la pantalla
        return Phaser.Math.Between(0, 100);  // Genera un valor entre 0 y 100 píxeles de altura desde la parte superior
    }

    // Detener el premio cuando toca el suelo o las plataformas
    detenerPremio(premioPuntos, objetoFisico) {
        // Desactivar la gravedad y la colisión
        premioPuntos.body.allowGravity = false;
        premioPuntos.body.velocity.y = 0; // Detener cualquier movimiento hacia abajo

        // Asegurarnos de que el premioPuntos se quede en su posición
        premioPuntos.body.setImmovable(true);  // Hace que el premio se quede en su lugar
    }

    // Ajustar escala de los premios de acuerdo al tamaño de la pantalla
    ajustarEscala(premioPuntos) {
        const texturaOriginal = premioPuntos.texture.getSourceImage();
        const anchoOriginal = texturaOriginal.width;

        const anchoPantalla = this.escena.scale.width;
        const porcentajeAncho = 0.05;  // Ajusta el porcentaje según el tamaño deseado
        const anchoDeseado = anchoPantalla * porcentajeAncho;

        const escala = anchoDeseado / anchoOriginal;

        premioPuntos.setScale(escala);
        premioPuntos.body.updateFromGameObject();
    }

    // Ejemplo de colisión con el jugador
    colisionConJugador(jugador, premioPuntos) {
        console.log("¡Colisión con un Premio de Puntos!");
        // Aquí podrías agregar la lógica para otorgar puntos al jugador, etc.
    }

    // Checamos si hay suficiente espacio para colocar un premio
    sePuedeColocarPremioPuntos(xPos, distanciaMinima) {
        const lista = this.grupoPremiosPuntos.getChildren();
        for (let premio of lista) {
            if (Math.abs(premio.x - xPos) < distanciaMinima) {
                return false;
            }
        }
        return true;
    }
}
