import expandGrid from "./expand-grid";
import FigmaSelection from "../models/selection";

import selection from "../controllers/selection";
import gridPreviewUi from "../interface/grid-preview/grid-preview-ui";
import config from "../controllers/config";

/**
 * Converts the Figma layer selection, the configuration (rows, columns, and gap inputs) and the container that previews the grid to return an array of every cell and their respective size
 * @param {FigmaSelection} selection 
 */
export default function evaluatePattern() {
    var w = selection.current.width
    var h = selection.current.height

    const configValues = config.getAll()
    const patternContainer = gridPreviewUi.rootGridElement

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
        column:expandGrid({
            pattern:configValues.grid_columns,
            gap:configValues.grid_columns_gap,
            realSize:selection.current.width,
            appliedSize:w
        }),
        row:expandGrid({
            pattern:configValues.grid_rows,
            gap:configValues.grid_rows_gap,
            realSize:selection.current.height,
            appliedSize:h
        })
    }
}