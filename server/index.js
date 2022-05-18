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
    CHANNEL.members.filter((user) => user.id === data.id).forEach((member) => member.setMute(data.mute, "Tode leude reden nicht!")
        .then(async (m) => {
            console.log("Task succesful: " + (data.mute ? "Muted " : "Unmuted ") + m.user.tag);
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
    CHANNEL.members.forEach((member) => {
        Queue.push({mute: false, id: member.id});
    });
});


// create Http server
Http.createServer((message, response) => {

    let mute = message.headers.mute === "true";
    let tag = CHANNEL.members.filter((member) => message.headers.id === undefined || String(member.id) === message.headers.id).map((member) => member.tag).join(", ");

    console.log("I'm supposed to " + (mute ? "mute" : "unmute") + " " + tag);

    if (message.headers.id === undefined) {
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
        Queue.push({mute: mute, id: message.headers.id});
    }

    response.end();
}).listen({port: PORT}, () => {
    console.log("HTTP server up and running on port " + PORT);
});
