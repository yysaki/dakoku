export interface Writer {
  write(data: string): void;
}
export interface JobcanAction {
  type: "jobcan";
  mode: "enter" | "leave" | "dryrun";
  email: string;
  password: string;
}
export interface SlackAction {
  type: "slack";
  name: string;
  token: string;
  channel: string;
  message: string;
}
export type Action = JobcanAction | SlackAction;

export type PostMessage = (action: SlackAction) => Promise<"success" | Error>;
export type JobcanTouch = (action: JobcanAction, stdout: Writer) => Promise<"success" | Error>;

export async function dakoku(
  postMessage: PostMessage,
  jobcanTouch: JobcanTouch,
  actions: Array<Action>,
  stdout: Writer,
): Promise<void> {
  const results: Array<"success" | "error"> = [];

  for (const action of actions) {
    let result: "success" | Error;

    if (action.type === "jobcan") {
      stdout.write(`jobcan (${action.mode}) に打刻中`);
      result = await jobcanTouch(action, stdout);
    } else { // if (action.type === "slack")
      stdout.write(`${action.name} (${action.channel}) に投稿中.... `);
      result = await postMessage(action);
    }

    if (result === "success") {
      stdout.write("✓ 成功\n");
      results.push("success");
    } else {
      stdout.write(`✗ 失敗: ${result.message}\n`);
      results.push("error");
    }
  }

  const successCount = results.filter((r) => r === "success").length;
  stdout.write(`\n成功: ${successCount} / ${results.length}\n`);
}
