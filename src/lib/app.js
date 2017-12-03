"use strict";

const sf = require("sf");
const path = require("path");
const Redis = require("ioredis");
const express = require("express");
const browserify = require("browserify-middleware");
const myUtils = require("./util");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const partials = require("express-partials");
const flash = require("express-flash");

process.chdir( path.join(__dirname, "..") );    // fix the cwd

var viewsPath = path.join(__dirname, "../web/views");
var staticPath = path.join(__dirname, "../web/static");
var redisConnections = [];
redisConnections.getLast = myUtils.getLast;

module.exports = function (httpServerOptions, _redisConnections, nosave, rootPattern) {
    redisConnections = _redisConnections;
    var app = express();
    app.use(partials());
    app.use(flash());
    app.use(function(req, res, next) {
        res.locals.sf = sf;
        res.locals.getFlashes = function() {
            return req.flash();
        };
        res.locals.getConnections = function() {
            return req.redisConnections;
        };
        next();
    });
    app.getConfig = myUtils.getConfig;
    if (!nosave) {
        app.saveConfig = myUtils.saveConfig;
    } else {
        app.saveConfig = function (config, callback) { callback(null); };
    }

    app.login = login;
    app.logout = logout;
    app.layoutFilename = path.join(__dirname, "../web/views/layout.ejs");
    app.rootPattern = rootPattern;
    app.set("views", viewsPath);
    app.set("view engine", "ejs");
    app.use(httpAuth(httpServerOptions.username, httpServerOptions.password));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(express.query());
    app.use(express.cookieParser());
    app.use(express.session({ secret: "rediscommander" }));
    app.use(addConnectionsToRequest);
    app.get("/browserify.js", browserify(["cmdparser","readline-browserify"]));
    app.use(app.router);
    app.use(express.static(staticPath));
    require("./routes")(app);

    app.listen(httpServerOptions.webPort, httpServerOptions.webAddress);

    console.info("listening on ", httpServerOptions.webAddress, ":", httpServerOptions.webPort);
};

function httpAuth (username, password) {
    if (username && password) {
        return express.basicAuth(function (user, pass) {
            return (username === user && password == pass);
        });
    } else {
        return function (req, res, next) {
            next();
        };
    }
}

function logout (hostname, port, db, callback) {
    var notRemoved = true;
    redisConnections.forEach(function (instance, index) {
        if (notRemoved && instance.options.host == hostname && instance.options.port == port && instance.options.db == db) {
            notRemoved = false;
            var connectionToClose = redisConnections.splice(index, 1);
            connectionToClose[0].quit();
        }
    });
    if (notRemoved) {
        return callback(new Error("Could not remove ", hostname, port, "."));
    } else {
        return callback(null);
    }
}

function login (label, hostname, port, password, dbIndex, callback) {
    console.info("connecting... ", hostname, port);
    var client = new Redis(port, hostname);
    client.label = label;
    redisConnections.push(client);
    redisConnections.getLast().on("error", function (err) {
        console.error("Redis error", err.stack);
    });
    redisConnections.getLast().on("end", function () {
        console.info("Connection closed. Attempting to Reconnect...");
    });
    if (password) {
        return redisConnections.getLast().auth(password, function (err) {
            if (err) {
                console.error("Could not authenticate", err.stack);
                if (callback) {
                    callback(err);
                    callback = null;
                }
                return;
            }
            redisConnections.getLast().on("connect", selectDatabase);
        });
    } else {
        return redisConnections.getLast().on("connect", selectDatabase);
    }

    function selectDatabase () {
        try {
            dbIndex = parseInt(dbIndex || 0);
        } catch (e) {
            return callback(e);
        }

        return redisConnections.getLast().select(dbIndex, function (err) {
            if (err) {
                console.info("could not select database", err.stack);
                if (callback) {
                    callback(err);
                    callback = null;
                }
                return;
            }
            console.info("Using Redis DB #" + dbIndex);
            return callback();
        });
    }
}

function addConnectionsToRequest (req, res, next) {
    req.redisConnections = redisConnections;
    return next();
}
