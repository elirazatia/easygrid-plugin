import expandGrid from "./expand-grid";
import FigmaSelection from "../models/selection";

/**
 * Converts the Figma layer selection, the configuration (rows, columns, and gap inputs) and the container that previews the grid to return an array of every cell and their respective size
 * @param {FigmaSelection} selection 
 */
export default function evaluatePattern(selection, config, patternContainer) {
    var w = selection.width
    var h = selection.height

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
            pattern:config.grid_columns,
            gap:config.grid_columns_gap,
            realSize:selection.width,
            appliedSize:w
        }),
        row:expandGrid({
            pattern:config.grid_rows,
            gap:config.grid_rows_gap,
            realSize:selection.height,
            appliedSize:h
        })
    }
}