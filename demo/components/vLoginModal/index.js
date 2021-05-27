var { globalData, reg_mobile, notokan_api_post,mall_api_post,mall_api_get} = getApp();
Component({
  options: {
    addGlobalClass: true
  },
  data:{
    username:'',
    password:'',
    vcode:'',
    isVcodeSended:false,
    vcode_time:60,
    expired_at:'',
    loginType:1,//0 密码 1 验证码
    hasLogin:false,
  },
  properties:{
    showLoginModal:{
      type:Boolean,
      value:false
    },
    showMask:{
      type:Boolean,
      value:false
    },
  },
  ready(){
    let user_info=wx.getStorageSync('user_info');
    let mobile="";
    if(!!user_info){
      mobile =  user_info.login_account[0].login_account
    }
    this.setData({
      username: mobile
    })
  },
  methods:{
    changeLoginType(){
      let {loginType}=this.data;

      loginType=loginType?0:1;
      this.setData({
        loginType:loginType
      })
    },
    handleCancel(){
      this.setData({
        // username:'',
        password:'',
      })
      this.triggerEvent("onCancel");
    },
    getVcode(){
      let {username,vcode}=this.data;
      if (this.data.isVcodeSended) {
        wx.showToast({
          title: '验证码已发送',
          icon:'none',
          duration: 2000
        })
        return;
      }
      //获取验证码
      var vm = this;
      //验证手机号和密码
      if (!(reg_mobile(username))) {
        wx.showToast({
          title: '手机号不正确',
          icon:'none',
          duration: 2000
        })
        return;
      }
      wx.showLoading({
        title: '正在请求',
      })

      mall_api_get("/api/wap/register/send_sms",{
        mobile: username
      },res=>{
        wx.hideLoading();
        if (res.status=='success'){
          wx.showToast({
            title: '验证码已发送',
            icon: 'success',
            duration: 2000
          });
          vm.setData({
            isVcodeSended: true,
            vcode_time: 60,
            // hasLogin: res.data.hasLogin
          })
          vm.vcode_timer();
        }else{
          wx.showToast({
            title: res.message || '发送失败',
            icon: 'none',
            duration: 2000
          });
          vm.setData({
            vcode_time: 60,
            isVcodeSended: true
          })
          vm.vcode_timer();
        }
      })
    },
    vcode_timer() {
        var vm = this;
        var timer = setTimeout(function() {
          let vcode_time=vm.data.vcode_time;
          vcode_time--;
          if (vcode_time < 0) {
              vm.setData({
                isVcodeSended:false,
                vcode_time:60
              })
            clearTimeout(timer);
            return;
          } else {
            vm.setData({
              vcode_time,
            })
            //继续循环
            vm.vcode_timer();
          }
        }, 1000)
    },
    loginClick(e){
      let vm=this;
      let {loginType,username,password,vcode}=this.data;

      //验证手机号和密码
      if (!(reg_mobile(username))) {
        wx.showToast({
          title: '手机号不正确',
          icon:'none',
          duration: 2000
        })
        return;
      }
      if(loginType===0&&!password){
        wx.showToast({
          title: '请输入密码',
          icon:'none',
          duration: 2000
        })
        return;
      }
      if(loginType===1&&!vcode){
        wx.showToast({
          title: '请输入验证码',
          icon:'none',
          duration: 2000
        })
        return;
      }
      if(loginType===1){
        vm.submit_vcode(username,vcode);
      }else{
        vm.submitLogin(username,password);
      }
    },
    submitLogin(username,password){
      return;
      let vm=this;
      notokan_api_post('mobileapi.passportlogin.post_login',{
        uname:username,
        password
      },res=>{

        if(res.rsp=="succ"){
          wx.setStorageSync('loginStatus', true);
          wx.setStorageSync('user_info', res.data);
          let openId = wx.getStorageSync('openid');
          if (!!openId) {
            try {
              getApp().mtj.setUserInfo({
                tel: obj.uname,
                openId,
              });
            } catch (err) {
              
            }
          }
          wx.showToast({
            title:'登陆成功',
            icon:'success',
            duration:2000,
            complete:function(){

            }
          })
          vm.triggerEvent("onOk");
        }else{
          wx.showToast({
            title:res.data.msg,
            icon:'none',
            duration:2000
          })
        }

      })
    },
    submit_vcode: function(username,vcode) {
      let vm = this;
      //提交验证码->登陆成功
      wx.showLoading({
        title: '正在登录',
      })
      mall_api_post("/api/mobile/Sign",{
        mobile: username,
        smsCode: vcode,
        platform: 'web'
      },res=>{
        wx.hideLoading();
        if(res.status=='success'){
          //保存至本地数据
          wx.showToast({
            title: '登录成功',
            icon: "success",
            duration: 2000
          });
          let { uuid, access_token } = res.data;
          let store_uuid = uuid;
          // wx.setStorageSync('store_uuid', store_uuid);
          // wx.setStorageSync('access_token', access_token);
          wx.setStorageSync('vstore_user_info',res.data);
          wx.nextTick(() => {
            vm.triggerEvent("onOk");
          })
        }else{
          wx.showToast({
            title: res.message || '验证数据失败',
            icon: 'none',
            duration: 2000
          })
          return;
        }
      })
    },
    handleChange(event){
      let value=event.detail.detail.value;
      let key=event.currentTarget.dataset.key;
      this.setData({
        [key]:value
      })
    }
  }
})
