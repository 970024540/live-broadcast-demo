// packageActive/redEnvelopeRain/rule/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    redRuleUrl: {
      type: String,
      default: ''
    },
    winningNews: {
      type: Array,
      default: []
    }
  },
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的初始数据
   */
  data: {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    cancelShow() {
      this.triggerEvent('cancelShow')
    },
    joinGame() {
      this.triggerEvent('joinGame')
    }
  }
})
