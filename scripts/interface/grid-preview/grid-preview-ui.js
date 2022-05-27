import { EVENTS } from "../../TYPES"

import "../../controllers/config"
import selection from "../../controllers/selection"
import merging from "../../controllers/merging"

import previewGrabber from "./preview-grabber"
import evaluatePattern from "../../handlers/evalute-pattern"

import applyPreview from './apply-preview'
import createMergeCell from './create-merge-cell'


/**
 * Get the root grid object found in the interface and add a merge container and cells container to it
 */
const gridRoot = document.querySelector('#grid-root')

/**
 * The merge container will be used to add the merge squares in
 */
const gridMergeContainer = document.createElement('div')
gridMergeContainer.classList.add('merge-container')

/**
 * The cells container will be used to show the individual squares on the grid
 */
const gridCellsContainer = document.createElement('div')
gridCellsContainer.classList.add('cells-container')

/**
 * Add the newly created elements to the root grid
 */
gridRoot.appendChild(gridCellsContainer)
gridRoot.appendChild(gridMergeContainer)

/**
 * Assign the newly created containers to the preview grabber utility helper
 */
previewGrabber.gridCellsContainer = gridCellsContainer
previewGrabber.gridMergeContainer = gridMergeContainer


/**
 * 
 * @param {*} node 
 * @param {*} param1 
 */
const applyGridPatternToNode = (node, {xItems, yItems, xGap, yGap}) => {
    node.style.display = 'grid'
    node.style.gridTemplateColumns = xItems.map(i => `${i}px`).join(' ')
    node.style.gridTemplateRows = yItems.map(i => `${i}px`).join(' ')
    node.style.columnGap = `${xGap}px` 
    node.style.rowGap = `${yGap}px` 
    node.style.justifyContent = 'center'
}

function refreshLayout() {

    Array.from(gridMergeContainer.children).forEach(child => child.remove())
    Array.from(gridCellsContainer.children).forEach(child => child.remove())

    /**
     * If nothing is selected than set the height of the grid preview to 20px
     */
    if (selection.isSelectionEmpty()) {
        const emptyPatternOptions = { xItems:[0], yItems:[0], xGap:0, yGap:0 }
        applyGridPatternToNode(gridMergeContainer, emptyPatternOptions)
        applyGridPatternToNode(gridCellsContainer, emptyPatternOptions)
        return
    }

    /**
     * If a layer is selected than automatically assign the height using unset
     */
    gridMergeContainer.style.height = 'unset'
    gridCellsContainer.style.height = 'unset'
    gridMergeContainer.style.backgroundColor = 'unset'


    /**
     * Evalute the pattern using the given options to create the grid and cell merge previews
     */
    const pattern = evaluatePattern()

    const patternOptions = {
        xItems:pattern.column.items(true), yItems:pattern.row.items(true),
        xGap:pattern.column.gap(true), yGap:pattern.row.gap(true)
    }

    /**
     * Loop through each pattern row and create the preview node and the merged node (if cell is merged)
     */
    // var items = {}
    var y = 0
    while (y < patternOptions.yItems.length) {
        var x = 0

        /**
         * For each cell (run through y and x lengths) create a new preview cell
         * assign a border
         * check if cell is the origin of a merge
         * assigns a cellDescription variable (so that the grid preview knows what cell is being hovered on)
         * appends the child to the gridCellsContainer element
         */
        while (x < patternOptions.xItems.length) {
            const newCellNode = document.createElement('div')
            newCellNode.style.border = `1px solid #00000026`

            /**
             * Call the merging controller and fetch if cell at x,y has been merged
             * if so then create a new preview cell and call the merge controllers overridePreviewMerge function
             *     then append the new merge cell to the gridMergeContainer element
             */
            const existingMerge = merging.detailForMerge(x, y)
            if (existingMerge) {
                const newMergeCell = createMergeCell()
                merging.overridePreviewMerge(x,y,newMergeCell)

                applyPreview(newMergeCell, x,y,existingMerge.w,existingMerge.h)
                gridMergeContainer.appendChild(newMergeCell)
            }

            newCellNode.gridDescription = {
                id:(Math.random().toString()),
                x:x, y:y,
                merged:existingMerge||null
            }
            
            gridCellsContainer.appendChild(newCellNode)

            // items[x] = items[x] || []
            // items[x][y] = newCellNode

            x += 1
        }

        y += 1
    }

    applyGridPatternToNode(gridMergeContainer, patternOptions)
    applyGridPatternToNode(gridCellsContainer, patternOptions)
}

/**
 * Listen for selection chagnes or configuration changes so that the layout can be refreshed
 */
document.addEventListener(EVENTS.SelectionChanged, () => refreshLayout())
document.addEventListener(EVENTS.ConfigChanged, () => refreshLayout())
document.addEventListener(EVENTS.MergesCleared, () => refreshLayout())


/**
 * Assign default events for the correlating preview grabber utility functions
 * (Required to make the cells draggab le)
 */
document.body.addEventListener('contextmenu', (e) => previewGrabber.contextClick(e))
document.body.addEventListener('mousedown', (e) => previewGrabber.mouseDown(e))
document.body.addEventListener('mouseup', (e) => previewGrabber.mouseUp(e))
document.body.addEventListener('mousemove', (e) => previewGrabber.mouseMove(e))

/**
 * Add PreviewCellGrabBegin/End events to change the cursor to a grabber
 */
document.addEventListener(EVENTS.PreviewCellGrabBegin, () => { document.body.style.cursor = 'grabbing' })
document.addEventListener(EVENTS.PreviewCellGrabEnd, () => { document.body.style.cursor = 'auto' })


export default {
    get rootGridElement() { return gridRoot },
}