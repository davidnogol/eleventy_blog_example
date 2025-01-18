const { DateTime } = require("luxon");
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");
const markdownItAttrs = require("markdown-it-attrs");
const { feedPlugin } = require("@11ty/eleventy-plugin-rss");
const embedYouTube = require("eleventy-plugin-youtube-embed");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
  let md = markdownIt({
    html: true, // Enable HTML tags
    linkify: true, // Automatically convert URLs to links
    typographer: true, // Better typography
  }).use(markdownItAttrs);

  // Override renderer for link_open tokens
  const defaultRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    // Check if the link contains an image
    const nextToken = tokens[idx + 1];
    if (nextToken && nextToken.type === "image") {
      // Add data-fslightbox attribute
      const aIndex = tokens[idx].attrIndex("data-fslightbox");
      if (aIndex < 0) {
        tokens[idx].attrPush(["data-fslightbox", ""]); // Adds attribute without a value
      } else {
        tokens[idx].attrs[aIndex][1] = ""; // Updates existing attribute
      }
    }

    // Call default renderer
    return defaultRender(tokens, idx, options, env, self);
  };

  // Set up custom Markdown library
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addFilter("truncate", function (str, len) {
    if (typeof str !== "string") return "";
    if (str.length > len) {
      return str.substring(0, len) + "...";
    }
    return str;
  });

  // "tags" collection – returns a list of all existing tags
  eleventyConfig.addCollection("tags", (collectionApi) => {
    const gatheredTags = [];
    collectionApi.getAll().forEach((item) => {
      if (item.data.tags) {
        const itemTags = Array.isArray(item.data.tags)
          ? item.data.tags
          : [item.data.tags];
        gatheredTags.push(...itemTags);
      }
    });
    return [...new Set(gatheredTags)];
  });

  eleventyConfig.addCollection("posts", function (collectionApi) {
    const allPosts = collectionApi
      .getFilteredByGlob("src/**/*.md")
      .filter((post) => post.data.type === "blogpost")
      .sort((a, b) => b.date - a.date);
    return allPosts;
  });

  eleventyConfig.addCollection("reversedPosts", function (collectionApi) {
    const allPosts = collectionApi
      .getFilteredByGlob("src/**/*.md")
      .filter((post) => post.data.type === "blogpost")
      .sort((a, b) => a.date - b.date);
    return allPosts;
  });

  eleventyConfig.addGlobalData("site", {
    url: "https://nogol.cz",
  });

  // Copy CSS files
  eleventyConfig.addPassthroughCopy("**/*.css");
  eleventyConfig.addPassthroughCopy("**/*.woff");
  eleventyConfig.addPassthroughCopy("**/*.woff2");

  // Copy JavaScript files
  eleventyConfig.addPassthroughCopy("assets/js");

  // Optionally: Copy favicon or other static files
  eleventyConfig.addPassthroughCopy("favicon.ico");

  eleventyConfig.addPassthroughCopy("**/*.js");

  // Copy images from posts
  eleventyConfig.addPassthroughCopy("**/*.jpg");
  eleventyConfig.addPassthroughCopy("**/*.webp");
  eleventyConfig.addPassthroughCopy("**/*.avif");
  eleventyConfig.addPassthroughCopy("**/*.png");
  eleventyConfig.addPassthroughCopy("**/*.svg");

  eleventyConfig.addFilter("asPostDate", (dateObj) => {
    // If the date is a string, use fromISO, otherwise fromJSDate
    let dt;
    if (typeof dateObj === "string") {
      dt = DateTime.fromISO(dateObj);
    } else if (dateObj instanceof Date) {
      dt = DateTime.fromJSDate(dateObj);
    } else {
      return "";
    }

    return dt.toFormat("dd.MM.yyyy");
  });

  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // which file extensions to process
    extensions: "html",
    // optional, output image formats
    formats: ["webp", "jpeg"],
    // optional, output image widths
    widths: [300, 600, 1080],
    sharpAvifOptions: {
      quality: 75,
    },
    // optional, attributes assigned on <img> override these values.
    defaultAttributes: {
      loading: "lazy",
      sizes: "auto",
      decoding: "sync",
    },
  });

  eleventyConfig.addPlugin(embedYouTube);
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom", // or "rss", "json"
    outputPath: "/feed.xml",
    collection: {
      name: "reversedPosts", // iterate over `collections.posts`
      limit: 15, // 0 means no limit
    },
    metadata: {
      language: "cs",
      title: "David Nogol - blog",
      base: "https://nogol.cz/",
      author: {
        name: "David Nogol",
      },
    },
  });

  eleventyConfig.addShortcode("gallery", function (galleryName) {
    const pagePath = this.page.inputPath;
    const currentDir = path.dirname(pagePath);
    const galleryDir = path.join(currentDir, galleryName);

    if (!fs.existsSync(galleryDir)) {
      return `<p>Galerie "${galleryName}" nebyla nalezena.</p>`;
    }

    const files = fs.readdirSync(galleryDir).filter((file) => {
      return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(
        path.extname(file).toLowerCase()
      );
    });

    if (files.length === 0) {
      return `<p>Galerie "${galleryName}" neobsahuje žádné obrázky.</p>`;
    }

    // Generate HTML for gallery compatible with Masonry
    let galleryHTML = `<div class="gallery masonry">`;
    files.forEach((file) => {
      const imagePath = path.join(galleryName, file).replace(/\\/g, "/");

      galleryHTML += `
        <div class="gallery-item">
          <a href="${imagePath}" data-fslightbox>
            <img src="${imagePath}" alt="" loading="lazy">
          </a>
        </div>
      `;
    });
    galleryHTML += `</div>`;

    return galleryHTML;
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_includes/layouts",
      output: "_site",
      data: "data",
    },
  };
};
