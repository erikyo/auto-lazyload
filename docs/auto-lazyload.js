"use strict";
(() => {
  // src/index.ts
  var options = "lazyloadOptions" in window ? window?.lazyloadOptions : { loading: "lazy-loading", failed: "lazy-failed", on: "lazy", loaded: "lazy-loaded", attribute: "lazy" };
  var fakeSrc = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  if ("IntersectionObserver" in window && "MutationObserver" in window) {
    new MutationObserver((mutationsList) => {
      function locator(entries, observer) {
        for (const entry of entries) {
          const isElement = entry.target;
          if (isElementInViewport(entry.boundingClientRect)) {
            if (isElement.nodeName === "IMG") {
              isElement.setAttribute("fetchpriority", "high");
              const linkHeader = document.createElement("link");
              linkHeader.setAttribute("rel", "preload");
              linkHeader.setAttribute("as", "image");
              linkHeader.setAttribute("href", isElement.src);
              document.head.appendChild(linkHeader);
            }
            observer.unobserve(isElement);
          } else {
            if (isElement.nodeName !== "DIV") {
              if (isElement.loading === "lazy")
                continue;
              if (!isElement.poster) {
                isElement.poster = fakeSrc;
              }
              isElement.dataset[options.attribute] = isElement.src;
              isElement.src = isElement.nodeName !== "IMG" ? fakeSrc : "";
              if (isElement.hasAttribute("srcset")) {
                isElement.dataset[options.attribute + "Srcset"] = isElement.srcset;
                isElement.srcset = fakeSrc;
              }
            }
            lazyObserver.observe(isElement);
          }
        }
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
      const positionObserver = new IntersectionObserver(locator);
      const lazyObserver = new IntersectionObserver(exec);
      for (const mutation of mutationsList) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === "DIV") {
            node.dataset[options.attribute + "Bkg"] = node.style.backgroundImage;
            node.style.backgroundImage = "";
          }
          if (node.nodeType === 1) {
            let isElement = node;
            if (mutation.type === "childList") {
              if (isElement.nodeName === "SCRIPT") {
                if (isElement.dataset[options.attribute])
                  lazyscript(isElement);
              } else if (["IMG", "VIDEO", "AUDIO", "DIV"].includes(isElement.nodeName)) {
                positionObserver.observe(isElement);
              }
            }
          }
        });
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
  function unveil(lazyElement) {
    if (options.attribute + "Bkg" in lazyElement.dataset) {
      lazyElement.style.backgroundImage = lazyElement.dataset[options.attribute + "Bkg"];
      lazyElement.removeAttribute("data-" + options.attribute + "-bkg");
    } else {
      lazyElement.src = lazyElement.dataset[options.attribute];
      if ([options.attribute] + "Srcset" in lazyElement.dataset) {
        lazyElement.srcset = lazyElement.dataset[options.attribute] + "-srcset";
        lazyElement.removeAttribute("data-" + options.attribute + "-srcset");
      }
    }
    if ("data-" + options.attribute in lazyElement.dataset)
      lazyElement.removeAttribute("data-" + options.attribute);
  }
  function lazyscript(node) {
    const delay = Number(node.dataset[options.attribute + "Delay"]) ?? 0;
    window.addEventListener("load", () => {
      const script = document.createElement("script");
      for (let i = 0; i < node.attributes.length; i++) {
        if (!node.attributes[i].name.includes("data-" + options.attribute))
          script.setAttribute(node.attributes[i].name, node.attributes[i].value);
      }
      script.src = node.dataset[options.attribute];
      new Promise((resolve) => setTimeout(resolve, Number(delay))).then(() => {
        node.parentElement?.insertBefore(script, node);
        node.remove();
      });
    });
  }
  function isElementInViewport(elBBox) {
    return elBBox.bottom > 0 && elBBox.right > 0 && elBBox.left < (window.innerWidth || document.documentElement.clientWidth) && elBBox.top < (window.innerHeight || document.documentElement.clientHeight);
  }
})();
