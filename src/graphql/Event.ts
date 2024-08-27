import { extendType, objectType } from "nexus"; 

import {NexusGenObjects} from "../../nexus-typegen"

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
        t.nonNull.list.nonNull.string("parsedData"),
        t.nonNull.string("contractAddress"),
        t.nonNull.string("appName"),
        t.nonNull.string("createdAt")
    }
});

let events: NexusGenObjects["Event"][] = [   
{
    id: 5,
    eventName: "Transfer",
    eventSignature: "Transfer(address,address,uint256)",
    eventData: "0x000000000000000000000000000000000000000000000000f35f5ed172de40d8",
    blockNumber: 46942706,
    transactionHash: "0x3fe53ecc1828a472e9763d97c68d29673a41326e33d58911d62f5f0a4c20ba88",
    logIndex: 29,
    parsedData: ["0x0000000000000000000000000000000000000000","0xF1102711b8df5EA6f934cb42F618ed040d0d5da6","17536839727672344792"],
    contractAddress: "0xaBe7a9dFDA35230ff60D1590a929aE0644c47DC1",
    appName: "ausd-event-tracker",
    createdAt: "2024-08-26 11:44:24.271592"
}
]; 

export const eventsQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("events", {
            type: "Event",
            resolve(_parent, _args, _context, _info) {
                return events;
            }
        }) 
    }
    })