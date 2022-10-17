/**
 * Possible app events
 */
const EVENTS = {
    SelectionChanged:'SelectionChanged',
    ConfigChanged:'ConfigChanged',
    PresavedArrayChanged:'PresavedArrayChanged',

    PreviewCellGrabBegin:'PreviewCellGrabBegin',
    PreviewCellGrabEnd:'PreviewCellGrabEnd',

    MergesCleared:'MergesCleared',
    MergesUpdated:'MergesUpdated'
}

/**
 * Possible events that can be sent from the Figma code.js file
 */
const WINDOW_EVENTS = {
    SelectionChanged:'selectionchange',
    FetchedPresavedFromStorage:'presaved-fetched'
}

/**
 * Generic options that are used throughout the app
 */
const OPTIONS = {
    GridPadding:2,
    GridCornerRadius:4
}

export {EVENTS,WINDOW_EVENTS,OPTIONS}