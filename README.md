# Cell Tooltip

基于 Bootstrap 5 + Font Awesome 6 的消息提示插件 (Base on [Bootstrap#Alerts](https://getbootstrap.com/docs/5.2/components/alerts/))

## [Documentation](/docs/README.md)

文档更新命令：

```bash
npm install -g jsdoc
npm install -g jsdoc-to-markdown
```

```bash
jsdoc src -d docs/html && jsdoc2md src/*.js > docs/README.md
```

## Usage

```js
/**
 * 初始化消息提示框
 */
this.initMessage = () => {
  this.tooltip = new CellTooltip({
    position: 'top-center',
    offset: document.querySelector('.container-header').offsetHeight
  });
  const iconMap = {
    'warning': 'fa-solid fa-exclamation-triangle',
    'success': 'fa-solid fa-check-circle',
    'info': 'fa-solid fa-info-circle',
    'error': 'fa-solid fa-times-circle',
    'danger': 'fa-solid fa-times-circle'
  };
  // 作为 CellTooltip#show 函数的别名
  this.message = (option) => {
    iconMap[option.type] && (option.iconClass = iconMap[option.type]);
    this.tooltip.show(option);
  };
};
this.initMessage();
```

```js
this.message({
  type: 'info',
  content: 'hello world!'
});

/* Or */

this.tooltip.show({
  type: 'info',
  content: 'hello world!'
});
```
