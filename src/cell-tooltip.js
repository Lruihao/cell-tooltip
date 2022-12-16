const CellTooltip = function () {
  /**
   * Tooltip 淡入淡出动画时长，unit: ms
   * @default var(--ct-duration)
   */
  const CT_DURATION = Number(getComputedStyle(document.documentElement).getPropertyValue('--ct-duration').trim().slice(0, -2));
  /**
   * 创建元素
   * @param {String} [parent = 'body'] parent selector
   * @param {String} [option.position = 'top-center'] Tooltip 位置，
   * 可选值：['top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center', 'bottom-end', 'start-center', 'end-center']
   * @param {Number} [option.offset = 0] Tooltip 偏移量，unit: px
   * @return {Element} $tooltipEle
   */
  const _createElement = function (parent = 'body', position = 'top-center', offset = 0) {
    const $tooltipEle = document.createElement('div');
    $tooltipEle.className = 'cell-tooltip alert alert-dismissible fade d-none';
    $tooltipEle.setAttribute('tabindex', '-1');
    $tooltipEle.setAttribute('role', 'alert');
    $tooltipEle.setAttribute('aria-hidden', true);
    $tooltipEle.dataset.position = position;
    $tooltipEle.style.setProperty('--ct-offset', `${offset}px`);
    document.querySelector(parent).appendChild($tooltipEle);
    return $tooltipEle;
  };

  /**
   * 创建 Tooltip 内容节点
   * @param {Element} $tooltip
   * @return {Element} $tooltipContent
   */
  const _createTooltipContent = function ($tooltip) {
    const $tooltipContent = document.createElement('div');
    $tooltipContent.className = 'cell-tooltip-content';
    $tooltip.appendChild($tooltipContent);
    return $tooltipContent;
  };

  /**
   * 创建 Tooltip 关闭按钮节点
   * 不启用 data-bs-dismiss="alert"，防止 BS 的关闭效果生效
   * @param {CellTooltip.prototype} tooltip
   * @return {Element} $btnClose
   */
  const _createTooltipBtnClose = function (tooltip) {
    const $btnClose = document.createElement('button');
    $btnClose.className = 'btn-close';
    $btnClose.type = 'button';
    $btnClose.setAttribute('aria-label', 'Close');
    // 设置 Tooltip 关闭事件监听
    $btnClose.addEventListener('click', function () {
      tooltip.hide();
    });
    tooltip._$tooltip.appendChild($btnClose);
    return $btnClose;
  };

  /**
   * 设置 关闭状态
   * @param {CellTooltip.prototype} tooltip
   * @param {Boolean} [closeable = true] 是否可关闭
   */
  const _setCloseBtn = function (tooltip, closeable) {
    closeable = closeable ?? tooltip.closeable ?? true;
    tooltip._$tooltip.classList.toggle('alert-dismissible', closeable);
    tooltip._$btnClose.classList.toggle('d-none', !closeable);
  };

  /**
   * 设置 Icon
   * @param {CellTooltip.prototype} tooltip
   * @param {String} [iconClass] className in HTML for font-awesome icon element
   */
  const _setIcon = function (tooltip, iconClass) {
    iconClass = iconClass ?? tooltip.option.iconClass ?? '';
    let $tooltipIcon = tooltip.find('.cell-tooltip-icon');
    if (!iconClass) {
      return $tooltipIcon?.classList.add('d-none');
    }
    // 首次渲染 Icon
    if (!$tooltipIcon) {
      $tooltipIcon = document.createElement('i');
      $tooltipIcon.classList.add('cell-tooltip-icon', ...iconClass.split(' '));
      tooltip._$tooltip.insertBefore($tooltipIcon, tooltip._$tooltipContent);
      return;
    }
    // 修改渲染后的 Icon
    $tooltipIcon.classList.value = `svg-inline--fa cell-tooltip-icon ${iconClass}`;
    const {prefix, iconName: icon} = FontAwesome.parse.icon(iconClass);
    $tooltipIcon.dataset.prefix = prefix;
    $tooltipIcon.dataset.icon = icon;
  };

  /**
   * 设置 Tooltip 延迟关闭时间
   * @param {CellTooltip.prototype} tooltip
   * @param {Number} [delay = 3000] 延迟关闭时间，unit: ms
   */
  const _setDelayTime = function (tooltip, delay) {
    delay = delay ?? tooltip.option.delay ?? 3000;
    if (tooltip._timer) {
      clearTimeout(tooltip._timer);
    }
    tooltip._timer = setTimeout(() => {
      tooltip.hide();
    }, delay);
  };
  /**
   * 设置 Tooltip 位置
   * @param {CellTooltip.prototype} tooltip
   * @param {String} [option.position = 'top-center'] Tooltip 位置，
   * 可选值：['top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center', 'bottom-end', 'start-center', 'end-center']
   * @param {Number} [option.offset = 0] Tooltip 偏移量，unit: px
   */
  const _setPosition = function (tooltip, position, offset) {
    tooltip._$tooltip.dataset.position = position ?? tooltip.option.position ?? 'top-center';
    tooltip._$tooltip.style = `--ct-offset: ${offset ?? tooltip.option.offset ?? 0}px`;
  };

  /**
   * Constructor of Cell Tooltip
   * @class CellTooltip
   * @classdesc 基于 Bootstrap 5 + Font Awesome 6 的消息提示插件  
   * (Base on {@link https://getbootstrap.com/docs/5.2/components/alerts/|Bootstrap#Alerts})
   * @param {Object} option 初始化设置
   * @param {String} [option.appendTo = 'body'] parent selector
   * @param {String} [option.type] Tooltip 类型，
   * 可选值：['primary', 'secondary', 'success', 'danger', 'error', 'warning', 'info', 'light', 'dark']
   * @param {String} [option.className = 'alert-light'] tooltip className in HTML
   * @param {String} [option.iconClass] className in HTML for icon element
   * @param {String} [option.content] Tooltip Content (HTML format is supported)
   * @param {String} [option.contentClass] className in HTML for content element
   * @param {Boolean} [option.closeable = true] 是否可关闭
   * @param {Number} [option.delay = 3000] 延迟关闭时间，unit: ms
   * @param {String} [option.position = 'top-center'] Tooltip 位置，
   * 可选值：['top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center', 'bottom-end', 'start-center', 'end-center']
   * @param {Number} [option.offset = 0] Tooltip 偏移量，unit: px
   * @version 1.0.0
   * @author Lruihao
   */
  function CellTooltip(option = {}) {
    const _proto = CellTooltip.prototype;
    this.option = option;
    this._$tooltip = _createElement(this.option.appendTo, this.option.position, this.option.offset);
    this._$tooltipContent = _createTooltipContent(this._$tooltip);
    this._$btnClose = _createTooltipBtnClose(this);

    /**
     * 查找子元素
     * @param {String} selector css selector
     * @returns {Element}
     * @name CellTooltip#find
     * @function
     * @since 1.0.0
     */
    _proto.find = function (selector) {
      return this._$tooltip.querySelector(selector);
    };

    /**
     * 设置 Tooltip 类名
     * @param {String} [className = 'alert-light'] tooltip's className in HTML
     * @returns {CellTooltip}
     * @name CellTooltip#setClassName
     * @function
     * @since 1.0.0
     */
    _proto.setClassName = function (className) {
      className = className ?? this.option.className;
      if (this.typeClass) {
        className = className ? `${className} ${this.typeClass}` : this.typeClass;
      }
      className = className ?? 'alert-light';
      this._$tooltip.className = 'cell-tooltip alert alert-dismissible fade';
      this._$tooltip.classList.add(...className.split(' '));
      return this;
    };

    /**
     * 设置內容
     * @param {String} [content] Tooltip Content (HTML format is supported)
     * @returns {CellTooltip}
     * @name CellTooltip#setContent
     * @function
     * @since 1.0.0
     */
    _proto.setContent = function (content) {
      this._$tooltipContent.innerHTML = content ?? this.option.content ?? '';
      return this;
    };

    /**
     * 设置內容 Class
     * @param {String} [contentClass] className in HTML for content element
     * @returns {CellTooltip}
     * @name CellTooltip#setContentClass
     * @function
     * @since 1.0.0
     */
    _proto.setContentClass = function (contentClass) {
      contentClass = contentClass ?? this.option.contentClass;
      this._$tooltipContent.className = 'cell-tooltip-content';
      if (contentClass) {
        this._$tooltipContent.classList.add(...contentClass.split(' '));
      }
      return this;
    };

    /**
     * 设置 Tooltip icon
     * @param {String} [iconClass] className in HTML for font-awesome icon element
     * @returns {CellTooltip}
     * @name CellTooltip#setIcon
     * @function
     * @since 1.0.0
     */
    _proto.setIcon = function (iconClass) {
      _setIcon(this, iconClass);
      return this;
    };

    /**
     * 显示 Tooltip 提示
     * @param {Object} option see {@link CellTooltip|Constructor}
     * @return {CellTooltip}
     * @name CellTooltip#show
     * @function
     * @since 1.0.0
     */
    _proto.show = function (option = {}) {
      // 'error' is an alias of type 'danger'
      option.type = option.type === 'error' ? 'danger' : (option.type ?? this.option.type);
      if (option.type) {
        this.typeClass = `alert-${option.type}`;
      }
      // 更新內容
      this.setIcon(option.iconClass)
          .setContent(option.content)
          .setContentClass(option.contentClass)
          .setClassName(option.className);
      _setDelayTime(this, option.delay);
      _setCloseBtn(this, option.closeable);
      _setPosition(this, option.position, option.offset);
      this._$tooltip.classList.remove('d-none');
      setTimeout(() => {
        this._$tooltip.classList.add('show');
      }, 0);
      return this;
    };

    /**
     * 关闭 Tooltip 提示
     * @return {CellTooltip}
     * @name CellTooltip#hide
     * @function
     * @since 1.0.0
     */
    _proto.hide = () => {
      this._$tooltip.classList.remove('show');
      setTimeout(() => {
        this._$tooltip.classList.add('d-none');
      }, CT_DURATION);
      clearTimeout(this._timer);
      return this;
    };
  }
  return CellTooltip;
}();
