import {options} from './constants'
import {unveil} from './unveil'

/**
 * Sugar for the IntersectionObserver lazy loading function
 *
 * @param options - The options for the IntersectionObserver function (defaults to { root: document.body, rootMargin: undefined, threshold: undefined })
 */
export function observe(options: IntersectionObserverInit = {}) {
    return new IntersectionObserver(lazyObserver, options)
}

/**
 * The lazy loading function that is triggered by the IntersectionObserver
 *
 * @param entries The entries from the IntersectionObserver
 * @param observer The IntersectionObserver instance
 */
export function lazyObserver(entries: IntersectionObserverEntry[], observer: IntersectionObserver): void {
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
