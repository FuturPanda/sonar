import puppeteer, { ElementHandle } from "puppeteer-core";
//import puppeteer from "puppeteer";

import { supabase } from "../../../supabase_client/client";
import OpenAI from "openai";
import { decode } from "base64-arraybuffer";

export const POST = async ({ request }) => {
  const { author, url } = await request.json();

  let { data: post, error: errorSelectingPostByUrl } = await supabase
    .from("posts")
    .select("*")
    .eq("url", url);

  if (!errorSelectingPostByUrl && post && post.length > 0) {
    return new Response(
      JSON.stringify({
        error: "Post Already exists",
        post: post,
      }),
      {
        status: 200,
        headers: { "Content-type": "application/json" },
      }
    );
  } else if (!errorSelectingPostByUrl) {
    const { contentArray: htmlContent, screenShot } =
      await getHtmlContentFromUrl(url);
    const openAiResponse = await requestOpenAiAPI(htmlContent);

    if (openAiResponse) {
      const contentString = openAiResponse.choices[0]?.message?.content;
      if (contentString) {
        const arrayValues = contentString.replace("\n", "").split("--");

        const postContent = {
          tldr: arrayValues[0]?.split(":")[1],
          translation: arrayValues[1]?.split(":")[1],
          tag: arrayValues[2]?.split(":")[1],
          title: arrayValues[3]?.split(":")[1],
        };
        const { data: postCreated, error: errorInsertPost } = await supabase
          .from("posts")
          .insert([
            {
              author: author,
              tldr: postContent.tldr,
              translation_fr: postContent.translation,
              title: postContent.title,
              url: url,
            },
          ])
          .select();
        if (postCreated) {
          const { data: tags, error: errorUpsertTags } = await supabase
            .from("tags")
            .upsert([{ value: postContent.tag }])
            .select();
          if (tags) {
            const { data: postTag, error: errorInsertPostTags } = await supabase
              .from("post_tag")
              .insert([{ post: postCreated[0].id, tag: tags[0].id }])
              .select();
            const { data: pathImage, error } = await supabase.storage
              .from("page_screenshot")
              .upload(`public/${postCreated[0].id}.png`, decode(screenShot), {
                contentType: "image/png",
              });
            if (!errorInsertPost && !errorUpsertTags && !errorInsertPostTags) {
              const { data: urlImage } = supabase.storage
                .from("public-bucket")
                .getPublicUrl("folder/avatar1.png");

              const { data: postUpdated, error: updatedPostError } =
                await supabase
                  .from("posts")
                  .update({ url_image: urlImage.publicUrl })
                  .eq("id", postCreated[0].id)
                  .select();
              if (postUpdated) {
                return new Response(
                  JSON.stringify({
                    post: postUpdated[0],
                  }),
                  {
                    status: 200,
                    headers: { "Content-type": "application/json" },
                  }
                );
              } else {
                return new Response(
                  JSON.stringify({ message: "error.message" }),
                  {
                    status: 400,
                    headers: { "Content-type": "application/json" },
                  }
                );
              }
            } else {
              return new Response(
                JSON.stringify({ message: "error.message" }),
                {
                  status: 400,
                  headers: { "Content-type": "application/json" },
                }
              );
            }
          }
        }
      } else {
        return new Response(JSON.stringify({ message: "error" }), {
          status: 400,
          headers: { "Content-type": "application/json" },
        });
      }
    }
  } else {
    return new Response(JSON.stringify({ message: "error" }), {
      status: 400,
      headers: { "Content-type": "application/json" },
    });
  }
  //const error = false;
};

const getHtmlContentFromUrl = async (url: string) => {
  const contentArray: Array<String> = [];
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=6b067983-bd51-4e37-9557-67e2201a6db1`,
  });

  //const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForFunction(
    "window.performance.timing.loadEventEnd - window.performance.timing.navigationStart >= 500"
  );

  /*await page.evaluate(() => {
    const selector =
      "a[id*=cookie i], a[class*=cookie i], button[id*=cookie i] , button[class*=cookie i]";
    const expectedText =
      /^(Accept|Accept all cookies|Accept all|Allow|Allow all|Allow all cookies|OK)$/gi;
    const elements: any = document.querySelectorAll(selector);
    for (const element of elements) {
      if (element.textContent.trim().match(expectedText)) {
        element.click();
        return;
      }
    }
  });*/

  const screenShot = await page.screenshot({
    path: "./",
    type: "png",
    encoding: "base64",
  });

  const headlines = await page.$$("h1");

  for (const element of headlines) {
    const elementText = await page.evaluate(
      (element) => element.textContent,
      element
    );
    if (elementText) {
      contentArray.push(elementText);
    }
  }

  const titles = await page.$$("h2");
  let i = 0;

  for (const element of titles) {
    const elementText = await page.evaluate(
      (element) => element.textContent,
      element
    );
    if (i < 10 && elementText) {
      contentArray.push(elementText);
      i++;
    } else {
      i = 0;
      break;
    }
  }

  const titlesh3 = await page.$$("h3");

  for (const element of titles) {
    const elementText = await page.evaluate(
      (element) => element.textContent,
      element
    );
    if (i < 10 && elementText) {
      contentArray.push(elementText);
      i++;
    } else {
      i = 0;
      break;
    }
  }

  const paragraphs = await page.$$("p");
  // Extracting and logging the text content of each element

  for (const element of paragraphs) {
    const elementText = await page.evaluate(
      (element) => element.textContent,
      element
    );
    if (i < 10) {
      contentArray.push(`"""${elementText}"""`);
      i++;
    } else {
      i = 0;
      break;
    }
  }

  await browser.close();
  return { contentArray, screenShot };
};

const requestOpenAiAPI = async (content) => {
  const openai = new OpenAI({
    apiKey: process.env.VITE_OPEN_AI_KEY,
  });
  console.log;
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
        You are a high level developer that write high quality daily content for education.
        Use the following step-by-step instructions to respond to user inputs.

        Step 1 -  The user will provide you with text scratch from a website. The paragraphs are in triple quotes, the rest are headlines.
        Some information isn't relevant. Look at the text in triple quote to find what the matter of the article really is.
        Step 2 - Summarize this text in one sentence in English with the prefix "tldr : " 
        Step 3 - Translate the summary from Step 1 into French with the prefix "-- translation : " 
        Step 4 - Choose one word reflecting the broad tech category where the article lies"-- tag : " 
        Step 5 - Give a fun ad engaging title to your summary with the prefix "-- title : " 

        `,
      },
      {
        role: "user",
        content: `${content}`,
      },
    ],
    seed: 478748,
    model: "gpt-3.5-turbo",
  });
  return completion;
};
/*
const getElementFromPupetteer =  async ( elements : ElementHandle<HTMLParagraphElement>[], page) => {
  let i = 0  
  let contentArray
  for (const element of elements) {
      const elementText = await page.evaluate(
        (element) => element.textContent,
        element
      );
      if (i < 10) {
        contentArray.push(`"""${elementText}"""`);
        i++;
      } else {
        i = 0;
        break;
      }
    }
    return contentArray
}*/
