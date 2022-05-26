class Merger {
    /**
     * @type {Number}
     */
    get x() {}

    /**
     * @type {Number}
     */
    get y() {}

    /**
     * @type {Number}
     */
    get width() {}

    /**
     * @type {Number}
     */
    get height() {}
}

class PreviewMerger extends Merger {
    /**
     * @type {HTMLElement}
     */
    get preview() {}
}

export {Merger, PreviewMerger}