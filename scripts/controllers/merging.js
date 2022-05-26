import { EVENTS } from "../TYPES"

var merges = {}

/**
 * Add value to merges in merges[x][y]
 * @param {Number} x 
 * @param {Number} y 
 * @param {Object} value 
 * @returns {Object}
 */
function addToMerge(x,y,value) {
    merges[x] = merges[x] || {}
    merges[x][y] = value
    console.log(`Value for ${x} - ${y} is: `, merges[x][y])

    return merges[x][y]
}

/**
 * Remove value from merges in merges[x][y]
 * @param {Number} x 
 * @param {Number} y 
 * @returns {Boolean}
 */
function removeFromMerge(x,y) {
    if (merges[x] && merges[y])
        delete merges[x][y]

    return true
}

/**
 * Get the value at merges[x][y]
 * @param {Number} x 
 * @param {Number} y 
 * @returns 
 */
function getMergeValue(x,y) {
    const mergeX = merges[x]||{}
    return mergeX[y]
}


export default {
    /**
     * Add a merger (call from the user interface when releases his mouse over the preview grid)
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} w 
     * @param {Number} h 
     * @param {HTMLElement} preview 
     * @returns 
     */
    addMerge(x,y,w,h,preview) {
        return addToMerge(x,y,{
            x:x,y:y,w:w,h:h,preview:preview
        })
    },

    /**
     * Override a merger preview cell when the UI is refreshed due to a new layer selection or due to a configuration change
     * @param {Number} x 
     * @param {Number} y 
     * @param {HTMLElement} newPreview 
     * @returns 
     */
    overridePreviewMerge(x,y,newPreview) {
        const cell = getMergeValue(x,y)
        if (!cell) return

        if (cell.preview) cell.preview.remove()
        merges[x][y].preview = newPreview

        return merges[x][y]
    },

    /**
     * Remove a merger from the grid and from storage
     * @param {Number} x 
     * @param {Number} y 
     * @param {HTMLElement} cellNode 
     * @returns {Boolean}
     */
    removeMerge(x,y,cellNode) {
        const cell = getMergeValue(x,y)
        console.log('cell valye', cell)
        if (!cell) return false
        console.log('cell valye', cell)

        console.log(cell.preview.remove)
        if (cell.preview) cell.preview.remove()

        removeFromMerge(x,y)
        cellNode.gridDescription.merged = null

        return true
    },

    /**
     * Get the details for the mergere at x,y (if exists)
     * @param {Number} x 
     * @param {Number} y 
     * @returns {MergeType}
     */
    detailForMerge(x,y) {
        return getMergeValue(x,y)
    },

    /**
     * Clear the current merges
     */
    clear() {
        merges = {}
        document.dispatchEvent(new CustomEvent(EVENTS.MergesCleared, {}))
    }
}