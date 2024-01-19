
import puppeteer from "puppeteer-core";

type Json = {
  message: string;
};

export const POST = async ({ request }) => {

  const url = ""


  if (!url) {
    return Response
      .status(400)
      .json({ message: `A ?url query-parameter is required` });
  }

  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BLESS_TOKEN}`,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(url);

  return res.status(200).send(await page.pdf());

}