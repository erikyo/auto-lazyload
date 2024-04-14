import { options } from "./constants";
import { unveil } from "./unveil";

/**
 * Sugar for the IntersectionObserver lazy loading function
 *
 * @param options - The options for the IntersectionObserver function (defaults to { root: document.body, rootMargin: undefined, threshold: undefined })
 */
export function observe(options: IntersectionObserverInit = {}) {
	return new IntersectionObserver(lazyObserver, options);
}

/**
 * The lazy loading function that is triggered by the IntersectionObserver
 *
 * @param entries The entries from the IntersectionObserver
 * @param observer The IntersectionObserver instance
 */
export function lazyObserver(
	entries: IntersectionObserverEntry[],
	observer: IntersectionObserver,
): void {
	for (const entry of entries) {
		if (entry.isIntersecting) {
			const target = entry.target as HTMLElement;

			// Adds the 'on' class if the image is in the viewport
			target.classList.add(options.on);

			// Adds the 'loading' class until the image is loaded
			target.classList.add(options.loading);

			let imageToLoad: null | HTMLImageElement = target.dataset[
				options.attribute
			]
				? (target as HTMLImageElement)
				: null;

			if (!imageToLoad && target.dataset[`${options.attribute}Bkg`]) {
				// the image is in the background image, so we need to create a new image element to load it to get the event onload
				imageToLoad = new Image();

				// Gets the background image from the attribute and removes the url and quotes
				const bkgImage = target
					.getAttribute(`${options.attribute}-bkg`)
					?.replace(/(^url\()|(\)$|["'])/g, "");
				if (bkgImage) {
					imageToLoad.src = bkgImage;
				}
			}

			if (imageToLoad) {
				// Adds the 'on' class after the image is loaded
				imageToLoad.addEventListener("load", () => {
					imageToLoad.classList.add(options.loaded);
					imageToLoad.classList.remove(options.loading);
				});

				// Adds the 'failed' class if the image fails to load
				imageToLoad.addEventListener("error", () => {
					imageToLoad.classList.add(options.failed);
				});
			}

			// Unveils the image if it is in the viewport
			unveil(target as HTMLElement);
			observer.unobserve(target);
		}
	}
}
