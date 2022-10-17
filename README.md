# ✨ Open-source layout creation plugin for Figma ✨

> A plugin built for the Figma design software that allowes the user to select a layer and configure a layout (by selecting columns, rows, and spacing) and then applying it to the layer with a click on a button. This plugin makes creating layouts much faster and can allow for complicated / unique layouts thanks to the merger functionallity (drag multiple cells in preview together)

> Download on Figma @ [Figma Community]()
Learn More @ [(easy)grid Website]()

### 💫 Features
- Works with selected Figma layers, no need to configure the width, height, and position!
- Flexible, allows for CSS grid like formatting for entering column / row patterns (removing the fr symbol and changing px to pt)
- If more than one layer is selected than the created grid will use the secondary selected layer as cells (rapidly speeding up design)
- Apply grid / layout right onto the select layer, can add the layout onto groups, layers, and artboards
- The grid preview allows the user to see a preview of the grid they are about to create
- Within the grid preview, the user can also drag and drop cells together to merge them into more complicated shapes
- Help section included

### 📸 Screenshots
![Screenshot of app](https://github.com/eliraz003/easygrid-plugin/blob/main/preview-screenshot.png?raw=true)

---

### 🏃️ Getting Starting / Prequisits 
<!-- > After downloading the project, open Figma and open a project
Navigate to Plugins > Development > Import Plugin For Manifest
You can find the manifest at dist/manifest.json -->

After downloading the codebase there are 2 steps you need to take to begin working on the project, they are as following:<br>
1. Navigate to Plugins > Development > Import Plugin For Manifest
> You can find the manifest at dist/manifest.json <br>
2. Run `npm ci` in the terminal to install any missing node modules<br>
3. Call `node watcher` to begin watching for changes in the scripts/ folder which automatically calls `npm run build`<br>

When editing code, make sure you are not editing the code in the /dist/ folder as that gets automatically generated, 
except for the code.js file which is the embeded script that can communicate with the Figma API

To edit the UI edit the UI.html file in the root directory
To edit any script edit edit the /scripts/ folder

After making changes call `npm run build` 

### 🧐 Understanding The Code

> The main scripts include:<br>
/scripts/root/root.js<br>
/scripts/interface/grid-preview/grid-preview-ui.js<br>
/scripts/controllers/save-grid.js<br>
/scripts/controllers/to-element.js<br>
/scripts/controllers/save-grid.js<br>

- The `scripts/root/root` script handles the main confugration for the app, including importing every nessasery file and adding events to UI elements for interactivity
- The `scripts/interface/grid-preview/grid-preview-ui` script handles the grid preview interface, it does so by creating two layers, one that has cells and one that has the merges and styles it using CSS in a way that represents the grid confugration entered by the user, so if the user has entered columns to be 1*5 than the grid-column-style will be 1fr 1fr 1fr 1fr 1fr
    - Size of each cell in both the preview and the rendering is calculated in the `evaluatePattern` function which returns the size of each cell.
- `toElement` handles using the configuration and the merges created by the user to calculate each new element which should be created in Figma, it loops through each cell and adds it to an array which is posted to `dist/code.js`

### 👨‍🔧 Testing

This project uses testing Cypress for testing, the test covers the following<br>
1. Layer selected/unselected state<br>
2. Changing config inputs<br>
3. Merging layers<br>
4. Clearing layer merges<br>

To test, run `npm run cypress` and select the spec.cy.js file in E2E testing

---
### Contributions

Contributions, issues and feature requests are welcome. Feel free to check issues page if you want to contribute or simply add an idea that you have to the project. You can also send me an email at [elirazatia003@gmail.com]() if you need furthur help and I will try to update this file with the information.

---

👨‍🔧### LICENCE

> MIT License

> Copyright (c) 2022 Eliraz Atia

> Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

> The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
