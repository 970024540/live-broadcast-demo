// const {indexOf} = require("../indexOf.js")
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    prize: {
      type: Object,
      default: {}
    },
    game_duration: {
      type: String,
      default: ''
    }
  },
  ready() {
    this.gameBegin()
    // this.startRedPacket()
    wx.hideTabBar({
      aniamtion: false,
      success: {},
      fail: {},
      complete: {}
    })
  },
  /**
   * 组件的初始数据
   */
  data: {
    liParams: [],
    timer: null,
    isPrize: false,
    clicks: 0,
    couponsArr: [],
    giftArr: [],
    index:0
  },
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的方法列表
   */
  methods: {
    startRedPacket() {
      let win = wx.getSystemInfoSync().windowWidth*2
      let left = Math.random()*(win-200)-win*0.036
      let width = Math.random()*30 + 150; // 图片尺寸
      let durTime = (Math.random() * 5 + 2) + 's';
      // let liParams = this.data.liParams
      if ( this.data.liParams.length >= 30) {
        let liParams = 'liParams[' + this.data.index + ']'
        this.setData({
          [liParams]: null,
          index: this.data.index + 1
        })
      }
      this.setData({
        liParams: this.data.liParams.concat({ show: true, width: width + 'rpx', left: left + 'rpx', durTime: durTime })
      })
    },
    
    gameBegin() {
      if ( this.data.prize) {
        let { coupons } = this.data.prize
        let { gift } = this.data.prize
        let gameTime = this.data.game_duration;
        let count = Math.floor(this.data.game_duration/0.6);
        let arr = [];
        for (let i = 0; i < count; i++) {
          arr[i] = i + 1;
        }
        console.log(arr)
        arr.sort(function () {
          return 0.5 - Math.random();
        })
        for (let i = 0; i < coupons + gift; i++) {
          if (this.data.couponsArr.length < coupons) {
            this.setData({
              couponsArr: this.data.couponsArr.concat(arr[i])
            })
          } else {
            this.setData({
              giftArr: this.data.giftArr.concat(arr[i])
            })
          }
        }
      }
      let countDownTimer = setInterval(() => {
        if (this.data.game_duration <= 0) {
          clearInterval(this.data.timer)
          clearInterval(countDownTimer);
          this.triggerEvent("isGameOver")
        } else {
          this.setData({
            game_duration: this.data.game_duration - 1
          })
        }
      }, 1000);

      this.data.timer = setInterval(() => {
        this.startRedPacket()
      }, 250)
    },
    isGetPrize(e) {
      let id = e.currentTarget.dataset['index']
      let fire = "liParams[" + id + "].show"
      this.setData({ [fire]: false,clicks: this.data.clicks+1 })
      setTimeout(() => {
        let arr = "liParams[" + id + "]"
        this.setData({ [arr]: null })
      },100)
      if(this.data.prize) {
        if (this.data.couponsArr.indexOf(this.data.clicks) != -1) {
          this.triggerEvent('canOpenPrize','coupons')
        }
        if (this.data.giftArr.indexOf(this.data.clicks) != -1) {
          this.triggerEvent('canOpenPrize', 'gift')
        }
      }
      console.log(this.data.couponsArr)
      console.log(this.data.giftArr)
    }
  }
})
