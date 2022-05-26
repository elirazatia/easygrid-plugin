var currentOverlay  = null

/**
 * Closes the current overlay (if open)
 */
function closeOverlay() {
    if (currentOverlay) {
        currentOverlay()
    }
}

/**
 * Creates an overlay that the user can enter an input into.
 * @param {{inputs:Boolean}|{items:Array<String>, remove:function(string):void}} data
 * @returns {Promise<String>} The input provided by the user
 */
 function openOverlay() {
    var valueGetter = (() => {return ''})

    const overlay = document.createElement('div')
    overlay.classList.add('input-overlay')
    overlay.classList.add('opening')

    const title = document.createElement('span')
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

    if (data.inputs) {
        title.innerText = 'Save Grid As...'
        overlay.classList.add('equally-divided')

        bottomContainer.appendChild(confirmButton)
        bottomContainer.appendChild(cancelButton)

        const input = document.createElement('input')
        input.placeholder = 'Enter value...'
        topContainer.appendChild(input)

        valueGetter = (() => {
            const val = input.value
            if (val.trim() === '') return null
            return val
        })
    } else if (data.items) {
        title.innerText = 'Edit Saved Items'
        overlay.classList.add('flex')

        cancelButton.innerText = 'Close'
        bottomContainer.appendChild(cancelButton)

        const list = document.createElement('ul')
        list.style = 'list-style: none; width: 100%; height: 100%; padding: 0 12px 12px 12px; margin: 0; box-sizing: border-box'
        
        data.items.forEach(item => {
            const view = document.createElement('li')
            view.style = 'display:flex; padding: 16px; border-bottom: 1px solid black; align-items: center; background-color: #ffffff3b; border-radius: 6px; margin-bottom: 6px'

            const label = document.createElement('span')
            label.innerText = item.name//'View Name'
            label.style = 'flex-grow: 100; color: white'

            const rightContainer = document.createElement('div')
            // rightContainer.style = ''

            const deleteButton = document.createElement('svg')
            deleteButton.style = 'width: 22px; height: 22px; cursur: pointer'
            deleteButton.innerHTML = trashIcon

            rightContainer.appendChild(deleteButton)

            view.appendChild(label)
            view.appendChild(rightContainer)
            list.appendChild(view)

            deleteButton.addEventListener('click', () => {
                view.remove()
                data.remove(item.id)
            })
        })

        topContainer.appendChild(list)
    }

    /**
     * Return a promise that is resolved when the user selects a value
     */
    return new Promise((resolve, reject) => {
        currentOverlay = (() => reject())

        cancelButton.addEventListener('click', () => reject())
        confirmButton.addEventListener('click', () => {
            const res = valueGetter()
            if (res) resolve(res)
        })
    }).finally(() => {
        overlay.classList.remove('opening')
        overlay.classList.add('closing')
        setTimeout(() => overlay.remove(), 290)
    })
 }

export default {
    openOverlay:openOverlay,
    closeOverlay:closeOverlay
}