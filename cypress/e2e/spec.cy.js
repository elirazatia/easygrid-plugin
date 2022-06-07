require('cypress-xpath')

const dispatchSelection = (name, width, height) => {
	cy.window().then(win => {
		win.postMessage({
			pluginMessage: {
				type: 'selectionchange',
				item: (width && height) ? { name: name, width: width, height: height } : null
			}
		}, '*')
	})
}

const setInputFor = (id, newValue, blurAfter) => {
	const i = cy.get('#'+id).clear().type(newValue)
	if (blurAfter) i.blur()
}

describe('spec.cy.js', {scrollBehavior: false}, () => {
	it('should visit', () => {
		cy.visit('localhost:2888')
	})

	it ('should should successfully listen for empty Figma layer selection changes', () => {
		// set selection to empty
		dispatchSelection()
	})

	it ('should should then successfully render correctly for the layer selection changes', () => {
		// merge button should be transparent
		cy.get('#clear-merge').should('have.css', 'opacity').and('eq', '0.3')
		// title label should be transparent
		cy.get('#current-frame-name').should('have.css', 'opacity').and('eq', '0.4')
		// title label should be equal to Select Element...
		cy.get('#current-frame-name span').should('have.text', 'Select Element...')
		// button label should be equal to "Must Select Atleast One Layer"
		cy.get('#apply-to-element span').should('have.text', 'Must Select Atleast One Layer')
		// check that both cells-container and merge-container have no children
		cy.get('.cells-container').find('div').should('have.length', 0)
		cy.get('.merge-container').find('div').should('have.length', 0)
		
	})

	it ('should should successfully listen for Figma layer selection changes', () => {
		// set selection to empty
		dispatchSelection('Layer 15', 100, 200)

		// check that the label equals the name of the new layer
		cy.get('#current-frame-name span').should('have.text', 'Layer 15')
		// merge button should be fully opaque
		cy.get('#clear-merge').should('have.css', 'opacity').and('eq', '1')
		// title label should be fully opaque
		cy.get('#current-frame-name').should('have.css', 'opacity').and('eq', '1')	
	})

	it('should successfully have the same amount of preview cells depending on the input', () => {
		// check that the amount of items in container children equal to row*height input already there and test some other values
		setInputFor('grid-columns', 5, true)
		setInputFor('grid-rows', 2, true)
		cy.get('.cells-container').find('div').should('have.length', (5*2))

		setInputFor('grid-columns', 16, true)
		setInputFor('grid-rows', 3, true)
		cy.get('.cells-container').find('div').should('have.length', (16*3))

		setInputFor('grid-columns', 4, true)
		setInputFor('grid-rows', 8, true)
		cy.get('.cells-container').find('div').should('have.length', (4*8))

		// apply more complciated values as input values
		setInputFor('grid-columns', '2 4 2', true)
		setInputFor('grid-rows', '1', true)
		cy.get('.cells-container').find('div').should('have.length', (3*1))

		setInputFor('grid-columns', '5pt 1 3', true)
		setInputFor('grid-rows', '20pt', true)
		cy.get('.cells-container').find('div').should('have.length', (3*1))

		setInputFor('grid-columns', ' ', true)
		setInputFor('grid-rows', '0', true)
		cy.get('.cells-container').find('div').should('have.length', 0)

		setInputFor('grid-columns', '-1 3', true)
		setInputFor('grid-rows', '-2', true)
	})

	it ('should successfully style when hovered over', () => {
		cy.get('.cells-container').find('div').eq(0)
			.trigger('mousemove',{force:true, bubbles:true})
			// .should('have.css', 'background-color').and('eq', 'rgb(0,162,255)')
	})

	it('should successfully merge a single cell', () => {
		setInputFor('grid-columns', 5, true)
		setInputFor('grid-rows', 2, true)

		cy.get('.cells-container').find('div').eq(0)
			.trigger('mousemove',{force:true, bubbles:true})
			.trigger('mousedown',{force:true, bubbles:true, which:1 })
			.trigger('mouseup',{force:true, bubbles:true, which:1 })

		cy.get('.merge-container').find('div').should('have.length', 1)
	})

	it('should successfully merge 3 cells horizontally', () => {
		cy.get('.cells-container').find('div').eq(1)
			.trigger('mousemove',{force:true, bubbles:true})
			.trigger('mousedown',{force:true, bubbles:true, which:1 })
			.parent().find('div').eq(2)
			.trigger('mousemove',{force:true, bubbles:true})
			.parent().find('div').eq(3)
			.trigger('mousemove',{force:true, bubbles:true})
			.trigger('mouseup',{force:true, bubbles:true, which:1 })

		cy.get('.merge-container').find('div').should('have.length', 2)
	})

	it('should successfully merge 3 cells vertically', () => {
		cy.get('.cells-container').find('div').eq(3)
			.trigger('mousemove',{force:true, bubbles:true})
			.trigger('mousedown',{force:true, bubbles:true, which:1 })
			.parent().find('div').eq(7)
			.trigger('mousemove',{force:true, bubbles:true})
			.trigger('mouseup',{force:true, bubbles:true, which:1 })

		cy.get('.merge-container').find('div').should('have.length', 3)
	})

	it('should successfully clear merges', () => {
		cy.get('#clear-merge')
			.trigger('click')

		cy.get('.merge-container').find('div').should('have.length', 0)
	})
})