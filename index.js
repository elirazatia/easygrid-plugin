/**
 * Import the UI element
 */
import _ from "./scripts/root/root"

/**
 * Make sure that selection is empty on launch
 */
window.postMessage({
    pluginMessage: {
        type: 'selectionchange',
        item: null
    }
}, '*')