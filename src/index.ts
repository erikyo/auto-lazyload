import {LazyloadOptions} from './types.js'
import {options} from './constants'
import {autoLazy} from './autoLazy'

/**
 *  Start the lazy loading using the IntersectionObserver and MutationObserver
 *
 *  @type {NodeListOf<Element>} lazyElements The elements to lazy load *
 */
export default function autoLazyLoad(customOptions?: LazyloadOptions) {
    window.lazyloadOptions = {...options, ...customOptions} // Merge the options with the default options
    if ('IntersectionObserver' in window && 'MutationObserver' in window) {
        new MutationObserver(autoLazy).observe(document.body, {childList: true, subtree: true})
    } else {
        console.warn('Sorry, your browser does not support automatic lazy loading')
    }
}

autoLazyLoad()
