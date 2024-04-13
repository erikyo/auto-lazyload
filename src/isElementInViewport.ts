/**
 * Check if an element is in the viewport
 *
 * @param {DOMRect} elBBox The element BoundingClientRect to check
 *
 * @return {boolean} True if the element is in the viewport
 */
export function isElementInViewport(elBBox: DOMRect): boolean {
    return (
        elBBox.bottom > 0 &&
        elBBox.right > 0 &&
        elBBox.left < (window.innerWidth || document.documentElement.clientWidth) &&
        elBBox.top < (window.innerHeight || document.documentElement.clientHeight)
    )
}
