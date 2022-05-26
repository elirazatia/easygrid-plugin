import { EVENTS } from "../TYPES"

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

export default {
    /**
     * Get all the configuration options
     * @returns {Object<String,String>}
     */
    getAll() {
        return configValues
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
}