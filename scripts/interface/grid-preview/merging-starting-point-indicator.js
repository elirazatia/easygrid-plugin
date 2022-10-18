const applied = {}

/**
 * Add a starting point indicator to the grid
 * @param {HTMLElement} gridMergeContainer 
 * @param {Number} x 
 * @param {Number} y 
 */
function add(gridMergeContainer, x, y) {
    const node = document.createElement('div')
    node.style.width = '8px'
    node.style.height = '8px'
    node.style.borderRadius = '4px'
    node.style.backgroundColor = '#F0AA45'
    node.style.border = '1px solid black'
    node.style.position = 'absolute'

    node.style.gridRowStart = `${y + 1}`
    node.style.gridRowEnd = `${y + 1}`
    node.style.gridColumnStart = `${x + 1}`
    node.style.gridColumnEnd = `${x + 1}`

    node.style.transform = `translate(-50%, -50%)`
    node.style.left = '50%'
    node.style.top = '50%'

    gridMergeContainer.appendChild(node)

    applied[x] = applied[x] || {}
    applied[x][y] = node
}

/**
 * Remove a merge starting point indicator from the grid
 * @param {Number} x 
 * @param {Number} y 
 */
function remove(x, y) {
    const toRemove = (applied[x]||{})[y]
    if (toRemove)
        toRemove.remove()
}

export default { add, remove }