import {options} from './constants'

/**
 * Add a script tag to the page
 *
 * @param node the script node
 */
export function lazyscript(node: HTMLScriptElement) {
    const delay = Number(node.dataset[options.attribute + 'Delay']) ?? 0

    // Lazy load the script in the background after the page is loaded
    window.addEventListener('load', () => {
        const script = document.createElement('script')

        // Copy the attributes
        for (let i = 0; i < node.attributes.length; i++) {
            if (!node.attributes[i].name.includes('data-' + options.attribute))
                script.setAttribute(node.attributes[i].name, node.attributes[i].value)
        }

        // Set the src
        script.src = node.dataset[options.attribute] as string

        new Promise(resolve => setTimeout(resolve, Number(delay))).then(() => {
            // Add the script to the page in the same position as the old script node
            node.parentElement?.insertBefore(script, node)
            node.remove()
        })
    })
}
