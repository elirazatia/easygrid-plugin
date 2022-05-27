import { Merger, PreviewMerger } from "../models/Merger"
import { EVENTS } from "../TYPES"

var merges = {}

/**
 * Add value to merges in merges[x][y]
 * @param {PreviewMerger} context
 * @returns {PreviewMerger}
 */
function addToMerge(context) {
    const x = context.x
    const y = context.y
    merges[x] = merges[x] || {}
    merges[x][y] = context
    // console.log(`Value for ${x} - ${y} is: `, merges[x][y])

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

    if (Object.keys(merges[x]).length === 0)
        delete merges[x]
        
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
     * @param {PreviewMerger} context
     * @returns {PreviewMerger}
     */
    addMerge(context) {
        return addToMerge(context)
        // return addToMerge(x,y,{
        //     x:x,y:y,w:w,h:h,preview:preview
        // })
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
        if (!cell) return false

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
     * @returns {PreviewMerger}
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
    },

    /**
     * Has the user merged any grid cells?
     * @returns {Boolean} True if the user has merged cells
     */
    doesIncludeMerges() {
        return (Object.keys(merges).length > 0)
    },

    /**
     * 
     * @param {function(Merger):void} callback 
     * @returns 
     */
    forEach(callback) {
        if (!callback.call) return
        Object.values(merges).map(yValue => Object.values(yValue)).flat().forEach(i => callback(i))
    }
}