import { Action, dakoku } from "./dakoku.ts";
import { jobcanTouch } from "./jobcan.ts";
import { postMessage } from "./slack.ts";
import { config } from "./config.ts";

function buildWriter() {
  const encoder = new TextEncoder();
  return { write: (data: string) => Deno.stdout.writeSync(encoder.encode(data)) };
}

function buildActions(mode: string): Array<Action> {
  const email = Deno.env.get("JOBCAN_EMAIL");
  const password = Deno.env.get("JOBCAN_PASSWORD");
  if (!email || !password) {
    throw new Error("環境変数 JOBCAN_EMAIL, JOBCAN_PASSWORD を設定してください");
  }

  return config[mode].map((action) => {
    return action.type === "slack" ? action : { ...action, email, password };
  });
}

if (import.meta.main) {
  const mode = Deno.args[0];
  if (mode === "") {
    throw new Error("Usage: deno run -A main.ts [enter|leave|dryrun]");
  }

  await dakoku(postMessage, jobcanTouch, buildActions(mode), buildWriter());
}
