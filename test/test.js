"use strict";

/* global describe, it */
const Redis = require("../src/lib/redis-connector");
const Connector = new Redis({port: 6389, host: "127.0.0.1"});

describe("Redis Connection Test", ()=>{
    describe("Server Informations", ()=>{
        it("@server_info", (done)=>{
            console.info(Connector.interfaces.server_info);
            Connector.interfaces.quit();
            return done();
        });
    });
});