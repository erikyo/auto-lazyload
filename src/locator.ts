import {observe} from './lazyObserver'
import {isElementInViewport} from './isElementInViewport'
import {options} from './constants'
import {unveil} from './unveil'

/**
 * A function that handles intersection observer entries and manipulates DOM elements accordingly.
 *
 * @param entries - The array of intersection observer entries to process.
 * @param observer - The intersection observer instance being used.
 */
export function locator(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {

    /**
     * The IntersectionObserver instance for lazy loading
     * @type {IntersectionObserver}
     */
    const lazyloadObserver: IntersectionObserver = observe(options.observer)

    for (const entry of entries) {
        const isElement = entry.target as HTMLElement
        if (isElementInViewport(entry.boundingClientRect as DOMRect)) {
            // add the fetchpriority attribute to the element
            if (isElement.nodeName === 'IMG') {
                isElement.setAttribute('fetchpriority', 'high')
                isElement.setAttribute('decoding', 'async')

                const linkHeader = document.createElement('link')
                linkHeader.setAttribute('rel', 'preload')
                linkHeader.setAttribute('as', 'image')
                linkHeader.setAttribute('href', (isElement as HTMLImageElement).src as string)
                linkHeader.setAttribute('fetchpriority', 'high')

                document.head.appendChild(linkHeader)
            }
            // Watch the element for changes in the viewport
            observer.unobserve(isElement)
        } else {
            if (isElement.nodeName === 'DIV') {
                isElement.dataset[options.attribute + 'Bkg'] = isElement.style.getPropertyValue('background-image')
                isElement.style.setProperty('background-image', 'none')
            } else {
                // If the element has the native loading attribute and is not a lazy element, continue
                if (window?.autolazy?.options.nativeSupport && (isElement as HTMLImageElement).loading === 'lazy') continue
                // If the element is a video, add a fake src to the element as a poster image
                if (!(isElement as HTMLVideoElement).poster) {
                    // if the poster is not set, add a fake src to the element
                    (isElement as HTMLVideoElement).poster = options.fakeImage
                }
                // If the element is not a lazy element, add the src to the element
                isElement.dataset[options.attribute] = (isElement as HTMLMediaElement).src as string
                (isElement as HTMLMediaElement).src = (isElement.nodeName !== 'IMG') ? options.fakeImage : ''
                // handle the srcset attribute if it exists
                if (isElement.hasAttribute('srcset')) {
                    isElement.dataset[options.attribute + 'Srcset'] = (isElement as HTMLImageElement).srcset as string
                    (isElement as HTMLImageElement).srcset = (isElement.nodeName !== 'IMG') ? options.fakeImage : ''
                }
            }
            lazyloadObserver.observe(isElement)
        }
    }

    /**
     * The observer instance for the lazy loading function
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
     * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
     *
     * @type {IntersectionObserver}
     */
    window.autolazy.observer = lazyloadObserver

    /**
     * Update the IntersectionObserver to observe the new elements
     *
     * @param target The selector of the elements to observe
     */
    window.autolazy.update = (target?: string) => {
        const elements = document.querySelectorAll(target || '[data-lazy]')
        return elements ? elements.forEach(item => lazyloadObserver.observe(item)): null
    }

    /**
     * Watch the element for changes in the viewport
     *
     * @param element The element to watch for changes
     */
    window.autolazy.watch = (element: HTMLElement) => observer.observe(element)
    /**
     * Unveil the element if it is in the viewport
     *
     * @param element The element to unveil
     */
    window.autolazy.unveil = (element: HTMLElement) => unveil(element)

    /**
     * Unmount the IntersectionObserver
     */
    window.autolazy.unmount = () => {
        observer.disconnect()
        lazyloadObserver.disconnect()
    }
}
