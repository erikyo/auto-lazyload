import {AutoLazy, LazyloadOptions} from './types.js'
import {options} from './constants'
import {autoLazy} from './autoLazy'
import {lazyObserver, observe} from './lazyObserver'
import { unveil } from './unveil.js'

/**
 * The global options for the lazy loading function.
 */
declare global {
    export interface Window {
        autolazy: AutoLazy
    }
}

/**
 *  Start the lazy loading using the IntersectionObserver and MutationObserver
 *
 *  @type {NodeListOf<Element>} lazyElements The elements to lazy load *
 */
export default function autoLazyLoad(customOptions?: LazyloadOptions) {
    window.autolazy = {
        options: {...options, ...customOptions} // Merge the options with the default options
    } as AutoLazy
    if ('IntersectionObserver' in window && 'MutationObserver' in window) {
        new MutationObserver(autoLazy).observe(document.body, {childList: true, subtree: true})
    } else {
        console.warn('Sorry, your browser does not support automatic lazy loading')
    }
}

autoLazyLoad()

export {autoLazy, lazyObserver, observe, unveil}
