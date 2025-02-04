# Eleventy blog example
Repository with example web in [Eleventy](https://www.11ty.dev/). It's based on code which I used to build https://nogol.cz. The code is not very clean; it was a side project I worked on in the evenings after the kids were asleep, and I didn’t have much time for it. It could definitely be improved, but it works.

## Features of this web
- Works for blogs with combination of posts and pages.
- Automatic images transformation - optimized webp images are generated by build in several sizes to optimize page size and speed.
- Simple galleries in pages - if you want to include gallery of photos (with masonry format), just create folder with some name and into page content insert `{% gallery "folder_name" %}` shortcode, where folder_name is name of folder, where you store images from gallery and add `hasGallery: true` to page frontmatter (it's because masonry library is loaded only for pages with this flag to optimize page speed).
- Except of gallery snipet, it uses only standard markdown format, so it is easily transferable to another system.
- Use lightbox effect thanks to [fslightbox](https://fslightbox.com/) library.
- Highlight code syntax.
- Automaticaly embed youtube videos by inserting link in content.
- RSS/Atom with latest blog posts.

## How to run it
1. Clone this repository
2. Open project folder and run `npx @11ty/eleventy --serve`
3. Go to http://localhost:8080/

## Migration from Wordpress to Eleventy (Czech only)
Here is tutorial how to migrate web from Wordpress to Eleventy. Only in Czech language: http://nogol.cz/2025/01/jak-prevest-wordpress-web-na-staticke-stranky-pomoci-eleventy/

