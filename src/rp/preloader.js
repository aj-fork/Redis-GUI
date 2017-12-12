"use strict";

const {ipcRenderer} = require("electron");
const Protocol = require("../ipc/protocol");
/* global window */

window.nac = {test: true};

const EVENTS = {
    //main-process
    MP_EVENT: "mp-event",
    //renderer-process
    RP_EVENT: "rp-event",
    RP_READY: "rp-ready-to-work",
};

class Preloader {
    constructor(){
        this._config = null;
        ipcRenderer.on(EVENTS.MP_EVENT, this._onMPEvents.bind(this));
    }

    ready(){
        ipcRenderer.send(EVENTS.RP_READY, true);
    }

    _onMPEvents(event, info){
        console.info(info);
        let proto = info.proto;
        switch(proto){
        case Protocol.UPDATE_CONFIG:
            this._config = info.data;
            ipcRenderer.send(EVENTS.RP_EVENT, {updated: true, proto: Protocol.UPDATE_CONFIG_RE});
            break;
        }
    }

    get config(){
        return this._config;
    }
}

const preloader = new Preloader();
window.preloader = preloader;
preloader.ready();