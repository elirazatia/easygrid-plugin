import _ from "./grid-preview"
import app from "./app"
import communicator from "./communicator"
import util from "./util"
// import gridPreview from "./grid-preview"


import selection from "./controllers/selection"
import saveGrid from "./controllers/save-grid"

import configUI from './interface/config-ui'
import overlayUI from './interface/overlay-ui'
import gridPreviewUi from "./interface/grid-preview/grid-preview-ui"





const inputs = {}
//     grid_columns:document.querySelector('#grid-columns'),
//     grid_rows:document.querySelector('#grid-rows'),
//     column_gap:document.querySelector('#column-gap'),
//     row_gap:document.querySelector('#row-gap')
// }

// app.addInputListener((newValue) => {
//     inputs.grid_columns.value = newValue.grid_columns
//     inputs.grid_rows.value = newValue.grid_rows
//     inputs.column_gap.value = newValue.column_gap
//     inputs.row_gap.value = newValue.row_gap
// })

// Object.keys(inputs).forEach(key => {
//     const val = inputs[key]
//     val.addEventListener('change', () => {
//         app.setInputValue(key, val.value)
//     })
// })

const trashIcon = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M155.148 482H356.626C369.59 482 379.917 478.387 387.605 471.161C395.293 463.935 399.439 453.925 400.042 441.129L414.061 126.129H447.302C451.372 126.129 454.839 124.699 457.704 121.839C460.568 118.978 462 115.516 462 111.452C462 107.387 460.568 103.925 457.704 101.065C454.839 98.2043 451.372 96.7742 447.302 96.7742H64.472C60.5525 96.7742 57.1606 98.2043 54.2964 101.065C51.4321 103.925 50 107.387 50 111.452C50 115.516 51.4321 118.978 54.2964 121.839C57.1606 124.699 60.5525 126.129 64.472 126.129H97.9385L112.184 441.129C112.787 453.925 116.858 463.935 124.395 471.161C132.083 478.387 142.334 482 155.148 482ZM188.615 420.806C185.147 420.806 182.283 419.753 180.022 417.645C177.761 415.538 176.555 412.753 176.404 409.29L169.846 174.226C169.696 170.763 170.751 167.978 173.012 165.871C175.273 163.613 178.288 162.484 182.057 162.484C185.524 162.484 188.389 163.538 190.65 165.645C192.911 167.753 194.117 170.613 194.268 174.226L200.825 409.065C200.976 412.527 199.921 415.387 197.66 417.645C195.398 419.753 192.383 420.806 188.615 420.806ZM256 420.806C252.231 420.806 249.141 419.753 246.729 417.645C244.468 415.387 243.337 412.527 243.337 409.065V174.226C243.337 170.763 244.468 167.978 246.729 165.871C249.141 163.613 252.231 162.484 256 162.484C259.769 162.484 262.784 163.613 265.045 165.871C267.457 167.978 268.663 170.763 268.663 174.226V409.065C268.663 412.527 267.457 415.387 265.045 417.645C262.784 419.753 259.769 420.806 256 420.806ZM323.159 420.806C319.39 420.806 316.375 419.753 314.114 417.645C312.004 415.387 310.948 412.602 310.948 409.29L317.732 174.226C317.883 170.613 319.089 167.753 321.35 165.645C323.611 163.538 326.476 162.484 329.943 162.484C333.712 162.484 336.727 163.613 338.988 165.871C341.249 167.978 342.304 170.763 342.154 174.226L335.37 409.516C335.37 412.828 334.239 415.538 331.978 417.645C329.717 419.753 326.777 420.806 323.159 420.806ZM161.027 103.323H196.077V65.1613C196.077 59.2903 197.886 54.6237 201.504 51.1613C205.273 47.6989 210.323 45.9677 216.654 45.9677H294.894C301.225 45.9677 306.2 47.6989 309.818 51.1613C313.587 54.6237 315.471 59.2903 315.471 65.1613V103.323H350.52V63.3548C350.52 47.6989 345.696 35.4301 336.048 26.5484C326.551 17.5161 313.436 13 296.703 13H214.619C198.037 13 184.921 17.5161 175.273 26.5484C165.776 35.4301 161.027 47.6989 161.027 63.3548V103.323Z" fill="#EF453B"/>
</svg>`







const clearMergeButton = document.querySelector('#clear-merge')
const selectedElementLabel = document.querySelector('#current-frame-name span')

const applyToElementButton = document.querySelector('#apply-to-element')
const applyToElementIcon = document.querySelector('#apply-to-element svg')
const applyToElementLabel = document.querySelector('#apply-to-element span')

const selectSavedButton = document.querySelector('#select-saved')
const selectSavedDropdown = document.querySelector('#select-saved select')

const helpSection = document.querySelector('.help-screen')
const helpSectionOpenButton = document.querySelector('.help-button')
const helpSectionCloseButton = document.querySelector('.help-screen .button')

const defaultApplyToElementText = applyToElementLabel.innerText
const noneSelectedApplyToElementText = 'Must Select Atleast One Layer'

clearMergeButton.style.cursor = 'pointer'
clearMergeButton.addEventListener('click', () => {
    app.grids.clear()
    gridPreview.clear()
})

app.addSelectionListener(selection => {
    if (selection.empty) {
        overlayUI.closeOverlay()
        // forceCloseInputOverlay()

        Object.values(inputs).forEach(input => input.setAttribute('disabled', 'disabled'))

        document.querySelector('.body-container .button-container').style.border = '0px'
        clearMergeButton.style.opacity = '0.3'
        applyToElementIcon.style.display = 'none'
        applyToElementButton.style.color = '#848b92'
        applyToElementButton.style.cursor = 'not-allowed'
        applyToElementButton.style.backgroundColor = 'rgb(218 220 222)'
        applyToElementLabel.innerText = noneSelectedApplyToElementText

        selectedElementLabel.innerText = 'Select Element...'
        selectedElementLabel.parentElement.style.opacity = '0.4'
        selectedElementLabel.style.fontWeight = 600
        selectedElementLabel.style.textDecoraction = 'underline'

        selectSavedButton.style.display = 'none'
    } else {
        Object.values(inputs).forEach(input => input.removeAttribute('disabled'))

        document.querySelector('.body-container .button-container').style.border = '1px solid #0097f7'
        clearMergeButton.style.opacity = '0.8'
        applyToElementIcon.style.display = 'unset'
        applyToElementButton.style.color = ''
        applyToElementButton.style.cursor = ''
        applyToElementButton.style.backgroundColor = ''
        applyToElementLabel.innerText = defaultApplyToElementText

        selectedElementLabel.innerText = selection.name
        selectedElementLabel.parentElement.style.opacity = '1'
        selectedElementLabel.style.textDecoraction = ''
        selectedElementLabel.style.fontWeight = 400

        selectSavedButton.style.display = ''
    }
})

helpSectionOpenButton.addEventListener('click', () => {
    helpSection.classList.add('opening')
})

helpSectionCloseButton.addEventListener('click', () => {
    helpSection.classList.remove('opening')
    helpSection.classList.add('closing')

    helpSection.addEventListener('animationend', e)
    function e() {
        helpSection.classList.remove('closing')
        helpSection.removeEventListener('animationend', e)
    }
})



function refreshPresavedGridsDropdown(newData) {
    selectSavedDropdown.innerHTML = ''

    function createDropdownItem(value, label, childOf) {
        const item = document.createElement('option')
        item.innerText = label
        item.setAttribute('value', value)
        childOf.appendChild(item)
        return item
    }

    const preExisting = app.getPreExistingSavedGrids()

    const mainOptionGroup = document.createElement('optgroup')
    mainOptionGroup.setAttribute('label', 'Actions')

    const preExistingOptionGroup = document.createElement('optgroup')
    preExistingOptionGroup.setAttribute('label', 'Pre-Made Layouts')

    const suboptionsOptionGroup = document.createElement('optgroup')
    suboptionsOptionGroup.setAttribute('label', (newData.length === 0) ? 'Nothing Saved Yet' : 'Saved History')

    createDropdownItem('empty', 'Saved...', mainOptionGroup)
    createDropdownItem('save', 'Save Current Layout', mainOptionGroup)
    createDropdownItem('edit', 'Edit Saved', mainOptionGroup)

    selectSavedDropdown.appendChild(mainOptionGroup)
    selectSavedDropdown.appendChild(suboptionsOptionGroup)
    selectSavedDropdown.appendChild(preExistingOptionGroup)

    newData.forEach(item =>
        createDropdownItem(item.id, item.name, suboptionsOptionGroup))

    preExisting.forEach(item => 
        createDropdownItem(item.id, item.name, preExistingOptionGroup))
}

app.addPresavedGridListener(refreshPresavedGridsDropdown)

selectSavedButton.addEventListener('click', () => (selectSavedDropdown.click()))

selectSavedDropdown.addEventListener('change', (e) => {
    const val = selectSavedDropdown.value
    // console.log('val', val)
    if (val === 'save') {
        createOverlay({
            inputs:true
        }).then(name => app.addPresavedGrid(name))
    } else if (val === 'edit') {
        createOverlay({
            items:app.getPresavedGrids(),
            remove:(id) => (app.removePresavedGrid(id))
        }).then(() => {})
    } else if (val != 'empty' && val != '----') {
        const found = app.getPresavedGridsWithID(val)
        if (found) {
            // MUST CALL SETALLINPUTVALUES AS SETMERGES DOESN'T ACTIVE ANY EVENT LISTENERS
            app.setMerges(found.mergedCells)
            app.setAllInputValues(found.inputs)
        }
    }

    selectSavedDropdown.selectedIndex = 0
})

applyToElementButton.addEventListener('click', () => {
    const patternValue = app.getPatternValue()
    if (patternValue.empty)
        return alert("Cannot apply to element without selecting any layers!")

    const xItems = patternValue.column.items(false)
    const yItems = patternValue.row.items(false)
    const xGap = patternValue.column.gap(false)
    const yGap = patternValue.row.gap(false)

    var finalItems = []
    var currentXPosition = 0
    var currentYPosition = 0

    if (app.grids.hasMerged) {
        app.grids.merges.forEach(merge => {
            const finalPlacement = util.calculateFinalXYWH(merge.x, merge.y, merge.w, merge.h)
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
                    } else {
                        current += arr[i] + gap
                    }

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
        var y = 0
        
        while (y < yItems.length) {
            var x = 0
            currentXPosition = 0
            const yItem = yItems[y]

            while (x < xItems.length) {
                const xItem = xItems[x]
                finalItems.push({
                    x:currentXPosition, y:currentYPosition,
                    width:xItem, height:yItem,
                })

                currentXPosition += (xItem + xGap)
                x ++
            }

            y ++ 
            currentYPosition += (yItem + yGap)
        }
    }

    const id = Math.random().toString()
    communicator.postToFigma('create-cells', {
        id:id,
        items:finalItems,

        colour:document.querySelector('#cell-fill').value,
        replaceSelected:document.querySelector('#replace-selected').checked
    })
})


// document.querySelector('#apply-to-element').addEventListener('click', () => {
//     const patternValue = app.getPatternValue()
//     if (patternValue.empty) return alert("Cannot complete with empty selector")

//     const xItems = patternValue.column.items(false)
//     const yItems = patternValue.row.items(false)
//     const xGap = patternValue.column.gap(false)
//     const yGap = patternValue.row.gap(false)

//     var finalItems = []

//     var y = 0
//     var currentXPosition = 0
//     var currentYPosition = 0
//     while (y < yItems.length) {
//         var x = 0
//         currentXPosition = 0
//         const yItem = yItems[y]

//         while (x < xItems.length) {
//             const xItem = xItems[x]
//             finalItems.push({
//                 x:currentXPosition, y:currentYPosition,
//                 width:xItem, height:yItem,
//             })

//             currentXPosition += (xItem + xGap)
//             x ++
//         }

//         y ++ 
//         currentYPosition += (yItem + yGap)
//     }

//     const id = Math.random().toString()
//     app.pushUndoAction(id)
//     communicator.postToFigma('create-cells', {
//         id:id,
//         items:finalItems,

//         colour:document.querySelector('#cell-fill').value,
//         deleteOnClose:document.querySelector('#delete-on-close').checked
//     })
// })


// const undoButton = document.querySelector('#undo')

// undoButton.addEventListener('click', () => app.undo())

// app.addUndoListener(undos => {
//     if (undos.length === 0) undoButton.style.display = 'none'
//     else undoButton.style.display = 'flex'
// })