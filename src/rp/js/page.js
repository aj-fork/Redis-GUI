"use strict";
/* global $, document, preloader */

$(document).ready(function(){
    let index = 0;
    preloader.connect(index);
    let box = document.getElementById("redis-info-box");
    let ret = preloader.getTopKeys({index: index, limit: 10});
    //$("#redis-info-box").text(JSON.stringify());
    let keys = ret.data;
    for(let i = 0; i<keys.length; i++){
        let p = document.createElement("p");
        p.innerText = `Type:${keys[i].type} Key:${keys[i].key}`;
        box.appendChild(p);
    }

    let r = preloader.getValueByKey({index: index, key: "mcapp:device:ad:macosd"});
    let p = document.createElement("p");
    p.innerText = JSON.stringify(r);
    box.appendChild(p);

    r = preloader.sendCommand({index:0, cmd: "hgetalla mcapp:devices:macosd"});
    p = document.createElement("p");
    p.innerText = JSON.stringify(r);
    box.appendChild(p);
});