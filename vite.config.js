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
        // add the rest here
      },
    },
  },
});
