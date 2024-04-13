import {fakeSrc, options} from './constants'
import {unveil} from './unveil'
import {lazyscript} from './lazyscript'

import {isElementInViewport} from './isElementInViewport'

/**
 * The lazy loading function
 *
 * @param mutationsList The list of mutations
 */
export function autoLazy(mutationsList: MutationRecord[]) {

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
                    linkHeader.setAttribute('fetchpriority', 'high')

                    document.head.appendChild(linkHeader)
                }
                observer.unobserve(isElement)
            } else {
                if (isElement.nodeName === 'DIV') {
                    isElement.dataset[options.attribute + 'Bkg'] = isElement.style.backgroundImage
                    isElement.style.backgroundImage = ''
                } else {
                    // If the element has the native loading attribute and is not a lazy element, continue
                    if (window?.lazyloadOptions?.nativeSupport && (isElement as HTMLImageElement).loading === 'lazy') continue
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
                        (isElement as HTMLImageElement).srcset = (isElement.nodeName !== 'IMG') ? fakeSrc : ''
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

    const positionObserver = new IntersectionObserver(locator)

    const lazyObserver = new IntersectionObserver(exec)

    for (const mutation of mutationsList) {

        mutation.addedNodes.forEach((node: Node) => {

            // Check if the node is a lazy element
            if (node.nodeType === 1) {

                /** @var {HTMLElement | HTMLScriptElement} isElement the element to lazy load */
                const isElement = node as HTMLElement | HTMLScriptElement

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
