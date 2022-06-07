import merging from '../../controllers/merging'
import {EVENTS} from '../../TYPES'

import applyPreview from './apply-preview'
import createMergeCell from './create-merge-cell'



var overNode;

var grabbingStartNode;
var grabbingPreviewNode;

var grabbingX;
var grabbingY;

var grabbingWidth;
var grabbingHeight;

var gridCellsContainer;
var gridMergeContainer;

function self() {
    return {

    }
}



/**
 * Applies styling (correct position and sizing) to the preview node for the merge operation
 * Called when the mouse moves to a different cell
 */
function applyPropertiesToPreviewNode() {
    applyPreview(
        grabbingPreviewNode,
        grabbingX,
        grabbingY,
        grabbingWidth,
        grabbingHeight
    )
}

/**
 * Cancel the current merger
 * @param {Boolean} deletesPreviewNode should the preview node be deleted (merge operation cancelled) or be kept (merge operation confirmed)
 */
function cancelMerge(deletesPreviewNode) {
    if (grabbingPreviewNode && deletesPreviewNode)
        grabbingPreviewNode.remove()

    grabbingPreviewNode = null
    grabbingStartNode = null

    grabbingX = null
    grabbingY = null
    grabbingWidth = null
    grabbingHeight = null

    document.dispatchEvent(new CustomEvent(EVENTS.PreviewCellGrabEnd, {
        detail:self()
    }))
}

/**
 * Apply the merge operation
 */
function applyMerge() {
    if (!grabbingPreviewNode && !grabbingStartNode)
        return
    
    grabbingStartNode.gridDescription.merged = merging.addMerge({
        x:grabbingX, y:grabbingY, width:grabbingWidth, height:grabbingHeight, preview:grabbingPreviewNode
    })
        // grabbingX,grabbingY,grabbingWidth,grabbingHeight,grabbingPreviewNode}) //{
    cancelMerge(false) 
}


export default {
    /**
     * Set the cells container from the grid-preview-ui script
     */
    set gridCellsContainer(newValue) { gridCellsContainer = newValue },
    /**
     * Set the merge container form the grid-preview-ui script
     */
    set gridMergeContainer(newValue) { gridMergeContainer = newValue },


    /**
     * Call when the user right clicks in the preview grid
     * @param {MouseEvent} e 
     */
    contextClick:(e) => {
        /**
         * Check if the user is hovering over a node, if not then return
         * Check the nodes merged status, if it is not merged then reutnr
         * 
         * Call the merging controller with the x and y coordinates of the node to clear
         */
        if (!overNode) return
        if (overNode.gridDescription.merged == null) return
    
        merging.removeMerge(overNode.gridDescription.x, overNode.gridDescription.y, overNode)
    },

    /**
     * Call when the user clicks down in the preview grid
     * @param {MouseEvent} e 
     */
    mouseDown:(e) => {
        console.log('MOUSE DOWN', e.target)
        if (e.which !== 1) return
        if (!overNode) return
        if (overNode.gridDescription.merged) return

        grabbingStartNode = overNode

        grabbingPreviewNode = createMergeCell()
        grabbingX = grabbingStartNode.gridDescription.x
        grabbingY = grabbingStartNode.gridDescription.y

        grabbingWidth = 0
        grabbingHeight = 0

        gridMergeContainer.appendChild(grabbingPreviewNode)
        applyPropertiesToPreviewNode()

        document.dispatchEvent(new CustomEvent(EVENTS.PreviewCellGrabBegin, {
            detail:self()
        }))
    },

    /**
     * Call when the user releases a click in the preview grid
     * @param {MouseEvent} e 
     */
    mouseUp:(e) => {
        console.log('MOUSE UP', e.target)
        if (e.which !== 1) return
        if (!grabbingPreviewNode && !grabbingStartNode) {
            cancelMerge(true)
        } else {
            applyMerge()
        }
    },

    /**
     * Call when the user moves the mouse within the preview grid
     * @param {MouseEvent} e 
     */
    mouseMove:(e) => {
        console.log('MOUSE MOVE', e.target)
        const newOverNode = (() => {
            const node = e.target
            return (node.gridDescription) ? node : null
        })()

        const _over = overNode
        overNode = newOverNode

        if (_over) _over.style.backgroundColor = 'unset'
        if (overNode) overNode.style.backgroundColor = '#00a2ff'
            

        if (grabbingPreviewNode && overNode) {
            grabbingWidth = (overNode.gridDescription.x) - grabbingX
            grabbingHeight = (overNode.gridDescription.y) - grabbingY

            applyPropertiesToPreviewNode()
        }
    }
}
