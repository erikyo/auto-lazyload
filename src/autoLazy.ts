import { options } from "./constants";
import { lazyscript } from "./lazyscript";
import { locator } from "./locator";

/**
 * The lazy loading function triggered by the MutationObserver
 * Needs to be fired before all at the beginning of the body because it needs to observe the elements added to the body
 *
 * @param mutationsList The list of mutations
 */
export function autoLazy(mutationsList: MutationRecord[]) {
	const positionObserver = new IntersectionObserver(locator);

	for (const mutation of mutationsList) {
		for (const node of mutation.addedNodes) {
			// Check if the node is a lazy element
			if (node.nodeType === 1) {
				/** @var {HTMLElement | HTMLScriptElement} isElement the element to lazy load */
				const isElement = node as HTMLElement | HTMLScriptElement;

				if (mutation.type === "childList") {
                    /* Skip the element if it has the 'no-lazy' class */
                    if (isElement.classList.contains('no-lazy')) {
                        continue;
                    }

					if (isElement.nodeName === "SCRIPT") {
						/* If the element is a script tag, load the script in the background */
						if (isElement.dataset[options.attribute])
							lazyscript(isElement as HTMLScriptElement);
					} else if (
						["IMG", "VIDEO", "AUDIO", "DIV"].includes(isElement.nodeName)
					) {
						positionObserver.observe(isElement);
					}
				}
			}
		}
	}
}
