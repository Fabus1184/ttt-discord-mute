"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Http = __importStar(require("http"));
const Async = __importStar(require("async"));
const Discord = __importStar(require("discord.js"));
// get values from config
// @ts-ignore
const config = __importStar(require("./config.json"));
const PORT = config.port;
const TOKEN = config.token;
const GUILD_ID = config.guild;
const CHANNEL_ID = config.channel;
// create new discord client
const CLIENT = new Discord.Client();
let Guild;
let Channel;
// init queue
const Queue = Async.queue((data, callback) => {
    data.member.setMute(data.mute, "Tode leude reden nicht!")
        .then((m) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Task succesful: " + (data.mute ? "Muted " : "Unmuted ") + m.user.tag);
        yield new Promise((resolve) => setTimeout(resolve, 50));
    }))
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
    Guild = CLIENT.guilds.get(GUILD_ID);
    Channel = Guild.channels.get(CHANNEL_ID);
    // unmute everyone
    Channel.members.forEach((m) => Queue.push({
        mute: false,
        member: m
    }).catch((err) => console.log(err)));
});
// create Http server
Http.createServer((message, response) => {
    let mute = message.headers.mute === "true";
    let members = Channel.members.filter((m) => (message.headers.id === undefined) || (String(m.id) === message.headers.id));
    console.log("I'm supposed to " + (mute ? "mute" : "unmute") + " " + members.map((m) => m.user.tag).join(", "));
    members.forEach((m) => {
        Queue.push({ mute: mute, member: m }).catch((err) => console.log(err));
    });
    response.end();
}).listen({ port: PORT }, () => {
    console.log("HTTP server up and running on port " + PORT);
});
