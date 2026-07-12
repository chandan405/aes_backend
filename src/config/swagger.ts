import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AES Backend API Documentation',
      version: '1.0.0',
      description: 'Abinash Engineering Services (AES) Backend API documentation. Contains details about all endpoints, schemas, authentication, and responses.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
      {
        url: 'https://aesbackend-sigma.vercel.app',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token in the format: Bearer <token>',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Paths to files containing OpenAPI definitions (e.g. routes/controllers)
  apis: ['./src/routes/*.ts', './src/routes/*.js', './dist/routes/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
