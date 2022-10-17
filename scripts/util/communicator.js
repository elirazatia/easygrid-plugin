/**
 * @typedef {'create-cells'|'undo'| 'save-grid'|'delete-grid'} PostType
 * @typedef {'selection'} ListenType
 */

export default {
    /**
     * 
     * @param {PostType} type 
     * @param {Object} data 
     */
    postToFigma:(type, data) => {
        parent.postMessage({
            pluginMessage:{
                type:type,
                ...data,
            }
        }, '*')
    }
}