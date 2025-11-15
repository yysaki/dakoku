import { chromium } from "playwright";
import { JobcanAction, JobcanTouch, Writer } from "./dakoku.ts";

export const jobcanTouch: JobcanTouch = async (
  { mode, email, password }: JobcanAction,
  stdout: Writer,
): Promise<"success" | Error> => {
  const browser = await chromium.launch({ headless: true, tracesDir: "trace/" });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true });

    await page.goto("https://id.jobcan.jp/users/sign_in");
    stdout.write(".");

    await page.fill('input[name="user[email]"]', email);
    await page.fill('input[name="user[password]"]', password);
    await page.click('input[type="submit"]');
    stdout.write(".");

    await page.goto("https://ssl.jobcan.jp/jbcoauth/login");
    stdout.write(".");

    if (mode === "enter") {
      await page.click("#adit-button-push");
    } else if (mode === "leave") {
      await page.click("#adit-button-work-end");
    } else {
      await page.fill("textarea#notice_value", "dryrun");
    }
    await page.getByText("通信中").waitFor({ state: "hidden" });
    stdout.write(". ");

    await context.tracing.stop();
    return "success";
  } catch (error) {
    await context.tracing.stop({ path: "trace/trace.zip" });
    return error instanceof Error ? error : new Error(String(error));
  } finally {
    await browser.close();
  }
};
