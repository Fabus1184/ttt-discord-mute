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
    console.log("Starting task: " + data.mute ? "Mute" : "Unmute" + data.id);
    discord_action(data);
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

// mute or unmute member or everyone
function discord_action(params) {
    let id = params.id;
    let mute = params.mute === "true";

    if (id === "") {
        // unmute all
        CHANNEL.members.forEach((m) => {
            m.setMute(false, "Tode leute reden!")
                .then(async (m) => {
                    console.log("Unmuted " + m.user.tag);

                    // wait to not get rate-limited
                    await new Promise((resolve) => setTimeout(resolve, 50));
                })
                .catch((err) => {
                    console.log("Error:" + err);
                });
        });
    } else {
        // [un]mute member
        GUILD.members.find((user) => user.id === id).setMute(mute, "Tode leude reden nicht!")
            .then(async (m) => {
                if (mute) {
                    console.log("Muted " + m.user.tag);
                } else {
                    console.log("Unmuted " + m.user.tag);
                }

                // wait to not get rate-limited
                await new Promise((resolve) => setTimeout(resolve, 50));
            })
            .catch((err) => {
                console.log("Error: " + err);
            });
    }
}

// create Http server
Http
    .createServer((message, response) => {
        Queue.push(JSON.parse(JSON.stringify(message.headers)));
        response.end();
    })
    .listen({port: PORT}, () => {
        console.log("http server up and running on port " + PORT);
    });
