import { PostMessage, SlackAction } from "./dakoku.ts";

export const postMessage: PostMessage = async (
  { token, channel, message: text }: SlackAction,
): Promise<"success" | Error> => {
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ channel, text }),
  });

  const data = await response.json();
  return data.ok ? "success" : new Error(data.error || "Unknown error");
};
