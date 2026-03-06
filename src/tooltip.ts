export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto'
export type TooltipTrigger = 'hover' | 'focus' | 'click' | 'manual'
export type TooltipTheme = 'light' | 'dark' | 'auto'

export interface TooltipDelay {
  show: number
  hide: number
}

export interface TooltipOptions {
  title?: string | (() => string)
  placement?: TooltipPlacement
  trigger?: string
  theme?: TooltipTheme
  container?: HTMLElement
  offset?: number
  html?: boolean
  delay?: number | Partial<TooltipDelay>
}

type ActiveTriggerState = {
  click: boolean
  hover: boolean
  focus: boolean
}

const DEFAULT_OPTIONS: Required<Omit<TooltipOptions, 'title' | 'container'>> & { title: '' } = {
  title: '',
  placement: 'top',
  trigger: 'hover focus',
  theme: 'dark',
  offset: 8,
  html: false,
  delay: 0,
}

const DEFAULT_DELAY: TooltipDelay = {
  show: 120,
  hide: 80,
}

const AUTO_PLACEMENTS: Exclude<TooltipPlacement, 'auto'>[] = ['top', 'bottom', 'right', 'left']

const INSTANCE_MAP = new WeakMap<HTMLElement, Tooltip>()

let idSeed = 0

function nextId(prefix: string): string {
  idSeed += 1
  return `${prefix}-${idSeed}`
}

function isHTMLElement(node: unknown): node is HTMLElement {
  return node instanceof HTMLElement
}

function normalizeDelay(delay: number | Partial<TooltipDelay> | undefined): TooltipDelay {
  if (typeof delay === 'number') {
    return {
      show: delay,
      hide: delay,
    }
  }

  return {
    show: delay?.show ?? DEFAULT_DELAY.show,
    hide: delay?.hide ?? DEFAULT_DELAY.hide,
  }
}

function normalizeTriggers(trigger: string): TooltipTrigger[] {
  const list = trigger
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (list.length === 0) {
    return ['hover', 'focus']
  }

  const valid: TooltipTrigger[] = []

  for (const item of list) {
    if (item === 'hover' || item === 'focus' || item === 'click' || item === 'manual') {
      valid.push(item)
    }
  }

  return valid.length > 0 ? valid : ['hover', 'focus']
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function normalizeTheme(theme: string | undefined): TooltipTheme {
  if (theme === 'light' || theme === 'dark' || theme === 'auto') {
    return theme
  }

  return DEFAULT_OPTIONS.theme
}

export class Tooltip {
  private element: HTMLElement
  private config: Required<Omit<TooltipOptions, 'title' | 'container'>> & {
    title: string | (() => string)
    container: HTMLElement
    delay: TooltipDelay
  }
  private tip: HTMLElement | null = null
  private arrow: HTMLElement | null = null
  private isEnabled = true
  private timeoutId: number | null = null
  private hoverState: 'show' | 'out' | null = null
  private activeTrigger: ActiveTriggerState = {
    click: false,
    hover: false,
    focus: false,
  }
  private listeners: Array<() => void> = []

  constructor(element: HTMLElement, options: TooltipOptions = {}) {
    this.element = element

    const titleFromAttr = element.getAttribute('data-ct-title') ?? element.getAttribute('title') ?? ''
    const placementFromAttr = (element.getAttribute('data-ct-placement') ?? undefined) as TooltipPlacement | undefined
    const triggerFromAttr = element.getAttribute('data-ct-trigger') ?? undefined
    const themeFromAttr = element.getAttribute('data-ct-theme') ?? undefined

    this.config = {
      title: options.title ?? titleFromAttr,
      placement: options.placement ?? placementFromAttr ?? DEFAULT_OPTIONS.placement,
      trigger: options.trigger ?? triggerFromAttr ?? DEFAULT_OPTIONS.trigger,
      theme: normalizeTheme(options.theme ?? themeFromAttr ?? DEFAULT_OPTIONS.theme),
      container: options.container ?? document.body,
      offset: options.offset ?? DEFAULT_OPTIONS.offset,
      html: options.html ?? DEFAULT_OPTIONS.html,
      delay: normalizeDelay(options.delay),
    }

    if (element.title) {
      element.setAttribute('data-ct-original-title', element.title)
      element.removeAttribute('title')
    }

    this.addListeners()
    INSTANCE_MAP.set(element, this)
  }

  static getOrCreateInstance(element: HTMLElement, options?: TooltipOptions): Tooltip {
    return INSTANCE_MAP.get(element) ?? new Tooltip(element, options)
  }

  static initAll(selector = '[data-ct-title]', options?: TooltipOptions): Tooltip[] {
    return Array.from(document.querySelectorAll<HTMLElement>(selector)).map((element) =>
      Tooltip.getOrCreateInstance(element, options),
    )
  }

  enable(): void {
    this.isEnabled = true
  }

  disable(): void {
    this.isEnabled = false
  }

  toggleEnabled(): void {
    this.isEnabled = !this.isEnabled
  }

  toggle(): void {
    if (this.tip && this.tip.classList.contains('show')) {
      this.leave()
      return
    }
    this.enter()
  }

  show(): void {
    if (!this.isEnabled || !this.hasContent()) {
      return
    }

    const tip = this.getTipElement()
    tip.dataset.theme = this.config.theme

    const alreadyShown = tip.classList.contains('show')

    if (!tip.isConnected) {
      this.config.container.appendChild(tip)
    }

    this.setContent(tip)

    if (!alreadyShown) {
      this.updatePosition()
      tip.classList.add('show')
      this.element.setAttribute('aria-describedby', tip.id)
    }
  }

  hide(): void {
    const tip = this.tip
    if (!tip) {
      return
    }

    tip.classList.remove('show')
    this.activeTrigger.click = false
    this.activeTrigger.focus = false
    this.activeTrigger.hover = false
    this.hoverState = null
    this.element.removeAttribute('aria-describedby')

    window.setTimeout(() => {
      if (!tip.classList.contains('show')) {
        tip.remove()
      }
    }, 150)
  }

  update(): void {
    if (this.tip && this.tip.classList.contains('show')) {
      this.updatePosition()
    }
  }

  dispose(): void {
    this.clearTimer()
    this.listeners.forEach((off) => off())
    this.listeners = []
    this.hide()
    INSTANCE_MAP.delete(this.element)
  }

  private addListeners(): void {
    const triggers = normalizeTriggers(this.config.trigger)

    for (const trigger of triggers) {
      if (trigger === 'manual') {
        continue
      }

      if (trigger === 'hover') {
        this.bind(this.element, 'mouseenter', () => {
          this.activeTrigger.hover = true
          this.enter()
        })

        this.bind(this.element, 'mouseleave', () => {
          this.activeTrigger.hover = false
          this.leave()
        })
      }

      if (trigger === 'focus') {
        this.bind(this.element, 'focusin', () => {
          this.activeTrigger.focus = true
          this.enter()
        })

        this.bind(this.element, 'focusout', () => {
          this.activeTrigger.focus = false
          this.leave()
        })
      }

      if (trigger === 'click') {
        this.bind(this.element, 'click', (event) => {
          event.preventDefault()
          this.activeTrigger.click = !this.activeTrigger.click
          this.toggle()
        })
      }
    }

    this.bind(window, 'resize', () => this.update())
    this.bind(window, 'scroll', () => {
      if (this.activeTrigger.hover || this.activeTrigger.focus) {
        this.hide()
        return
      }

      this.update()
    })
  }

  private bind(target: EventTarget, eventName: string, handler: EventListener): void {
    target.addEventListener(eventName, handler)
    this.listeners.push(() => target.removeEventListener(eventName, handler))
  }

  private clearTimer(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  private enter(): void {
    if (!this.isEnabled) {
      return
    }

    this.clearTimer()
    this.hoverState = 'show'

    this.timeoutId = window.setTimeout(() => {
      if (this.hoverState === 'show') {
        this.show()
      }
    }, this.config.delay.show)
  }

  private leave(): void {
    if (this.hasActiveTrigger()) {
      return
    }

    this.clearTimer()
    this.hoverState = 'out'

    this.timeoutId = window.setTimeout(() => {
      if (this.hoverState === 'out') {
        this.hide()
      }
    }, this.config.delay.hide)
  }

  private hasActiveTrigger(): boolean {
    return this.activeTrigger.click || this.activeTrigger.focus || this.activeTrigger.hover
  }

  private hasContent(): boolean {
    const content = this.getTitle()
    return content.trim().length > 0
  }

  private getTitle(): string {
    const { title } = this.config
    return typeof title === 'function' ? title() : title
  }

  private getTipElement(): HTMLElement {
    if (this.tip) {
      return this.tip
    }

    const tip = document.createElement('div')
    tip.className = 'cell-tooltip'
    tip.id = nextId('cell-tooltip')
    tip.setAttribute('role', 'tooltip')
    tip.dataset.theme = this.config.theme
    tip.innerHTML = '<div class="cell-tooltip-arrow"></div><div class="cell-tooltip-inner"></div>'

    const arrow = tip.querySelector('.cell-tooltip-arrow')
    if (!isHTMLElement(arrow)) {
      throw new Error('Tooltip arrow element is missing')
    }

    this.tip = tip
    this.arrow = arrow
    return tip
  }

  private setContent(tip: HTMLElement): void {
    const inner = tip.querySelector('.cell-tooltip-inner')
    if (!isHTMLElement(inner)) {
      throw new Error('Tooltip inner element is missing')
    }

    const title = this.getTitle()

    if (this.config.html) {
      inner.innerHTML = title
      return
    }

    inner.textContent = title
  }

  private updatePosition(): void {
    const tip = this.getTipElement()

    tip.style.top = '0'
    tip.style.left = '0'

    const targetRect = this.element.getBoundingClientRect()
    const tipRect = tip.getBoundingClientRect()
    const placement = this.resolvePlacement(targetRect, tipRect)
    tip.dataset.placement = placement

    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const offset = this.config.offset

    let top = 0
    let left = 0

    switch (placement) {
      case 'top':
        top = targetRect.top + scrollY - tipRect.height - offset
        left = targetRect.left + scrollX + (targetRect.width - tipRect.width) / 2
        break
      case 'bottom':
        top = targetRect.bottom + scrollY + offset
        left = targetRect.left + scrollX + (targetRect.width - tipRect.width) / 2
        break
      case 'left':
        top = targetRect.top + scrollY + (targetRect.height - tipRect.height) / 2
        left = targetRect.left + scrollX - tipRect.width - 1.5 * offset
        break
      case 'right':
        top = targetRect.top + scrollY + (targetRect.height - tipRect.height) / 2
        left = targetRect.right + scrollX + offset
        break
    }

    const clampedTop = clamp(top, scrollY + 4, scrollY + viewportHeight - tipRect.height - 4)
    const clampedLeft = clamp(left, scrollX + 4, scrollX + viewportWidth - tipRect.width - 4)

    tip.style.top = `${Math.round(clampedTop)}px`
    tip.style.left = `${Math.round(clampedLeft)}px`

    this.updateArrowPosition(placement, targetRect, {
      top: clampedTop,
      left: clampedLeft,
      width: tipRect.width,
      height: tipRect.height,
    })
  }

  private resolvePlacement(
    targetRect: DOMRect,
    tipRect: DOMRect,
  ): Exclude<TooltipPlacement, 'auto'> {
    if (this.config.placement !== 'auto') {
      return this.config.placement
    }

    const offset = this.config.offset
    const spaceTop = targetRect.top
    const spaceBottom = window.innerHeight - targetRect.bottom
    const spaceLeft = targetRect.left
    const spaceRight = window.innerWidth - targetRect.right

    const fits = {
      top: spaceTop >= tipRect.height + offset,
      bottom: spaceBottom >= tipRect.height + offset,
      left: spaceLeft >= tipRect.width + offset,
      right: spaceRight >= tipRect.width + offset,
    }

    for (const placement of AUTO_PLACEMENTS) {
      if (fits[placement]) {
        return placement
      }
    }

    const area = {
      top: spaceTop,
      bottom: spaceBottom,
      left: spaceLeft,
      right: spaceRight,
    }

    return AUTO_PLACEMENTS.reduce((prev, current) => (area[current] > area[prev] ? current : prev), 'top')
  }

  private updateArrowPosition(
    placement: Exclude<TooltipPlacement, 'auto'>,
    targetRect: DOMRect,
    tooltipRect: { top: number; left: number; width: number; height: number },
  ): void {
    if (!this.arrow) {
      return
    }

    const targetCenterX = targetRect.left + window.scrollX + targetRect.width / 2
    const targetCenterY = targetRect.top + window.scrollY + targetRect.height / 2

    if (placement === 'top' || placement === 'bottom') {
      const rawX = targetCenterX - tooltipRect.left
      const x = clamp(rawX, 10, tooltipRect.width - 10)
      this.arrow.style.left = `${x}px`
      this.arrow.style.top = ''
      return
    }

    const rawY = targetCenterY - tooltipRect.top
    const y = clamp(rawY, 10, tooltipRect.height - 10)
    this.arrow.style.top = `${y}px`
    this.arrow.style.left = ''
  }
}
