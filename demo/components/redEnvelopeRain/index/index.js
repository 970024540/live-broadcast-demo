  const app = getApp()
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
    rule_id: '',
    addr_id: '',
    lottery_id: '',
    game_start_time: [],   // 游戏开始时间（整点）
    popup_window_time: '',  // 游戏提前显示时间
    showGame: false,        // 游戏主界面显示
    countdown: '',          // 游戏准备倒计时
    game_duration: '',       // 游戏时间
    timeLeft: false,  // 倒计时及游戏
    ruleShow: false,  // 规则
    recordShow: false, // 中奖记录
    gameBegin: false, // 游戏界面
    showPrize: false, // 弹框是否显示
    isPrize: false,   // 弹框里面是否有奖品
    address: false,
    prize: {},          // 游戏结果
    prizeMsg: {},
    prizeType: '',
    gameStatus: false,   // 游戏状态 
    redrainData: null,
    overShow: false,
    showLoginModal: false,
    redRuleUrl: '',
    winningNews: [],
    hiddenPrize: false
  },
  created() {
    let user_info = wx.getStorageSync('user_info');
    if (!!user_info && user_info.member_id) {
      this.setData({
        member_id: user_info.member_id
      })
    }
    let redrainData=app.globalData.redPacketState;
    if(!!redrainData){
      redrainData=JSON.parse(redrainData);
      return this.getInit(redrainData);
      
    }
    this.getRedrainRule()
  },
  pageLifetimes:{
    hide: function () {
      clearInterval(this.data.timer);
    },
  },
  methods: {
    homeSelect(e) {
      switch (e.detail) {
        case 'start':
          this.getRedrainResult();
          break;
        case 'rule':
          this.getPrizeMsg();
          this.setData({ ruleShow: true })
          break;
        case 'record':
          this.setData({ recordShow: true })
          break;
        default:
          break;
      }
    },
    getInit(data){
      this.setData({
        game_start_time: data.game_start_time.split(','),
        popup_window_time: data.popup_window_time,
        game_duration: data.game_countdown,
        countdown: data.countdown,
        rule_id: data.id,
        redrainData:data,
        redRuleUrl: data.url
      })
      this.compute(this.data.game_start_time, this.data.popup_window_time);
    },
    openGame() {
      this.setData({showGame: true})
      wx.hideTabBar({
        aniamtion: false,
        success: {},
        fail: {},
        complete: {}
      })
    },
    compute(des, popup_window_time) {
      var vm = this
      let nowHour, nowMin, nowSec, h, hour, m, s;
      // wx.showToast({
      //   title: '开启倒计时',
      // })
      vm.data.timer = setInterval(() => {
        nowHour = new Date().getHours();
        nowMin = new Date().getMinutes();
        nowSec = new Date().getSeconds();

        hour = des != '' ? des.find(item => item > nowHour) : (nowHour + 1)
        h = popup_window_time != '0' ? hour - 1 : hour;
        m = popup_window_time != '0' ? 59 - Math.floor(popup_window_time / 60) : '00';
        s = popup_window_time != '0' ? 60 - popup_window_time % 60 : '00';

        // console.log(nowHour,nowMin,nowSec)
        console.log(h,m,s)
        if (!hour) {
          clearInterval(this.data.timer);
          return;
        }
        if (nowHour == h && nowMin == m && nowSec == s) {
        // if (nowSec%10 == 0) {
          vm.setData({ showGame: true })
          wx.hideTabBar({
            aniamtion: false,
            success: {},
            fail: {},
            complete: {}
          })
          app.globalData.redPacketState=null;
          clearInterval(this.data.timer);
        }
      }, 1000);
    },
    cancelShow() {
      wx.showTabBar({
        animation: true,
        success:{},
        fail: {},
        complete: {}
      })
      this.setData({
        showGame: false
      })
      wx.removeStorageSync('redrainRuleData');
    },
    getRedrainRule(type) {
      app.notokan_api_post('mobileapi.redrain.getRedrainRule', {
        member_id: this.data.member_id
      }, (res) => {
        if (res.rsp == 'succ') {
          app.globalData.redPacketState=JSON.stringify(res.data);
          this.getInit(res.data);
          if (type == 'add') {
            this.getRedrainResult();
          }
        } 
      })
    },
    getPrizeMsg() {
      app.notokan_api_post('mobileapi.redrain.winningNews', {
        offset: 1,
        limit: 10
      }, (res) => {
        if (res.rsp == 'succ') {
          this.setData({
            winningNews: res.data
          })
        }
      })
    },
    getRedrainResult() {
      if (!this.data.member_id) {
        let user_info = wx.getStorageSync('user_info');
        if (!!user_info && user_info.member_id) {
          this.setData({
            member_id: user_info.member_id
          })
        }
        if (!user_info || !user_info.member_id){
          wx.showToast({
            title: '请先登录',
            icon: 'none'
          })
          this.setData({ showLoginModal: true})
          return;
        }
      } 
      if (this.data.ruleShow) {  // 从规则页面进入
        this.setData({
          ruleShow: false
        })
      }
      if (!this.data.rule_id) {
        this.getRedrainRule('add');

      }
        wx.showLoading({
          title: '加载中'
        })
        app.notokan_api_post('mobileapi.redrain.isGetPrize', {
          member_id: this.data.member_id,
          rule_id: this.data.rule_id
        }, (res) => {
          if (res.rsp == 'succ') {
            wx.hideLoading();
            this.setData({
              prize: res.data,
              timeLeft: true,
              gameStatus: true
            })
          }else {
            wx.hideLoading();
            wx.showToast({
              title: '活动还未开始或已结束',
              icon: 'none'
            })
          } 
        })
    },
    handleOk() {
      let user_info = wx.getStorageSync('user_info');
      this.setData({
        member_id: user_info.member_id,
        user_info
      })
      let vm = this;
      wx.showLoading({
        title: '请求中..',
      })
      app.tokan_api_post('vstore.store.detail', {
        store_id: user_info.member_id
      }, (res) => {
        wx.hideLoading();
        if (res.rsp == 'succ' && res.data.items.status) {
          let store_info = res.data.items;
          wx.setStorageSync('store_info', store_info);
          wx.setStorageSync('store_id', user_info.member_id);
        }
      });
      vm.handleCancel();
    },
    seeRecord() {
      this.setData({
        hiddenPrize: true,
        recordShow: true
      })
      console.log(this.data.hiddenPrize)
      console.log(this.data.showPrize)
    },
    handleCancel() {
      this.setData({
        showLoginModal: false
      })
    },
    closeAll() {
      if (this.data.gameStatus == false && this.data.gameBegin && this.data.recordShow) {
        this.setData({ recordShow: false })
      }else {
        this.setData({
          ruleShow: false,
          gameBegin: false,
          timeLeft: false,
          recordShow: false,
          showPrize: false,
          gameStatus: false,
          overShow: false
        })
      }
    },
    gameBeginLe() {
      this.setData({
        timeLeft: false,
        gameBegin: true
      })
    },
    closeShow() {   // 弹框的X
        this.setData({
          showPrize: false  // 只关闭弹框
        })
    },
    canOpenPrize(type) {  //点红包弹出弹框
      this.setData({
        prizeType: type.detail
      })
      app.notokan_api_post('mobileapi.redrain.saveGameRecord', {
        member_id: this.data.member_id,
        rule_id: this.data.rule_id,
        type: type.detail
      }, (res) => {
        if (res.rsp == 'succ') {
          this.setData({
            lottery_id: res.data.lottery_id,
            prizeMsg: res.data.prizeInfo[0],
            isPrize: true,
            showPrize: true,
            overShow: true
          })
        }
      })
    },
    getPrize() {  // 弹框里的立即领取或返回商城
      if ((!this.data.prize || !this.data.gameStatus || !this.data.overShow) && !this.data.address) {
        wx.showTabBar({
          animation: true,
          success:{},
          fail: {},
          complete: {}
        })
        this.closeAll()
        this.setData({
          showGame: false
        })
      } else {
        if (this.data.prizeType == 'gift' && !this.data.address) {
          this.setData({
            address: true,
            showPrize: false
          })
        }else {
          wx.showLoading({
            title: '正在请求',
            mask: true
          })
          app.notokan_api_post('mobileapi.redrain.receivePrize', {
            member_id: this.data.member_id,
            rule_id: this.data.rule_id,
            lottery_id: this.data.lottery_id,
            addr_id: this.data.addr_id
          }, (res) => {
            wx.hideLoading();
            if (res.rsp == 'succ') {
              wx.showToast({
                title: res.data,
                icon: 'none'
              })
              if (!this.data.gameStatus) {
                this.setData({
                  recordShow: true
                })
                console.log(this.data.hiddenPrize)
                console.log(this.data.showPrize)
              }
            } else {
              wx.showToast({
                title: res.data,
                icon: 'none'
              })
            }
            if (this.data.gameStatus) {
              this.setData({ showPrize: false})
            }
              this.setData({ address: false })
          })
        }
      }
    },
    isGameOver() {  // 游戏结束
      this.setData({ gameStatus: false })
      setTimeout(() => {
        if (this.data.prize && this.data.overShow) {
          this.setData({
            showPrize: true,
            hiddenPrize: false,
            isPrize: false,
            address: false,
            overShow: true
          })
        } else {
          this.setData({
            showPrize: true,
            hiddenPrize: false,
            isPrize: false
          })
        }
      },500)
    },
    writeAddress(e) {
      this.setData({
        lottery_id: e.detail,
        address: true,
        hiddenPrize: true,
        recordShow: false
      })
    },
    closeAddr() {
      if (this.data.gameStatus != true) {
        this.setData({
          address: false,
          recordShow: true
        })
      } else {
        this.setData({
          address: false
        })
      }
    },
    closeRecord() {
      if (this.data.gameBegin) {
        this.setData({
          recordShow:false,
          hiddenPrize: false
        })
      }else {
        this.setData({
          recordShow: false,
        })
      }

      console.log(this.data.hiddenPrize)
      console.log(this.data.showPrize)
    },
    btnSubAddress() {
      if (!this.data.addr_id) {
        return wx.showToast({
          title: '请勾选地址',
          icon: 'none'
        })
      }
      wx.showLoading({
        title: '领取中..',
        mask: true
      })
      this.getPrize()
    },
    addrChange({ detail }) {
      this.setData({ addr_id: detail.addr_id });
    },
  }
})
