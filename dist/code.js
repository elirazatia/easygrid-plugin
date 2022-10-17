// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
    width: 380,
    height: 614
})

/**
 * Clones an object
 * @param {Object} val 
 * @returns {Object}
 */
function clone(val) {
  return JSON.parse(JSON.stringify(val))
}

/**
 * Variable to hold the root layer currently selected in figma
 * When listening to layer changes check if the new layer array has this layer, if so then do nothing
 * If not then this means the root layer has been changed and the selected layer within the plugin should be updated
 */
var rootLayer = null

function getReplacementItems() {
    const selection = figma.currentPage.selection
    if (selection.length <= 1) {
        return []
    }

    return selection.filter(e => (e.id != rootLayer.id))
}

function dispatchCurrentSelection() {
    if (!rootLayer) 
        return figma.ui.postMessage({ type: 'selectionchange', item:null })

    const w = rootLayer.width
    const h = rootLayer.height

    figma.ui.postMessage({ type: 'selectionchange', item: {
        width:w,
        height:h,
        name:rootLayer.name
    } })
}

var previousSelection = null
var previousAppliedSelection = null

function evaluateCurrentSelection() {
    /**
     * // current selection
     * // previous selection
     * // previous applied selection
     * 
     * get the current selection
     * compare to previous selection
     *  // set previous selection to current selection
     *  if newselection is 0 and previous is more then 1
     *      // do nothing
     *  if newselection is 1
     *      // change previous applied selection to selection & root layer to the 0 layer
     *  if newselection is the same length as previous (and > 1)
     *      // compare if they are the same
     *          // no
     *              // set previous applied selection to current selection
     *          // yes
     *              // change previous applied selection to selection
     *              // set rootLayer to the rootLayer of the previous selection
     */


    const selection = figma.currentPage.selection

    var postChange = false

    if (selection.length === 0) {
        rootLayer = null
    } else if (selection.length > 0 && rootLayer == null) {
        rootLayer = selection[0]
    } else if (selection.length > 0 && rootLayer != null) {
        var doesExist = false
        selection.forEach(e => {
            if (e.id === rootLayer.id) doesExist = true
        })

        if (doesExist == false) {
            rootLayer = selection[0]
        }
    }

    if ((previousAppliedSelection && selection.length === previousAppliedSelection.length) && !(previousSelection.length === 1 && selection.length >= 2)) {
        var doesMatch = true
        var currentIDs = {}
        selection.forEach(selected => (currentIDs[selected.id] = true))
        previousAppliedSelection.selection.forEach(selected => {
            if (!currentIDs[selected.id]) doesMatch = false
        })

        if (doesMatch) {
            rootLayer = previousAppliedSelection.rootLayer
        }
    }

    /* if previousSelection length is not zero && currentSelection is greater then */
    if (selection.length >= 2) {
        previousAppliedSelection = {
            selection:selection,
            length:selection.length,
            rootLayer:rootLayer
        }
    }

    previousSelection = selection
    dispatchCurrentSelection()
}


const latestVersion = 0

function clearReleaseNotes() {
    figma.clientStorage.setAsync('@version', '')
}


function checkForReleaseNotes() {
    // USE FOR FUTURE VERSIONS
    figma.clientStorage.getAsync('@version').then(value => {
        var showNote = false
        value = (typeof(value) === 'number') ? value : -1
        if (value < latestVersion) {
            showNote = true
            figma.clientStorage.setAsync('@version', latestVersion).catch(error => { console.error('error', error) })
        } 

        if (showNote) {
            figma.ui.postMessage({ type: 'fetch-release-notes', note:true })
        }
    })
}

/**
 * Called when a selecion change event occurs
 * @returns {void}
 */
function postSelection() {
    const selection = figma.currentPage.selection[0]
    if (!selection) 
        return figma.ui.postMessage({ type: 'selectionchange', item:null })

    const w = selection.width;
    const h = selection.height;

    figma.ui.postMessage({ type: 'selectionchange', item: {
        width:w,
        height:h,
        name:selection.name
    } })
}

/**
 * Converts a hex colour to an RGB object (0-255)
 * @param {String} hex
 * @returns {{r:Number, g:Number, b:Number}} RGB values
 */
function hexToRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null
}

/**
 * Gets the grids saved by the user
 */
function getSavedGrids() {
    figma.clientStorage.getAsync('@presaved').then(val => {
        figma.ui.postMessage({ type: 'presaved-fetched', items:val||[] })
    })
}

getSavedGrids()


/**
 * Call on a UI message and evaluate the message
 */
figma.ui.onmessage = (message => {
    if (!rootLayer)
        return

    if (message.type === 'save-grid') {
        const id = message.id
        const name = message.name
        const inputs = message.inputs
        const mergedCells = message.mergedCells

        figma.clientStorage.getAsync('@presaved').then(val => {
            const valueForSave = { id:id, name:name, inputs:inputs, mergedCells:mergedCells, isCustomMade:true }
            if (val && Array.isArray(val)) val.push(valueForSave)
            else val = [valueForSave]

            figma.clientStorage.setAsync('@presaved', val)
                .then(() => getSavedGrids())
        })

    } else if (message.type === 'delete-grid') {
        figma.clientStorage.getAsync('@presaved').then(val => {
            if (val && Array.isArray(val)) {
                val = val.filter(i => (i.id != message.id))
            }

            figma.clientStorage.setAsync('@presaved', val)
                .then(() => getSavedGrids())
        })
    } else if (message.type === 'create-cells') {
        var items = []

        const colour = hexToRGB(message.colour)
        const shouldReplace = message.replaceSelected

        const replacementItems = getReplacementItems()

        var offsetX = 0
        var offsetY = 0
        var parent = rootLayer
        while (parent && !parent.appendChild) {
            offsetX += parent.x
            offsetY += parent.y
            parent = parent.parent
        }

        var replacementModeIndex = 0
        message.items.forEach(item => {
            var r = (() => {
                if (replacementItems.length > 0) {
                    const element = replacementItems[replacementModeIndex]
                    const node = (element.createInstance) ? element.createInstance() : element.clone()

                    replacementModeIndex += 1
                    if (replacementModeIndex >= replacementItems.length)
                        replacementModeIndex = 0

                    return node
                } else {
                    const rectangle = figma.createRectangle()
                    
                    const fills = clone(rectangle.fills)
                    fills[0].color.r = (colour.r / 255)
                    fills[0].color.g = (colour.g / 255)
                    fills[0].color.b = (colour.b / 255)
                    fills[0].opacity = 0.6

                    rectangle.fills = fills

                    return rectangle
                }
            })()
            
            parent.appendChild(r)

            r.x = item.x + offsetX
            r.y = item.y + offsetY
            r.resize(
                item.width,
                item.height
            )

            items.push(r)
        })

        const group = figma.group(items, parent)

        if (shouldReplace) {
            if (rootLayer && rootLayer.remove)
                rootLayer.remove()
        }
    }
})

figma.on("selectionchange", () => evaluateCurrentSelection())

evaluateCurrentSelection()
checkForReleaseNotes()