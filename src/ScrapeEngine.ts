import { TagCategory, SafetyRating } from "./BooruTypes";

export type ContentType = "image" | "video";

export class ScrapedPost {
  contentUrl = "";
  pageUrl = "";
  contentType: ContentType = "image";
  resolution: [number, number] | undefined;
  rating: SafetyRating = "safe";
  tags: ScrapedTag[] = [];
  notes: ScrapedNote[] = [];
  sources: string[] = [];
  referrer: string | undefined;
}

export class ScrapedTag {
  name: string;
  category?: TagCategory;

  constructor(name: string, category?: TagCategory) {
    this.name = name.replace(/\s/g, "_").toLowerCase(); // Replace all spaces with underscores and make everything lowercase
    this.category = category;
  }
}

export class ScrapedNote {
  constructor(public text: string, public polygon: number[][]) {}
}

export class ScrapeResult {
  engine: string;
  description = "";
  posts: ScrapedPost[] = [];

  constructor(engine: string) {
    this.engine = engine;
  }

  tryAddPost(post: ScrapedPost) {
    if (!post.contentUrl) {
      console.log(`[${this.engine}] Not adding post because contentUrl is unset!`);
    } else {
      this.posts.push(post);
    }
  }
}

export class ScrapeResults {
  results: ScrapeResult[] = [];

  get posts(): ScrapedPost[] {
    let posts: ScrapedPost[] = [];

    for (const res of this.results) {
      posts = posts.concat(res.posts);
    }

    return posts;
  }
}

export type ScrapeEngineFeature = "content" | "rating" | "resolution" | "tags" | "tag_category" | "source" | "notes";

export interface ScrapeEngine {
  name: string;
  features: ScrapeEngineFeature[];
  notes: string[];
  supportedHosts: string[];

  canImport(url: Location): boolean;
  scrapeDocument(document: Document): ScrapeResult;
}

export abstract class ScrapeEngineBase implements ScrapeEngine {
  abstract name: string;
  abstract features: ScrapeEngineFeature[];
  abstract notes: string[];
  abstract supportedHosts: string[];

  canImport(url: Location): boolean {
    return this.supportedHosts.indexOf(url.host) != -1;
  }

  abstract scrapeDocument(document: Document): ScrapeResult;

  protected log(str: string) {
    console.log(`[${this.name}] ${str}`);
  }
}
