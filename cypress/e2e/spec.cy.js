const { WINDOW_EVENTS } = require("../../scripts/TYPES")

function dispatchSampleSelection({ width, height }) {
  window.parent.postMessage({
      type:WINDOW_EVENTS.SelectionChanged,
      item:{
        width:width,
        height:height
      }
  })
  // document.dispatchEvent(new CustomEvent('message', {
  //   detail:{
  //     width:width,
  //     height:height
  //   }
  // }))
}

describe('spec.cy.js', () => {
  it('should visit', () => {
    cy.visit('localhost:2888')

    cy.window()
      .then(win => {
        win.postMessage({
          pluginMessage:{
            type:'selectionchange',
            item:{
              name:'Sample layer name',
              width:200,
              height:500
            }
          }
        }, '*')

        cy.get('#grid-columns').clear().type('4').blur()
        cy.get('#grid-rows').clear().type('6').blur()
      })
    expect(true).to.equal(true)
  })


})
