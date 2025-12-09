const express = require('express');
const campaignRoutes = require('./routes/campaignRoutes');
const auth = require('./middlewares/auth');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

app.use(express.json({ limit: '20mb' }));

// Configuração Swagger
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
        url: 'http://localhost:3000', // ajuste se estiver em outro host
        description: 'Servidor local'
      }
    ],
    components: {
      securitySchemes: {
        ApiTokenAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Use: `Bearer SEU_TOKEN_AQUI`'
        }
      }
    },
    security: [
      {
        ApiTokenAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js'] // onde estão os JSDoc das rotas
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Rota pública da documentação
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas protegidas
app.use('/api', auth, campaignRoutes);

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
