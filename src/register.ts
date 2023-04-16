require('dotenv').config()

const appID = process.env.APPLICATION_ID
const guildID = process.env.GUILD_ID
const apiEndpoint = `https://discord.com/api/v8/applications/${appID}/guilds/${guildID}/commands`
const botToken = process.env.BOT_TOKEN

const commandData = {
    name: 'ai',
    description: 'command for ai chat',
    options: [
        {
            name: 'msg',
            description: 'message for ai',
            type: 3,
            required: true,
        },
    ]
}

async function main() {
    const response = await fetch(apiEndpoint, {
        method: 'post',
        body: JSON.stringify(commandData),
        headers: {
            Authorization: 'Bot ' + botToken,
            'Content-Type': 'application/json',
        },
    })
    const json = await response.json()

    console.log(json)
}

main()
