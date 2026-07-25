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

    <section class="panel">
      <button
        class="demo-btn"
        data-ct-title="自定义 class 的 tooltip"
        data-ct-placement="bottom"
        data-ct-custom-class="my-tooltip"
      >
        Custom Class
      </button>

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

      <button id="callbackBtn" class="demo-btn">
        Callbacks (check console)
      </button>

      <button id="escapeBtn" class="demo-btn">
        Press Escape to close
      </button>
    </section>
  </main>
`

CellTooltip.initAll('.demo-btn[data-ct-title]')

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
