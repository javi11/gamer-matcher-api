const fastify = require('fastify')();
const { graphiqlFastify, graphqlFastify } = require('fastify-graphql');
const fastifyMongoose = require('./plugins/mongoose');
const schema = require('./schema');

fastify.register(
  fastifyMongoose,
  {
    uri: process.env.MONGODB_URI || `mongodb://${process.env.IP || 'localhost'}/gamer-matcher`
  },
  err => {
    if (err) throw err;
  }
);

fastify.register(graphqlFastify, {
  prefix: '/graphql',
  graphql: {
    schema
  }
});

fastify.register(graphiqlFastify, {
  prefix: '/graphiql',
  graphiql: {
    endpointURL: '/graphql'
  }
});

fastify.listen(process.env.PORT || 8080, '0.0.0.0', err => {
  if (err) {
    throw err;
  }

  console.log(`server listening on ${fastify.server.address().port}`);
});
