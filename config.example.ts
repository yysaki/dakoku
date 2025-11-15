import { JobcanAction, SlackAction } from "./dakoku.ts";

export const config: Record<string, Array<Omit<JobcanAction, "email" | "password"> | SlackAction>> = {
  "enter": [
    {
      "type": "jobcan",
      "mode": "enter",
    },
    {
      "type": "slack",
      "name": "workspace_a",
      "token": Deno.env.get("SLACK_WORKSPACE_A_TOKEN") || "",
      "channel": "#general",
      "message": "作業開始します",
    },
    {
      "type": "slack",
      "name": "workspace_b",
      "token": Deno.env.get("SLACK_WORKSPACE_B_TOKEN") || "",
      "channel": "#general",
      "message": "作業開始します",
    },
  ],
  "leave": [
    {
      "type": "jobcan",
      "mode": "leave",
    },
    {
      "type": "slack",
      "name": "workspace_a",
      "token": Deno.env.get("SLACK_WORKSPACE_A_TOKEN") || "",
      "channel": "#general",
      "message": "作業終了します",
    },
  ],
  "dryrun": [
    {
      "type": "jobcan",
      "mode": "dryrun",
    },
  ],
};
