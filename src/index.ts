import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import https from 'https';
import fs from 'fs';
import { schema } from './schema';
import typeormConfig from './typeorm.config';
import { Context } from './types/Context';

async function startApolloServer() {
  const app = express();

  const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/stable.nameylus.xyz/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/stable.nameylus.xyz/fullchain.pem')
  };

  const connection = await typeormConfig.initialize();

  const server = new ApolloServer({
    schema,
    context: (): Context => ({
      connection
    })
  });

  await server.start();

  server.applyMiddleware({ app });

  const httpsServer = https.createServer(httpsOptions, app);

  httpsServer.listen(443, () => {
    console.log(`🚀 Server ready at https://stable.nameylus.xyz${server.graphqlPath}`);
  });
}

startApolloServer().catch((error) => {
  console.error('Failed to start server:', error);
});