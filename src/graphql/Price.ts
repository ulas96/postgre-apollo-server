import { extendType, nonNull, objectType, stringArg, floatArg } from "nexus"; 
import { Price } from "../entities/Price";
import { Context } from "../types/Context";

export const PriceType = objectType({
    name: "Price",
    definition(t) {
        // Removed the id field
        t.nonNull.string("date"),
        t.nonNull.string("price")
    }
});


export const PricesQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("prices", {
            type: "Price",
            args: {
                date: stringArg(), // Optional argument
            },
            async resolve(_parent, args, context: Context, _info) {
                const { connection } = context;
                const { date } = args;

                let query = `SELECT * FROM price`;

                if (date) {
                    query += ` WHERE date = $1`;
                }

                try {
                    let result;
                    if (date) {
                        result = await connection.query(query, [date]);
                    } else {
                        result = await connection.query(query);
                    }
                    console.log('Prices Query Result:', result);
                    return result;
                } catch (error) {
                    console.error('Error executing prices query:', error);
                    throw new Error('Failed to fetch prices');
                }
            }
        });
    }
});

export const CreatePriceMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("createPrice", {
            type: "Price",
            args: {
                date: nonNull(stringArg()),
                price: nonNull(floatArg()),
            },
            async resolve(_parent, args, context: Context, _info) {
                const { date, price } = args;
                
                // Use the repository to create and save the price
                const priceEntity = context.connection.getRepository(Price).create({ date, price });
                return await context.connection.getRepository(Price).save(priceEntity);
            }
        })
    },
})