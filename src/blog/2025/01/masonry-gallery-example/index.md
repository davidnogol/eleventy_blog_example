---
title: "Masonry gallery example"
date: "2025-01-18"
type: "blogpost"
tags:
  - "Photography"
hasGallery: true
coverImage: "cover.jpg"
layout: post-detail.njk
---
This is example, how easily you can create visually interesting galleries. Those galleries are also responsive and loads only minimal image size. All images are transformed into several smaller sizes during site build. And then served depending on browser size.

This is example gallery of some snapshots:

{% gallery "photogallery" %}

## How can I change gallery style?
Code from gallery shortcode is stored in `.eleventy.js` file in root directory. This part is responsible for rendering gallery from shortcode:
```
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
      return `<p>Gallery "${galleryName}" is empty</p>`;
    }

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
```

There is a lot things which you can improve, for example sorting, photo titles... But for my purposes, this simple way to show multiple photos is enough. For now... :)