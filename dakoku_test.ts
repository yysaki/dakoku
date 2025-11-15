import { assertEquals } from "@std/assert";
import { type Action, dakoku, JobcanTouch, PostMessage, type Writer } from "./dakoku.ts";

interface CallLog {
  postMessageCalls: Array<{
    token: string;
    channel: string;
    message: string;
  }>;
  jobcanTouchCalls: Array<{
    mode: "enter" | "leave" | "dryrun";
    config: { email: string; password: string };
  }>;
}

function createMocks(
  postMessageResult: "success" | Error = "success",
  jobcanTouchResult: "success" | Error = "success",
) {
  const callLog: CallLog = { postMessageCalls: [], jobcanTouchCalls: [] };

  const postMessage: PostMessage = ({ token, channel, message }) => {
    callLog.postMessageCalls.push({ token, channel, message });
    return Promise.resolve(postMessageResult);
  };

  const jobcanTouch: JobcanTouch = ({ mode, email, password }, _stdout) => {
    const config = { email, password };
    callLog.jobcanTouchCalls.push({ mode, config });
    return Promise.resolve(jobcanTouchResult);
  };

  return { postMessage, jobcanTouch, callLog };
}

function createWriter(): Writer {
  return { write: (_data: string) => true };
}

Deno.test("dakoku - 通常のSlackメッセージのみ投稿", async () => {
  const { postMessage, jobcanTouch, callLog } = createMocks();

  const messages: Action[] = [
    {
      type: "slack",
      name: "workspace1",
      token: "token1",
      channel: "#test",
      message: "おはようございます",
    },
    {
      type: "slack",
      name: "workspace2",
      token: "token2",
      channel: "#random",
      message: "お疲れ様です",
    },
  ];

  await dakoku(postMessage, jobcanTouch, messages, createWriter());

  assertEquals(callLog.postMessageCalls.length, 2);
  assertEquals(callLog.postMessageCalls[0].message, "おはようございます");
  assertEquals(callLog.postMessageCalls[1].message, "お疲れ様です");

  assertEquals(callLog.jobcanTouchCalls.length, 0);
});

Deno.test("dakoku - jobcan typeがある場合、Jobcan自動打刻を実行", async () => {
  const { postMessage, jobcanTouch, callLog } = createMocks();

  const messages: Action[] = [
    {
      type: "jobcan",
      mode: "enter",
      email: "test@example.com",
      password: "password",
    },
    {
      type: "slack",
      name: "workspace2",
      token: "token2",
      channel: "#random",
      message: "おはようございます",
    },
  ];

  await dakoku(postMessage, jobcanTouch, messages, createWriter());

  assertEquals(callLog.jobcanTouchCalls.length, 1);
  assertEquals(callLog.jobcanTouchCalls[0].mode, "enter");
  assertEquals(callLog.jobcanTouchCalls[0].config.email, "test@example.com");

  assertEquals(callLog.postMessageCalls.length, 1);
  assertEquals(callLog.postMessageCalls[0].message, "おはようございます");
});

Deno.test("dakoku - mode=leaveの場合、Jobcanにleaveアクションを渡す", async () => {
  const { postMessage, jobcanTouch, callLog } = createMocks();

  const messages: Action[] = [
    {
      type: "jobcan",
      mode: "leave",
      email: "test@example.com",
      password: "password",
    },
  ];

  await dakoku(postMessage, jobcanTouch, messages, createWriter());

  // jobcanTouchがleaveで呼ばれることを確認
  assertEquals(callLog.jobcanTouchCalls.length, 1);
  assertEquals(callLog.jobcanTouchCalls[0].mode, "leave");
});

Deno.test("dakoku - postMessageが失敗してもプログラムは継続する", async () => {
  const { postMessage, jobcanTouch, callLog } = createMocks(
    new Error("Network error"),
  );

  const messages: Action[] = [
    {
      type: "slack",
      name: "workspace1",
      token: "token1",
      channel: "#test",
      message: "テストメッセージ1",
    },
    {
      type: "slack",
      name: "workspace2",
      token: "token2",
      channel: "#random",
      message: "テストメッセージ2",
    },
  ];

  await dakoku(postMessage, jobcanTouch, messages, createWriter());

  assertEquals(callLog.postMessageCalls.length, 2);
});

Deno.test("dakoku - jobcanTouchが失敗してもSlackメッセージ投稿は継続する", async () => {
  const { postMessage, jobcanTouch, callLog } = createMocks(
    "success",
    new Error("Jobcan login failed"),
  );

  const messages: Action[] = [
    {
      type: "jobcan",
      mode: "enter",
      email: "test@example.com",
      password: "password",
    },
    {
      type: "slack",
      name: "workspace2",
      token: "token2",
      channel: "#random",
      message: "おはようございます",
    },
  ];

  await dakoku(postMessage, jobcanTouch, messages, createWriter());

  assertEquals(callLog.jobcanTouchCalls.length, 1);
  assertEquals(callLog.postMessageCalls.length, 1);
  assertEquals(callLog.postMessageCalls[0].message, "おはようございます");
});
