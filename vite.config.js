import { defineConfig } from "vite";

export default defineConfig({
  base: "/Gender-Violence-Database-Redesign/",
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        browse: "browse.html",
        blogs: "blogs.html",
        glossary: "glossary.html",
        about: "about.html",
        resources: "resources.html",
        blogIntro: "blogs-collection/001-intro.html",
        blogCriticalReflection: "blogs-collection/002-critical-reflection.html",
        // add the rest here
      },
    },
  },
});
