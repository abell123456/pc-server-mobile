# pc-server-mobile
装逼利器：基于XAMPP+Ajax+nodeJS的实现pc端浏览器、服务器以及移动端浏览器三方通信的解决方案

# 一步步教你实现三方通信
## 前期工作
首先，你要把js/mobile.js，js/slide.js中Ajax请求的IP地址更换一下，因为那是我本机的IP地址，需要更换为你本机的IP地址。查看本机IP地址可以在命令行中输入:  
windows下：ipconfig，Mac下：ifconfig。  
js/slide.js中的请求url地址域名部分可以更换为localhost或127.0.0.1。
## 安装XAMPP并启动服务：
首先下载安装本地服务器搭建工具：[XAMPP](https://www.apachefriends.org/zh_cn/download.html)，安装完成后启动服务；
## 将项目文件放置于服务指定访问文件夹下：
将该项目文件git clone或下载到本地，然后将该项目文件放置于服务器指定的访问文件夹地址下，我的mac地址是：  
`/Applications/XAMPP/xamppfiles/htdocs`  
其实在XAMPP应用里有“Open Application Folder”操作选项，你可以点击打开对应的应用文件夹，然后把项目文件拷贝到htdocs目录下。
## 启动NodeJS服务
NodeJS服务入口文件是server/server.js，你可以在命令行server目录下执行:  
`sudo node server.js`  
或者在项目根目录下执行：  
`npm run`  
启动服务。当然最快捷的还是直接在webstorm中运行server.js文件即可。
## 在PC浏览器中访问
在PC浏览器中访问：  
`http://localhost/client/slide.html`  

这时，你应该能看到一个用impress.js实现的PPT了，注意左上角有一个二维码，二维码的内容是用于移动端访问的链接地址。  
好吧，也许你已经猜到了，这个地址也是用我本机的IP地址生成的，你可以用你本机的IP地址生成一个二维码后，将其转换为：base64编码放于二维码元素的样式里，来替换原有的二维码。  
移动端访问地址推荐格式：'http://'+你本机的IP地址+'/client/mobile.html'  
推荐一个比较好的二维码生成地址：[草料二维码](http://cli.im/)，  
png图片转base64编码：[png to base64](http://tool.css-js.com/base64.html)，  
impress.js PPT在线制作：[Strut](http://strut.io/editor/)。  
## 操作
将你自己的二维码放上去之后，只需要拿你的手机打开任意一个有二维码扫描功能的APP（比如微信、微博）扫描二维码，即可以打开移动端的访问地址。  
打开后，页面上有两个按钮，好吧，你也许又猜到了，点击往左的箭头，PC浏览器上的PPT就会往前翻一页，点击往右的按钮则会向下翻一页。  

哈哈，接下来你就可以拿这东西装逼了，演讲、答辩、讲座。。是不是很酷？真的很酷哎~  
这只是PC浏览器、服务器以及移动端浏览器三方通信的一个应用。掌握其原理后当然可以做更多的事情，记住，唯一限制你发挥的是你的想象力。  

# 待优化
1、前端Ajax请求采用了简单的心跳机制实现，后续优化成采用websocket长连接的实现；  
2、服务端NodeJS实现采用了过程式的简单实现方式，后续考虑进行一定程度的抽象封装;  
3、摇一摇实现移动端同服务器通信。
