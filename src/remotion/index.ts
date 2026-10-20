import { registerRoot } from "remotion";
import { FreeReelsVideo } from "./compositions/FreeReelsVideo";

// Re-export for programmatic rendering
export { FreeReelsVideo };

registerRoot(FreeReelsVideo);
