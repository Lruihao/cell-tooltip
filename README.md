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
this.tooltip = new CellTooltip({
  position: 'top-center',
  offset: document.querySelector('.container-header').offsetHeight
});

this.tooltip.show({
  type: 'info',
  content: 'hello world!'
});
/* Or */
this.tooltip.info({
  content: 'hello world!'
});
```
