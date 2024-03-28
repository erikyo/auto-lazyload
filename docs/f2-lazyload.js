"use strict";
(() => {
  // src/index.ts
  var options = "lazyloadOptions" in window ? window?.lazyloadOptions : { loading: "lazy-loading", failed: "lazy-failed", on: "lazy", loaded: "lazy-loaded", attribute: "lazy" };
  var imageRequests = /* @__PURE__ */ new Map();
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.bottom > 0 && rect.right > 0 && rect.left < (window.innerWidth || document.documentElement.clientWidth) && rect.top < (window.innerHeight || document.documentElement.clientHeight);
  }
  function unveil(lazyElement) {
    if (options.attribute + "Bkg" in lazyElement.dataset) {
      lazyElement.style.backgroundImage = lazyElement.dataset[options.attribute + "Bkg"];
      lazyElement.removeAttribute("data-" + options.attribute + "-bkg");
    } else {
      lazyElement.src = lazyElement.dataset[options.attribute];
      if ([options.attribute] + "-srcset" in lazyElement.dataset) {
        lazyElement.srcset = lazyElement.dataset[options.attribute] + "-srcset";
        lazyElement.removeAttribute("data-" + options.attribute + "-srcset");
      }
    }
    if ("data-" + options.attribute in lazyElement.dataset)
      lazyElement.removeAttribute("data-" + options.attribute);
  }
  function lazyscript(node) {
    window.addEventListener("load", () => {
      const script = document.createElement("script");
      for (let i = 0; i < node.attributes.length; i++) {
        if (node.attributes[i].name !== "data-" + options.attribute)
          script.setAttribute(node.attributes[i].name, node.attributes[i].value);
      }
      script.src = node.dataset[options.attribute];
      node.parentElement?.insertBefore(script, node);
      node.remove();
    });
  }
  function exec(entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target;
        target.classList.add(options.on);
        target.classList.add(options.loading);
        target.addEventListener("load", () => {
          target.classList.add(options.loaded);
          target.classList.remove(options.loading);
        });
        target.addEventListener("error", () => {
          target.classList.add(options.failed);
        });
        unveil(target);
        observer.unobserve(target);
      }
    });
  }
  function cancelRequest(element) {
    if (imageRequests.has(element)) {
      const controller = imageRequests.get(element);
      controller?.abort();
      imageRequests.delete(element);
    }
  }
  function watcher(mutationsList) {
    const lazyObserver = new IntersectionObserver(exec);
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const isElement = node;
            if (isElement.nodeName === "SCRIPT") {
              if (isElement.dataset[options.attribute])
                lazyscript(isElement);
            } else if (["IMG", "VIDEO", "AUDIO", "DIV"].includes(isElement.nodeName)) {
              if (isElementInViewport(isElement)) {
                if (isElement.nodeName === "IMG")
                  isElement.setAttribute("fetchpriority", "high");
              } else {
                const controller = new AbortController();
                cancelRequest(isElement);
                imageRequests.set(isElement, controller);
                if (isElement.nodeName === "DIV") {
                  if (isElement.hasAttribute("style") && isElement.style.backgroundImage) {
                    isElement.dataset[options.attribute + "Bkg"] = isElement.style.backgroundImage;
                    isElement.style.setProperty("background-image", "none");
                  }
                } else {
                  isElement.dataset[options.attribute] = isElement.src;
                  isElement.src = "";
                  if (isElement.hasAttribute("srcset")) {
                    isElement.dataset[options.attribute + "Srcset"] = isElement.srcset;
                    isElement.srcset = "";
                  }
                }
                lazyObserver.observe(isElement);
              }
            }
          }
        });
      }
    }
  }
  function fastLazyLoad() {
    if ("IntersectionObserver" in window && "MutationObserver" in window) {
      const mutationObserver = new MutationObserver(watcher);
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }
  }
  fastLazyLoad();
})();
