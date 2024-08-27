import { objectType } from "nexus"; 

export const EventType = objectType({
    name: "Event",
    definition(t) {
        t.nonNull.int("id"),
        t.nonNull.string("eventName"),
        t.nonNull.string("eventSignature"),
        t.nonNull.string("eventData"),
        t.nonNull.int("blockNumber"),
        t.nonNull.string("transactionHash"),
        t.nonNull.int("logIndex"),
        t.nonNull.string("parsedData"),
        t.nonNull.string("contractAddress"),
        t.nonNull.string("appName"),
        t.nonNull.string("createdAt")
    }
})