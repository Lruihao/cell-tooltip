<a name="CellTooltip"></a>

## CellTooltip
基于 Bootstrap 5 + Font Awesome 6 的消息提示插件  
(Base on [Bootstrap#Alerts](https://getbootstrap.com/docs/5.2/components/alerts/))

**Kind**: global class  
**Version**: 1.0.3  
**Author**: Lruihao  

* [CellTooltip](#CellTooltip)
    * [new CellTooltip(option)](#new_CellTooltip_new)
    * [.find(selector)](#CellTooltip+find) ⇒ <code>Element</code>
    * [.setClassName([className])](#CellTooltip+setClassName) ⇒ [<code>CellTooltip</code>](#CellTooltip)
    * [.setContent([content])](#CellTooltip+setContent) ⇒ [<code>CellTooltip</code>](#CellTooltip)
    * [.setContentClass([contentClass])](#CellTooltip+setContentClass) ⇒ [<code>CellTooltip</code>](#CellTooltip)
    * [.setIcon([iconClass])](#CellTooltip+setIcon) ⇒ [<code>CellTooltip</code>](#CellTooltip)
    * [.show(option)](#CellTooltip+show) ⇒ [<code>CellTooltip</code>](#CellTooltip)
    * [.hide()](#CellTooltip+hide) ⇒ [<code>CellTooltip</code>](#CellTooltip)
    * [.[type](option)](#CellTooltip+[type]) ⇒ [<code>CellTooltip</code>](#CellTooltip)

<a name="new_CellTooltip_new"></a>

### new CellTooltip(option)
Constructor of Cell Tooltip


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| option | <code>Object</code> |  | 初始化设置 |
| [option.appendTo] | <code>String</code> | <code>&#x27;body&#x27;</code> | parent selector |
| [option.type] | <code>String</code> |  | Tooltip 类型，可选值：<br> ['primary', 'secondary', 'success', 'danger', 'error', 'warning', 'info', 'light', 'dark'] |
| [option.className] | <code>String</code> | <code>&#x27;alert-light&#x27;</code> | tooltip className in HTML |
| [option.iconClass] | <code>String</code> |  | className in HTML for icon element |
| [option.content] | <code>String</code> |  | Tooltip Content (HTML format is supported) |
| [option.contentClass] | <code>String</code> |  | className in HTML for content element |
| [option.closeable] | <code>Boolean</code> | <code>true</code> | 是否可关闭 |
| [option.delay] | <code>Number</code> | <code>3000</code> | 延迟关闭时间，unit: ms |
| [option.position] | <code>String</code> | <code>&#x27;top-center&#x27;</code> | Tooltip 位置，可选值：<br> ['top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center', 'bottom-end', 'start-center', 'end-center'] |
| [option.offset] | <code>Number</code> | <code>0</code> | Tooltip 偏移量，unit: px |

<a name="CellTooltip+find"></a>

### cellTooltip.find(selector) ⇒ <code>Element</code>
查找子元素

**Kind**: instance method of [<code>CellTooltip</code>](#CellTooltip)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>String</code> | css selector |

<a name="CellTooltip+setClassName"></a>

### cellTooltip.setClassName([className]) ⇒ [<code>CellTooltip</code>](#CellTooltip)
设置 Tooltip 类名

**Kind**: instance method of [<code>CellTooltip</code>](#CellTooltip)  
**Since**: 1.0.0  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [className] | <code>String</code> | <code>&#x27;alert-light&#x27;</code> | tooltip's className in HTML |

<a name="CellTooltip+setContent"></a>

### cellTooltip.setContent([content]) ⇒ [<code>CellTooltip</code>](#CellTooltip)
设置內容

**Kind**: instance method of [<code>CellTooltip</code>](#CellTooltip)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [content] | <code>String</code> | Tooltip Content (HTML format is supported) |

<a name="CellTooltip+setContentClass"></a>

### cellTooltip.setContentClass([contentClass]) ⇒ [<code>CellTooltip</code>](#CellTooltip)
设置內容 Class

**Kind**: instance method of [<code>CellTooltip</code>](#CellTooltip)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [contentClass] | <code>String</code> | className in HTML for content element |

<a name="CellTooltip+setIcon"></a>

### cellTooltip.setIcon([iconClass]) ⇒ [<code>CellTooltip</code>](#CellTooltip)
设置 Tooltip icon

**Kind**: instance method of [<code>CellTooltip</code>](#CellTooltip)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| [iconClass] | <code>String</code> | className in HTML for font-awesome icon element |

<a name="CellTooltip+show"></a>

### cellTooltip.show(option) ⇒ [<code>CellTooltip</code>](#CellTooltip)
显示 Tooltip 提示

**Kind**: instance method of [<code>CellTooltip</code>](#CellTooltip)  
**Since**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| option | <code>Object</code> | see [Constructor](#CellTooltip) |

<a name="CellTooltip+hide"></a>

### cellTooltip.hide() ⇒ [<code>CellTooltip</code>](#CellTooltip)
关闭 Tooltip 提示

**Kind**: instance method of [<code>CellTooltip</code>](#CellTooltip)  
**Since**: 1.0.0  
<a name="CellTooltip+[type]"></a>

### cellTooltip.[type](option) ⇒ [<code>CellTooltip</code>](#CellTooltip)
显示指定类型的 Tooltip 提示<br>
type: ['success', 'error', 'warning', 'info']

**Kind**: instance method of [<code>CellTooltip</code>](#CellTooltip)  
**Since**: 1.0.3  

| Param | Type | Description |
| --- | --- | --- |
| option | <code>Object</code> | see [show](#CellTooltip+show) |

