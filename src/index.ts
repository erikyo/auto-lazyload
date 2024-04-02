/**
 * The options for the lazy loading function.
 * Check the documentation for more information, don't be lazy :P
 *
 * @example window.lazyloadOptions = {loading: 'my-lazy-loading', failed: 'my-lazy-failed', on: 'my-lazy', loaded: 'my-lazy-loaded', attribute: 'lazy' }
 */
type LazyloadOptions = { loading: string, failed: string, on: string, loaded: string, attribute: string }

/* Fake src for a small pixel image */
let fakeSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * If needed, you can set the lazyloadOptions in the window object before the document is loaded to override the default options
 */
let options = 'lazyloadOptions' in window
    ? window?.lazyloadOptions as LazyloadOptions
    : {loading: 'lazy-loading', failed: 'lazy-failed', on: 'lazy', loaded: 'lazy-loaded', attribute: 'lazy'}

/**
 *  Start the lazy loading using the IntersectionObserver and MutationObserver
 *
 *  @type {NodeListOf<Element>} lazyElements The elements to lazy load *
 */
export default function autoLazyLoad(customOptions?: LazyloadOptions) {
    options = {...options, ...customOptions} // Merge the options with the default options
    if ('IntersectionObserver' in window && 'MutationObserver' in window) {
        new MutationObserver(autoLazy).observe(document.body, {childList: true, subtree: true})
    } else {
        console.warn('Sorry, your browser does not support automatic lazy loading')
    }
}

autoLazyLoad()

/**
 * The lazy loading function
 *
 * @param mutationsList The list of mutations
 */
function autoLazy(mutationsList: MutationRecord[]) {

    /**
     * A function that handles intersection observer entries and manipulates DOM elements accordingly.
     *
     * @param {IntersectionObserverEntry[]} entries - The array of intersection observer entries to process.
     * @param {IntersectionObserver} observer - The intersection observer instance being used.
     */
    function locator(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
        for (const entry of entries) {
            const isElement = entry.target as HTMLElement
            if (isElementInViewport(entry.boundingClientRect as DOMRect)) {
                // add the fetchpriority attribute to the element
                if (isElement.nodeName === 'IMG') {
                    isElement.setAttribute('fetchpriority', 'high')

                    const linkHeader = document.createElement('link')
                    linkHeader.setAttribute('rel', 'preload')
                    linkHeader.setAttribute('as', 'image')
                    linkHeader.setAttribute('href', (isElement as HTMLImageElement).src as string)

                    document.head.appendChild(linkHeader)
                }
                observer.unobserve(isElement)
            } else {
                if (isElement.nodeName !== 'DIV') {
                    // If the element has the native loading attribute and is not a lazy element, continue
                    if ((isElement as HTMLImageElement).loading === 'lazy') continue;
                    // If the element is a video, add a fake src to the element as a poster image
                    if (!(isElement as HTMLVideoElement).poster) {
                        // if the poster is not set, add a fake src to the element
                        (isElement as HTMLVideoElement).poster = fakeSrc
                    }
                    // If the element is not a lazy element, add the src to the element
                    isElement.dataset[options.attribute] = (isElement as HTMLImageElement).src as string
                    (isElement as HTMLImageElement).src = (isElement.nodeName !== 'IMG') ? fakeSrc : ''
                    if (isElement.hasAttribute('srcset')) {
                        isElement.dataset[options.attribute + 'Srcset'] = (isElement as HTMLImageElement).srcset as string
                        (isElement as HTMLImageElement).srcset = fakeSrc
                    }
                }
                // Else observe the newly added node with the IntersectionObserver
                lazyObserver.observe(isElement)
            }
        }
    }

    /**
     * Define the lazy loading function
     *
     * @param entries The entries from the IntersectionObserver
     * @param observer The IntersectionObserver instance
     */
    function exec(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target as HTMLElement

                // Adds the 'on' class if the image is in the viewport
                target.classList.add(options.on)

                // Adds the 'loading' class until the image is loaded
                target.classList.add(options.loading)

                // Adds the 'on' class after the image is loaded
                target.addEventListener('load', () => {
                    target.classList.add(options.loaded)
                    target.classList.remove(options.loading)
                })

                // Adds the 'failed' class if the image fails to load
                target.addEventListener('error', () => {
                    target.classList.add(options.failed)
                })

                // Unveils the image if it is in the viewport
                unveil(target as HTMLElement)
                observer.unobserve(target)
            }
        })
    }

    const positionObserver = new IntersectionObserver(locator);

    const lazyObserver = new IntersectionObserver(exec)

    for (const mutation of mutationsList) {

        mutation.addedNodes.forEach((node: Node) => {
            if (node.nodeName === 'DIV') {
                (node as HTMLDivElement).dataset[options.attribute+'Bkg'] = (node as HTMLDivElement).style.backgroundImage;
                (node as HTMLDivElement).style.backgroundImage = '';
            }

            // Check if the node is a lazy element
            if (node.nodeType === 1) {

                /** @var {HTMLElement | HTMLScriptElement} isElement the element to lazy load */
                let isElement = node as HTMLElement | HTMLScriptElement

                if (mutation.type === 'childList') {
                    if (isElement.nodeName === 'SCRIPT') {
                        // If the element is a script tag, load the script in the background
                        if (isElement.dataset[options.attribute])
                            lazyscript(isElement as HTMLScriptElement)
                    } else if (['IMG', 'VIDEO', 'AUDIO', 'DIV'].includes(isElement.nodeName)) {
                        positionObserver.observe(isElement)
                    }
                }
            }
        })
    }
}

/**
 * Show the background image
 *
 * @param lazyElement
 */
export function unveil(lazyElement: HTMLElement) {
    // Add the background image to the element if it exists else add the src
    if (options.attribute + 'Bkg' in lazyElement.dataset) {
        lazyElement.style.backgroundImage = lazyElement.dataset[options.attribute + 'Bkg'] as string
        lazyElement.removeAttribute('data-' + options.attribute + '-bkg')
    } else {
        // Add the src to the element
        (lazyElement as HTMLImageElement).src = lazyElement.dataset[options.attribute] as string
        // If the srcset attribute exists, add it
        if ([options.attribute] + 'Srcset' in lazyElement.dataset) {
            (lazyElement as HTMLImageElement).srcset = lazyElement.dataset[options.attribute] + '-srcset' as string
            lazyElement.removeAttribute('data-' + options.attribute + '-srcset')
        }
    }
    // Remove the data-lazy attribute
    if ('data-' + options.attribute in lazyElement.dataset) lazyElement.removeAttribute('data-' + options.attribute)
}

/**
 * Add a script tag to the page
 *
 * @param node the script node
 */
function lazyscript(node: HTMLScriptElement) {
    const delay = Number(node.dataset[options.attribute+'Delay']) ?? 0;

    // Lazy load the script in the background after the page is loaded
    window.addEventListener('load', () => {
        const script = document.createElement('script')

        // Copy the attributes
        for (let i = 0; i < node.attributes.length; i++) {
            if (!node.attributes[i].name.includes('data-' + options.attribute))
                script.setAttribute(node.attributes[i].name, node.attributes[i].value)
        }

        // Set the src
        script.src = node.dataset[options.attribute] as string

        new Promise(resolve => setTimeout(resolve, Number(delay))).then(() => {
            // Add the script to the page in the same position as the old script node
            node.parentElement?.insertBefore(script, node)
            node.remove()
        })
    })
}

/**
 * Check if an element is in the viewport
 *
 * @param {DOMRect} elBBox The element BoundingClientRect to check
 *
 * @return {boolean} True if the element is in the viewport
 */
export function isElementInViewport(elBBox: DOMRect): boolean {
    return (
        elBBox.bottom > 0 &&
        elBBox.right > 0 &&
        elBBox.left < (window.innerWidth || document.documentElement.clientWidth) &&
        elBBox.top < (window.innerHeight || document.documentElement.clientHeight)
    )
}
