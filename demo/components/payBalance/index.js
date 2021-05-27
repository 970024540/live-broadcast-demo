// components/payBalance/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLink:{
      type:Boolean,
      value:true
    },
    title:{
      type:String,
      value:'请输入密码'
    },
    type:{
      type:String,
      value:'pass'
    },
    login_account:{
      type:String,
      value:'',
      observer(val){
        this.setData({
          account:val.substr(val.length-4)
        })
      }
    }
  },
  options: {
    addGlobalClass: true,
  },

  /**
   * 组件的初始数据
   */
  data: {
    showPopup:false,
    items: [0, 1, 2, 3, 4, 5],
    password: [],
    keys: [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0],
    smsTimer:0,
    timer:null,
    account:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    keyUpHandle({ target }){
      let { password}=this.data;
      if (password.length >= 6 || target.dataset.item==='') return ;
      password.push(String(target.dataset.item))
      this.setData({
        password
      })
      if (password.length >= 6){
        setTimeout(()=>{
          this.triggerEvent('onSubmit', password.join(''));
        },300)
      }
    },
    initTimer(val){
      let {type,smsTimer}=this.data;
      if(type=='point'){
        smsTimer=val;
        this.setData({
          smsTimer
        })
        this.data.timer=setInterval(() => {
          if(smsTimer==0){
            clearInterval(this.data.timer);
          }else{
            smsTimer-=1;
            this.setData({
              smsTimer
            })
          }
        }, 1000);
      }
    },
    get_vcode(){
      this.triggerEvent('getVcode','');
    },
    delHandle(){
      let { password } = this.data;
      if(password.length==0) return ;
      password.pop();
      this.setData({
        password
      })
    },
    linkSetting(){
      wx.navigateTo({
        url: '/packageUserSetting/payUpdateBalanceView/index',
      })
    },
    hidePopup(){
      this.setData({
        showPopup:false
      })
      if(this.data.type=='point'){
        clearInterval(this.data.timer);
      }
    },
    showPopup(){
      this.setData({
        showPopup: true,
        password:[]
      })
    }
  }
})
