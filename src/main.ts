import './style.css'
import { Tooltip } from './tooltip'

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
  </main>
`

Tooltip.initAll('.demo-btn[data-ct-title]')

const manualButton = document.querySelector<HTMLElement>('#manualBtn')

if (manualButton) {
  const manualTooltip = Tooltip.getOrCreateInstance(manualButton, {
    title: '手动触发 tooltip',
    placement: 'bottom',
    trigger: 'manual',
  })

  manualButton.addEventListener('click', () => {
    manualTooltip.toggle()
  })
}
