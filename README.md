# Auto Lazy Load
[![](https://img.shields.io/npm/v/auto-lazyload.svg?label=npm%20version)](https://www.npmjs.com/package/auto-lazyload)
[![](https://img.shields.io/npm/l/auto-lazyload)](https://github.com/erikyo/auto-lazyload?tab=GPL-3.0-1-ov-file#readme)

## Why?
While lazy loading is hailed as a game-changer in optimizing web performance, not all implementations are created equal.
Traditional lazy loaders may inadvertently delay crucial content, leading to detrimental effects on your site's Largest Contentful Paint (LCP).
Read more about [this](https://web.dev/articles/lazy-loading-images) and about the [Largest Contentful Paint (LCP)](https://web.dev/lcp/).

## How?
This library allows you to lazyload images, videos,
and background images using the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) and the MutationObserver API in order to check when an element is in view.
What differs with the common lazy loading implementation is that it doesn't require markup, it's very lightweight and fast to load, remaining full-featured and easy to use.

## Usage
Add the script just after the `body` tag.

### Using the iife version
```html
<html>
    <head>...</head>
    <body>
        <script src="https://unpkg.com/auto-lazyload"></script>
        ... the rest of your code ...
    </body>
</html>
...
```

### Using the esm version
install the library with `npm install auto-lazyload` or `yarn add auto-lazyload`.

Then import the library with:
```html
<html>
    <head>...</head>
    <body>
    <script type="module">
        import AutoLazyLoad from 'auto-lazyload';
        AutoLazyLoad({
            on: 'lazy',
            loading: 'lazy-loading',
            failed: 'lazy-failed',
            loaded: 'lazy-loaded',
            attribute: 'data-lazy',
            nativeSupport: false,
            fetchprioritySupport: true
        });
    </script>
    ... the rest of your code ...
    </body>
</html>
...
```

## User Configurable Options

If needed, you have the flexibility to customize the lazy loading behavior by setting the `lazyloadOptions` object in the `window` object before the document is loaded. This allows you to override the default options to tailor lazy loading according to your specific requirements.

### Example:

```javascript
window.autolazy = {
    on: 'my-lazy', // the class name for the active lazy loaded image
    loading: 'my-lazy-loading', // the class name for the lazy loading image
    failed: 'my-lazy-failed', // the class name for the failed image
    loaded: 'my-lazy-loaded', // the class name for the lazy loaded image
    attribute: 'data-lazy', // the dataset name for the lazy loaded image (used internally but configurable)
    nativeSupport: false, // whether to use the native lazyload (e.g. loading="lazy") or not
    fetchprioritySupport: true, // whether to add the fetchpriority attribute to the page head or not
    // The intersectionObserverOptions can also be set here
    // https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver#instance_properties
    selector: {
        root: null,
        rootMargin: "0px 0px 0px 0px",
        threshold: 0
    },
};
```

### Api

- **Observer**
The intersection observer instance.

```javascript
const observer = autolazy.observer;

// Example:
observer.rootMargin = "0px 0px 0px 0px";
observer.threshold = 0;

observer.observe(document.querySelector(".target"));
observer.unobserve(document.querySelector(".target"));
observer.disconnect();
```

- **Unmount**
Destroy the library and remove the event listeners.

`autolazy.unmount()`

- **Update a target Element**
Update the options for the specified target.

`autolazy.update(".target")`

- **Update**
Update the options for all targets.

`autolazy.update()`


- **Watch**
Add the specified target to the watch list.

`autolazy.watch(document.querySelector(".target"))`

- **Unveil**
  Show the specified target.

`autolazy.unveil(document.querySelector(".target"))`


### Additional Tricks

- **Skip auto lazy load**

You can avoid the auto lazy load by adding the `no-lazy` class to the target element.

```javascript
<img class="no-lazy" src="https://example.com/image.jpg" alt="this image is not lazyloaded" />
```

- **Disable the fetchpriority attribute**

While the `fetchPrioritySupport` option is enabled by default, and it is recommended to keep it active, this can conflict with other plugins.
If you need to disable it, this is possible by setting the `fetchPrioritySupport` option to `false` before the script is loaded.

```javascript
window.autolazy = {fetchPrioritySupport: false};
```

### Compatibility

- The script is designed to work in modern browsers that support both Intersection Observer and Mutation Observer APIs.
- If the `IntersectionObserver` API is not supported, the page will be loaded without lazy loading images but nothing else.

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md)

## License
MIT
