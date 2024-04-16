/**
 * The options for the lazy loading function.
 * Check the documentation for more information, don't be lazy :P
 *
 * @link https://github.com/erikyo/auto-lazyload?tab=readme-ov-file#user-configurable-options
 *
 * @example window.autolazy.options = {loading: 'my-lazy-loading', failed: 'my-lazy-failed', on: 'my-lazy', loaded: 'my-lazy-loaded', attribute: 'lazy', nativeSupport: false, root: document.body, rootMargin: "0px 0px 0px 0px", threshold: 0}
 */
export type LazyloadOptions = {
	loading?: string;
	failed?: string;
	on?: string;
	loaded?: string;
	attribute?: string;
	nativeSupport?: boolean;
	proxy?: string;
	observer?: {
		root?: HTMLElement;
		rootMargin?: string;
		threshold?: number;
	};
};

export type AutoLazy = {
	options: LazyloadOptions;
	observer: IntersectionObserver;
	unmount: () => void;
	watch: (element: HTMLElement) => void;
	update: (target: string) => void;
	unveil: (element: HTMLElement) => void;
};
