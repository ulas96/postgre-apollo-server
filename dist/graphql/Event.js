"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEventMutation = exports.EventsQuery = exports.EventType = void 0;
const nexus_1 = require("nexus");
const Event_1 = require("../entities/Event");
exports.EventType = (0, nexus_1.objectType)({
    name: "Event",
    definition(t) {
        t.nonNull.int("id"),
            t.nonNull.string("eventName"),
            t.nonNull.string("eventSignature"),
            t.nonNull.string("eventData"),
            t.nonNull.int("blockNumber"),
            t.nonNull.string("transactionHash"),
            t.nonNull.int("logIndex"),
            t.nonNull.list.nonNull.string("parsedData"),
            t.nonNull.string("contractAddress"),
            t.nonNull.string("appName"),
            t.nonNull.string("createdAt");
    }
});
exports.EventsQuery = (0, nexus_1.extendType)({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("events", {
            type: "Event",
            resolve(_parent, _args, context, _info) {
                const { connection } = context;
                return connection.query(`SELECT * FROM event`);
            }
        });
    }
});
exports.CreateEventMutation = (0, nexus_1.extendType)({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("createEvent", {
            type: "Event",
            args: {
                id: (0, nexus_1.nonNull)((0, nexus_1.intArg)()),
                eventName: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                eventSignature: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                eventData: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                blockNumber: (0, nexus_1.nonNull)((0, nexus_1.intArg)()),
                transactionHash: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                logIndex: (0, nexus_1.nonNull)((0, nexus_1.intArg)()),
                parsedData: (0, nexus_1.nonNull)((0, nexus_1.list)((0, nexus_1.nonNull)((0, nexus_1.stringArg)()))),
                contractAddress: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                appName: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                createdAt: (0, nexus_1.nonNull)((0, nexus_1.stringArg)())
            },
            resolve(_parent, args, _context, _info) {
                const { id, eventName, eventSignature, eventData, blockNumber, transactionHash, logIndex, parsedData, contractAddress, appName, createdAt } = args;
                return Event_1.Event.create({ id, eventName, eventSignature, eventData, blockNumber, transactionHash, logIndex, parsedData, contractAddress, appName, createdAt: new Date(createdAt) }).save().then(event => (Object.assign(Object.assign({}, event), { createdAt: event.createdAt.toISOString() })));
            }
        });
    },
});
//# sourceMappingURL=Event.js.map