# GYT Collector Web Service

## Descripción del Proyecto

El GYT Collector Web Service es una aplicación diseñada para procesar pagos a través de la API de Akros. Utiliza un servidor Express.js para recibir solicitudes en formato XML, las convierte a JSON, y se comunica con la API de Akros para realizar las transacciones. La respuesta se convierte nuevamente a XML y se envía de vuelta al cliente.

## Estructura del Proyecto

```
gyt-collector-web-service
├── src
│   ├── controllers
│   │   └── collectorController.js
│   ├── middleware
│   │   └── errorHandler.js
│   ├── services
│   │   └── akrosClient.js
│   ├── utils
│   │   ├── logger.js
│   │   └── xmlConverter.js
│   ├── app.js
│   └── types
│       └── index.d.ts
├── test
│   ├── controllers
│   │   └── collectorController.test.js
│   ├── services
│   │   └── akrosClient.test.js
│   └── utils
│       └── xmlConverter.test.js
├── .env.example
├── package.json
├── README.md
└── ARCHITECTURE.md
```

## Instalación

1. Clona el repositorio:
   ```
   git clone <url-del-repositorio>
   cd gyt-collector-web-service
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Configura las variables de entorno. Copia el archivo `.env.example` a `.env` y completa los valores necesarios.

## Uso

Para iniciar el servidor, ejecuta el siguiente comando:

```
npm start
```

El servidor se ejecutará en el puerto especificado en las variables de entorno.

## Pruebas

Para ejecutar las pruebas unitarias, utiliza el siguiente comando:

```
npm test
```

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.