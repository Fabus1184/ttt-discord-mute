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
    data.member.setMute(data.mute, "Tode leude reden nicht!")
        .then(async (m) => {
            console.log("Task succesful: " + (data.mute ? "Muted " : "Unmuted ") + m.user.tag);
            await new Promise((resolve) => setTimeout(resolve, 50));
        })
        .catch((err) => {
            console.log("Error: " + err);
        })

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
        Queue.push({mute: false, id: member.id, member: member});
    });
});


// create Http server
Http.createServer((message, response) => {

    let mute = message.headers.mute === "true";
    let members = CHANNEL.members.filter((m) => (message.headers.id === undefined) || (String(m.id) === message.headers.id));

    console.log("I'm supposed to " + (mute ? "mute" : "unmute") + " " + members.map((m) => m.user.tag).join(", "));

    members.forEach((m) => {
        Queue.push({mute: mute, id: message.headers.id, member: m});
    });

    response.end();
}).listen({port: PORT}, () => {
    console.log("HTTP server up and running on port " + PORT);
});
