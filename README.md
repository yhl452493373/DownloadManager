#### 用于替换Chrome浏览器下载管理功能，最新版可通过图标上右键菜单进入设置，配置是否启用浅色图标、通知
---

## Edge用户注意：如果出现卡在处理中，请尝试 [edge://settings/downloads](edge://settings/downloads) -> 每次下载都询问我该做些什么 -> 关闭
## 目前所有此类插件都会出现这个问题。如果你有解决方法，可以留言或者pull

---

使用了[Toastify](https://github.com/apvarun/toastify-js)进行toast展示

使用了[iconfont](https://www.iconfont.cn/)的图标字体

---

+ 感谢[Harshil783](https://github.com/Harshil783)的英文翻译修正
+ 感谢[gitqwerty777](https://github.com/gitqwerty777)的繁体中文翻译
+ 感谢[Jeremy-Hibiki](https://github.com/Jeremy-Hibiki)的bug修复

---
#### 由于2.0把Manifest从原来的V2更新到了V3，为了支持之前的的模块写法,因此需要最低 ***Chrome版本92*** 以上才能运行
#### 主要用于chrome,chromium,微软的新版edge浏览器
#### chrome商店地址：[下载管理](https://chrome.google.com/webstore/detail/%E4%B8%8B%E8%BD%BD%E7%AE%A1%E7%90%86/dgoaeahpciglgomkbmfblkcfanpfckhb) 
#### edge商店地址：[下载管理](https://microsoftedge.microsoft.com/addons/detail/%E4%B8%8B%E8%BD%BD%E7%AE%A1%E7%90%86/oljecelfndgchlbkmodifnpodpialkjo)

---

由于Manifest V3的限制，功能有变动。因为Manifest V3移除了部分HTMLDOM对象，如window，Audio，Image等，导致无法通过直接执行`window.matchMedia("(prefers-color-scheme: dark)").matches`来确定是否是深色模式。为了实现这个功能，每次检测是否深色模式时，必须先打开一个窗口来执行某些代码，然后通过storage或其他方式返回。而播放音频也是同样问题，由于移除了Audio对象，要播放音频，也只能另起窗口。

具体情况请看[这里](https://developer.chrome.com/docs/extensions/mv3/migrating_to_service_workers/#audio_vidio) ，现在播放音视频、检测深色模式等均需要使用`chrome.windows.create`来创建新窗口，在新窗口中执行js代码

在非macOS的系统下，打开窗口会有个弹窗一闪而过（如果是播放音频，还需要等播放音频时长的时间），体验很不好，所以有以下改动：

+ 屏蔽非macOS下的自动改变浏览器中插件图标颜色功能。
+ macOS下自动改变浏览器插件图标功能改为浏览器焦点发生改变时执行，以减少打开窗口的次数
+ 图标由原来的png图片文件改为采用`OffscreenCanvas`实时绘制，因此某些情况会出现浏览器中图标一闪而过的情况



chrome商店和edge商店，因为审核的原因，版本不一定一致。
 
---
#### 实现的功能(基于chrome的API实现):
- 接管系统下载
- 显示下载进度
- 清除下载历史
- 创建下载项时通知
- 下载完成后通知
- 暂停,恢复下载
- 重新下载
- 打开文件
- 打开下载目录
- 复制文件名(不带下载路径)
- 复制下载地址
- 删除单个下载历史
- 提示隐患文件
- 删除文件和记录
- 显示下载时间
- 显示剩余时间
- 新建下载项(支持一次下载多个链接)
---
![预览图](/preview/1280%20800%204.png)
![预览图](/preview/1280%20800%202.png)
---
#### 如果有什么问题，请在[issues](https://github.com/yhl452493373/DownloadManager/issues)提出，同时最好带上操作系统，浏览器以及版本，下载地址和复现步骤，便于查找问题
