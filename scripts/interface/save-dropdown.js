import { EVENTS } from "../TYPES"
import saveGrid from "../controllers/save-grid"
import config from "../controllers/config"

import overlay, { inputOverlay, itemArrayOverlay } from "./overlay-ui"

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
        overlay.openOverlay(
            inputOverlay()
        ).then(value => saveGrid.addPresavedGrid(value, config.getAll()))
    } else if (val === 'edit') {
        /** * If selection option == edit then open an overlay with the presaved grids that can be removed and renamed */
        overlay.openOverlay(
            itemArrayOverlay(
                saveGrid.getPresavedGrids().filter(i => {
                    console.log('SAVE ITEM', i)
                    return (i.isCustomMade)
                }),

                (id) => saveGrid.removePresavedGrid(id)
            )
        ).finally(() => {})
    } else if (val != 'empty' && val != '----') {
        /**
         * If selection is any other value then attempt to get the grid with the given ID,
         * and if successful set merges and configuration to the ones from the grid
         */
        const found = saveGrid.getPresavedGridsWithID(val)
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


export { selectSavedButton, selectSavedDropdown }