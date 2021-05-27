var {
  globalData,
  reg_mobile,
  notokan_api_post
} = getApp();
var {
  getCurrentPageUrlWithArgs
} = require('../../utils/index');
const app = getApp();
Component({
  options: {
    addGlobalClass: true
  },
  data: {
    username: '',
    password: '',
    vcode: '',
    isVcodeSended: false,
    vcode_time: 60,
    expired_at: '',
    loginType: 1, //0 密码 1 验证码
    hasLogin: false,
    showMobileLogin: true, // 短信登录
    share_member_id: ''
  },
  properties: {
    showLoginModal: {
      type: Boolean,
      value: false,
    },
    showMask: {
      type: Boolean,
      value: false
    },
    params: {
      type: Object,
      value: {}
    },
    showCloneBtn:{
      type: Boolean,
      value:true
    }
  },
  ready() {
    if (!this.properties.params.member_id) {
      this.data.share_member_id = wx.getStorageSync('store_id') || '';
    } else {
      this.data.share_member_id = this.properties.params.member_id;
    }


  },
  methods: {
    changeLoginType() {
      let {
        loginType
      } = this.data;

      loginType = loginType ? 0 : 1;
      this.setData({
        loginType: loginType
      })
    },
    handleCancel() {
      this.setData({
        username: '',
        password: '',
      })
      this.triggerEvent("onCancel");
    },
    getVcode() {
      let {
        username,
        vcode
      } = this.data;
      if (this.data.isVcodeSended) {
        wx.showToast({
          title: '验证码已发送',
          icon: 'none',
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
          icon: 'none',
          duration: 2000
        })
        return;
      }


      wx.showToast({
        title: '正在请求',
        icon: 'none',
        duration: 2000
      });
      app.mall_api_post('/api/ecstore/code/cors',{login_account:username},res=>{
        wx.hideLoading();
        if(res.data&&res.data.status){
          app.notokan_api_post('mobileapi.sign.saveCodeRedis',{login_account:username,vCode:res.data.vCode});
        }
        vm.setData({
          isVcodeSended: true,
          vcode_time: res.data.expired_at || 60,
          hasLogin: res.data.hasLogin
        })
        vm.vcode_timer();
        wx.showToast({
          title: res.data.msg,
          icon:res.data.status?'success':'none'
        })
      })

      // vm.isVcodeSended=false;
      
      // notokan_api_post("mobileapi.sign.sendSms", {
      //   login_account: username
      // }, res => {
      //   wx.hideToast();
      //   if (res.rsp == 'succ') {
      //     wx.showToast({
      //       title: '验证码已发送',
      //       icon: 'success',
      //       duration: 2000
      //     });
      //     vm.setData({
      //       isVcodeSended: true,
      //       vcode_time: 60,
      //       hasLogin: res.data.hasLogin
      //     })
      //     vm.vcode_timer();
      //   } else {
      //     vm.setData({
      //       vcode_time: res.data.data.expired_at,
      //       isVcodeSended: true
      //     })
      //     vm.vcode_timer();
      //   }
      // })
    },
    vcode_timer() {
      var vm = this;
      var timer = setTimeout(function () {
        let vcode_time = vm.data.vcode_time;
        vcode_time--;
        if (vcode_time < 0) {
          vm.setData({
            isVcodeSended: false,
            vcode_time: 60
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
    loginClick(e) {
      let vm = this;
      let {
        loginType,
        username,
        password,
        vcode
      } = this.data;

      //验证手机号和密码
      if (!(reg_mobile(username))) {
        wx.showToast({
          title: '手机号不正确',
          icon: 'none',
          duration: 2000
        })
        return;
      }
      if (loginType === 0 && !password) {
        wx.showToast({
          title: '请输入密码',
          icon: 'none',
          duration: 2000
        })
        return;
      }
      if (loginType === 1 && !vcode) {
        wx.showToast({
          title: '请输入验证码',
          icon: 'none',
          duration: 2000
        })
        return;
      }
      if (loginType === 1) {
        vm.submit_vcode(username, vcode);
      } else {
        vm.submitLogin(username, password);
      }
    },
    submitLogin(username, password) {
      let vm = this;
      notokan_api_post('mobileapi.passportlogin.post_login', {
        uname: username,
        password
      }, res => {

        if (res.rsp == "succ") {
          wx.setStorageSync('loginStatus', true);
          wx.setStorageSync('user_info', res.data);
          app.globalData.userInfo = res.data;
          let openId = wx.getStorageSync('openid');
          app.updateWxUserInfo();
          if (!!openId) {
            try {
              getApp().mtj.setUserInfo({
                tel: obj.uname,
                openId,
              });
            } catch (err) {}
          }
          wx.showToast({
            title: '登陆成功',
            icon: 'success',
            duration: 2000,
            complete: function () {
            }
          })
          vm.triggerEvent("onOk");
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }

      })
    },
    submit_vcode: function (username, vcode) {
      let vm = this;
      let {
        params
      } = this.properties;
      //提交验证码->注册或是登陆成功
      wx.showToast({
        title: '正在请求',
        icon: 'none',
        duration: 2000
      });
      let val = {
        login_account: username,
        vCode: vcode,
        share_member_id: params.member_id || '',
      }
      // 砍价分享注册N人再砍一刀功能，需要记录砍价id
      if (params.bargain_id) {
        val.bargain_id = params.bargain_id;
        val.regist_url = encodeURIComponent(getCurrentPageUrlWithArgs());
      }
      // 各种送券类型标识   "grab"=闺蜜券
      if (params.share_source) {
        val.share_source = params.share_source;
      }
      notokan_api_post("mobileapi.sign.signUpOrRegister", val, res => {
        wx.hideToast();

        if (res.rsp == "succ") {
          //保存至本地数据
          wx.showToast({
            title: vm.data.hasLogin ? '登录成功' : '注册成功',
            icon: "success",
            duration: 2000
          });
          app.globalData.userInfo = res.data;
          app.globalData.member_id = res.data.member_id;
          wx.setStorageSync('user_info', res.data);
          app.updateWxUserInfo();
          vm.triggerEvent("onOk", {isNew: res.data.is_new_register == 1});
          let options = wx.getLaunchOptionsSync();
          let page = getCurrentPages();
          let query = options.query;
          if (res.data.is_new_register == 1) {
            vm.reportCont("register", res.data.member_id);
            if (!!query.isChk) {
              //isChk=1 上报会员ID数据
              app.reportNewMember(page[0].route, res.data.member_id)
            }
          }
        }else if(res.res=='blacklist'){
          wx.showToast({
            title: res.data,
            icon: 'none',
            duration: 2000
          })
          return;
        } else {
          wx.showToast({
            title: '验证数据失败',
            icon: 'none',
            duration: 2000
          })
          return;
        }
      })
    },
    handleChange(event) {
      let value = event.detail.detail.value;
      let key = event.currentTarget.dataset.key;
      this.setData({
        [key]: value
      })
    },
    reportCont(val, member_id) {
      let form = {};
      let params = wx.getStorageSync('scene_obj');
      Object.keys(params).map(key => {
        if (key == 'scene_type' || key == 'scene_id' || key == 'scene_relation') {
          form[key] = params[key];
        }
      });
      if (!!member_id) {
        form.member_id = member_id;
      }
      if (val == 'register') {
        form.register_num = 1;
      }
      app.reportContent(form);
    },
    getPhoneNumber(e) {
      let self = this;
      let {
        iv,
        encryptedData,
        errMsg
      } = e.detail;
      if (errMsg != 'getPhoneNumber:ok') {
        wx.showToast({
          title: errMsg,
          icon: 'none',
          duration: 3000
        });
        this.setData({
          showMobileLogin: true
        });
        return
      }
      let openid = wx.getStorageSync('openid');
      app.post('/index.php/miniprogram/default/index', {
        openid,
        encrypte: encryptedData,
        iv
      }, function (res) {
        if (res.code == 200) {
          let {
            phoneNumber
          } = res.data;
          self.setData({
            login_account: phoneNumber
          })
          self.wxlogin(phoneNumber);
        } else {
          wx.showToast({
            title: res.msg || '授权失败,请重试',
            icon: 'none'
          });
        }
      })
    },
    wxlogin(login_account) {
      let self = this;
      let {
        params
      } = this.properties;
      let val = {
        login_account,
        share_member_id: self.data.share_member_id,
      }
      // 砍价分享注册N人再砍一刀功能，需要记录砍价id
      if (params.bargain_id) {
        val.bargain_id = params.bargain_id;
        val.regist_url = encodeURIComponent(getCurrentPageUrlWithArgs());
      }
      // 各种送券类型标识   "grab"=闺蜜券
      if (params.share_source) {
        val.share_source = params.share_source;
      }
      app.notokan_api_post('mobileapi.sign.fastSign', val, res => {
        if (res.rsp == 'succ') {
          let options = wx.getLaunchOptionsSync();
          let page = getCurrentPages();
          let query = options.query;
          wx.showToast({
            title: '登录成功',
            icon: 'none'
          });
          wx.setStorageSync('user_info', res.data);
          app.globalData.userInfo = res.data;
          app.updateWxUserInfo();
          self.triggerEvent("onOk", {isNew: res.data.is_new_register == 1});
          if (res.data.is_new_register == 1) {
            self.reportCont("register", res.data.member_id);
            if (!!query.isChk) {
              //isChk=1 上报内空数据
              app.reportNewMember(page[0].route, res.data.member_id)
            }
          }
        } else {
          wx.showToast({
            title: '登录失败,请重试',
            icon: 'none'
          });
        }
      })
    },
    handleLogin() {
      this.setData({
        showMobileLogin: !this.data.showMobileLogin
      })
    },
    colseModal() {
      this.setData({
        showLoginModal: false,
        showMobileLogin: false
      })
      // 这个事件触发为后续新加,为了不影响之前的使用,用的新的事件名称,如果确认无影响可以改为onCancel
      this.triggerEvent("onCancelModal");
    }
  }
})