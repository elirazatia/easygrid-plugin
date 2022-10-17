/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./scripts/TYPES.js
/**
 * Possible app events
 */
const EVENTS = {
    SelectionChanged:'SelectionChanged',
    ConfigChanged:'ConfigChanged',
    PresavedArrayChanged:'PresavedArrayChanged',

    PreviewCellGrabBegin:'PreviewCellGrabBegin',
    PreviewCellGrabEnd:'PreviewCellGrabEnd',

    MergesCleared:'MergesCleared'
}

/**
 * Possible events that can be sent from the Figma code.js file
 */
const WINDOW_EVENTS = {
    SelectionChanged:'selectionchange',
    FetchedPresavedFromStorage:'presaved-fetched'
}

/**
 * Generic options that are used throughout the app
 */
const OPTIONS = {
    GridPadding:2,
    GridCornerRadius:4
}


;// CONCATENATED MODULE: ./scripts/handlers/expand-grid.js
/**
 * Expand layout string and given option into an array that includes the width (in px) for each item
 * It also returns the gap space (can change is useAppliedSize is true)
 * @param {{ pattern:String, realSize:Number, appliedSize:Number, useAppliedSize:Boolean }}
 * @returns {{ gap:function(Boolean):Number, items:function(Boolean):Array<Number> }}
 */
 /* harmony default export */ const expand_grid = (({ pattern, gap, realSize, appliedSize }) => {
	gap = parseInt(gap)
	realSize = parseInt(realSize)
	appliedSize = parseInt(appliedSize)

	const isValidElement = /^(auto|([0-9|%]+)(pt)?)(\*[0-9]+)?$/

	var elements = []
	const split = pattern.split(' ')

	/**
	 * Make sure every item in the pattern in valid and occurs as many times as needed
	 * (Based if the item has a multiplier or not)
	 */
	split.forEach(item => {
		if (!isValidElement.test(item)) return

		const split = item.split('*')

		const value = split[0]
		const multiplier = split[1] || 1

		var i = 0
		while (i < multiplier) {
			elements.push(value)
			i ++
		}
	})

	/**
	 * check if items are empty, if so make a single item, if items only contain one item then use that value as the amount of columns/rows
	 */
	if (elements.length === 0) {
        elements.push(1)
    } else if (elements.length === 1) {
        const elementZero = elements[0]

        const asNumber = parseInt(elementZero)
		const isDirectPoint = elementZero.indexOf('pt')
        if (!isNaN(asNumber) && isDirectPoint == -1) {
			elements = []
			var i = 0
            while(i < asNumber) {
                elements.push(1)
                i ++
            }
        }
    }


	/** * The final array of items (in real sizes) */
	const array = (() => {
		var usedSpace = 0
        var totalFractions = 0

        var items = {}

		/**
		 * Checks a text value and see if it is a fraction or a direct number point, and an integrer based number value
		 * @param {String} element a part of the config values, for example a grid_column input of 1 1 1 would result in expand being called 3 times with '1' as the element argument
		 * @returns {{numberValue:String, isDirectPoint:Boolean}} numberValue is the real figma screen value for the passed element
		 */
		function expand(element) {
			element = element.toString()
            const replaced = element.replace('pt', '')
            const isDirectPoint = (element !== replaced)

            element = (isDirectPoint) ? element.replace('pt', '') : element
            const numberValue = parseInt(element)

            return { numberValue:numberValue, isDirectPoint:isDirectPoint }
		}

		// Evaluates the given numberValue as a whole number
		function evaluateAsWholeNumber(i, numberValue) {
			usedSpace += numberValue
            items[i] = numberValue
		}

		// Evaluates the given numberValue as a franction
		function evaluateAsFraction(i, numberValue) {
			const availiableSpace = (realSize - usedSpace) - ((elements.length - 1) * gap)
            const columnWidth = (availiableSpace / totalFractions)
            items[i] = (columnWidth * numberValue)
		}

		var index = 0
		var evaluatingAs = 0
		while (index < elements.length) {
			const element = elements[index]
			const { isDirectPoint, numberValue } = expand(element)

			index += 1
			if (evaluatingAs === 0) {
				if (isDirectPoint) evaluateAsWholeNumber((index - 1), numberValue)
				else totalFractions += numberValue
			} else if (!isDirectPoint && evaluatingAs === 1) {
				evaluateAsFraction((index - 1), numberValue)
			}

			if (index === (elements.length) && evaluatingAs === 0) {
				evaluatingAs = 1
				index = 0
			}
		}
		
		return items
	})()

	const nearestDecimal = (val) => (Math.round(val * 100) / 100)
	return {
		gap:((useAppliedSize) => {
			if (useAppliedSize) return nearestDecimal((appliedSize / realSize) * gap)
			return gap
		}),
		items:((useAppliedSize) => {
			return Object.keys(array).sort((a,b) => (a > b)).map(i => {
				const val = array[i]
				if (useAppliedSize) return nearestDecimal((appliedSize / realSize) * val)
				return val
			})
		})
	}
});
;// CONCATENATED MODULE: ./scripts/controllers/selection.js



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
        if (data.item) setSelection(data.item.width, data.item.height, data.item.name)
        else setSelection(null)
    }
})

/* harmony default export */ const controllers_selection = ({
    /**
     * @type {FigmaSelection}
     */
    get current() { return selection },

    isSelectionEmpty:isSelectionEmpty
});
;// CONCATENATED MODULE: ./scripts/controllers/config.js


/**
 * The default configuration values
 * @type {CREATE_CONFIG_TYPE}
 *  ##TODO: Create the cCREATE_COMFIG_TYPE class
 */
const configValues = {
    grid_columns:'5',
    grid_columns_gap:'0',
    grid_rows:'2',
    grid_rows_gap:'0'
}

/**
 * Listen for changes in the user interface and change the stored values accordingly
 */
document.addEventListener(EVENTS.ConfigChanged, (e) => {
    let detail = e.detail
    let detailfor = detail['for']
    let detailNewValue = detail['newValue']
    if (!detailfor || !detailNewValue) return

    configValues[detailfor] = detailNewValue
})

/* harmony default export */ const config = ({
    /**
     * Get all the configuration options
     * @returns {Object<String,String>}
     */
    getAll() {
        return configValues
    },

    /**
     * Override the configu values with new ones and dispatch and event that the config values have been changed
     * @param {Object<String, String>} withValues 
     */
    setAll(withValues) {
        Object.keys(configValues).forEach(key => {
            configValues[key] = withValues[key] || configValues[key]
            const value = configValues[key]
            document.dispatchEvent(new CustomEvent(EVENTS.ConfigChanged, {
                detail:{for:key, newValue:value}
            }))
        })
    },
    
    /**
     * Get the configuration option for 'key'
     * @param {String} key 
     * @returns {String}
     */
    getValue(key) { 
        return configValues[key] || null
    },

    /**
     * Set a configuration value manually
     * @param {String} key 
     * @param {String} newValue 
     * @returns 
     */
    setValue(key, newValue) {
        configValues[key] = newValue
        return configValues[key]
    }
});
;// CONCATENATED MODULE: ./scripts/controllers/merging.js



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


/* harmony default export */ const merging = ({
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
        Object.values(merges).map(yValue => Object.values(yValue)).flat().forEach(i => callback({
            x:i.x, y:i.y, w:i.width, h:i.height
        }))
    }
});
;// CONCATENATED MODULE: ./scripts/util/calculate-xyhw.js
/**
 * Calculates the final x,y, width, and height based on the given properties
 * use when merging cells for cases such as width being -1 or -2 requiring offset but without changing the starting cell
 */
/* harmony default export */ const calculate_xyhw = ((x,y,w,h) => {
    if (w < 0) {
        w = Math.abs(w)
        x -= w
    }

    if (h < 0) {
        h = Math.abs(h)
        y -= h
    }

    x = x + 1
    y = y + 1

    return {
        x:x,y:y,h:h,w:w
    }
});
;// CONCATENATED MODULE: ./scripts/interface/grid-preview/apply-preview.js
// import util from "../../util"


function applyPreviewPropertiesToNode(node,xPos,yPos,width,height) {
    if (!node) return

    xPos = parseInt(xPos)
    yPos = parseInt(yPos)
    width = parseInt(width)
    height = parseInt(height)

    const {x,y,h,w} = calculate_xyhw(
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

;// CONCATENATED MODULE: ./scripts/interface/grid-preview/create-merge-cell.js


/**
 * Generates a random colour from TYPES.PREVIEW_COLORS to be used with a preview cell node
 * @returns {String} a hex code to use as a random colour
 */
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

/**
 * Creates a node that will be used a preview for the merge operation
 * @returns {HTMLElement}
 */
function createPreviewMergeNode() {
    const node = document.createElement('div')
    node.style.backgroundColor = randomColour()
    node.style.position = 'relative'
    node.style.left = `${OPTIONS.GridPadding}px`
    node.style.top = `${OPTIONS.GridPadding}px`
    node.style.width = `calc(100% - ${OPTIONS.GridPadding*2}px)`
    node.style.height = `calc(100% - ${OPTIONS.GridPadding*2}px)`
    node.style.opacity = '0.85'
    node.style.borderRadius = `${OPTIONS.GridCornerRadius}px`
    node.style.pointerEvents = 'none'

    return node
}
;// CONCATENATED MODULE: ./scripts/interface/grid-preview/preview-grabber.js








var overNode;

var grabbingStartNode;
var grabbingPreviewNode;

var grabbingX;
var grabbingY;

var grabbingWidth;
var grabbingHeight;

var gridCellsContainer;
var gridMergeContainer;

function preview_grabber_self() {
    return {

    }
}



/**
 * Applies styling (correct position and sizing) to the preview node for the merge operation
 * Called when the mouse moves to a different cell
 */
function applyPropertiesToPreviewNode() {
    applyPreviewPropertiesToNode(
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
        detail:preview_grabber_self()
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


/* harmony default export */ const preview_grabber = ({
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
        if (e.which !== 1) return
        if (!overNode) return
        if (overNode.gridDescription.merged) return

        grabbingStartNode = overNode

        grabbingPreviewNode = createPreviewMergeNode()
        grabbingX = grabbingStartNode.gridDescription.x
        grabbingY = grabbingStartNode.gridDescription.y

        grabbingWidth = 0
        grabbingHeight = 0

        gridMergeContainer.appendChild(grabbingPreviewNode)
        applyPropertiesToPreviewNode()

        document.dispatchEvent(new CustomEvent(EVENTS.PreviewCellGrabBegin, {
            detail:preview_grabber_self()
        }))
    },

    /**
     * Call when the user releases a click in the preview grid
     * @param {MouseEvent} e 
     */
    mouseUp:(e) => {
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
});

;// CONCATENATED MODULE: ./scripts/interface/grid-preview/grid-preview-ui.js













/**
 * Get the root grid object found in the interface and add a merge container and cells container to it
 */
const gridRoot = document.querySelector('#grid-root')

/**
 * The merge container will be used to add the merge squares in
 */
const grid_preview_ui_gridMergeContainer = document.createElement('div')
grid_preview_ui_gridMergeContainer.classList.add('merge-container')

/**
 * The cells container will be used to show the individual squares on the grid
 */
const grid_preview_ui_gridCellsContainer = document.createElement('div')
grid_preview_ui_gridCellsContainer.classList.add('cells-container')

/**
 * Add the newly created elements to the root grid
 */
gridRoot.appendChild(grid_preview_ui_gridCellsContainer)
gridRoot.appendChild(grid_preview_ui_gridMergeContainer)

/**
 * Assign the newly created containers to the preview grabber utility helper
 */
preview_grabber.gridCellsContainer = grid_preview_ui_gridCellsContainer
preview_grabber.gridMergeContainer = grid_preview_ui_gridMergeContainer


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

    Array.from(grid_preview_ui_gridMergeContainer.children).forEach(child => child.remove())
    Array.from(grid_preview_ui_gridCellsContainer.children).forEach(child => child.remove())

    /**
     * If nothing is selected than set the height of the grid preview to 20px
     */
    if (controllers_selection.isSelectionEmpty()) {
        const emptyPatternOptions = { xItems:[0], yItems:[0], xGap:0, yGap:0 }
        applyGridPatternToNode(grid_preview_ui_gridMergeContainer, emptyPatternOptions)
        applyGridPatternToNode(grid_preview_ui_gridCellsContainer, emptyPatternOptions)
        return
    }

    /**
     * If a layer is selected than automatically assign the height using unset
     */
    grid_preview_ui_gridMergeContainer.style.height = 'unset'
    grid_preview_ui_gridCellsContainer.style.height = 'unset'
    grid_preview_ui_gridMergeContainer.style.backgroundColor = 'unset'


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
                const newMergeCell = createPreviewMergeNode()
                merging.overridePreviewMerge(x,y,newMergeCell)

                applyPreviewPropertiesToNode(newMergeCell, x,y,existingMerge.w,existingMerge.h)
                grid_preview_ui_gridMergeContainer.appendChild(newMergeCell)
            }

            newCellNode.gridDescription = {
                id:(Math.random().toString()),
                x:x, y:y,
                merged:existingMerge||null
            }
            
            grid_preview_ui_gridCellsContainer.appendChild(newCellNode)

            x += 1
        }

        y += 1
    }

    applyGridPatternToNode(grid_preview_ui_gridMergeContainer, patternOptions)
    applyGridPatternToNode(grid_preview_ui_gridCellsContainer, patternOptions)
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
document.body.addEventListener('contextmenu', (e) => preview_grabber.contextClick(e))
document.body.addEventListener('mousedown', (e) => preview_grabber.mouseDown(e))
document.body.addEventListener('mouseup', (e) => preview_grabber.mouseUp(e))
document.body.addEventListener('mousemove', (e) => preview_grabber.mouseMove(e))

/**
 * Add PreviewCellGrabBegin/End events to change the cursor to a grabber
 */
document.addEventListener(EVENTS.PreviewCellGrabBegin, () => { document.body.style.cursor = 'grabbing' })
document.addEventListener(EVENTS.PreviewCellGrabEnd, () => { document.body.style.cursor = 'auto' })


/* harmony default export */ const grid_preview_ui = ({
    get rootGridElement() { return gridRoot },
});
;// CONCATENATED MODULE: ./scripts/handlers/evalute-pattern.js







/**
 * Converts the Figma layer selection, the configuration (rows, columns, and gap inputs) and the container that previews the grid to return an array of every cell and their respective size
 * @param {FigmaSelection} selection 
 */
function evaluatePattern() {
    var w = controllers_selection.current.width
    var h = controllers_selection.current.height

    const configValues = config.getAll()
    const patternContainer = grid_preview_ui.rootGridElement

    /**
     * Get the ratio of the selected element by dividing its width by its height
     * If the ratio is smaller than one (is portrait) then set the height to 300 points and calculate the new width based on the aspect ratio
     * If the ratio is larger than one (is horizontal) then set the width to the maximum width for the grid preview element and then set the height based on the aspect ratio
     */
    const ratio = w / h
    if (ratio < 1) {
        h = 300
        w = h * ratio
    } else {
        w = patternContainer.getBoundingClientRect().width
        h = w / ratio
    }

    return {
        column:expand_grid({
            pattern:configValues.grid_columns,
            gap:configValues.grid_columns_gap,
            realSize:controllers_selection.current.width,
            appliedSize:w
        }),
        row:expand_grid({
            pattern:configValues.grid_rows,
            gap:configValues.grid_rows_gap,
            realSize:controllers_selection.current.height,
            appliedSize:h
        })
    }
}
;// CONCATENATED MODULE: ./scripts/util/communicator.js
/**
 * @typedef {'create-cells'|'undo'| 'save-grid'|'delete-grid'} PostType
 * @typedef {'selection'} ListenType
 */

/* harmony default export */ const communicator = ({
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
});
;// CONCATENATED MODULE: ./scripts/controllers/save-grid.js





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

/* harmony default export */ const save_grid = ({
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
        var mergedArray = []
        merging.forEach(merge => {
            var duplicate = JSON.stringify(
                JSON.parse(merge)
            )

            delete duplicate.preview
            mergedArray.push(duplicate)
        })

        const newID = Math.random().toString().slice(3)
        const currentInput = configOptions
        communicator.postToFigma('save-grid', {
            id:newID,
            name:withName,
            inputs:currentInput,
            mergedCells:mergedArray
        })
    },

});
;// CONCATENATED MODULE: ./scripts/controllers/to-element.js






/**
 * Pushes the layout to the figma layer selected by calculating where it should go and creating an array of the final new layers (each cell)
 * @param {{xItems:Array<Number>, yItems:Array<Number>, xGap:Number, yGap:Number}} param0 
 * @param {{ colour:String, replaceSelected:Boolean }} options 
 */
/* harmony default export */ function to_element({xItems, yItems, xGap, yGap}, options) {
    var finalItems = []
    var currentXPosition = 0
    var currentYPosition = 0

    /** * Check if the user has merged, if so then create the grid differently */
    if (merging.doesIncludeMerges()) {
        /** * Loop thorugh every merger */
        merging.forEach(merge => {
            const finalPlacement = calculate_xyhw(merge.x, merge.y, merge.w, merge.h)
            finalPlacement.x = finalPlacement.x - 1
            finalPlacement.y = finalPlacement.y - 1

            function getPoint(arr, gap, index, inclusive) {
                var current = 0
                var i = 0
                var hasFinished = false
    
                while (!hasFinished) {
                    if (i === index) {
                        if (inclusive) current += arr[i]
                        hasFinished = true
                    } else { current += arr[i] + gap }
                    i ++
                }
    
                return current
            }

            const startX = getPoint(xItems, xGap, finalPlacement.x, false)
            const startY = getPoint(yItems, yGap, finalPlacement.y, false)
            const endX = getPoint(xItems, xGap, finalPlacement.x + finalPlacement.w, true)
            const endY = getPoint(yItems, yGap, finalPlacement.y + finalPlacement.h, true)
            const width = endX - startX
            const height = endY - startY
            
            finalItems.push({
                x:startX, y:startY,
                width:width, height:height,
            })    
        })
    } else {
        var yIndex = 0
        while (yIndex < yItems.length) {
            var xIndex = 0
            currentXPosition = 0
            const currentYItem = yItems[yIndex]
            while (xIndex < xItems.length) {
                const currentXItem = xItems[xIndex]
                finalItems.push({
                    x:currentXPosition, y:currentYPosition,
                    width:currentXItem, height:currentYItem,
                })

                currentXPosition += (currentXItem + xGap)
                xIndex ++
            }

            currentYPosition += (currentYItem + xGap)
            yIndex ++
        }
    }

    communicator.postToFigma('create-cells', {
        id:Math.random().toString().slice(4),
        items:finalItems,

        ...options
    })
}
;// CONCATENATED MODULE: ./scripts/interface/config-ui.js



/**
 * Get the inputs for the configuration panel
 */
const inputs = {
    grid_columns:document.querySelector('#grid-columns'),
    grid_columns_gap:document.querySelector('#grid-columns-gap'),
    grid_rows:document.querySelector('#grid-rows'),
    grid_rows_gap:document.querySelector('#grid-rows-gap')
}

/**
 * For each input set its value to the value set as default from the config controller
 */
Object.keys(inputs).forEach(key => 
    inputs[key].value = config.getValue(key)
)

/**
 * Listen for input changes within the document
 */
document.addEventListener('change', (e) => {
    /**
     * If the events target has an attribute of config then call an EVENTS.ConfigChanged event that will post to the config controller
     */
    const configAttribute = e.target.getAttribute('config')
    if (configAttribute == null) return

    document.dispatchEvent(new CustomEvent(EVENTS.ConfigChanged, {
        detail:{
            for:configAttribute,
            newValue:e.target.value
        }
    }))
})

/**
 * Listen for EVENTS.ConfigChanged to keep both the UI and config controller in sync
 */
document.addEventListener(EVENTS.ConfigChanged, (e) => {
    let detail = e.detail
    let detailfor = detail['for']
    let detailNewValue = detail['newValue']
    if (!detailfor || !detailNewValue) return

    inputs[detailfor].value = detailNewValue
})
;// CONCATENATED MODULE: ./scripts/interface/help-button.js
/**
 * Configures the help menu
 */
 const helpSection = document.querySelector('.help-screen')
 const helpSectionOpenButton = document.querySelector('.help-button')
 const helpSectionCloseButton = document.querySelector('.help-screen .button')
 
 /** * Listen for click on the help button to open the helpSection */
 helpSectionOpenButton.addEventListener('click', () => {
     helpSection.classList.add('opening')
 })
 
 /** * Listen for a click on the close button to close the help section */
 helpSectionCloseButton.addEventListener('click', () => {
     /** * Called on the animationend event, removes the class that sets the closing animation and remove the listener */
     function e() {
         helpSection.classList.remove('closing')
         helpSection.removeEventListener('animationend', e)
     }
 
     helpSection.classList.remove('opening')
     helpSection.classList.add('closing')
 
     helpSection.addEventListener('animationend', e)
 })

 
;// CONCATENATED MODULE: ./scripts/interface/overlay-ui.js
/**
 * A function to close and send a reject Promise to the open overlay
 * @type {function():void}
 */
var currentOverlay = null

/**
 * The SVG path to create a trsah icon SVG for the itemArrayOverlay
 */
const trashIcon = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M155.148 482H356.626C369.59 482 379.917 478.387 387.605 471.161C395.293 463.935 399.439 453.925 400.042 441.129L414.061 126.129H447.302C451.372 126.129 454.839 124.699 457.704 121.839C460.568 118.978 462 115.516 462 111.452C462 107.387 460.568 103.925 457.704 101.065C454.839 98.2043 451.372 96.7742 447.302 96.7742H64.472C60.5525 96.7742 57.1606 98.2043 54.2964 101.065C51.4321 103.925 50 107.387 50 111.452C50 115.516 51.4321 118.978 54.2964 121.839C57.1606 124.699 60.5525 126.129 64.472 126.129H97.9385L112.184 441.129C112.787 453.925 116.858 463.935 124.395 471.161C132.083 478.387 142.334 482 155.148 482ZM188.615 420.806C185.147 420.806 182.283 419.753 180.022 417.645C177.761 415.538 176.555 412.753 176.404 409.29L169.846 174.226C169.696 170.763 170.751 167.978 173.012 165.871C175.273 163.613 178.288 162.484 182.057 162.484C185.524 162.484 188.389 163.538 190.65 165.645C192.911 167.753 194.117 170.613 194.268 174.226L200.825 409.065C200.976 412.527 199.921 415.387 197.66 417.645C195.398 419.753 192.383 420.806 188.615 420.806ZM256 420.806C252.231 420.806 249.141 419.753 246.729 417.645C244.468 415.387 243.337 412.527 243.337 409.065V174.226C243.337 170.763 244.468 167.978 246.729 165.871C249.141 163.613 252.231 162.484 256 162.484C259.769 162.484 262.784 163.613 265.045 165.871C267.457 167.978 268.663 170.763 268.663 174.226V409.065C268.663 412.527 267.457 415.387 265.045 417.645C262.784 419.753 259.769 420.806 256 420.806ZM323.159 420.806C319.39 420.806 316.375 419.753 314.114 417.645C312.004 415.387 310.948 412.602 310.948 409.29L317.732 174.226C317.883 170.613 319.089 167.753 321.35 165.645C323.611 163.538 326.476 162.484 329.943 162.484C333.712 162.484 336.727 163.613 338.988 165.871C341.249 167.978 342.304 170.763 342.154 174.226L335.37 409.516C335.37 412.828 334.239 415.538 331.978 417.645C329.717 419.753 326.777 420.806 323.159 420.806ZM161.027 103.323H196.077V65.1613C196.077 59.2903 197.886 54.6237 201.504 51.1613C205.273 47.6989 210.323 45.9677 216.654 45.9677H294.894C301.225 45.9677 306.2 47.6989 309.818 51.1613C313.587 54.6237 315.471 59.2903 315.471 65.1613V103.323H350.52V63.3548C350.52 47.6989 345.696 35.4301 336.048 26.5484C326.551 17.5161 313.436 13 296.703 13H214.619C198.037 13 184.921 17.5161 175.273 26.5484C165.776 35.4301 161.027 47.6989 161.027 63.3548V103.323Z" fill="#EF453B"/>
</svg>`


/**
 * Define a type for the input options that the openOverlay function takes
 * use when creating overlay UI items or when calling the openOverlay function
 * @typedef {{ title:String, classList:Array<String>, includeCancelButton:Boolean, includeCancelButton:Boolean, body:function():Array<HTMLElement>, onConfirm:function(HTMLElement):any }} OverlayOptions
 */


/**
 * An overlay option that provides the user with an ability to enter a text and confirm
 * used when saving grids
 * @returns {OverlayOptions}
 */
function inputOverlay() {
    return {
        title:'Save Grid As...',
        classList:['equally-divided'],
        includeConfirmButton:true,
        includeCancelButton:true,
        body:() => {
            const input = document.createElement('input')
            input.placeholder = 'Enter value...'
            
            return [input]
        },
        onConfirm:(body) => {
            const input = body.querySelector('input')
            const val = input.value
            if (val.trim() === '') return null
            return val
        }
    }
}

/**
 * An overlay option that provides the user the ability to edit and delete items in a list
 * used when editing previuly saved grids
 * @param {Array<{id:String, name:String}>} items
 * @param {function(string):void} remove
 * @returns {OverlayOptions}
 */
 function itemArrayOverlay(items, remove) {
    return {
        title:'Edit Saved Items',
        classList:['flex'],
        includeCancelButton:true,
        onConfirm:(body) => { return null },
        body:() => {
            const list = document.createElement('ul')
            list.style = 'list-style: none; width: 100%; height: 100%; padding: 0 12px 12px 12px; margin: 0; box-sizing: border-box'
                
            items.forEach(item => {
                const view = document.createElement('li')
                view.style = 'display:flex; padding: 16px; border-bottom: 1px solid black; align-items: center; background-color: #ffffff3b; border-radius: 6px; margin-bottom: 6px'
    
                const label = document.createElement('span')
                label.innerText = item.name//'View Name'
                label.style = 'flex-grow: 100; color: white'
    
                const deleteButton = document.createElement('svg')
                deleteButton.style = 'width: 22px; height: 22px; cursur: pointer'
                deleteButton.innerHTML = trashIcon
    
                const rightContainer = document.createElement('div')
                rightContainer.appendChild(deleteButton)
    
                view.appendChild(label)
                view.appendChild(rightContainer)
                list.appendChild(view)
    
                deleteButton.addEventListener('click', () => {
                    view.remove()
                    remove(item.id)
                })
            })    

            return [list]
        }
    }
}


/**
 * Closes the current overlay (if open)
 */
function closeOverlay() {
    if (currentOverlay) { currentOverlay() }
}

/**
 * Creates an overlay that the user can enter an input into.
 * @param {OverlayOptions} data 
 * @returns {Promise<String>} The input provided by the user
 */
function openOverlay(data) {
    /**
     * The part below constructs the overlay elements
     * Check out the Elements part of the Figma console to see what is going on here
     */
    const overlay = document.createElement('div')
    overlay.classList.add('input-overlay')
    overlay.classList.add('opening')
    data.classList.forEach(item => overlay.classList.add(item))

    const title = document.createElement('span')
    title.innerText = data.title
    title.classList.add('title')

    const topContainer = document.createElement('div')
    topContainer.classList.add('top-container')

    const bottomContainer = document.createElement('div')
    bottomContainer.classList.add('bottom-container')

    const confirmButton = document.createElement('span')
    confirmButton.id = 'confirm-button'
    confirmButton.innerText = 'Save Grid'

    const cancelButton = document.createElement('span')
    cancelButton.id = 'cancel-button'
    cancelButton.innerText = 'Cancel'

    overlay.appendChild(topContainer)
    overlay.appendChild(bottomContainer)

    topContainer.appendChild(title)
    document.body.appendChild(overlay)

    if (data.includeConfirmButton) bottomContainer.appendChild(confirmButton)
    if (data.includeCancelButton) bottomContainer.appendChild(cancelButton)

    const body = data.body()
    body.forEach(element => topContainer.appendChild(element))

    /** * Return a promise that is resolved when the user selects a value */
    return new Promise((resolve, reject) => {
        currentOverlay = (() => reject())

        cancelButton.addEventListener('click', () => reject())
        confirmButton.addEventListener('click', () => {
            const res = data.onConfirm(topContainer) //valueGetter()
            if (res) resolve(res)
        })
    }).finally(() => {
        overlay.classList.remove('opening')
        overlay.classList.add('closing')
        setTimeout(() => overlay.remove(), 290)
    })
}

/* harmony default export */ const overlay_ui = ({
    openOverlay: openOverlay,
    closeOverlay: closeOverlay
});


;// CONCATENATED MODULE: ./scripts/interface/save-dropdown.js






/**
 * Configure the buttons and dropdown that let the user select premade grids
 */
const selectSavedButton = document.querySelector('#select-saved')
const selectSavedDropdown = document.querySelector('#select-saved select')

/** * Simulate a click on the dropdown item if clicked on the dropdown button */
selectSavedButton.addEventListener('click', () => (selectSavedDropdown.click()))

/**
 * Listen for a change in the selection option in the dropdown (menu) and determain what should happen based on the ID of the option selected
 */
selectSavedDropdown.addEventListener('change', (e) => {
    const val = selectSavedDropdown.value
    
    if (val === 'save') {
        /** * If selection option == save then open an overlay with an input option that when confirmed, saves a new grid to local storage */
        overlay_ui.openOverlay(
            inputOverlay()
        ).then(value => save_grid.addPresavedGrid(value, config.getAll()))
    } else if (val === 'edit') {
        /** * If selection option == edit then open an overlay with the presaved grids that can be removed and renamed */
        overlay_ui.openOverlay(
            itemArrayOverlay(
                save_grid.getPresavedGrids().filter(i => {
                    return (i.isCustomMade)
                }),

                (id) => save_grid.removePresavedGrid(id)
            )
        ).finally(() => {})
    } else if (val != 'empty' && val != '----') {
        /**
         * If selection is any other value then attempt to get the grid with the given ID,
         * and if successful set merges and configuration to the ones from the grid
         */
        const found = save_grid.getPresavedGridsWithID(val)
        if (found) {
            config.setAll(found.inputs)
        }
    }

    /** * Revert dropdown to the placeholder element (no action selected) */
    selectSavedDropdown.selectedIndex = 0
})

/** * Listens for when the array of saved grids has changed (removed, updated) to refresh the selectors dropdown options */
document.addEventListener(EVENTS.PresavedArrayChanged, (e) => {
    const newArray = Array.from(e.detail)
    if (newArray == null || !Array.isArray(newArray)) return

    /**
     * Adds a dropdown item to the given option group to create the new dropdown children
     * @param {String} value The identifier for the dropdown option
     * @param {String} label The label for the dropdown item
     * @param {HTMLOptGroupElement} childOf The optgroup parent of the new item
     * @returns 
     */
    function createDropdownItem(value, label, childOf) {
        const item = document.createElement('option')
        item.innerText = label
        console.log('creating dropdown item', value, label, childOf)
        item.setAttribute('value', value)
        childOf.appendChild(item)

        return item
    }

    /** * Clear the contents of the dropdown */
    selectSavedDropdown.innerHTML = ''

    /** * The group that contains the actions availiable (edit, save current, ...) */
    const mainOptionGroup = document.createElement('optgroup')
    mainOptionGroup.setAttribute('label', 'Actions')

    /** * The group that contains the preexisting grid options (created in scripts/controllers/save-grid.js) */
    const preExistingOptionGroup = document.createElement('optgroup')
    preExistingOptionGroup.setAttribute('label', 'Pre-Made Layouts')

    /** * The group that contains the custom grid (made and saved by the user) */
    const suboptionsOptionGroup = document.createElement('optgroup')
    suboptionsOptionGroup.setAttribute('label', (newArray.length === 0) ? 'Nothing Saved Yet' : 'Saved History')

    /** * Create action items */
    createDropdownItem('empty', 'Saved...', mainOptionGroup)
    createDropdownItem('save', 'Save Current Layout', mainOptionGroup)
    createDropdownItem('edit', 'Edit Saved', mainOptionGroup)

    /** * Add sub groups to the dropdown */
    selectSavedDropdown.appendChild(mainOptionGroup)
    selectSavedDropdown.appendChild(suboptionsOptionGroup)
    selectSavedDropdown.appendChild(preExistingOptionGroup)

    /** * Loop thorugh the list of custom grids availiable and add them to the appropiate group */
    newArray.filter(i => (i.isCustomMade)).forEach(item =>
        createDropdownItem(item.id, item.name, suboptionsOptionGroup))

        /** * Loop thorugh the list of custom grids availiable and add them to the appropiate group */
    newArray.filter(i => (!i.isCustomMade)).forEach(item =>
        createDropdownItem(item.id, item.name, preExistingOptionGroup))
})



;// CONCATENATED MODULE: ./scripts/root/root.js








// import overlay, { inputOverlay, itemArrayOverlay } from '../interface/overlay-ui'





// import saveGrid from "../controllers/save-grid"
// import config from "../controllers/config"





/**
 * Array of actions that should occur when the selection is changed
 */
var selectionActions = []
document.addEventListener(EVENTS.SelectionChanged, (e) => {
    const newSelection = e.detail
    if (newSelection.empty === true) selectionActions.forEach(i => (i.call) ? i(null) : ({}))
    else selectionActions.forEach(i => (i.call) ? i(newSelection) : ({}))
})


/**
 * Configure button that clears the merges
 */
const clearMergeButton = document.querySelector('#clear-merge')
clearMergeButton.addEventListener('click', () => merging.clear())
selectionActions.push(selection => {
    if (selection) clearMergeButton.style.opacity = '1'
    else clearMergeButton.style.opacity = '0.3'
}) 


/**
 * Configure the label that shows the name of the layer selected
 */
const selectedElementLabel = document.querySelector('#current-frame-name span')
selectionActions.push(selection => {
    if (selection) {
        selectedElementLabel.parentElement.style.opacity = '1'
        selectedElementLabel.innerText = selection.name
        selectedElementLabel.style.textDecoraction = ''
        selectedElementLabel.style.fontWeight = 400
    } else {
        selectedElementLabel.parentElement.style.opacity = '0.4'
        selectedElementLabel.innerText = 'Select Element...'
        selectedElementLabel.style.fontWeight = 600
        selectedElementLabel.style.textDecoraction = 'underline'
    } 
}) 


/**
 * Configure the buttons at the bottom of the interface that applies the created grid to the figma element
 */
const applyToElementButton = document.querySelector('#apply-to-element')
const applyToElementIcon = document.querySelector('#apply-to-element svg')
const applyToElementLabel = document.querySelector('#apply-to-element span')

const defaultApplyToElementText = applyToElementLabel.innerText
const noneSelectedApplyToElementText = 'Must Select Atleast One Layer'

applyToElementButton.addEventListener('click', () => {
    /**
     * Listen for clicks on the apply to element button
     * If clicked calculate the final grid and send that to the figma.post function
     */

    /** * Evalute the pattern using the given options to create the grid and cell merge previews */
    const pattern = evaluatePattern()

    /** * Call a function that sends the pattern over to the Figma layer using the correct sizing relative to the layer */
    to_element({
        xItems:pattern.column.items(false), yItems:pattern.row.items(false),
        xGap:pattern.column.gap(false), yGap:pattern.row.gap(false)
    }, {
        colour:document.querySelector('#cell-fill').value,
        replaceSelected:document.querySelector('#replace-selected').checked
    })
})
 
selectionActions.push(selection => {
    if (selection) {
        applyToElementButton.style.color = ''
        applyToElementButton.style.cursor = ''
        applyToElementButton.style.backgroundColor = ''

        applyToElementIcon.style.display = 'unset'
        applyToElementLabel.innerText = defaultApplyToElementText
    } else {
        applyToElementButton.style.color = '#848b92'
        applyToElementButton.style.cursor = 'not-allowed'
        applyToElementButton.style.backgroundColor = 'rgb(218 220 222)'

        applyToElementIcon.style.display = 'none'
        applyToElementLabel.innerText = noneSelectedApplyToElementText
    }
})



/**
 * Configure the buttons and dropdown that let the user select premade grids
 */
selectionActions.push(selection => {
    if (selection) selectSavedButton.style.display = ''
    else selectSavedButton.style.display = 'none'
})
;// CONCATENATED MODULE: ./index.js
/**
 * Import the UI element
 */


/**
 * Make sure that selection is empty on launch
 */
window.postMessage({
    pluginMessage: {
        type: 'selectionchange',
        item: null
    }
}, '*')
/******/ })()
;