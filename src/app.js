// src/app.js
const express = require('express');
const campaignRoutes = require('./routes/campaignRoutes');
const auth = require('./middlewares/auth');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

app.use(express.json({ limit: '20mb' }));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BLiP Campaign API',
      version: '1.0.0',
      description: 'API para receber payload de campanha, salvar PDF na Azure e enviar comando ao BLiP'
    },
    servers: [
      {
        url: 'https://apiblip-g8fkhuhyb0d3efgx.brazilsouth-01.azurewebsites.net', // ajuste para o host de produção se precisar
        description: 'Servidor local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'Token',
          description: 'Envie o header Authorization no formato: Bearer <TOKEN>.'
        }
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Não autorizado. Token inválido.'
            }
          }
        }
      }
    },
    // aplica bearer como padrão em todas as rotas (pode tirar se quiser só em algumas)
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas protegidas
app.use('/api', auth, campaignRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
