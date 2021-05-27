// components/authIdentityModal/index.js
var {globalData, getLocalUserInfo, notokan_api_post,mall_api_post } = getApp();
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true,
  },
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showBoxModal:false,
    time: 0,
    timeId: '',
    oldAccount:'',
    oldCode:'',
  },
  lifetimes:{
    attached(){
      let user = getLocalUserInfo();
      if(globalData.CodeCheck && !!user && user.login_account[0]){
        this.setData({
          oldAccount: user.login_account[0].login_account
        })
        globalData.CodeCheck=false; // 只开启一次
        notokan_api_post('mobileapi.passportlogin.authOverdueDays',{login_account:this.data.oldAccount},res=>{
          if(res.rsp=='fail'){
            wx.showToast({
              title: res.data,
              icon:'none'
            })
            this.setData({
              showBoxModal:true
            })
          }
        })
      }
    }
  },
  pageLifetimes:{
    hide: function() {
      // 页面被隐藏
      this.setData({
        showBoxModal:false
      })
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    closeBtn(){
      this.setData({
        showBoxModal:false
      })
    },
    oldSubmit(){
      let {oldAccount,oldCode}=this.data;
      if (!oldCode) {
        wx.showToast({
          title: '验证码不能为空',
          icon: 'none'
        });
        return;
      }
      let parmas={
        username:oldAccount,
        vcode:oldCode,
        type:'authIdentity'
      }
      notokan_api_post('mobileapi.passport.checkPointCode',parmas,res=>{
        wx.hideLoading();
        if(res.rsp=='succ'){
          this.setData({
            showBoxModal:false
          })
          wx.showToast({
            title: res.res,
            icon:'success'
          })
        }else{
          wx.showToast({
            title: res.data,
            icon:'none'
          })
        }
      })
    },
    change(e) {
      let name = e.target.dataset.name;
      let value = e.detail.detail.value;
      this.setData({
        [name]: value
      });
    },
    old_get_sms_code() {
      if (this.data.time) return;
      wx.showLoading({
        title: '发送中...',
        mask:true
      })
      mall_api_post('/api/ecstore/sendCode/cors',{login_account:this.data.oldAccount,type:'authIdentity'},res=>{
        wx.hideLoading();
        if(res.data&&res.data.status){
          notokan_api_post('mobileapi.sign.saveCodeCache',{login_account:this.data.oldAccount,vCode:res.data.vCode,type:'authIdentity'});
        }
        let _data = res.data||{},time=60;
        time = _data.expired_at||60;
        this.setData({ time });
        this.count_down();
        wx.showToast({
          title: res.data.msg,
          icon:res.data.status?'success':'none'
        })
      })
    },
    count_down() {
      let timeId = setInterval(() => {
        let time = this.data.time;
        if (time > 0) {
          this.setData({ time: time - 1 });
        } else {
          clearInterval(this.data.timeId);
        }
      }, 1000);
      this.data.timeId=timeId;
    },
  }
})

