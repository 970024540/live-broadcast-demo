let app=getApp();
Component({
  options: {
    addGlobalClass: true
  },
  data: {
    // 组件自己决定隐藏显示
    show: false,
  },
  lifetimes: {
    created () {
      let wxUserinfoAuth = wx.getStorageSync('wxUserinfoAuth') || false;
      if (!wxUserinfoAuth) {
        app.wxUserinfoAuthSync = () => {
          if (this.setData) {
            wx.hideTabBar({
              aniamtion: false,
              success: {},
              fail: {},
              complete: {}
            })
            let timer = setTimeout(() => {
              this.setData({
                show: true,
              })
              clearTimeout(timer);
            }, 160)
          }
        }
      }
    }
  },
  pageLifetimes: {
    show () {
      let wxUserinfoAuth = wx.getStorageSync('wxUserinfoAuth') || false;
      if (!wxUserinfoAuth) {
        this.setData({
          show: false,
        })
        wx.nextTick(() => {
          wx.showTabBar({ aniamtion: true });
        });
      } else {
        wx.hideTabBar({
          aniamtion: false,
          success: {},
          fail: {},
          complete: {}
        })
        let timer = setTimeout(() => {
          this.setData({
            show: true,
          })
          clearTimeout(timer);
        }, 160)
      }
    },
    hide () {
      wx.showTabBar({
        animation: false,
        success:{},
        fail: {},
        complete: {}
      })
      this.setData({
        show: false,
      })
    }
  },
  methods: {
    // 这里是一个自定义方法
    onGotUserInfo(e){
      wx.setStorageSync('auth', true);
      let wxInfo = null;
      if (e.detail.errMsg == "getUserInfo:ok"){
        wxInfo = e.detail.userInfo;
        app.globalData.wxInfo = wxInfo;
        app.updateWxUserInfo();
      }
      this.setData({
        show: false
      })
      wx.removeStorageSync('wxUserinfoAuth');
      this.triggerEvent('onHide', wxInfo);
      wx.nextTick(() => {
        wx.showTabBar({ aniamtion: true });
      });
    },
  }
})