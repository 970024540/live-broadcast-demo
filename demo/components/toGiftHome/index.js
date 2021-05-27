const { notokan_api_post, getLocalUserInfo }=getApp();
import { formatTime } from '../../utils/index.js';
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    showGift: { // 是否显示弹框
      type: Boolean,
      value: false
    },
  },
  data: {
    stateGift:false, // 开启动画
    member_id:'',
    stateType: true,
    isSanta:false,   // 是否显示圣诞老人
    showBtn: true, // 是否显示打开按钮以及关闭按钮
    keyword:'',
    rule_id:''
  },
  lifetimes:{
    ready: function () {// 在组件在视图层布局完成后执行
      this.updateUser();
      this.getState();
    }
  },
  observers:{
    'showGift':function(val){
      if(val){
        this.updateUser();
        if (this.data.member_id){
          let data=wx.getStorageSync('giftData')||{};
          let obj = {
            keyword: data.keyword,
            rule_id: data.rule_id,
            member_id: this.data.member_id,
            search_type: wx.getStorageSync('gift_enum')||'1'
          }// 记录打开过的时间
          wx.removeStorageSync('enum');
          notokan_api_post('mobileapi.wantGift.addWantGiftSearchRecord', obj, res => { })
        }
      }
    }
  },
  pageLifetimes:{
    hide: function () {
      this.setData({
        showGift: false,
        stateGift:false,
        stateType:true,
        showBtn:true
      })
    },
  },
  methods: {
    btnClick(){
      this.updateUser();
      if(this.data.member_id){
        wx.showLoading({
          title: '请求中..',
          mask:true
        });
        notokan_api_post('mobileapi.wantGift.judgeMemberReceivePrizes', { member_id: this.data.member_id },res=>{
          wx.hideLoading();
          //status  0:正常 1:关闭 2:未开始 3:已结束 4:导购禁止参与 5:多日未参与 6:总领取礼品次数已用完 7:当天已领取
          if (res.rsp == 'succ' && res.data.status != 1 && res.data.status != 4){
            this.setData({
              showBtn:false
            })
            wx.navigateTo({
              url: '/packageActive/toGiftView/index?isRq=1',
            })
          }else{
            wx.showToast({title: res.data,icon:'none'});
            this.setData({
              showGift:false
            })
          }
        })
      }else{
        this.triggerEvent('onLogin');
      }
    },
    closeBtn(){
      this.setData({
        showGift:false,
        stateType:true
      })
    },
    getState() {// 初始化我要礼物活动
      let giftData = wx.getStorageSync('giftData') || {};
      if (giftData.isRequest) return;
      notokan_api_post('mobileapi.wantGift.judgeMemberPartakeActivity', { member_id: this.data.member_id }, res => {
        //status  0:正常 1:关闭 2:未开始 3:已结束 4:导购禁止参与 5:多日未参与 6:总领取礼品次数已用完 7:已发放 8:已领取
        wx.setStorage({
          key: "giftData",
          data: {
            showGift: false, // 显示隐藏
            isRequest: true, // 是否重复请求
            keyword: res.data.keyword,     // 关键字
            rule_id: res.data.id,     // 规则id
            description: res.data.description, // 活动说明
            status:res.data.status,    // 状态
            start_time: formatTime(res.data.start_time * 1000, 'MM-dd'),
            end_time: formatTime(res.data.end_time * 1000, 'MM-dd')
          }
        })
        this.setData({
          showGift: res.data.status === 5,
          keyword: res.data.keyword,
          rule_id: res.data.id
        })
      })
    },
    updateUser() {
      /**************** localUserInfo ******************/
      let user_info = getLocalUserInfo();
      if (!!user_info) {
        this.setData({
          member_id: user_info.member_id
        })
      }
    },
  }
})
