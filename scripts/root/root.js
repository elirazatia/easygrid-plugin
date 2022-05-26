import { EVENTS } from "../TYPES"

import merging from "../controllers/merging"
import overlay from '../interface/overlay-ui'
import toElement from "../controllers/to-element"

import evaluatePattern from "../util/evalute-pattern"

import "../controllers/selection"
import "../controllers/save-grid"

import '../interface/config-ui'
import saveGrid from "../controllers/save-grid"
import config from "../controllers/config"



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
    toElement({
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
const selectSavedButton = document.querySelector('#select-saved')
const selectSavedDropdown = document.querySelector('#select-saved select')

/** * Simulate a click on the dropdown item if clicked on the dropdown button */
selectSavedButton.addEventListener('click', () => (selectSavedDropdown.click()))
selectionActions.push(selection => {
    if (selection) selectSavedButton.style.display = ''
    else selectSavedButton.style.display = 'none'
})

selectSavedDropdown.addEventListener('change', (e) => {
    const val = selectSavedDropdown.value
    
    if (val === 'save') {
        /**
         * If selection option == save then open an overlay with an input option that when confirmed, saves a new grid to local storage
         */
        overlay.openOverlay({
            inputs:true
        }).then(name => saveGrid.addPresavedGrid(name, config.getAll()))//app.addPresavedGrid(name))
    } else if (val === 'edit') {
        /**
         * If selection option == edit then open an overlay with the presaved grids that can be removed and renamed
         */
        overlay.openOverlay({
            items:saveGrid.getPresavedGrids().filter(i => {
                console.log('SAVE ITEM', i)
                return (i.isCustomMade)
            }),//app.getPresavedGrids(),
            remove:(id) => saveGrid.removePresavedGrid(id) //(id) => (app.removePresavedGrid(id))
        }).then(() => {})
    } else if (val != 'empty' && val != '----') {
        /**
         * If selection is any other value then attempt to get the grid with the given ID,
         * and if successful set merges and configuration to the ones from the grid
         */
        const found = saveGrid.getPresavedGridsWithID(val)//app.getPresavedGridsWithID(val)
        if (found) {
            config.setAll(found.inputs)
            // MUST CALL SETALLINPUTVALUES AS SETMERGES DOESN'T ACTIVE ANY EVENT LISTENERS
            // app.setMerges(found.mergedCells)
            // app.setAllInputValues(found.inputs)
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

    /**
     * Add sub groups to the dropdown
     */
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