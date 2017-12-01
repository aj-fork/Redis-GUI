"use strict";

exports.window = {
    width: 800, height: 600,
    show: false,
    webPreferences:{
        javascript:true,
        nodeIntegration:true,
        webSecurity: false,            
        experimentalFeatures:true,
        experimentalCanvasFeatures:true,
        //preload:`${app.baseDir}/renderer-process/plug/index.js`,
    }
};