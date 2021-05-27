// packageActive/redEnvelopeRain/startup/index.js
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

  },
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的方法列表
   */
  methods: {
    homeSelect(e) {
      let select = e.currentTarget.dataset.sel
      this.triggerEvent('homeSelect',select)
    },
    cancelShow() {
      this.triggerEvent('cancelShow')
    }
  }
})
