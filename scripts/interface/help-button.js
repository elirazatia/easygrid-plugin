/**
 * Configures the help menu
 */
 const helpSection = document.querySelector('.help-screen')
 const helpSectionOpenButton = document.querySelector('.help-button')
 const helpSectionCloseButton = document.querySelector('.help-screen .button')
 
 /** * Listen for click on the help button to open the helpSection */
 helpSectionOpenButton.addEventListener('click', () => {
     helpSection.classList.add('opening')
 })
 
 /** * Listen for a click on the close button to close the help section */
 helpSectionCloseButton.addEventListener('click', () => {
     /** * Called on the animationend event, removes the class that sets the closing animation and remove the listener */
     function e() {
         helpSection.classList.remove('closing')
         helpSection.removeEventListener('animationend', e)
     }
 
     helpSection.classList.remove('opening')
     helpSection.classList.add('closing')
 
     helpSection.addEventListener('animationend', e)
 })

 export {helpSection, helpSectionOpenButton, helpSectionCloseButton}