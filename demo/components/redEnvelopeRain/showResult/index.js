// packageActive/redEnvelopeRain/showResult/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isPrize: {     // 弹框里是否有奖品
      type: Boolean,
      default: false
    },
    overShow: {    // 弹框是否显示
      type: Boolean,
      default: false
    },
    prizeType: {
      type: String,
      default: ''
    },
    prizeMsg: {
      type: Object,
      default: {}
    },
    gameStatus: {
      type: Boolean,
      default: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    closeIcon: true
  },
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的方法列表
   */
  methods: {
    cancelShow() {
      this.triggerEvent('cancelShow')
    },
    getPrize() {
      this.triggerEvent('getPrize')
    },
    seeRecord() {
      this.triggerEvent('seeRecord')
    },
  }
})
