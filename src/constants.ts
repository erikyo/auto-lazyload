/**
 * The default options for the lazy loading function.
 */
const defaults = {
	loading: "lazy-loading",
	failed: "lazy-failed",
	on: "autolazy",
	loaded: "lazy-loaded",
	attribute: "lazy",
	nativeSupport: false,
	proxy:
		"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
	observer: {
		root: null,
		rootMargin: "0px 0px 0px 0px",
		threshold: 0,
	},
};

/**
 * If needed, you can set the lazyloadOptions in the window object before the document is loaded to override the default options
 */
export const options =
	"autolazy" in window ? { ...defaults, ...window?.autolazy } : defaults;
