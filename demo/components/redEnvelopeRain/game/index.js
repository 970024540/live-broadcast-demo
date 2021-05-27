// packageActive/redEnvelopeRain/game/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    count: {
      type: String,
      default: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },
  ready() {
    this.countDown();
  },
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的方法列表
   */
  methods: {
    countDown() {
      let countDownTimer;
      countDownTimer = setInterval(() => {
        if (this.data.count > 0) {
          this.setData({
            count: this.data.count-1
          })
        } else {
          this.triggerEvent('countDownOver')
          clearInterval(countDownTimer);
        }
      }, 1000);
    }
  }
})
