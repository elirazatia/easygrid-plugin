export default class SavedGrid {
    /**
     * @type {String}
     */
    get id() { }

    /**
     * @type {String}
     */
    get name() {  }

    /**
     * @type {{ grid_columns:String, grid_rows:String, grid_columns_gap:String, grid_rows_gap:String }}
     */
    get inputs() {  }

    /**
     * @type {Array<{x:Number, y:Number, w:Number, h:Number}>}
     */
    get mergedCells() {  }

    /**
     * Was this grid made by the user
     * @type {Boolean}
     */
    get isCustomMade() {  }
}