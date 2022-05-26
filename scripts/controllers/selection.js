import FigmaSelection from "../models/selection"
import { EVENTS, WINDOW_EVENTS } from "../TYPES"

/**
 * @type {FigmaSelection}
 */
var selection = {}

/**
 * Checks if the current selection within the editing programme is empty
 * @returns {Boolean}
 */
const isSelectionEmpty = () => (selection.width == 0 || selection.height == 0)

const setSelection = (width, height, name) => {
    selection = (!width || !height)
        ? {width:0, height:0, name:''}
        : {width:width, height:height, name:name}

    document.dispatchEvent(new CustomEvent(EVENTS.SelectionChanged, {
        detail:(isSelectionEmpty()) ? {empty:true} : selection
    }))
}

window.addEventListener('message', (message) => {
    const data = message.data.pluginMessage

    /**
     * If the data.type of the event is selection change then call the setSelection function with the new item, or with null if there is no item
     */
    if (data.type == WINDOW_EVENTS.SelectionChanged) {
        console.log('NEW SELECTION', data)

        if (data.item) setSelection(data.item.width, data.item.height, data.item.name)
        else setSelection(null)
    }
})

export default {
    /**
     * @type {FigmaSelection}
     */
    get current() { return selection },

    isSelectionEmpty:isSelectionEmpty
}