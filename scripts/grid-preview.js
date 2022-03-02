// WAITS FOR GRID_PATTERN TO CHANGE AND REFRESHES THE UI DEPENDING ON IF THERE IS ANYTHING SELECTED 

import app from "./app";
import util from "./util";

const appOptions = {
    gridElementPadding:2,
    gridElementBorderRadius:4
}

// PRESENTS THE GRIDS WITH ALL THE ITEMS IN THEM
const gridRoot = document.querySelector('#grid-root')

const gridMergeContainer = document.createElement('div')
gridMergeContainer.classList.add('merge-container')

const gridCellsContainer = document.createElement('div')
gridCellsContainer.classList.add('cells-container')

gridRoot.appendChild(gridCellsContainer)
gridRoot.appendChild(gridMergeContainer)

var items = {}

function applyPreviewPropertiesToNode(node,xPos,yPos,width,height) {
    if (!node)
        return

    xPos = parseInt(xPos)
    yPos = parseInt(yPos)
    width = parseInt(width)
    height = parseInt(height)

    const {x,y,h,w} = util.calculateFinalXYWH(
        xPos,
        yPos,
        width,
        height
    )

    node.style.gridRowStart = `${y}`
    node.style.gridRowEnd = `${y + h + 1}`
    node.style.gridColumnStart = `${x}`
    node.style.gridColumnEnd = `${x + w + 1}`
}

function createPreviewMergeNode() {
    const newEl = document.createElement('div')
    newEl.style.backgroundColor = randomColour()
    newEl.style.position = 'relative'
    newEl.style.left = `${appOptions.gridElementPadding}px`
    newEl.style.top = `${appOptions.gridElementPadding}px`
    newEl.style.width = `calc(100% - ${appOptions.gridElementPadding*2}px)`
    newEl.style.height = `calc(100% - ${appOptions.gridElementPadding*2}px)`
    newEl.style.opacity = '0.85'
    newEl.style.borderRadius = `${appOptions.gridElementBorderRadius}px`
    newEl.style.pointerEvents = 'none'
    return newEl
}

const applyGridPatternToNode = (node, { xItems, yItems, xGap, yGap }) => {
    node.style.display = 'grid'
    node.style.gridTemplateColumns = xItems.map(i => `${i}px`).join(' ')
    node.style.gridTemplateRows = yItems.map(i => `${i}px`).join(' ')
    node.style.columnGap = `${xGap}px` 
    node.style.rowGap = `${yGap}px` 
    node.style.justifyContent = 'center'
}

app.addPatternListener(newPattern => {
    Array.from(gridMergeContainer.children).forEach(child => child.remove())
    Array.from(gridCellsContainer.children).forEach(child => child.remove())

    if (newPattern.empty) {
        gridMergeContainer.style.height = '20px'
        gridCellsContainer.style.height = '20px'
        return
    }

    gridMergeContainer.style.height = 'unset'
    gridCellsContainer.style.height = 'unset'
    gridMergeContainer.style.backgroundColor = 'unset'

    items = {}

    const xItems = newPattern.column.items(true)
    const xGap = newPattern.column.gap(true)
    const yItems = newPattern.row.items(true)
    const yGap = newPattern.row.gap(true)

    const patternOptions = {
        xItems:xItems, yItems:yItems,
        xGap:xGap, yGap:yGap
    }

    applyGridPatternToNode(gridMergeContainer, patternOptions)
    applyGridPatternToNode(gridCellsContainer, patternOptions)

    var y = 0
    while (y < yItems.length) {
        var x = 0
        while (x < xItems.length) {
            const newCellNode = document.createElement('div')
            newCellNode.style.border = `1px solid #00000026`

            // get grid item from x and y positiino

            // if exists set the newCellNode.gridDescription.merged with true and create the preview cell

            const existingGridMerge = app.grids.get(x,y)
            const newGridPreviewNode = (existingGridMerge) ? createPreviewMergeNode() : null
            if (newGridPreviewNode) {
                if (existingGridMerge.previewNode && existingGridMerge.previewNode.remove)
                    existingGridMerge.previewNode.remove()
                    
                applyPreviewPropertiesToNode(newGridPreviewNode, x, y, existingGridMerge.w, existingGridMerge.h)
                app.grids.overridePreviewNode(x, y, newGridPreviewNode)
                gridMergeContainer.appendChild(newGridPreviewNode)
            }

            newCellNode.gridDescription = {
                id:(Math.random().toString()),
                x:x, y:y,
                merged:existingGridMerge
            }
            
            gridCellsContainer.appendChild(newCellNode)

            items[x] = items[x] || []
            items[x][y] = newCellNode
            x += 1
        }

        y += 1
    }
})



function randomColour() {
    const arr = [
        '#E94E3D',
        '#EF9A37',
        '#F6CD46',
        '#69C466',
        '#5FC4BD',
        '#5EAEC4',
        '#387AF6',
        '#A259D7',
        '#E9445A',
        '#9D8563' ]

    const index = Math.floor(Math.random() * (arr.length - 1))
    return `${arr[index]}AA`
}


const grabber = (function grabber() {
    var overNode;

    var grabbingStartNode;
    var grabbingPreviewNode;

    var grabbingX;
    var grabbingY;

    var grabbingWidth;
    var grabbingHeight;

    function applyPropertiesToPreviewNode() {
        applyPreviewPropertiesToNode(
            grabbingPreviewNode,
            grabbingX,
            grabbingY,
            grabbingWidth,
            grabbingHeight
        )
    }

    function cancelMerge(deletesPreviewNode) {
        if (grabbingPreviewNode && deletesPreviewNode)
            grabbingPreviewNode.remove()

        grabbingPreviewNode = null
        grabbingStartNode = null

        grabbingX = null
        grabbingY = null
        grabbingWidth = null
        grabbingHeight = null

        document.body.style.cursor = 'auto'
    }

    function applyMerge() {
        if (!grabbingPreviewNode && !grabbingStartNode)
            return
        
        grabbingStartNode.gridDescription.merged = app.grids.addMerge(
            grabbingX, grabbingY,
            grabbingWidth, grabbingHeight,
            grabbingPreviewNode
        )

        cancelMerge(false) 
    }

    return {
        contextClick:(e) => {
            if (!overNode) return
            if (overNode.gridDescription.merged == null) return

            overNode.gridDescription.merged = null
            app.grids.removeMerge(
                overNode.gridDescription.x,
                overNode.gridDescription.y
            )
        },

        mouseDown:(e) => {
            if (e.which !== 1) return
            if (!overNode) return
            if (overNode.gridDescription.merged) return

            document.body.style.cursor = 'grabbing'

            grabbingStartNode = overNode

            grabbingPreviewNode = createPreviewMergeNode()
            grabbingX = grabbingStartNode.gridDescription.x
            grabbingY = grabbingStartNode.gridDescription.y

            grabbingWidth = 0
            grabbingHeight = 0

            gridMergeContainer.appendChild(grabbingPreviewNode)
            applyPropertiesToPreviewNode()
        },

        mouseUp:(e) => {
            if (e.which !== 1) return
            if (!grabbingPreviewNode && !grabbingStartNode) {
                cancelMerge(true)
            } else {
                applyMerge()
            }
        },

        mouseMove:(e) => {
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
})()

document.body.addEventListener('contextmenu', (e) => grabber.contextClick(e))
document.body.addEventListener('mousedown', (e) => grabber.mouseDown(e))
document.body.addEventListener('mouseup', (e) => grabber.mouseUp(e))
document.body.addEventListener('mousemove', (e) => grabber.mouseMove(e))

export default {
    gridRoot:gridRoot,

    /**
     * Clears all the merges from the app
     */
    clear() {
        Object.values(items).forEach(xAxis => {
            Object.values(xAxis).forEach(cellNode => {
                cellNode.gridDescription.merged = null
            })
        })
    }
}