"use strict";

const {ipcRender} = require("electron");
/* global window */

window.nac = {test: true};

const WINDOW_EVENTS = {
    RENDERER: "renderer-process-event",
    MAIN: "main-process-event"
};

const getConfig = function(data){
    if(!data) return false;
    //TODO: receive config
    if(typeof(data) === "string"){
        try{
            data = JSON.parse(data);
        }catch(e){
            console.info("data format error");
            console.error(e);
            return false;
        }
    }
    sendConfig(data);
};
const sendConfig = function(data){
    ipcRender.send(WINDOW_EVENTS.RENDERER, data);
};
window.getConfig = getConfig;