import { EVENTS, WINDOW_EVENTS } from "../TYPES"
import SavedGrid from '../models/SavedGrid'
import merging from "./merging"
import communicator from "../util/communicator"

/**
 * ##TODO: CHANGE THE INPUTS IN THE PREMADE LAYOUTS TO NEW SYNTAX FOR THE CONFIG INPUTS
 */


/**
 * The layouts made by the user that have been fetched using the window.onmessage event
 * @type {Array<SavedGrid>}
 */
var customLayouts = []

/**
 * Default premade layouts that are always availiable
 * @type {Array<SavedGrid>}
 */
const premadeLayouts = [
    {
        name: "Golden Ratio",
        id: "golden-ratio",
        inputs: {grid_columns: "13", grid_rows: "8", grid_columns_gap: "0", grid_rows_gap: "0"},
        mergedCells: [
            {x: 0, y: 0, w: 7, h: 7},
            {x: 8, y: 0, w: 4, h: 4},
            {x: 8, y: 5, w: 0, h: 0},
            {x: 8, y: 6, w: 1, h: 1},
            {x: 9, y: 5, w: 0, h: 0},
            {x: 12, y: 5, w: -2, h: 2}
        ]
    },
    {
        name: "Column Grid (12 Column)",
        id: "ipad-split",
        inputs: {grid_columns: "12", grid_rows: "1", grid_columns_gap: "6", grid_rows_gap: "0"}
    },
    {
        name: "iPad App With Sidebar",
        id: "ipad-with-sidebar",
        inputs: {grid_columns: "220pt 1", grid_rows: "1", grid_columns_gap: "0", grid_rows_gap: "0"}
    },
    {
        name: "Notch iPhone App Layout",
        id: "ios-app-layout",
        inputs: {grid_columns: "1", grid_rows: "140pt 1 83pt", grid_columns_gap: "0", grid_rows_gap: "0"}
    },
    {
        name: "Rule Of Threes",
        id: "rule-of-threes",
        inputs: {grid_columns: "3", grid_rows: "3", grid_columns_gap: "0", grid_rows_gap: "0"}
    }
]

/**
 * Listen for the FetchedPresavedFromStorage event that gets called when the localStorage is read to fetch what the user has saved
 * @param {Event} message 
 * @returns 
 */
window.addEventListener('message', (message) => {
    const data = message.data.pluginMessage

    if (data.type === WINDOW_EVENTS.FetchedPresavedFromStorage) {
        if (!data.items || !Array.isArray(data.items)) return

        customLayouts = data.items
        document.dispatchEvent(new CustomEvent(EVENTS.PresavedArrayChanged, {
            detail:[
                ...customLayouts,//premadeLayouts,
                ...premadeLayouts
            ]
        }))
    }
})

export default {
    /**
     * Gets an array with all the premade grids that are availiable, both custom and default ones
     * @returns {Array<SavedGrid>}
     */
    getPresavedGrids() {
        return [
            ...customLayouts,
            ...premadeLayouts
        ]
    },

    /**
     * Gets a presaved grid using a passed ID
     * @param {String} id 
     * @returns {SavedGrid}
     */
    getPresavedGridsWithID(id) {
        const items = [
            ...customLayouts,
            ...premadeLayouts
        ]

        var i = 0
        var found;
        while (i < items.length && found == null) {
            const cur = items[i]
            if (cur.id === id) found = cur

            i ++ 
        }

        return found || null
    },

    /**
     * Calls for the grid with the given ID to be from storage
     * @param {String} id 
     */
    removePresavedGrid(id) {
        communicator.postToFigma('delete-grid', { id:id })
    },

    /**
     * Adds the current grid layout and passed config 
     * @param {String} withName 
     * @param {Object} configOptions
     */
    addPresavedGrid(withName, configOptions) {
        // var mergedArray = []
        // Object.values(mergedCells).forEach(val => {
        //     Object.values(val).forEach(i => {
        //         const n = { ...i }]
        //         delete n.previewNode

        //         mergedArray.push(n)
        //     })
        // })

        var mergedArray = []
        merging.forEach(merge => {
            var duplicate = JSON.stringify(
                JSON.parse(merge)
            )

            delete duplicate.preview
            mergedArray.push(duplicate)
        })

        const newID = Math.random().toString().slice(3)
        const currentInput = configOptions//inputListeners.get()
        communicator.postToFigma('save-grid', {
            id:newID,
            name:withName,
            inputs:currentInput,
            mergedCells:mergedArray
        })
    },

}