import util from "../../util"

export default function applyPreviewPropertiesToNode(node,xPos,yPos,width,height) {
    if (!node) return

    xPos = parseInt(xPos)
    yPos = parseInt(yPos)
    width = parseInt(width)
    height = parseInt(height)

    const {x,y,h,w} = util.calculateFinalXYWH(
        xPos,
        yPos,
        width,
        height
    )

    node.style.gridRowStart = `${y}`
    node.style.gridRowEnd = `${y + h + 1}`
    node.style.gridColumnStart = `${x}`
    node.style.gridColumnEnd = `${x + w + 1}`
}
