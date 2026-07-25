export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto'
export type TooltipTrigger = 'hover' | 'focus' | 'click' | 'manual'
export type TooltipTheme = 'light' | 'dark' | 'auto'

export interface TooltipDelay {
  show: number
  hide: number
}

export interface TooltipOptions {
  title?: string | ((element: HTMLElement) => string)
  placement?: TooltipPlacement
  trigger?: string
  theme?: TooltipTheme
  container?: HTMLElement
  offset?: number
  html?: boolean
  delay?: number | Partial<TooltipDelay>
  customClass?: string
  showOnCreate?: boolean
  interactive?: boolean
  onShow?: (tooltip: Tooltip) => void
  onHide?: (tooltip: Tooltip) => void
}

type ActiveTriggerState = {
  click: boolean
  hover: boolean
  focus: boolean
}

const DEFAULT_OPTIONS: Required<Omit<TooltipOptions, 'title' | 'container' | 'onShow' | 'onHide'>> & { title: '' } = {
  title: '',
  placement: 'top',
  trigger: 'hover focus',
  theme: 'dark',
  offset: 8,
  html: false,
  delay: 0,
  customClass: '',
  showOnCreate: false,
  interactive: false,
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

function normalizeDelay(delay: number | Partial<TooltipDelay> | undefined): TooltipDelay {
  if (typeof delay === 'number') {
    return { show: delay, hide: delay }
  }
  return {
    show: delay?.show ?? DEFAULT_DELAY.show,
    hide: delay?.hide ?? DEFAULT_DELAY.hide,
  }
}

const VALID_TRIGGERS: Set<string> = new Set(['hover', 'focus', 'click', 'manual'])

function normalizeTriggers(trigger: string): TooltipTrigger[] {
  const valid = trigger.trim().split(/\s+/).filter((t) => VALID_TRIGGERS.has(t)) as TooltipTrigger[]
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

export default class Tooltip {
  private element: HTMLElement
  private config: Required<Omit<TooltipOptions, 'title' | 'container' | 'onShow' | 'onHide'>> & {
    title: string | ((element: HTMLElement) => string)
    container: HTMLElement
    delay: TooltipDelay
    onShow?: (tooltip: Tooltip) => void
    onHide?: (tooltip: Tooltip) => void
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
  private rafId: number | null = null

  constructor(element: HTMLElement, options: TooltipOptions = {}) {
    this.element = element

    const titleFromAttr = (el: HTMLElement): string => el.dataset.ctTitle ?? el.dataset.ctOriginalTitle ?? el.getAttribute('title') ?? ''
    const placementFromAttr = (element.getAttribute('data-ct-placement') ?? undefined) as TooltipPlacement | undefined
    const triggerFromAttr = element.getAttribute('data-ct-trigger') ?? undefined
    const themeFromAttr = element.getAttribute('data-ct-theme') ?? undefined
    const htmlFromAttr = element.getAttribute('data-ct-html') === 'true' ? true : undefined
    const offsetFromAttr = element.dataset.ctOffset ? Number(element.dataset.ctOffset) : undefined
    const delayFromAttr = element.dataset.ctDelay ? Number(element.dataset.ctDelay) : undefined
    const customClassFromAttr = element.getAttribute('data-ct-custom-class') ?? undefined
    const showOnCreateFromAttr = element.hasAttribute('data-ct-show-on-create') ? true : undefined
    const interactiveFromAttr = element.hasAttribute('data-ct-interactive') ? true : undefined

    this.config = {
      title: options.title ?? titleFromAttr,
      placement: options.placement ?? placementFromAttr ?? DEFAULT_OPTIONS.placement,
      trigger: options.trigger ?? triggerFromAttr ?? DEFAULT_OPTIONS.trigger,
      theme: normalizeTheme(options.theme ?? themeFromAttr ?? DEFAULT_OPTIONS.theme),
      container: options.container ?? document.body,
      offset: options.offset ?? offsetFromAttr ?? DEFAULT_OPTIONS.offset,
      html: options.html ?? htmlFromAttr ?? DEFAULT_OPTIONS.html,
      delay: normalizeDelay(options.delay ?? delayFromAttr),
      customClass: options.customClass ?? customClassFromAttr ?? DEFAULT_OPTIONS.customClass,
      showOnCreate: options.showOnCreate ?? showOnCreateFromAttr ?? DEFAULT_OPTIONS.showOnCreate,
      interactive: options.interactive ?? interactiveFromAttr ?? DEFAULT_OPTIONS.interactive,
      onShow: options.onShow,
      onHide: options.onHide,
    }

    if (element.title) {
      element.setAttribute('data-ct-original-title', element.title)
      element.removeAttribute('title')
    }

    this.addListeners()
    INSTANCE_MAP.set(element, this)

    if (this.config.showOnCreate) {
      this.show()
    }
  }

  static getInstance(element: HTMLElement): Tooltip | null {
    return INSTANCE_MAP.get(element) ?? null
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
    if (!this.isEnabled || !this.hasContent() || this.isDisabledElement()) {
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
      this.config.onShow?.(this)
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
    this.config.onHide?.(this)

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

  refresh(): void {
    if (!this.tip || !this.tip.classList.contains('show')) {
      return
    }

    this.setContent(this.tip)
    this.updatePosition()
  }

  setTitle(title: string | ((element: HTMLElement) => string)): void {
    this.config.title = title
    this.refresh()
  }

  dispose(): void {
    this.clearTimer()
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.listeners.forEach((off) => off())
    this.listeners = []
    if (this.tip) {
      this.tip.remove()
      this.tip = null
      this.arrow = null
    }
    this.element.removeAttribute('aria-describedby')
    this.hoverState = null
    this.activeTrigger.click = false
    this.activeTrigger.focus = false
    this.activeTrigger.hover = false
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

        this.bind(document, 'click', ((event: MouseEvent) => {
          const target = event.target as Node
          if (this.activeTrigger.click && this.tip?.classList.contains('show') &&
            !this.element.contains(target) && !this.tip.contains(target)) {
            this.activeTrigger.click = false
            this.hide()
          }
        }) as EventListener)
      }
    }

    const throttledUpdate = () => {
      if (this.rafId !== null) {
        return
      }
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null
        if (this.tip && this.tip.classList.contains('show')) {
          const rect = this.element.getBoundingClientRect()
          const isVisible = rect.bottom > 0 && rect.top < window.innerHeight &&
            rect.right > 0 && rect.left < window.innerWidth
          if (isVisible) {
            this.updatePosition()
          } else {
            this.hide()
          }
        }
      })
    }

    this.bind(window, 'resize', throttledUpdate)
    this.bind(window, 'scroll', throttledUpdate)

    this.bind(document, 'keydown', ((event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.tip?.classList.contains('show')) {
        this.hide()
      }
    }) as EventListener)
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

  private isDisabledElement(): boolean {
    return this.element.hasAttribute('disabled') ||
      this.element.getAttribute('aria-disabled') === 'true'
  }

  private getTitle(): string {
    const { title } = this.config
    return typeof title === 'function' ? title(this.element) : title
  }

  private getTipElement(): HTMLElement {
    if (this.tip) {
      return this.tip
    }

    const tip = document.createElement('div')
    tip.className = this.config.customClass ? `cell-tooltip ${this.config.customClass}` : 'cell-tooltip'
    tip.id = nextId('cell-tooltip')
    tip.setAttribute('role', 'tooltip')
    tip.dataset.theme = this.config.theme
    tip.innerHTML = '<div class="cell-tooltip-arrow"></div><div class="cell-tooltip-inner"></div>'

    if (this.config.interactive) {
      tip.style.pointerEvents = 'auto'
      tip.addEventListener('mouseenter', () => {
        this.clearTimer()
        this.activeTrigger.hover = true
      })
      tip.addEventListener('mouseleave', () => {
        this.activeTrigger.hover = false
        this.leave()
      })
    }

    this.tip = tip
    this.arrow = tip.firstElementChild as HTMLElement
    return tip
  }

  private setContent(tip: HTMLElement): void {
    const inner = tip.lastElementChild as HTMLElement
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
        left = targetRect.left + scrollX - tipRect.width - offset
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
