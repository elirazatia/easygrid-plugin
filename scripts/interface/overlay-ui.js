/**
 * A function to close and send a reject Promise to the open overlay
 * @type {function():void}
 */
var currentOverlay = null

/**
 * The SVG path to create a trsah icon SVG for the itemArrayOverlay
 */
const trashIcon = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M155.148 482H356.626C369.59 482 379.917 478.387 387.605 471.161C395.293 463.935 399.439 453.925 400.042 441.129L414.061 126.129H447.302C451.372 126.129 454.839 124.699 457.704 121.839C460.568 118.978 462 115.516 462 111.452C462 107.387 460.568 103.925 457.704 101.065C454.839 98.2043 451.372 96.7742 447.302 96.7742H64.472C60.5525 96.7742 57.1606 98.2043 54.2964 101.065C51.4321 103.925 50 107.387 50 111.452C50 115.516 51.4321 118.978 54.2964 121.839C57.1606 124.699 60.5525 126.129 64.472 126.129H97.9385L112.184 441.129C112.787 453.925 116.858 463.935 124.395 471.161C132.083 478.387 142.334 482 155.148 482ZM188.615 420.806C185.147 420.806 182.283 419.753 180.022 417.645C177.761 415.538 176.555 412.753 176.404 409.29L169.846 174.226C169.696 170.763 170.751 167.978 173.012 165.871C175.273 163.613 178.288 162.484 182.057 162.484C185.524 162.484 188.389 163.538 190.65 165.645C192.911 167.753 194.117 170.613 194.268 174.226L200.825 409.065C200.976 412.527 199.921 415.387 197.66 417.645C195.398 419.753 192.383 420.806 188.615 420.806ZM256 420.806C252.231 420.806 249.141 419.753 246.729 417.645C244.468 415.387 243.337 412.527 243.337 409.065V174.226C243.337 170.763 244.468 167.978 246.729 165.871C249.141 163.613 252.231 162.484 256 162.484C259.769 162.484 262.784 163.613 265.045 165.871C267.457 167.978 268.663 170.763 268.663 174.226V409.065C268.663 412.527 267.457 415.387 265.045 417.645C262.784 419.753 259.769 420.806 256 420.806ZM323.159 420.806C319.39 420.806 316.375 419.753 314.114 417.645C312.004 415.387 310.948 412.602 310.948 409.29L317.732 174.226C317.883 170.613 319.089 167.753 321.35 165.645C323.611 163.538 326.476 162.484 329.943 162.484C333.712 162.484 336.727 163.613 338.988 165.871C341.249 167.978 342.304 170.763 342.154 174.226L335.37 409.516C335.37 412.828 334.239 415.538 331.978 417.645C329.717 419.753 326.777 420.806 323.159 420.806ZM161.027 103.323H196.077V65.1613C196.077 59.2903 197.886 54.6237 201.504 51.1613C205.273 47.6989 210.323 45.9677 216.654 45.9677H294.894C301.225 45.9677 306.2 47.6989 309.818 51.1613C313.587 54.6237 315.471 59.2903 315.471 65.1613V103.323H350.52V63.3548C350.52 47.6989 345.696 35.4301 336.048 26.5484C326.551 17.5161 313.436 13 296.703 13H214.619C198.037 13 184.921 17.5161 175.273 26.5484C165.776 35.4301 161.027 47.6989 161.027 63.3548V103.323Z" fill="#EF453B"/>
</svg>`


/**
 * Define a type for the input options that the openOverlay function takes
 * use when creating overlay UI items or when calling the openOverlay function
 * @typedef {{ title:String, classList:Array<String>, includeCancelButton:Boolean, includeCancelButton:Boolean, body:function():Array<HTMLElement>, onConfirm:function(HTMLElement):any }} OverlayOptions
 */


/**
 * An overlay option that provides the user with an ability to enter a text and confirm
 * used when saving grids
 * @returns {OverlayOptions}
 */
function inputOverlay() {
    return {
        title:'Save Grid As...',
        classList:['equally-divided'],
        includeConfirmButton:true,
        includeCancelButton:true,
        body:() => {
            const input = document.createElement('input')
            input.placeholder = 'Enter value...'
            
            return [input]
        },
        onConfirm:(body) => {
            const input = body.querySelector('input')
            const val = input.value
            if (val.trim() === '') return null
            return val
        }
    }
}

/**
 * An overlay option that provides the user the ability to edit and delete items in a list
 * used when editing previuly saved grids
 * @param {Array<{id:String, name:String}>} items
 * @param {function(string):void} remove
 * @returns {OverlayOptions}
 */
 function itemArrayOverlay(items, remove) {
    return {
        title:'Edit Saved Items',
        classList:['flex'],
        includeCancelButton:true,
        onConfirm:(body) => { return null },
        body:() => {
            const list = document.createElement('ul')
            list.style = 'list-style: none; width: 100%; height: 100%; padding: 0 12px 12px 12px; margin: 0; box-sizing: border-box'
                
            items.forEach(item => {
                const view = document.createElement('li')
                view.style = 'display:flex; padding: 16px; border-bottom: 1px solid black; align-items: center; background-color: #ffffff3b; border-radius: 6px; margin-bottom: 6px'
    
                const label = document.createElement('span')
                label.innerText = item.name//'View Name'
                label.style = 'flex-grow: 100; color: white'
    
                const deleteButton = document.createElement('svg')
                deleteButton.style = 'width: 22px; height: 22px; cursur: pointer'
                deleteButton.innerHTML = trashIcon
    
                const rightContainer = document.createElement('div')
                rightContainer.appendChild(deleteButton)
    
                view.appendChild(label)
                view.appendChild(rightContainer)
                list.appendChild(view)
    
                deleteButton.addEventListener('click', () => {
                    view.remove()
                    remove(item.id)
                })
            })    

            return [list]
        }
    }
}


/**
 * Closes the current overlay (if open)
 */
function closeOverlay() {
    if (currentOverlay) { currentOverlay() }
}

/**
 * Creates an overlay that the user can enter an input into.
 * @param {OverlayOptions} data 
 * @returns {Promise<String>} The input provided by the user
 */
function openOverlay(data) {
    /**
     * The part below constructs the overlay elements
     * Check out the Elements part of the Figma console to see what is going on here
     */
    const overlay = document.createElement('div')
    overlay.classList.add('input-overlay')
    overlay.classList.add('opening')
    data.classList.forEach(item => overlay.classList.add(item))

    const title = document.createElement('span')
    title.innerText = data.title
    title.classList.add('title')

    const topContainer = document.createElement('div')
    topContainer.classList.add('top-container')

    const bottomContainer = document.createElement('div')
    bottomContainer.classList.add('bottom-container')

    const confirmButton = document.createElement('span')
    confirmButton.id = 'confirm-button'
    confirmButton.innerText = 'Save Grid'

    const cancelButton = document.createElement('span')
    cancelButton.id = 'cancel-button'
    cancelButton.innerText = 'Cancel'

    overlay.appendChild(topContainer)
    overlay.appendChild(bottomContainer)

    topContainer.appendChild(title)
    document.body.appendChild(overlay)

    if (data.includeConfirmButton) bottomContainer.appendChild(confirmButton)
    if (data.includeCancelButton) bottomContainer.appendChild(cancelButton)

    const body = data.body()
    body.forEach(element => topContainer.appendChild(element))

    /** * Return a promise that is resolved when the user selects a value */
    return new Promise((resolve, reject) => {
        currentOverlay = (() => reject())

        cancelButton.addEventListener('click', () => reject())
        confirmButton.addEventListener('click', () => {
            const res = data.onConfirm(topContainer) //valueGetter()
            if (res) resolve(res)
        })
    }).finally(() => {
        overlay.classList.remove('opening')
        overlay.classList.add('closing')
        setTimeout(() => overlay.remove(), 290)
    })
}

export default {
    openOverlay: openOverlay,
    closeOverlay: closeOverlay
}

export {inputOverlay, itemArrayOverlay}