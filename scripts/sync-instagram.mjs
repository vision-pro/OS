import { syncInstagramVideos } from "../server/db.ts";

const result = await syncInstagramVideos();
console.log(JSON.stringify(result));
