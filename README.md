equest合法域名
https://dev-yingerfashion.oss-cn-shenzhen.aliyuncs.com;https://dev.makings.link;https://hmma.baidu.com;https://mall.yingerfashion.com;https://mallcdn.yingerfashion.com;https://pottle.cn;https://robot.yingerfashion.com:8096;https://robottest.yingerfashion.com:8096;https://test1.yingerfashion.com;https://video.yingerfashion.com;https://yingerfashion.com;https://zone-yingerfashion.oss-cn-shenzhen.aliyuncs.com;https://zone.yingerfashion.com;


socket合法域名
wss://robot.yingerfashion.com:8181;wss://robottest.yingerfashion.com:8181;wss://ws.makings.link;


uploadFile合法域名
https://dev-yingerfashion.oss-cn-shenzhen.aliyuncs.com;https://dev.makings.link;https://mall.yingerfashion.com;https://mallcdn.yingerfashion.com;https://test1.yingerfashion.com;https://video.yingerfashion.com;https://zone-yingerfashion.oss-cn-shenzhen.aliyuncs.com;https://zone.yingerfashion.com;


downloadFile合法域名
https://dev-yingerfashion.oss-cn-shenzhen.aliyuncs.com;https://dev.makings.link;https://mall.yingerfashion.com;https://mallcdn.yingerfashion.com;https://test1.yingerfashion.com;https://video.yingerfashion.com;https://webim.tim.qq.com;https://wx.qlogo.cn;https://yingerfashion.com;https://zone-yingerfashion.oss-cn-shenzhen.aliyuncs.com;https://zone.yingerfashion.com;


代码上传失败总结：
  1.Error: {"errCode":-1,"errMsg":"inner upload fail with errcode: 80082。。。
    小程序未开通直播功能时，需先屏蔽app.json
    "plugins": {
      "live-player-plugin": {
        "version": "1.1.9",
        "provider": "wx2b03c6e691cd7370"
      }
    },

流程：
    1.开通微信支付=>关联商户号
    2.影儿项目修改appid，屏蔽直播代码（app.json），环境换成测试机，上传代码到正式。
    3.在该小程序里产生一笔支付（隔天才能查看支付流水）
    4.开通直播功能
    5.执行打包命令（npm run upload）
    6.去后台小程序管理创建小程序直播

