/**
 * Expand layout string and given option into an array that includes the width (in px) for each item
 * It also returns the gap space (can change is useAppliedSize is true)
 * @param {{ pattern:String, realSize:Number, appliedSize:Number, useAppliedSize:Boolean }}
 * @returns {{ gap:function(Boolean):Number, items:function(Boolean):Array<Number> }}
 */
 export default ({ pattern, gap, realSize, appliedSize }) => {
	gap = parseInt(gap)
	realSize = parseInt(realSize)
	appliedSize = parseInt(appliedSize)

	const isValidElement = /^(auto|([0-9|%]+)(pt)?)(\*[0-9]+)?$/

	var elements = []
	const split = pattern.split(' ')

	// Make sure every item in the pattern in valid and occurs as many times as needed
	// (Based if the item has a multiplier or not)
	split.forEach(item => {
		if (!isValidElement.test(item)) return

		// const isMultiplied = item.includes('*')
		const split = item.split('*')

		const value = split[0]
		const multiplier = split[1] || 1 //(split.length === 1) ? split[0] : 1

		var i = 0
		while (i < multiplier) {
			elements.push(value)
			i ++
		}
	})

	// check if items are empty, if so make a single item, if items only contain one item then use that value as the amount of columns/rows
	if (elements.length === 0) {
        elements.push(1)
    } else if (elements.length === 1) {
        const elementZero = elements[0]

        const asNumber = parseInt(elementZero)
		const isDirectPoint = elementZero.indexOf('pt')
        if (!isNaN(asNumber) && isDirectPoint == -1) {
			elements = []
			var i = 0
            while(i < asNumber) {
                elements.push(1)
                i ++
            }
        }
    }

	// console.log('ELEMENTS after', elements)

	// The final array of items (in real sizes)
	const array = (() => {
		var usedSpace = 0
        var totalFractions = 0

        var items = {}

		// Checks a text value and see if it is a fraction or a direct number point, and an integrer based number value
		function expand(element) {
			// console.log('SHOULD EXPAND', element)
			element = element.toString()
            const replaced = element.replace('pt', '')
            const isDirectPoint = (element !== replaced)
			// console.log('replaced', element, isDirectPoint)

            element = (isDirectPoint) ? element.replace('pt', '') : element
            const numberValue = parseInt(element)

            return { numberValue:numberValue, isDirectPoint:isDirectPoint }
		}

		// Evaluates the given numberValue as a whole number
		function evaluateAsWholeNumber(i, numberValue) {
			usedSpace += numberValue
            items[i] = numberValue
		}

		// Evaluates the given numberValue as a franction
		function evaluateAsFraction(i, numberValue) {
			const availiableSpace = (realSize - usedSpace) - ((elements.length - 1) * gap)
            const columnWidth = (availiableSpace / totalFractions)
            items[i] = (columnWidth * numberValue)
		}

		var index = 0
		var evaluatingAs = 0
		while (index < elements.length) {
			const element = elements[index]
			const { isDirectPoint, numberValue } = expand(element)

			index += 1
			if (evaluatingAs === 0) {
				if (isDirectPoint) evaluateAsWholeNumber((index - 1), numberValue)
				else totalFractions += numberValue
			} else if (!isDirectPoint && evaluatingAs === 1) {
				evaluateAsFraction((index - 1), numberValue)
			}

			if (index === (elements.length) && evaluatingAs === 0) {
				evaluatingAs = 1
				index = 0
			}
		} return items
	})()

	const nearestDecimal = (val) => (Math.round(val * 100) / 100)
	return {
		gap:((useAppliedSize) => {
			if (useAppliedSize) return nearestDecimal((appliedSize / realSize) * gap)
			return gap
		}),
		items:((useAppliedSize) => {
			return Object.keys(array).sort((a,b) => (a > b)).map(i => {
				const val = array[i]
				if (useAppliedSize) return nearestDecimal((appliedSize / realSize) * val)
				return val
			})
		})
	}
}