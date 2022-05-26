import config from '../controllers/config'
import { EVENTS } from "../TYPES"

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
    // if (detail == null || detailfor === null || detailNewValue === null || !(detailfor instanceof String)) return

    inputs[detailfor].value = detailNewValue
})