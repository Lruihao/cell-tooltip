import './style.css'
import CellTooltip from './tooltip'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Cannot find #app container')
}

app.innerHTML = `
  <main class="demo">
    <h1>Cell Tooltip</h1>
    <p class="subtitle">参考 Bootstrap tooltip.js 的交互模型，做了轻量化实现。</p>

    <h2>基础触发方式</h2>
    <section class="panel">
      <button
        class="demo-btn"
        data-ct-title="顶部提示（hover + focus）"
        data-ct-placement="top"
      >
        Hover Top
      </button>

      <button
        class="demo-btn"
        data-ct-title="右侧提示（click）"
        data-ct-placement="right"
        data-ct-trigger="click"
        data-ct-theme="light"
      >
        Click Right
      </button>

      <button
        class="demo-btn"
        data-ct-title="自动选择方向（auto）+ 自动主题"
        data-ct-placement="auto"
        data-ct-theme="auto"
      >
        Auto Placement
      </button>

      <button id="manualBtn" class="demo-btn">Manual Toggle</button>
    </section>

    <h2>主题与动画</h2>
    <section class="panel">
      <button
        class="demo-btn"
        data-ct-title="深色主题（默认）"
        data-ct-placement="bottom"
        data-ct-theme="dark"
      >
        Dark Theme
      </button>

      <button
        class="demo-btn"
        data-ct-title="浅色主题"
        data-ct-placement="bottom"
        data-ct-theme="light"
      >
        Light Theme
      </button>

      <button
        class="demo-btn"
        data-ct-title="淡入动画"
        data-ct-placement="bottom"
        data-ct-animation="fade"
      >
        Fade Animation
      </button>

      <button
        class="demo-btn"
        data-ct-title="滑出动画"
        data-ct-placement="bottom"
        data-ct-animation="shift-away"
      >
        Shift-Away
      </button>

      <button
        class="demo-btn"
        data-ct-title="无动画"
        data-ct-placement="bottom"
        data-ct-animation="none"
      >
        No Animation
      </button>
    </section>

    <h2>高级功能</h2>
    <section class="panel">
      <button
        class="demo-btn"
        data-ct-title="<strong>HTML</strong> 内容"
        data-ct-html="true"
        data-ct-placement="bottom"
      >
        HTML Content
      </button>

      <button
        class="demo-btn"
        data-ct-title="自定义偏移量 (20px)"
        data-ct-placement="bottom"
        data-ct-offset="20"
      >
        Custom Offset
      </button>

      <button
        class="demo-btn"
        data-ct-title="延迟显示 (500ms)"
        data-ct-placement="bottom"
        data-ct-delay="500"
      >
        Delayed Show
      </button>

      <button
        class="demo-btn my-tooltip-class"
        data-ct-title="自定义 class 的 tooltip"
        data-ct-placement="bottom"
        data-ct-custom-class="my-tooltip"
      >
        Custom Class
      </button>

      <button id="interactiveBtn" class="demo-btn">
        Interactive (hover me)
      </button>

      <button id="callbackBtn" class="demo-btn">
        Callbacks (console)
      </button>

      <button id="escapeBtn" class="demo-btn">
        Escape to close
      </button>
    </section>

    <h2>生命周期</h2>
    <section class="panel">
      <button id="showOnCreateBtn" class="demo-btn">
        showOnCreate
      </button>

      <button id="disposeBtn" class="demo-btn">
        Dispose Demo
      </button>

      <button id="getInstanceBtn" class="demo-btn">
        getInstance
      </button>
    </section>
  </main>
`

CellTooltip.initAll('.demo-btn[data-ct-title]')

// Manual toggle
const manualButton = document.querySelector<HTMLElement>('#manualBtn')
if (manualButton) {
  const manualTooltip = CellTooltip.getOrCreateInstance(manualButton, {
    title: '手动触发 tooltip',
    placement: 'bottom',
    trigger: 'manual',
  })
  manualButton.addEventListener('click', () => {
    manualTooltip.toggle()
  })
}

// Interactive tooltip
const interactiveBtn = document.querySelector<HTMLElement>('#interactiveBtn')
if (interactiveBtn) {
  CellTooltip.getOrCreateInstance(interactiveBtn, {
    title: '可以 hover 到这里来 <a href="#">点击链接</a>',
    placement: 'bottom',
    html: true,
    interactive: true,
  })
}

// Callback demo
const callbackBtn = document.querySelector<HTMLElement>('#callbackBtn')
if (callbackBtn) {
  CellTooltip.getOrCreateInstance(callbackBtn, {
    title: '查看控制台输出',
    placement: 'bottom',
    trigger: 'click',
    onShow: (tooltip) => {
      console.log('onShow fired:', tooltip)
    },
    onHide: (tooltip) => {
      console.log('onHide fired:', tooltip)
    },
  })
}

// Escape key demo
const escapeBtn = document.querySelector<HTMLElement>('#escapeBtn')
if (escapeBtn) {
  CellTooltip.getOrCreateInstance(escapeBtn, {
    title: '按 Escape 键关闭',
    placement: 'bottom',
    trigger: 'click',
  })
}

// showOnCreate demo
const showOnCreateBtn = document.querySelector<HTMLElement>('#showOnCreateBtn')
if (showOnCreateBtn) {
  CellTooltip.getOrCreateInstance(showOnCreateBtn, {
    title: '创建时自动显示',
    placement: 'bottom',
    trigger: 'manual',
    showOnCreate: true,
  })
}

// Dispose demo
const disposeBtn = document.querySelector<HTMLButtonElement>('#disposeBtn')
if (disposeBtn) {
  const disposeTooltip = CellTooltip.getOrCreateInstance(disposeBtn, {
    title: '点击按钮销毁此 tooltip',
    placement: 'bottom',
    trigger: 'hover',
  })
  disposeBtn.addEventListener('click', () => {
    disposeTooltip.dispose()
    disposeBtn.textContent = 'Disposed!'
    disposeBtn.disabled = true
  })
}

// getInstance demo
const getInstanceBtn = document.querySelector<HTMLElement>('#getInstanceBtn')
if (getInstanceBtn) {
  const instance = CellTooltip.getInstance(getInstanceBtn)
  if (instance) {
    console.log('getInstance result:', instance)
    console.log('getContent():', instance.getContent())
  }
}
