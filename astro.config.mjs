import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Perfect World",

      customCss: [
        // Relative path to your @font-face CSS file.
        "./src/fonts/font-face.css",
        "./src/styles/main.css",
      ],
    }),
  ],
});
