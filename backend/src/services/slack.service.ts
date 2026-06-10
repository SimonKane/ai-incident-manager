type SlackPostMessageResponse = {
  ok: boolean;
  error?: string;
};

type SlackConversationOpenResponse = {
  ok: boolean;
  error?: string;
  channel?: {
    id: string;
  };
};

async function requestSlackApi<TResponse>(
  path: string,
  body: Record<string, unknown>,
) {
  const slackBotToken = process.env.SLACK_BOT_TOKEN;

  if (!slackBotToken) {
    throw new Error("Missing SLACK_BOT_TOKEN");
  }

  const response = await fetch(`https://slack.com/api/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${slackBotToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as TResponse & {
    ok: boolean;
    error?: string;
  };

  if (!response.ok || !data.ok) {
    throw new Error(`Slack ${path} error: ${data.error || response.statusText}`);
  }

  return data;
}

async function getSlackDmChannel(slackUserId: string) {
  const data = await requestSlackApi<SlackConversationOpenResponse>(
    "conversations.open",
    { users: slackUserId },
  );

  if (!data.channel?.id) {
    throw new Error("Slack conversations.open error: missing channel id");
  }

  return data.channel.id;
}

export async function sendSlackDm(slackUserId: string, text: string) {
  const channel = slackUserId.startsWith("D")
    ? slackUserId
    : await getSlackDmChannel(slackUserId);

  return requestSlackApi<SlackPostMessageResponse>("chat.postMessage", {
    channel,
    text,
  });
}
