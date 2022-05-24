# Xray Client
[本项目](https://github.com/lolo1208/xray-client) 是基于 [xray-core](https://github.com/XTLS/Xray-core) 的可运行于 Windows 与 Mac（包括 M1 Chip）的客户端程序。可以方便的编辑代理规则，以及查看上下行流量和日志，还可以导入与导出客户端配置。

服务器端配置可参考 [server-config-examples](https://github.com/lolo1208/xray-client/tree/main/server-config-examples) 目录下的文件进行配置。

底部状态栏显示的是代理的每秒上传与下载流量，以及与 xray-core 服务器的连接状态。

*因该程序目前仅个人使用，还未打算支持 VMess 等其他协议。*

# Usage
### 调试与发布
```bash
# Clone this repository
git clone https://github.com/lolo1208/xray-client
# Go into the repository
cd xray-client
# Install dependencies
npm install

# Run the app
npm start

# Release the app
# windows x64
npm run dist-win
# mac x64
npm run dist-mac
# mac arm64
npm run dist-arm
```


### General
![](https://static.lolo.link/img/screenshots/xray-client/general-1.png)
![](https://static.lolo.link/img/screenshots/xray-client/general-2.png)

在 General 页面，你可以输入自己服务器端 xray 的相关信息，以及设定本地代理端口。

还可以打开 `Enable LAN Proxy` 开关，启用局域网代理。启用后，当前机器可以作为代理服务器，供局域网内其他设备进行连接。

填写完毕后，点击 `STARTUP` 按钮，便可建立连接，以及启用本地代理了。

编辑修改内容后，界面底部会浮出一个提示框，点击提示框中（或 General 页面中）的 `APPLY` 按钮，便可启用修改后的内容。

---

### Profiles

在 Profiles 界面，你可以创建一个新的配置文件，或在多个配置文件间切换，也可以导入/导出以及删除配置文件。

点击配置文件上的网络测速图标，可以获取到服务器的 ping 值。
![](https://static.lolo.link/img/screenshots/xray-client/profiles.png)

---

### Proxies
在 Proxies 页面，你可以开启和关闭本机的网络代理。

你甚至可以不用在 General 页面中启动 xray-core 连接服务器，可以直接在 Global Proxy 相关配置中填写代理信息，连接本地或网络代理服务器。

当 xray-core 启动完成时，Global Proxy 将会自动打开，连接 General 页面中配置的 Local Proxy 对应的端口。
如果启用了 `Enable LAN Proxy`，server 地址将会是局域网 IP 地址，局域网中其他设备也可通过该 IP 和端口进行连接。

点击 `UPDATE` 按钮，可以更新 geoip.dat 和 geosite.dat。*国内建议代理连接成功后，再点击按钮更新。*
[geoip.dat & geosite.dat 数据介绍](https://github.com/Loyalsoldier/v2ray-rules-dat)

点击 `UPDATE` 按钮也会更新 xray-core*（如果覆盖安装的 xray-client 目录内有更新）*。

![](https://static.lolo.link/img/screenshots/xray-client/proxies.png)

---

### Rules
在 Rules 页面，你可以添加或删除网络规则。

出站规则有：直连 `Driect`，代理 `Proxy`，拒绝 `Reject`。

类型分为：域名 `Domain`，IP 地址 `IP`，端口 `Port`。

前缀和内容的介绍可查看：[如何配置规则内容](https://xtls.github.io/config/routing.html)

![](https://static.lolo.link/img/screenshots/xray-client/rules.png)

---

### Logs
在 Logs 页面，你可以修改日志级别，以及查看和 清除/复制/保存 访问日志 和 错误日志。
![](https://static.lolo.link/img/screenshots/xray-client/logs.png)