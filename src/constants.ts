import {LazyloadOptions} from './types'

/* Fake src for a small pixel image */
export const fakeSrc = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

/**
 * If needed, you can set the lazyloadOptions in the window object before the document is loaded to override the default options
 */
export const options = 'lazyloadOptions' in window
    ? window?.lazyloadOptions as LazyloadOptions
    : {loading: 'lazy-loading', failed: 'lazy-failed', on: 'lazy', loaded: 'lazy-loaded', attribute: 'lazy', nativeSupport: false}
