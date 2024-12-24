import { TaggingScrapeEngineBase, ScrapeResult, ScrapedPost, ScrapeEngineFeature } from "../ScrapeEngine.js";
import { addUniqueTags } from "../Utility.js";

export function getOriginalImageUrl(image: HTMLImageElement) {
  // if the link includes a resolution, change it to orig:
  // https://pbs.twimg.com/media/stuff?format=jpg&name=900x900
  // -> https://pbs.twimg.com/media/stuff?format=jpg&name=orig
  const img_url = new URL((image as HTMLImageElement).src);
  if (img_url.searchParams.has("name") && img_url.searchParams.get("name") != "orig") {
    img_url.searchParams.set("name", "orig");
  }
  return img_url;
}

export default class Twitter extends TaggingScrapeEngineBase {
  name = "twitter";
  features: ScrapeEngineFeature[] = ["content"];
  notes = [];
  supportedHosts = ["twitter.com", "mobile.twitter.com", "x.com"];

  scrapeDocument(document: Document): ScrapeResult {
    const result = new ScrapeResult(this.name);

    // first look for a focused image on desktop:
    const center_img = document.querySelector("div[role=dialog] div[role=dialog] div[aria-label=Image] img");
    if (center_img) {
      const post = new ScrapedPost();
      post.pageUrl = document.location.href;
      post.contentUrl = getOriginalImageUrl(center_img as HTMLImageElement).href;
      const promisedPost = addUniqueTags(this.taggingServerURL, post);
      result.tryAddPromisedPost(promisedPost);
    }

    // look for images within a tweet:
    const imgs = [...document.querySelectorAll("article a[role='link'] div[data-testid='tweetPhoto'] img")];

    for(let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      const post = new ScrapedPost();
      post.pageUrl = document.location.href;
      post.contentUrl = getOriginalImageUrl(img as HTMLImageElement).href;
      if(i < 2) {
        const promisedPost = addUniqueTags(this.taggingServerURL, post);
        result.tryAddPromisedPost(promisedPost);
      } else {
        result.tryAddPost(post);
      }
    }

    return result;
  }
}
