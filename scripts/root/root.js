import { EVENTS } from "../TYPES"

import merging from "../controllers/merging"
import overlay, { inputOverlay, itemArrayOverlay } from '../interface/overlay-ui'
import toElement from "../controllers/to-element"

import evaluatePattern from "../util/evalute-pattern"

import "../controllers/selection"
import "../controllers/save-grid"

import '../interface/config-ui'
import saveGrid from "../controllers/save-grid"
import config from "../controllers/config"
import { selectSavedButton } from "../interface/save-dropdown"




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
selectionActions.push(selection => {
    if (selection) selectSavedButton.style.display = ''
    else selectSavedButton.style.display = 'none'
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