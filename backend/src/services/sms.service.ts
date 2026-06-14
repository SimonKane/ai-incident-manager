type SmsResponse = {
  id?: string;
  status?: string;
  error?: string;
  [key: string]: unknown;
};

function getElksCredentials() {
  const username =
    process.env.ELKS_USERNAME || process.env.FORTYSIXELKS_USERNAME;
  const password =
    process.env.ELKS_PASSWORD || process.env.FORTYSIXELKS_PASSWORD;

  if (!username || !password) {
    throw new Error("Missing 46elks credentials");
  }

  return { username, password };
}

function getSmsSender() {
  const sender = process.env.ELKS_SMS_FROM || "LOGFIXAI";
  const normalizedSender = sender.replace(/[^a-z0-9]/gi, "").toUpperCase();

  return normalizedSender.slice(0, 11) || "LOGFIXAI";
}

async function readSmsResponse(response: Response) {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text) as SmsResponse;
  } catch {
    return { error: text };
  }
}

export async function sendSms(to: string, message: string) {
  const { username, password } = getElksCredentials();
  const auth = Buffer.from(`${username}:${password}`).toString("base64");
  const from = getSmsSender();
  const body = new URLSearchParams({ from, to, message }).toString();

  const response = await fetch("https://api.46elks.com/a1/sms", {
    method: "POST",
    body,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const data = await readSmsResponse(response);

  if (!response.ok || data.error) {
    throw new Error(`SMS error: ${data.error || response.statusText}`);
  }

  return data;
}
