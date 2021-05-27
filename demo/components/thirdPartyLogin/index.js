const app = getApp();
Component({
  properties: {
    share_member_id:{
      type:String,
      value:''
    },
    datas:{
      type:Object,
      value:{}
    },
    pageId:{
      type:String,
      value:""
    }
  },
  options: {
    addGlobalClass: true,
  },
  data: {
    login_account:''
  },
  methods: {
    getPhoneNumber(e) {
      console.log(e.detail.iv)
      console.log(e.detail.encryptedData);
      let self=this;
      let encrypte = e.detail.encryptedData;
      let iv = e.detail.iv;
      let openid = wx.getStorageSync('openid');
      app.post('/index.php/miniprogram/default/index', {
        openid,
        encrypte,
        iv
      }, function (res) {
        console.log("res",res);
        if(res.code==200){
          let {phoneNumber}=res.data;
          self.setData({
            login_account: phoneNumber
          })
          self.login();
        }else{
          wx.showToast({
            title: '授权失败,请重试',
            icon:'none'
          });
        }
      })
    },
    login(){
      let { share_member_id } = this.properties;
      let { login_account}=this.data;
      app.notokan_api_post('mobileapi.sign.fastSign',{
        login_account,
        share_member_id,
      },res=>{
        console.log("登录状态",res);
        if (res.rsp=='succ'){
          wx.showToast({
            title: '登录成功',
            icon: 'none'
          });
          wx.removeStorageSync(`lastShowModalTime_${this.data.pageId}`);
          wx.setStorageSync('loginStatus', true);
          wx.setStorageSync('user_info', res.data);
          if (this.data.datas && this.data.datas.btnLoginJump && res.data.is_new_register==1){
            let url=app.myJsTool(this.data.datas.btnLoginJump);
            wx.navigateTo({
              url,
              fail: () => {
                wx.switchTab({
                  url,
                })
              }
            })
          }else{
            wx.switchTab({
              url: '/pages/index/index',
            })
          }
        }else{
          wx.showToast({
            title: '登录失败,请重试',
            icon: 'none'
          });
        }
      })
    }
  }
})
