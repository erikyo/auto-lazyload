/**
 * The options for the lazy loading function.
 * Check the documentation for more information, don't be lazy :P
 *
 * @example window.lazyloadOptions = {loading: 'my-lazy-loading', failed: 'my-lazy-failed', on: 'my-lazy', loaded: 'my-lazy-loaded', attribute: 'lazy' }
 */
type LazyloadOptions = { loading: string, failed: string, on: string, loaded: string, attribute: string }
/**
 * If needed, you can set the lazyloadOptions in the window object before the document is loaded to override the default options
 */
const options = 'lazyloadOptions' in window ? window?.lazyloadOptions as LazyloadOptions : {loading: 'lazy-loading', failed: 'lazy-failed', on: 'lazy', loaded: 'lazy-loaded', attribute: 'lazy'}

/**
 *  Start the lazy loading
 *
 *  @type {NodeListOf<Element>} lazyElements The elements to lazy load *
 */
if ('IntersectionObserver' in window && 'MutationObserver' in window) {
    /**
     * Create a MutationObserver to watch for changes in the DOM
      */
    new MutationObserver((mutationsList) => {

        /**
         * A function that handles intersection observer entries and manipulates DOM elements accordingly.
         *
         * @param {IntersectionObserverEntry[]} entries - The array of intersection observer entries to process.
         * @param {IntersectionObserver} observer - The intersection observer instance being used.
         */
        function locator(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
            for (const entry of entries) {
                const isElement = entry.target as HTMLElement
                if ((entry.boundingClientRect as DOMRect).top < window.innerHeight) {
                    console.log(isElement.nodeName, 'in viewport')

                    // add the fetchpriority attribute to the element
                    if (isElement.nodeName === 'IMG') {
                        isElement.setAttribute('fetchpriority', 'high')

                        const linkHeader = document.createElement('link')
                        linkHeader.setAttribute('rel', 'preload')
                        linkHeader.setAttribute('as', 'image')
                        linkHeader.setAttribute('href', (isElement as HTMLImageElement).src as string)

                        document.head.appendChild(linkHeader)
                    }
                } else {
                    if (isElement.nodeName !== 'DIV') {
                        isElement.dataset[options.attribute] = (isElement as HTMLImageElement).src as string
                        (isElement as HTMLImageElement).src = ''
                        if (isElement.hasAttribute('srcset')) {
                            isElement.dataset[options.attribute + 'Srcset'] = (isElement as HTMLImageElement).srcset as string
                            (isElement as HTMLImageElement).srcset = ''
                        }
                    }
                    // Else observe the newly added node with the IntersectionObserver
                    lazyObserver.observe(isElement)
                }
            }
            positionObserver.disconnect();
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
                    positionObserver.unobserve(target)
                }
            })
        }

        const positionObserver = new IntersectionObserver(locator);

        const lazyObserver = new IntersectionObserver(exec)

        for (const mutation of mutationsList) {

            mutation.addedNodes.forEach((node) => {
                    if (node.nodeName === 'DIV') {
                        (node as HTMLDivElement).dataset[options.attribute+'Bkg'] = (node as HTMLDivElement).style.backgroundImage;
                        (node as HTMLDivElement).style.backgroundImage = '';
                    }
                }
            )

            mutation.addedNodes.forEach((node: Node) => {

                // Check if the node is a lazy element
                if (node.nodeType === 1) {
                    positionObserver.observe(node as Element)

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
    }).observe(document.body, {childList: true})
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
