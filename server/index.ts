import * as Http from "http";
import * as Async from "async";
import * as Discord from "discord.js";

// get values from config
// @ts-ignore
import * as config from "./config.json";
import {GuildMember, VoiceChannel} from "discord.js";
import {IncomingMessage, ServerResponse} from "http";

const PORT: number = config.port;
const TOKEN: string = config.token;
const GUILD_ID: string = config.guild;
const CHANNEL_ID: string = config.channel;

// create new discord client
const CLIENT: Discord.Client = new Discord.Client();

let Guild: Discord.Guild;
let Channel: Discord.VoiceChannel;

type QueueObject = {
    member: Discord.GuildMember;
    mute: boolean;
}

// init queue
const Queue = Async.queue((data: QueueObject, callback: Function) => {
    data.member.setMute(data.mute, "Tode leude reden nicht!")
        .then(async (m: Discord.GuildMember) => {
            console.log("Task succesful: " + (data.mute ? "Muted " : "Unmuted ") + m.user.tag);
            await new Promise((resolve) => setTimeout(resolve, 50));
        })
        .catch((err) => {
            console.log("Error: " + err);
        });

    callback();
}, 1);


// login discord client
CLIENT.login(TOKEN).catch((err) => {
    console.log("Dicker error" + err);
});


// assign GUILD and CHANNEL and unmute everyone when bot is ready
CLIENT.on("ready", () => {
    console.log("Bot is ready to mute them all lol :)");

    Guild = CLIENT.guilds.get(GUILD_ID)!;
    Channel = <VoiceChannel>Guild.channels.get(CHANNEL_ID)!;

    // unmute everyone
    Channel.members.forEach((m: Discord.GuildMember) =>
        Queue.push({
            mute: false,
            member: m
        }).catch((err: Error) => console.log(err))
    );
});


// create Http server
Http.createServer((message: IncomingMessage, response: ServerResponse) => {

    let mute = message.headers.mute === "true";
    let members = Channel.members.filter((m: Discord.GuildMember) => (message.headers.id === undefined) || (String(m.id) === message.headers.id));

    console.log("I'm supposed to " + (mute ? "mute" : "unmute") + " " + members.map((m: GuildMember) => m.user.tag).join(", "));

    members.forEach((m: Discord.GuildMember) => {
        Queue.push({mute: mute, member: m}).catch(
            (err: Error) => console.log(err)
        );
    });

    response.end();
}).listen({port: PORT}, () => {
    console.log("HTTP server up and running on port " + PORT);
});
