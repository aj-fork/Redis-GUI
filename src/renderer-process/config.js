"use strict";

const {ipcRenderer} = require("electron");
/* global window, $*/

window.nac = {test: true};

const WINDOW_EVENTS = {
    RENDERER: "renderer-process-event",
    MAIN: "main-process-event"
};
ipcRenderer.on(WINDOW_EVENTS.MAIN, (sender, res)=>{
    if(res.err){
        $("#msgBox").text(res.message || res.errorStack);
        setTimeout(()=>{
            $("#msgBox").text("");
        }, 1000 * 3);
    }
});
const onReceiveData = function(){
    
    let form = $("#formData").serializeArray();
    sendConfig(form);
};

const sendConfig = function(data){
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
    ipcRenderer.send(WINDOW_EVENTS.RENDERER, data);
};
window.onReceiveData = onReceiveData;