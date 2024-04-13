import {options} from './constants'

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
            (lazyElement as HTMLImageElement).srcset = lazyElement.dataset[options.attribute + 'Srcset']  as string
            lazyElement.removeAttribute('data-' + options.attribute + '-srcset')
        }
    }
    // Remove the data-lazy attribute
    if ('data-' + options.attribute in lazyElement.dataset) lazyElement.removeAttribute('data-' + options.attribute)
}
