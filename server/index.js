require("fs");
const Http = require("http");
const Async = require("async");
const Discord = require("discord.js");

// get values from config
let config = require("./config.json");

const PORT = config.port;
const TOKEN = config.token;
const GUILD_ID = config.guild;
const CHANNEL_ID = config.channel;

// create new discord client
const CLIENT = new Discord.Client();

const GUILD = [];
const CHANNEL = [];


// init queue
const Queue = Async.queue((data, callback) => {
    console.log("Starting task: " + data.mute ? "Mute" : "Unmute" + data.id ? data.id : "everyone");

    GUILD.members.filter((user) => user.id === data.id).forEach((member) => member.setMute(data.mute, "Tode leude reden nicht!")
        .then(async (m) => {
            console.log(data.mute ? "Muted " : "Unmuted " + m.user.tag);
            await new Promise((resolve) => setTimeout(resolve, 50));
        })
        .catch((err) => {
            console.log("Error: " + err);
        }));

    callback();
}, 1);


// login discord client
CLIENT.login(TOKEN).catch((err) => {
    console.log("Dicker error" + err);
});


// assign GUILD and CHANNEL and unmute everyone when bot is ready
CLIENT.on("ready", () => {
    console.log("Bot is ready to mute them all lol :)");

    Object.assign(GUILD, CLIENT.guilds.get(GUILD_ID));
    Object.assign(CHANNEL, GUILD.channels.get(CHANNEL_ID));

    // unmute everyone
    CHANNEL.members.forEach((m) => {
        m.setMute(false, "Tode leute reden doch!")
            .then((m) => {
                console.log("Unmuted " + m.user.tag);
            })
            .catch((err) => {
                console.log("error unmuting all: " + err);
            });
    });
});


// create Http server
Http
    .createServer((message, response) => {

        let params = JSON.parse(JSON.stringify(message.headers));
        let id = params.id;
        let mute = params.mute === "true";

        console.log("Supposed to " + mute ? "mute" : "unmute" + " " + id ? id : "everyone");

        if (id === "") {
            // unmute all
            CHANNEL.members.forEach((m) => {
                m.setMute(false, "Tode leute reden!")
                    .then(async (m) => {
                        Queue.push({mute: mute, id: m.id})
                    })
                    .catch((err) => {
                        console.log("Error:" + err);
                    });
            });
        } else {
            // [un]mute member
            Queue.push({mute: mute, id: id});
        }

        response.end();
    })
    .listen({port: PORT}, () => {
        console.log("http server up and running on port " + PORT);
    });
