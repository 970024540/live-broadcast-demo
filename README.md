
### 代码上传失败总结：
  1.Error: {"errCode":-1,"errMsg":"inner upload fail with errcode: 80082。。。
    小程序未开通直播功能时，需先屏蔽app.json
    "plugins": {
      "live-player-plugin": {
        "version": "1.1.9",
        "provider": "wx2b03c6e691cd7370"
      }
    },

### 流程：
    1.在微信后台=>开发=>开发管理=>开发设置=>小程序代码上传密钥=>生成后添加到key文件夹
    2.补充appList.json 内容，可填写多个小程序
    3.开通微信支付=>关联商户号
    4.项目修改appid，如果已开通直播功能先屏蔽直播代码（app.json），环境换成测试机，上传代码到正式。
    5.在该小程序里产生一笔支付（隔天才能查看支付流水）
    6.开通直播功能
    7.执行打包命令（npm run upload）
    8.去后台小程序管理创建小程序直播

