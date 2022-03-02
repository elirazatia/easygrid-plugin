import util from "./util"
// import gridPreview from "./grid-preview"
import expandGrid from "./expand-grid"
import communicator from "./communicator"

const gridRoot = document.querySelector('#grid-root')
const defaultGridRootWidth = gridRoot.getBoundingClientRect().width

/**
 * @template T

 * @param {T} defaultValue 
 * @returns {{ addListener:function(function(T):void):void, set:function(T):void, get:function():T }}
 */
function listener(defaultValue) {
    var value = defaultValue
    var listeners = []

    return {
        addListener:(listener) => {
            if (!listener.call) return false

            listeners.push(listener)
            listener(value)
            return true
        },

        set:(newValue) => {
            value = newValue
            listeners.forEach(listener => listener(value))
        },

        get:() => {
            return value
        }
    }
}



var mergedCells = {}

var inputs = {
    grid_columns:'1 3 1',
    grid_rows:'1',
    column_gap:'0',
    row_gap:'0'
}

var selection = {
    width:0,
    height:0,
    name:''
}

const inputListeners = listener(inputs)
const patternListeners = listener({ empty:true })
const selectionListeners = listener({ empty:true })
const presavedListeners = listener([])
const premadeLayouts = [
    {
        name: "Golden Ratio",
        id: "golden-ratio",
        inputs: {grid_columns: "13", grid_rows: "8", column_gap: "0", row_gap: "0"},
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
        inputs: {grid_columns: "12", grid_rows: "1", column_gap: "6", row_gap: "0"}
    },
    {
        name: "iPad App With Sidebar",
        id: "ipad-with-sidebar",
        inputs: {grid_columns: "220pt 1", grid_rows: "1", column_gap: "0", row_gap: "0"}
    },
    {
        name: "Notch iPhone App Layout",
        id: "ios-app-layout",
        inputs: {grid_columns: "1", grid_rows: "140pt 1 83pt", column_gap: "0", row_gap: "0"}
    },
    {
        name: "Rule Of Threes",
        id: "rule-of-threes",
        inputs: {grid_columns: "3", grid_rows: "3", column_gap: "0", row_gap: "0"}
    }
]



const isSelectionEmpty = () => (selection.width === 0 && selection.width === 0 && selection.name.trim() === '')
const setSelection = (width, height, name) => {
    if (!width || !height) {
        selection = { width:0, height:0, name:'' }
        selectionListeners.set({ empty:true })
    } else {
        selection = { width:width, height:height, name:name }
        selectionListeners.set(selection)
    }

    evaluatePattern()
}

function evaluatePattern() {
    if (isSelectionEmpty())
        return patternListeners.set({ empty:true })
    
    const values = inputListeners.get()

    var w = selection.width
    var h = selection.height

    // /** EDITED FROM HERE */

    // function evaluateEndValueOfGridPattern(pattern, gap, realSize) {
    //     const evaluatedPattern = expandGrid({
    //         pattern:pattern,
    //         gap:gap,
    //         realSize:realSize,
    //         appliedSize:0
    //     })

    //     const evaluatedItems = evaluatedPattern.items(false)
    //     const evaluatedGap = evaluatedPattern.gap(false)
    //     var axisValue = 0
    //     var i = 0

    //     while (i < evaluatedItems.length) {
    //         axisValue += evaluatedItems[i]
    //         // console.log('IS LAST', evaluatedItems[i])//, (i !== (evaluatedItems.length - 1)))
    //         if (i !== (evaluatedItems.length - 1)) axisValue += evaluatedGap
    //         i ++
    //     }

    //     return axisValue
    // }

    // const maxW = evaluateEndValueOfGridPattern(values.grid_columns, values.column_gap, selection.width)
    // // const maxH = evaluateEndValueOfGridPattern(values.grid_rows, values.row_gap, h, 0)
    // var w = Math.max(selection.width, maxW)
    // var widthChange = (w - selection.width)
    // var percentageWidthChange = 1
    // if (widthChange > 0) {
    //     percentageWidthChange = (selection.width-widthChange)/selection.width
    // }

    // h = (h * percentageWidthChange)

    // console.log('w', w, 'h', h, percentageWidthChange)
    // console.log('MAX X', maxW, w, (maxW > w))

    // w = maxW
    // h = maxH
    // console.log('MAX Y', maxH, h)
    /** TO HERE */

    // if (maxW > w)
    //     w = maxW

    // if (maxH > h)
    //     h = maxH

    // console.log('AFTER W', w)
    // console.log('AFTER H', h)

    const ratio = w / h
    // console.log(ratio)
    if (ratio < 1) {
        h = 300
        w = h * ratio
    } else {
        w = gridRoot.getBoundingClientRect().width
        h = w / ratio
    }

    setTimeout(() => {
        const cellsContainer = Array.from(gridRoot.children||[])[0]
        const mergeContainer = Array.from(gridRoot.children||[])[1]
        // console.log('grid root main controller', gridRootMainContainer)
        if (cellsContainer) {
            var maxWidth = 0
            var topY = -1
            // console.log('children', cellsContainer.children)
            Array.from(cellsContainer.children).forEach(c => {
                const bounding = c.getBoundingClientRect()

                if (topY === -1) topY = bounding.top
                else if (Math.floor(bounding.top) === Math.floor(topY)) maxWidth += bounding.width
                console.log('child', maxWidth)
            })

            // console.log('gridroot', maxWidth, defaultGridRootWidth)

            console.log('MAX WIDTH', maxWidth, defaultGridRootWidth)
            if (maxWidth > defaultGridRootWidth) {
                cellsContainer.style.overflowX = 'scroll'
                cellsContainer.style.justifyContent = 'left'

                mergeContainer.style.overflowX = 'scroll'
                mergeContainer.style.justifyContent = 'left'
                console.log('SHOULD ALLOW SCROLL')
            } else {
                cellsContainer.style.overflowX = 'hidden'; cellsContainer.style.justifyContent = 'center'
                mergeContainer.style.overflowX = 'hidden'; mergeContainer.style.justifyContent = 'center'
                console.log('SHOULD NOT ALLOW SCROLL')
            }
        }
    }, 1)

    

    const val = {
        column:expandGrid({
            pattern:values.grid_columns,
            gap:values.column_gap,
            realSize:selection.width,
            appliedSize:w
        }),
        row:expandGrid({
            pattern:values.grid_rows,
            gap:values.row_gap,
            realSize:selection.height,
            appliedSize:h
        })
    }

    patternListeners.set(val)
}

inputListeners.addListener(() => evaluatePattern())

document.querySelector('.new-feature-card .card-close').addEventListener('click', () => 
    document.querySelector('.new-feature-card').remove()
)

window.onmessage = (message) => {
    const data = message.data.pluginMessage

    if (data.type === 'selectionchange') {
        if (data.item) setSelection(data.item.width, data.item.height, data.item.name)
        else setSelection()
    } else if (data.type === 'presaved-fetched') {
        if (data.items && Array.isArray(data.items))
            presavedListeners.set(data.items)
    } else if (data.type === 'fetch-release-notes') {
        const note = data.note
        // console.log('SHOULD OPEN NOTES PAGE w/' , note)
        if (note)
            document.querySelector('.new-feature-card').style.display = ''
    }
}

setSelection(100, 100, 'Test Group')

export default {
    addSelectionListener:selectionListeners.addListener,

    addPatternListener:patternListeners.addListener,

    getPatternValue:patternListeners.get,

    addInputListener:inputListeners.addListener,

    addPresavedGridListener:presavedListeners.addListener,

    getPresavedGrids:presavedListeners.get,

    getPreExistingSavedGrids:() => { return premadeLayouts },

    removePresavedGrid(id) {
        communicator.postToFigma('delete-grid', { id:id })
    },

    getPresavedGridsWithID(id) {
        const items = [
            ...presavedListeners.get(),
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

    addPresavedGrid(withName) {
        var mergedArray = []
        Object.values(mergedCells).forEach(val => {
            // console.log('value', val)
            Object.values(val).forEach(i => {
                // console.log('i', i)
                const n = { ...i }
                delete n.previewNode

                mergedArray.push(n)
            })
        })

        // console.log('join', mergedArray)

        const newID = Math.random().toString().slice(3)
        const currentInput = inputListeners.get()
        communicator.postToFigma('save-grid', {
            id:newID,
            name:withName,
            inputs:currentInput,
            mergedCells:mergedArray
        })
    },

    setAllInputValues:(newInputs) => {
        inputListeners.set(newInputs)
    },
    
    setInputValue:(key, value) => {
        inputListeners.set({
            ...inputListeners.get(),
            [key]:value
        })
    },

    setMerges:(merges) => {
        merges = merges || []
        var xDict = {}
        merges.forEach(merge => {
            const x = merge.x
            const y = merge.y
            xDict[x] = xDict[x] || {}
            xDict[x][y] = merge
        })

        mergedCells = xDict
        // mergedCells = merges
    },

    grids:{
        get hasMerged() {
            return (Object.keys(mergedCells).filter(key => {
                const arr = Object.keys(mergedCells[key])
                if (arr.length === 0) return false
                return true
            }).length > 0)
        },

        get merges() {
            return Object.values(mergedCells).map(yKey => Object.values(yKey)).flat()
        },

        clear() {
            Object.keys(mergedCells).forEach(key => {
                const y = Object.values(mergedCells[key])
                y.forEach(y => {
                    if (y.previewNode && y.previewNode.remove)
                        y.previewNode.remove()
                })
            })

            mergedCells = {}
        },

        get(x, y) {
            const mergeX = mergedCells[x] || {}
            return mergeX[y] || null
        },

        addMerge(x,y,width,height,previewNode) {
            mergedCells[x] = mergedCells[x] || {}
            mergedCells[x][y] = {
                x:x, y:y, w:width, h:height, previewNode:previewNode
            }

            return mergedCells[x][y]
        },

        overridePreviewNode(x,y,newPreviewNode) {
            const mX = mergedCells[x]
            const mY = mX[y]
            if (!mY) return

            mY.previewNode = newPreviewNode
        },

        removeMerge(x,y) {
            const mX = mergedCells[x]
            const cell = mX[y]
            if (!cell) return
            if (cell.previewNode) cell.previewNode.remove()

            delete mergedCells[x][y]
        }
    }
}