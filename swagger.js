import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from "dotenv";
dotenv.config();
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shortener API',
      version: '1.0.0',
      description: 'API documentation for URL shortener | by Alfthrpy',
    },
    servers: [
      {
        url: process.env.URL,
      },
    ],
  },
  apis: ['./src/route/*.js'], // Lokasi file route Anda
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export { swaggerDocs, swaggerUi };
