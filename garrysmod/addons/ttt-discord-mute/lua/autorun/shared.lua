AddCSLuaFile()

BOT_HOST = "localhost"
BOT_PORT = "37405"
USERS_FILEPATH = "ttt_discord_mute.json"
BOT_ADDRESS = "http://" .. BOT_HOST .. ":" .. BOT_PORT

ids = {}
ids_raw = file.Read(USERS_FILEPATH, "DATA")

if (ids_raw) then

    ids = util.JSONToTable(ids_raw)
    print("------------------------")
    print("------------------------")
    PrintTable(ids)
    print("------------------------")
    print("------------------------")

else

    print("ERROR: can't read data" .. FILEPATH)

end

function GET(_, mute, callback)

    http.Fetch(BOT_ADDRESS,
            function(res)
                callback(util.JSONToTable(res))
            end,

            function(_)
                print("Request to bot failed. Is the bot running?")
            end,

            { mute = mute, id = id }
    )

end

function mute(gm_player)

    print("MUTING " .. gm_player:SteamID())
    print("aka " .. ids[gm_player:SteamID()])

    GET(ids[gm_player:SteamID()], "true",

            function(_)

            end
    )

end

function unmute(gm_player)

    if (gm_player) then

        GET(ids[gm_player:SteamID()], "false",

                function(_)

                end
        )
    end

end

hook.Add("PlayerInitialSpawn", "ttt_discord_bot_PlayerInitialSpawn",

        function(gm_player)

            if (ids[gm_player:SteamID()]) then

                gm_player:PrintMessage(HUD_PRINTTALK, "Mit Discord verbunden - braver Junge.")

            else

                gm_player:PrintMessage(HUD_PRINTTALK, "Du bist nicht mit discord verbunden!! Du wirst in 60 sekunden gekickt.")

            end
        end
)

hook.Add("PlayerSpawn", "ttt_discord_bot_PlayerSpawn",
        function(gm_player)
            unmute(gm_player)
        end
)

hook.Add("PlayerDisconnected", "ttt_discord_bot_PlayerDisconnected",
        function(gm_player)
            unmute(gm_player)
        end
)

hook.Add("ShutDown", "ttt_discord_bot_ShutDown",
        function()
            unmute()
        end
)

hook.Add("TTTEndRound", "ttt_discord_bot_TTTEndRound",
        function()
            unmute()
        end
)

hook.Add("TTTBeginRound", "ttt_discord_bot_TTTBeginRound",
        function()
            unmute()
        end
)

hook.Add("OnEndRound", "ttt_discord_bot_OnEndRound",
        function()
            unmute()
        end
)

hook.Add("OnStartRound", "ttt_discord_bot_OnStartRound",
        function()
            unmute()
        end
)

hook.Add("PostPlayerDeath", "ttt_discord_bot_PostPlayerDeath",
        function(gm_player)
            mute(gm_player)
        end
)
