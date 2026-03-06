import './tooltip.css'
import tooltipCssText from './tooltip.css?inline'

const RUNTIME_STYLE_ID = 'cell-tooltip-runtime-style'

function injectTooltipStyle(): void {
	if (typeof document === 'undefined') {
		return
	}

	if (document.getElementById(RUNTIME_STYLE_ID)) {
		return
	}

	const style = document.createElement('style')
	style.id = RUNTIME_STYLE_ID
	style.textContent = tooltipCssText
	document.head.appendChild(style)
}

injectTooltipStyle()

export { Tooltip } from './tooltip'
export type { TooltipDelay, TooltipOptions, TooltipPlacement, TooltipTheme, TooltipTrigger } from './tooltip'
