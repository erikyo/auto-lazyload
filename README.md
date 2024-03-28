# Fast Lazy Load
[![](https://img.shields.io/npm/v/fast-lazyload.svg?label=npm%20version)](https://www.npmjs.com/package/fast-lazyload)
[![](https://img.shields.io/npm/l/fast-lazyload)](https://github.com/erikyo/fast-lazyload?tab=GPL-3.0-1-ov-file#readme)

## Why?
While lazy loading is hailed as a game-changer in optimizing web performance, not all implementations are created equal.
Traditional lazy loaders may inadvertently delay crucial content, leading to detrimental effects on your site's Largest Contentful Paint (LCP).
Read more about [this](https://web.dev/articles/lazy-loading-images) and about the [Largest Contentful Paint (LCP)](https://web.dev/lcp/).

## How It Works
The script operates at the core of your webpage's creation process, thanks to the vigilant watch of the Mutation Observer API.
It meticulously observes every addition to the DOM, ensuring that when an element, be it an image or video, is appended, it comes complete with its source set.
By sidestepping proxies and preemptively loading content with its true source, we safeguard your site's Largest Contentful Paint (LCP) metrics.
This proactive approach not only optimizes loading times but also guarantees a seamless user experience from the moment your page springs to life.

## Features

- Lazily loads images, videos, and background images.
- Intersection Observer to efficiently detect when elements enter the viewport.
- Set the fetchpriority to `high` for the images and videos inside the viewport automatically ([ref.](https://web.dev/articles/optimize-lcp?utm_source=lighthouse&utm_medium=lr#optimize-resource-priority)).
- Employs Mutation Observer to dynamically handle changes in the DOM, ensuring newly added lazy elements are also properly observed.
- Provides a fallback mechanism for browsers that do not support the required APIs.

## Usage

### Installation

1. Include **the script at the beginning of the `<body>` tag in your HTML document**.
2. Ensure the script is added before any content that requires lazy loading.

```html
<body>
  <script src="https://www.unpkg.com/fast-lazyload"></script>
  ...
</body>
```

## The Markup changes required

To get started, add the `data-lazy` attribute to any element you want to lazy load.
The library will check for the existence of a style attribute with a background image.
If it does not exist, it will assume the element that requires lazy loading adding or replacing the src.

```html
<!-- Image -->
<img src="proxy.jpg" data-lazy="original.png" data-srcset="[original srcset]" width="960" height="540" />
<!-- Background image -->
<div style="background-color: dimgray; width: 960px; height: 540px" data-lazy="original.png"></div>
<!-- Video -->
<video autoplay muted data-lazy="original.mp4" style="background-image:url(proxy.jpg); width: 960px; height: 540px"></video>
<!-- Audio -->
<audio data-lazy="original.mp3"></audio>
<!-- Script -->
<script data-lazy="myHeavyScript.js"></script>
```

## User Configurable Options

If needed, you have the flexibility to customize the lazy loading behavior by setting the `lazyloadOptions` object in the `window` object before the document is loaded. This allows you to override the default options to tailor lazy loading according to your specific requirements.

### Example:

```javascript
window.lazyloadOptions = {
    loading: 'my-lazy-loading',
    failed: 'my-lazy-failed',
    on: 'my-lazy',
    loaded: 'my-lazy-loaded',
    attribute: 'data-lazy'
};
```

### Default Options:

If no custom options are provided, the script will fall back to the default options:

```javascript
const Options = {
    loading: 'lazy-loading',
    failed: 'lazy-failed',
    on: 'lazy',
    loaded: 'lazy-loaded',
    attribute: 'data-lazy'
};
```

### Animating Lazy Loaded Items

Integrating animations with lazy loaded items can significantly enhance the visual appeal and user engagement of your website.

- When an element enters the viewport, classes `lazy` and `loading` are added to indicate visibility and loading.
- Upon successful loading of source, class `Options.loaded` is added, and `Options.loading` is removed and the data-lazy attribute is removed too.
- If loading fails, class `Options.failed` is added.
- When an element leaves the viewport, the classes `Options.on` and `Options.loading` are removed.


#### CSS examples:

```css
img.lazy {
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
}

img.lazy.loaded {
    opacity: 1;
    animation: blink 0.5s ease-in-out;
}

video.lazy.loading {
  background-image: url("spinner.gif");
}

audio.lazy.failed {
  background-image: url("404.jpg");
}
```

### Compatibility

- The script is designed to work in modern browsers that support both Intersection Observer and Mutation Observer APIs.
- A fallback mechanism is provided for browsers that do not support Intersection Observer, ensuring basic functionality across a wide range of browsers.

## What the script does after being loaded

1. The script initially queries for all elements with the `data-lazy` attribute, which are considered lazy-loadable elements.
2. If the browser supports Intersection Observer and Mutation Observer, it creates instances of both.
3. Intersection Observer is used to monitor lazy-loadable elements and trigger loading when they enter the viewport.
4. Mutation Observer watches for changes in the DOM, ensuring any dynamically added lazy elements are also properly observed.
5. For browsers lacking Intersection Observer support, a fallback mechanism directly loads all lazy elements.

## Caveats

- The script relies on the availability of Intersection Observer and Mutation Observer APIs. Ensure compatibility with your target browsers.
- It's essential to use the `data-lazy` attribute on elements you intend to load lazily.
- Background image should be a style attribute and should be set (e.g. `background-image:url(proxy.jpg);`) otherwise will be considered as a src replacement

## Contributing

If you encounter any issues or have suggestions for improvements, feel free to contribute by submitting a pull request or opening an issue on the GitHub repository.

## License

This script is licensed under the [MIT License](https://opensource.org/licenses/MIT). You are free to modify and distribute it as per the terms of the license.

## Acknowledgments

Special thanks to the developers and contributors of Intersection Observer and Mutation Observer APIs for enabling efficient lazy loading techniques.
