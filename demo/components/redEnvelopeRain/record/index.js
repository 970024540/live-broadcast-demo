const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    member_id: '',
    materials: [],    
    LotteryList: [],  //优惠券列表
  },

  created() {
    let user_info = wx.getStorageSync('user_info');
    if (!!user_info && user_info.member_id) {
      this.setData({
        member_id: user_info.member_id
      })
    }
    this.getRecord()
  },
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getRecord() {
      app.notokan_api_post('mobileapi.redrain.memberLotteryList', {
        member_id: this.data.member_id
      }, (res) => {
        if (res.rsp == 'succ') {
          let LotteryList = []
          let materials = []
          res.data.forEach((item,index) => {
            if (item.cpns_id) {
              LotteryList.push(item)
              this.setData({ LotteryList: LotteryList })
            }else {
              materials.push(item)
              this.setData({ materials: materials })
            }
          })
        } else {
         wx.showToast({
           title: res.data,
           icon: 'none'
         })
        }
      })
    },
    receivePrize(e) {  // 战绩页奖品领取
      let state = e.currentTarget.dataset.state
      let cpns = e.currentTarget.dataset.cpns
      let lottery_id = e.currentTarget.dataset.lottery
      if (cpns) {
        let rule_id = e.currentTarget.dataset.rule
        wx.showLoading({
          title: '正在请求',
          mask: true
        })
        app.notokan_api_post('mobileapi.redrain.receivePrize', {
          member_id: this.data.member_id,
          rule_id: rule_id,
          lottery_id: lottery_id
        }, (res) => {
          wx.hideLoading();
          if (res.rsp == 'succ') {
            wx.showToast({ title: res.data, icon: 'none' })
            this.getRecord();
          } else {
            wx.showToast({ title: res.data, icon: 'none' })
          }
        })
      }else {
        if (state == '1') {
          wx.showToast({ title: '您已经领取过了！', icon: 'none' })
        }else {
          this.triggerEvent('writeAddress', lottery_id)
        }
      }
    },
    cancelShow() {
      this.triggerEvent('cancelShow')
    }
  }
})
