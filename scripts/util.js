export default {
    releaseObject:(object) => {
        return JSON.parse(JSON.stringify(object))
    },

    // calculates the final x,y, width, and height based on the given properties
    // use when merging cells for cases such as width being -1 or -2 requiring offset but without changing the starting cell
    calculateFinalXYWH:(x,y,w,h) => {
        if (w < 0) {
            w = Math.abs(w)
            x -= w
        }

        if (h < 0) {
            h = Math.abs(h)
            y -= h
        }

        x = x + 1
        y = y + 1

        return {
            x:x,y:y,h:h,w:w
        }
    }
}