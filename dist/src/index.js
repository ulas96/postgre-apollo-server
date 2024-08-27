"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const schema_1 = require("./schema");
const boot = () => {
    const server = new apollo_server_1.ApolloServer({ schema: schema_1.schema });
    server.listen(5151).then(({ url }) => {
        console.log("listening on" + url);
    });
};
boot();
//# sourceMappingURL=index.js.map