# Fontmin

字体压缩工具，基于 Electron，使用指定字符集对 TTF 文件进行精简，生成CSS规则，支持上传字体文件到CDN。

![alt 预览](https://article-assets.lynan.cn/fontmin.png "预览")

例如
使用字符集`1234567890`对1.6MB字体进行精简，得到生成精简完成的字体文件仅4KB。
![alt 预览](https://article-assets.lynan.cn/fontmin.png "预览")


## Example

### CSS output(default)
```
@font-face {
    font-family: "Noteworthy";
    src: url("Noteworthy Light.eot"); /* IE9 */
    src: url("Noteworthy Light.eot?#iefix") format("embedded-opentype"), /* IE6-IE8 */
    url("Noteworthy Light.woff2") format("woff2"), /* chrome 36+, firefox 39+,iOS 10+, Android 67+ */
    url("Noteworthy Light.woff") format("woff"), /* chrome, firefox */
    url("Noteworthy Light.ttf") format("truetype"), /* chrome, firefox, opera, Safari, Android, iOS 4.2+ */
    url("Noteworthy Light.svg#Noteworthy") format("svg"); /* iOS 4.1- */
    font-style: normal;
    font-weight: normal;
}
```
### CSS output(use CDN)
```
@font-face {
    font-family: "Noteworthy";
    src: url("https://cdn.your-dn.com/node-common/fontresource/myFont-1635766931830-Noteworthy_Light.eot"); /* IE9 */
    src: url("https://cdn.your-dn.com/node-common/fontresource/myFont-1635766931830-Noteworthy_Light.eot?#iefix") format("embedded-opentype"), /* IE6-IE8 */
    url("https://cdn.your-dn.com/node-common/fontresource/myFont-1635766931821-Noteworthy_Light.woff2") format("woff2"), /* chrome 36+, firefox 39+,iOS 10+, Android 67+ */
    url("https://cdn.your-dn.com/node-common/fontresource/myFont-1635766931821-Noteworthy_Light.woff") format("woff"), /* chrome, firefox */
    url("https://cdn.your-dn.com/node-common/fontresource/myFont-1635766931832-Noteworthy_Light.ttf") format("truetype"), /* chrome, firefox, opera, Safari, Android, iOS 4.2+ */
    url("https://cdn.your-dn.com/node-common/fontresource/myFont-1635766931827-Noteworthy_Light.svg#Noteworthy") format("svg"); /* iOS 4.1- */
    font-style: normal;
    font-weight: normal;
}
```

## Development

Clone this repository and run `yarn && yarn start`

## Build

Run `yarn build`
