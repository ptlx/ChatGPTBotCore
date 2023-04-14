import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import {
  InteractionType,
  InteractionResponseType,
  verifyKey,
} from "discord-interactions"

const CLIENT_PUBLIC_KEY = process.env.CLIENT_PUBLIC_KEY

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
    const greetingWord = req.body.data.options[0].value
    const username = req.body.member.user.username

    context.res = {
      status: 200,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `${greetingWord}, ${username}`,
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