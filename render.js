const makeStateIsActiveDecorator = require(`./active-decorator`)

const UPDATE_ROUTE_KEY = `update_route`

module.exports = function RactiveStateRouter(Ractive, ractiveOptions, options) {
	function copyIfAppropriate(value) {
		if (options && options.deepCopyDataOnSet) {
			return copy(value)
		} else {
			return value
		}
	}
	return function makeRenderer(stateRouter) {
		const ExtendedRactive = Ractive.extend(ractiveOptions || {})
		const extendedData = ExtendedRactive.defaults.data
		const ractiveData = Ractive.defaults.data

		const globalData = {}
		globalData[UPDATE_ROUTE_KEY] = {}
		const globalRactive = new Ractive({
			data: globalData,
		})

		stateRouter.on(`stateChangeEnd`, () => {
			globalRactive.update(UPDATE_ROUTE_KEY)
		})

		extendedData.makePath = ractiveData.makePath = function makePath() {
			globalRactive.get(UPDATE_ROUTE_KEY)
			return stateRouter.makePath.apply(null, arguments)
		}

		extendedData.active = ractiveData.active = function active(stateName, options, className = `active`) {
			globalRactive.get(UPDATE_ROUTE_KEY)
			return stateRouter.stateIsActive(stateName, options) ? className : ``
		}

		const activeDecorator = makeStateIsActiveDecorator(stateRouter)

		async function render(context) {
			const element = context.element
			const inputTemplate = context.template

			const defaultDecorators = {
				active: activeDecorator,
			}

			function getData() {
				const copyOfContent = copyIfAppropriate(context.content)
				return isTemplate(inputTemplate) ? copyOfContent : ({ ...inputTemplate.data, ...copyOfContent })
			}
			function getDecorators() {
				return isTemplate(inputTemplate) ? defaultDecorators : Object.assign(defaultDecorators, inputTemplate.decorators)
			}
			function getOptions() {
				const bareOptions = isTemplate(inputTemplate) ? { template: inputTemplate } : inputTemplate

				return { ...bareOptions, decorators: getDecorators(),
					data: getData(),
					el: element }
			}

			return new ExtendedRactive(getOptions())
		}

		return {
			render,
			destroy: async function destroy(ractive) {
				return ractive.teardown()
			},
			getChildElement: async function getChildElement(ractive) {
				return ractive.find(`ui-view`)
			},
		}
	}
}

function copy(value) {
	if (Array.isArray(value)) {
		return value.map(copy)
	} else if (object(value)) {
		const target = {}
		Object.keys(value).forEach(key => {
			target[key] = copy(value[key])
		})
		return target
	} else {
		return value
	}
}

function object(o) {
	return o && typeof o === `object`
}

function isTemplate(inputTemplate) {
	return typeof inputTemplate === `string` || isRactiveTemplateObject(inputTemplate)
}

function isRactiveTemplateObject(template) {
	// Based on https://github.com/ractivejs/ractive/blob/b1c9e1e5c22daac3210ee7db0f511065b31aac3c/src/Ractive/config/custom/template/template.js#L113-L116
	return template && typeof template.v === `number`
}
