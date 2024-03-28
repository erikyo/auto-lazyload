/**
 * If needed, you can set the lazyloadOptions in the window object before the document is loaded to override the default options
 *
 * @example window.lazyloadOptions = {loading: 'my-lazy-loading', failed: 'my-lazy-failed', on: 'my-lazy', loaded: 'my-lazy-loaded', attribute: 'lazy' }
 */
type LazyloadOptions = { loading: string, failed: string, on: string, loaded: string, attribute: string }
const options = 'lazyloadOptions' in window ? window?.lazyloadOptions as LazyloadOptions : {loading: 'lazy-loading', failed: 'lazy-failed', on: 'lazy', loaded: 'lazy-loaded', attribute: 'lazy'}

/**
 * Check if an element is in the viewport
 *
 * @param el {Element} The element to check
 * @return {boolean} True if the element is in the viewport
 */
export function isElementInViewport(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect()

    // Check if any part of the element is in the viewport
    return (
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
        rect.top < (window.innerHeight || document.documentElement.clientHeight)
    )
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
        if ([options.attribute] + '-srcset' in lazyElement.dataset) {
            (lazyElement as HTMLImageElement).srcset = lazyElement.dataset[options.attribute] + '-srcset' as string
            lazyElement.removeAttribute('data-' + options.attribute + '-srcset')
        }
    }
    // Remove the data-lazy attribute
    if ('data-' + options.attribute in lazyElement.dataset) lazyElement.removeAttribute('data-' + options.attribute)
}

/**
 * Fallback for browsers that don't support Intersection Observer
 * @param {Element} node The node to ensure is visible
 */
export function fallbackNode(node: HTMLElement) {
    unveil(node)
    node.classList.add(options.loaded)
}

/**
 * Add a script tag to the page
 * @param node the script node
 */
function lazyscript(node: HTMLScriptElement) {
    // Lazy load the script in the background after the page is loaded
    window.addEventListener('load', () => {
        const script = document.createElement('script')
        // copy the attributes
        for (let i = 0; i < node.attributes.length; i++) {
            if (node.attributes[i].name !== 'data-' + options.attribute) script.setAttribute(node.attributes[i].name, node.attributes[i].value)
        }
        // set the src
        script.src = node.dataset[options.attribute] as string
        // add the script to the page in the same position as the old script node
        node.parentElement?.insertBefore(script, node)
        node.remove()
    })
}

/**
 * Define the lazy loading function
 *
 * @param entries The entries from the IntersectionObserver
 * @param observer The IntersectionObserver instance
 */
export function exec(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
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

function watcher(mutationsList: MutationRecord[]) {
    const lazyObserver = new IntersectionObserver(exec)

    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node: Node) => {
                // Check if the node is a lazy element
                if (node.nodeType === 1) {
                    /** @var  {HTMLElement | HTMLScriptElement} isElement the element to lazy load */
                    const isElement = node as HTMLElement | HTMLScriptElement
                    if (isElement.nodeName === 'SCRIPT') {
                        // If the element is a script tag, load the script in the background
                        if (isElement.dataset[options.attribute]) lazyscript(isElement as HTMLScriptElement)
                    } else if (['IMG', 'VIDEO', 'AUDIO', 'DIV'].includes(isElement.nodeName)) {
                        if (isElementInViewport(isElement)) {
                            // add the fetchpriority attribute to the element
                            if (isElement.nodeName === 'IMG') isElement.setAttribute('fetchpriority', 'high')
                        } else {
                            if (isElement.nodeName === 'DIV') {
                                if (isElement.hasAttribute('style') && (isElement as HTMLDivElement).style.backgroundImage) {
                                    isElement.dataset[options.attribute + 'Bkg'] = isElement.style.backgroundImage
                                    isElement.style.backgroundImage = 'url()'
                                }
                            } else {
                                isElement.dataset[options.attribute] = (isElement as HTMLImageElement).src as string
                                (isElement as HTMLImageElement).src = ''
                            }
                            // Else observe the newly added node with the IntersectionObserver
                            lazyObserver.observe(isElement)
                        }
                    }
                }
            })
        }
    }
}

/**
 *  Start the lazy loading
 *
 *  @type {NodeListOf<Element>} lazyElements The elements to lazy load *
 */
export function fastLazyLoad() {
    /**
     * Create an IntersectionObserver instance and observe the lazy elements
     */
    if ('IntersectionObserver' in window && 'MutationObserver' in window) {

        // Create a MutationObserver to watch for changes in the DOM
        const mutationObserver = new MutationObserver(watcher)

        /**
         * Start observing the DOM
         */
        mutationObserver.observe(document.body, {childList: true, subtree: true})
    }
}

fastLazyLoad()
