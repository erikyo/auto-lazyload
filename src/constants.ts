import {LazyloadOptions} from './types'

/* Fake src for a small pixel image */
export const fakeSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

/**
 * The default options for the lazy loading function.
 */
const defaults = {
    loading: 'lazy-loading',
    failed: 'lazy-failed',
    on: 'lazy',
    loaded: 'lazy-loaded',
    attribute: 'lazy',
    nativeSupport: false,
    observer: {
        root: null,
        rootMargin: '0px 0px 0px 0px',
        threshold: 0
    }
}

/**
 * If needed, you can set the lazyloadOptions in the window object before the document is loaded to override the default options
 */
export const options = 'autolazy' in window
    ? {...defaults, ...window?.autolazy}
    : defaults
