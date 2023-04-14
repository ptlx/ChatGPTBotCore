import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import {
    InteractionType,
    InteractionResponseType,
    verifyKey,
} from "discord-interactions"
import { Configuration, OpenAIApi } from "openai"

const CLIENT_PUBLIC_KEY = process.env.CLIENT_PUBLIC_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

const ask = async (content: string, model = 'gpt-3.5-turbo-0301') => {
    const response = await openai.createChatCompletion({
        model: model,
        messages: [{ role: "user", content: content }]
    })

    const answer = response.data.choices[0].message?.content
    return answer
}

const httpTrigger: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {
    const sig = req.headers["x-signature-ed25519"]
    const time = req.headers["x-signature-timestamp"]
    const isValid = await verifyKey(req.rawBody, sig, time, CLIENT_PUBLIC_KEY)

    if (!isValid) {
        context.res = {
            status: 401,
            Headers: {},
            body: "",
        }
        return
    }

    const interaction = req.body
    if (interaction && interaction.type === InteractionType.APPLICATION_COMMAND) {
        const inputMessage = req.body.data.options[0].value
        const username = req.body.member.user.username
        const chatGPTResponse = await ask(inputMessage)

        context.res = {
            status: 200,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `To ${username}: ${chatGPTResponse}`,
                },
            }),
        }
    } else {
        context.res = {
            body: JSON.stringify({
                type: InteractionResponseType.PONG,
            }),
        }
    }
}

export default httpTrigger
