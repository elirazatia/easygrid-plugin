import communicator from "../util/communicator"
import merging from "./merging"

import calculateFinalXYWH from '../util/calculate-xyhw'


/**
 * Pushes the layout to the figma layer selected by calculating where it should go and creating an array of the final new layers (each cell)
 * @param {{xItems:Array<Number>, yItems:Array<Number>, xGap:Number, yGap:Number}} param0 
 * @param {{ colour:String, replaceSelected:Boolean }} options 
 */
export default function({xItems, yItems, xGap, yGap}, options) {
    var finalItems = []
    var currentXPosition = 0
    var currentYPosition = 0

    /** * Check if the user has merged, if so then create the grid differently */
    if (merging.doesIncludeMerges()) {
        /** * Loop thorugh every merger */
        merging.forEach(merge => {
            const finalPlacement = calculateFinalXYWH(merge.x, merge.y, merge.w, merge.h)
            finalPlacement.x = finalPlacement.x - 1
            finalPlacement.y = finalPlacement.y - 1

            function getPoint(arr, gap, index, inclusive) {
                var current = 0
                var i = 0
                var hasFinished = false
    
                while (!hasFinished) {
                    if (i === index) {
                        if (inclusive) current += arr[i]
                        hasFinished = true
                    } else { current += arr[i] + gap }
                    i ++
                }
    
                return current
            }

            const startX = getPoint(xItems, xGap, finalPlacement.x, false)
            const startY = getPoint(yItems, yGap, finalPlacement.y, false)
            const endX = getPoint(xItems, xGap, finalPlacement.x + finalPlacement.w, true)
            const endY = getPoint(yItems, yGap, finalPlacement.y + finalPlacement.h, true)
            const width = endX - startX
            const height = endY - startY
            
            finalItems.push({
                x:startX, y:startY,
                width:width, height:height,
            })    
        })
    } else {
        var yIndex = 0
        while (yIndex < yItems.length) {
            var xIndex = 0
            currentXPosition = 0
            const currentYItem = yItems[yIndex]
            while (xIndex < xItems.length) {
                const currentXItem = xItems[xIndex]
                finalItems.push({
                    x:currentXPosition, y:currentYPosition,
                    width:currentXItem, height:currentYItem,
                })

                currentXPosition += (currentXItem + xGap)
                xIndex ++
            }

            currentYPosition += (currentYItem + xGap)
            yIndex ++
        }
    }

    communicator.postToFigma('create-cells', {
        id:Math.random().toString().slice(4),
        items:finalItems,

        ...options
    })
}