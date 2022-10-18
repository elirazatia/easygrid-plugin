import { OPTIONS } from "../../TYPES"

/**
 * Generates a random colour from TYPES.PREVIEW_COLORS to be used with a preview cell node
 * @returns {String} a hex code to use as a random colour
 */
 function randomColour() {
    const arr = [
        '#E94E3D',
        '#EF9A37',
        '#F6CD46',
        '#69C466',
        '#5FC4BD',
        '#5EAEC4',
        '#387AF6',
        '#A259D7',
        '#E9445A',
        '#9D8563' ]

    const index = Math.floor(Math.random() * (arr.length - 1))
    return `${arr[index]}AA`
}

/**
 * Creates a node that will be used a preview for the merge operation
 * @returns {HTMLElement}
 */
export default function createPreviewMergeNode() {
    const node = document.createElement('div')
    node.style.backgroundColor = randomColour()
    node.style.position = 'relative'
    node.style.left = `${OPTIONS.GridPadding}px`
    node.style.top = `${OPTIONS.GridPadding}px`
    node.style.width = `calc(100% - ${OPTIONS.GridPadding*2}px)`
    node.style.height = `calc(100% - ${OPTIONS.GridPadding*2}px)`
    node.style.opacity = '0.85'
    node.style.borderRadius = `${OPTIONS.GridCornerRadius}px`
    node.style.pointerEvents = 'none'
    node.style.transition = 'filter 0.1s'

    return node
}