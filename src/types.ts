/**
 * The options for the lazy loading function.
 * Check the documentation for more information, don't be lazy :P
 *
 * @example window.lazyloadOptions = {loading: 'my-lazy-loading', failed: 'my-lazy-failed', on: 'my-lazy', loaded: 'my-lazy-loaded', attribute: 'lazy' }
 */
export type LazyloadOptions = { loading: string, failed: string, on: string, loaded: string, attribute: string, nativeSupport: boolean }

/**
 * The global options for the lazy loading function.
 */
declare global {
    export interface Window {
        lazyloadOptions: LazyloadOptions;
    }
}
