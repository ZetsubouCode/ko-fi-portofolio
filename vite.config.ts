import { defineConfig } from "vite";

export default defineConfig({
  // Change "ko-fi-portofolio" if the GitHub repository name changes.
  // This keeps production asset URLs valid for GitHub Pages project sites:
  // https://username.github.io/repository-name/
  base: process.env.NODE_ENV === "production" ? "/ko-fi-portofolio/" : "/",
});
