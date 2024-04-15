import { options } from "./constants";

function createElement({
	lazyElement,
	wrapperEl,
	innerHTML,
}: {
	lazyElement: HTMLElement;
	wrapperEl: string;
	innerHTML: string;
}) {
	// create a new element as div and add as innerHTML the include
	const wrapper = document.createElement(wrapperEl) as HTMLElement;
	wrapper.innerHTML = innerHTML;
	// assign every attribute to the element except the data-lazy stuff
	for (const attribute of lazyElement.attributes) {
		if (attribute.name.includes(`data-${options.attribute}`)) continue;
		wrapper.setAttribute(attribute.name, attribute.value);
	}
	// append after the element in the dom
	lazyElement.parentElement?.insertBefore(wrapper, lazyElement.nextSibling);
	// remove the element
	lazyElement.remove();
}

/**
 * Show the background image
 *
 * @param lazyElement
 */
export function unveil(lazyElement: HTMLElement) {
	// Add the background image to the element if it exists else add the src
	if (`${options.attribute}Bkg` in lazyElement.dataset) {
		lazyElement.style.backgroundImage = lazyElement.dataset[
			`${options.attribute}Bkg`
		] as string;
		lazyElement.removeAttribute(`data-${options.attribute}-bkg`);
	} else {
		// Add the src to the element
		(lazyElement as HTMLImageElement).src = lazyElement.dataset[
			options.attribute
		] as string;
		// If the srcset attribute exists, add it
		if (`${[options.attribute]}Srcset` in lazyElement.dataset) {
			(lazyElement as HTMLImageElement).srcset = lazyElement.dataset[
				`${options.attribute}Srcset`
			] as string;
			lazyElement.removeAttribute(`data-${options.attribute}-srcset`);
		}
	}
	/**
	 * Case Include
	 */
	if (`${options.attribute}Wrapper` in lazyElement.dataset) {
		if ((lazyElement.dataset[`${options.attribute}Include`] as string) !== "") {
			new Promise(() =>
				fetch(lazyElement.dataset[`${options.attribute}Include`] as string, {
					method: "GET",
					headers: {
						origin: "*",
						contentType: "text/html",
					},
				})
					.then((res) => res.text())
					.then((res) => {
						createElement({
							lazyElement: lazyElement,
							wrapperEl: lazyElement.dataset[
								`${options.attribute}Wrapper`
							] as string,
							innerHTML: res,
						});
					})
					.catch((err) => console.error(err)),
			);
		} else {
			createElement({
				lazyElement: lazyElement,
				wrapperEl: lazyElement.dataset[`${options.attribute}Wrapper`] as string,
				innerHTML: lazyElement.innerHTML,
			});
		}
	}
	/**
	 * Case Module
	 */
	if (`${options.attribute}Module` in lazyElement.dataset) {
		new Promise(() => {
			import(lazyElement.dataset[`${options.attribute}Module`] as string).then(
				() => {
					// we need to add the type module to the lazy module element so that is copied to the script tag
					lazyElement.setAttribute("type", "module");
					createElement({
						lazyElement: lazyElement,
						wrapperEl: "script",
						innerHTML: `import ${
							lazyElement.dataset[`${options.attribute}Import`]
						} from '${lazyElement.dataset[`${options.attribute}Module`]}';\n${
							lazyElement.innerHTML
						}`,
					});
				},
			);
		});
	}
	// Remove the data-lazy attribute
	if (`data-${options.attribute}` in lazyElement.dataset)
		lazyElement.removeAttribute(`data-${options.attribute}`);
}
