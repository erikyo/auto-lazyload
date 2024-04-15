"use strict";
(() => {
  // src/constants.ts
  var defaults = {
    loading: "lazy-loading",
    failed: "lazy-failed",
    on: "autolazy",
    loaded: "lazy-loaded",
    attribute: "lazy",
    nativeSupport: false,
    proxy: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    observer: {
      root: null,
      rootMargin: "0px 0px 0px 0px",
      threshold: 0
    }
  };
  var options = "autolazy" in window ? { ...defaults, ...window?.autolazy } : defaults;

  // src/lazyscript.ts
  function lazyscript(node) {
    const delay = Number(node.dataset[`${options.attribute}Delay`]) ?? 0;
    window.addEventListener("load", () => {
      const script = document.createElement("script");
      for (let i = 0; i < node.attributes.length; i++) {
        if (!node.attributes[i].name.includes(`data-${options.attribute}`))
          script.setAttribute(node.attributes[i].name, node.attributes[i].value);
      }
      script.src = node.dataset[options.attribute];
      new Promise((resolve) => setTimeout(resolve, Number(delay))).then(() => {
        node.parentElement?.insertBefore(script, node);
        node.remove();
      });
    });
  }

  // src/unveil.ts
  function createElement({
    lazyElement,
    wrapperEl,
    innerHTML
  }) {
    const wrapper = document.createElement(wrapperEl);
    wrapper.innerHTML = innerHTML;
    for (const attribute of lazyElement.attributes) {
      if (attribute.name.includes(`data-${options.attribute}`))
        continue;
      wrapper.setAttribute(attribute.name, attribute.value);
    }
    lazyElement.parentElement?.insertBefore(wrapper, lazyElement.nextSibling);
    lazyElement.remove();
    return wrapper;
  }
  function unveil(lazyElement) {
    if (`${options.attribute}Bkg` in lazyElement.dataset) {
      lazyElement.style.backgroundImage = lazyElement.dataset[`${options.attribute}Bkg`];
      lazyElement.removeAttribute(`data-${options.attribute}-bkg`);
    } else {
      lazyElement.src = lazyElement.dataset[options.attribute];
      if (`${[options.attribute]}Srcset` in lazyElement.dataset) {
        lazyElement.srcset = lazyElement.dataset[`${options.attribute}Srcset`];
        lazyElement.removeAttribute(`data-${options.attribute}-srcset`);
      }
    }
    if (`${options.attribute}Wrapper` in lazyElement.dataset) {
      if (lazyElement.dataset[`${options.attribute}Include`] !== "") {
        new Promise(
          () => fetch(lazyElement.dataset[`${options.attribute}Include`], {
            method: "GET",
            headers: {
              origin: "*"
            }
          }).then((res) => res.text()).then((res) => {
            const el = createElement({
              lazyElement,
              wrapperEl: lazyElement.dataset[`${options.attribute}Wrapper`],
              innerHTML: res
            });
            el.outerHTML = res;
          }).catch((err) => console.error(err))
        );
      } else {
        createElement({
          lazyElement,
          wrapperEl: lazyElement.dataset[`${options.attribute}Wrapper`],
          innerHTML: lazyElement.innerHTML
        });
      }
    }
    if (`${options.attribute}Module` in lazyElement.dataset) {
      new Promise(() => {
        import(lazyElement.dataset[`${options.attribute}Module`]).then(
          () => {
            lazyElement.setAttribute("type", "module");
            createElement({
              lazyElement,
              wrapperEl: "script",
              innerHTML: `import ${lazyElement.dataset[`${options.attribute}Import`]} from '${lazyElement.dataset[`${options.attribute}Module`]}';
${lazyElement.innerHTML}`
            });
          }
        );
      });
    }
    if (`data-${options.attribute}` in lazyElement.dataset)
      lazyElement.removeAttribute(`data-${options.attribute}`);
  }

  // src/lazyObserver.ts
  function observe(options2 = {}) {
    return new IntersectionObserver(lazyObserver, options2);
  }
  function lazyObserver(entries, observer) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const target = entry.target;
        target.classList.add(options.on);
        target.classList.add(options.loading);
        let imageToLoad = target.dataset[options.attribute] ? target : null;
        if (!imageToLoad && target.dataset[`${options.attribute}Bkg`]) {
          imageToLoad = new Image();
          const bkgImage = target.getAttribute(`${options.attribute}-bkg`)?.replace(/(^url\()|(\)$|["'])/g, "");
          if (bkgImage) {
            imageToLoad.src = bkgImage;
          }
        }
        if (imageToLoad) {
          imageToLoad.addEventListener("load", () => {
            imageToLoad.classList.add(options.loaded);
            imageToLoad.classList.remove(options.loading);
          });
          imageToLoad.addEventListener("error", () => {
            imageToLoad.classList.add(options.failed);
          });
        }
        unveil(target);
        observer.unobserve(target);
      }
    }
  }

  // src/isElementInViewport.ts
  function isElementInViewport(elBBox) {
    return elBBox.bottom > 0 && elBBox.right > 0 && elBBox.left < (window.innerWidth || document.documentElement.clientWidth) && elBBox.top < (window.innerHeight || document.documentElement.clientHeight);
  }

  // src/locator.ts
  function locator(entries, observer) {
    const lazyloadObserver = observe(options.observer);
    for (const entry of entries) {
      const isElement = entry.target;
      if (isElementInViewport(entry.boundingClientRect)) {
        if (isElement.nodeName === "IMG") {
          isElement.setAttribute("fetchpriority", "high");
          isElement.setAttribute("decoding", "async");
          const linkHeader = document.createElement("link");
          linkHeader.setAttribute("rel", "preload");
          linkHeader.setAttribute("as", "image");
          linkHeader.setAttribute(
            "href",
            isElement.src
          );
          linkHeader.setAttribute("fetchpriority", "high");
          document.head.appendChild(linkHeader);
        }
        if (isElement.dataset[`${options.attribute}Module`] || isElement.dataset[`${options.attribute}Include`]) {
          isElement.classList.add(options.loaded);
          unveil(isElement);
        }
        observer.unobserve(isElement);
      } else {
        if (isElement.nodeName === "DIV" && isElement.style.getPropertyValue("background-image")) {
          isElement.dataset[`${options.attribute}Bkg`] = isElement.style.getPropertyValue("background-image");
          isElement.style.setProperty("background-image", "none");
        } else {
          if (window?.autolazy?.options.nativeSupport && isElement.loading === "lazy")
            continue;
          if (isElement.poster) {
            isElement.poster = options.proxy;
          }
          if (isElement.src) {
            isElement.dataset[options.attribute] = isElement.src;
            isElement.src = isElement.nodeName !== "IMG" ? options.proxy : "";
            if (isElement.hasAttribute("srcset")) {
              isElement.dataset[`${options.attribute}Srcset`] = isElement.srcset;
              isElement.srcset = isElement.nodeName !== "IMG" ? options.proxy : "";
            }
          }
        }
        lazyloadObserver.observe(isElement);
      }
    }
    window.autolazy.observer = lazyloadObserver;
    window.autolazy.update = (target) => {
      const elements = document.querySelectorAll(target || "[data-lazy]");
      if (elements)
        for (const element of elements)
          observer.observe(element);
      return;
    };
    window.autolazy.watch = (element) => observer.observe(element);
    window.autolazy.unveil = (element) => unveil(element);
    window.autolazy.unmount = () => {
      observer.disconnect();
      lazyloadObserver.disconnect();
    };
  }

  // src/autoLazy.ts
  function autoLazy(mutationsList) {
    const positionObserver = new IntersectionObserver(locator);
    for (const mutation of mutationsList) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) {
          const isElement = node;
          if (mutation.type === "childList") {
            if (isElement.nodeName === "SCRIPT") {
              if (isElement.dataset[options.attribute])
                lazyscript(isElement);
            } else if (["IMG", "VIDEO", "AUDIO", "DIV"].includes(isElement.nodeName)) {
              positionObserver.observe(isElement);
            }
          }
        }
      }
    }
  }

  // src/index.ts
  function autoLazyLoad(customOptions) {
    window.autolazy = {
      options: { ...options, ...customOptions }
      // Merge the options with the default options
    };
    if ("IntersectionObserver" in window && "MutationObserver" in window) {
      new MutationObserver(autoLazy).observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      console.warn("Sorry, your browser does not support automatic lazy loading");
    }
  }
  autoLazyLoad();
})();
//# sourceMappingURL=auto-lazyload.js.map
