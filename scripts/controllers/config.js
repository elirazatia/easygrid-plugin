import { EVENTS } from "../TYPES"

/**
 * The default configuration values
 * @type {CREATE_CONFIG_TYPE}
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
}