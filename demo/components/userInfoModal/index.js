let app=getApp();
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    showGuide: {
      type: Boolean,
      default: false
    },
    showUserInfoModal: {
      type: Boolean,
      default: false
    }
  },
  data: {
    // 这里是一些组件内部数据
    someData: {},
  },
  methods: {
    // 这里是一个自定义方法
    onGotUserInfo(e){
      this.triggerEvent('onHide', false);
      wx.setStorageSync('auth', true);
      if (e.errMsg =="getUserInfo:ok"){
        let wxInfo=e.userInfo;
        app.globalData.wxInfo = wxInfo;
      }
    },
    colseGuide () {
      wx.setStorageSync('wx_modal_guide', true);
      this.triggerEvent('colseGuide', false);
    },
  }
})