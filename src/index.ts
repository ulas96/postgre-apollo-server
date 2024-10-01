import { ApolloServer } from "apollo-server";
import { schema } from "./schema";
import typeormConfig from "./typeorm.config";
import { Context } from "./types";

const boot = async () => {

    const connection = await typeormConfig.initialize();

    const server = new ApolloServer({
        schema,
        context: (): Context => ({
            connection
        })
    });

    server.listen(5252).then(({url}) => {
        console.log("listening on" + url )
    })
};

boot();