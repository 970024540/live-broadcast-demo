// components/leaveMsg/index.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true,
  },
  properties: {
    maxlength: {
      type: Number,
      value: 200
    },
    placeholder: {
      type: String,
      value: '请输入你的留言备注'
    },
    header: {
      type: String,
      value: '留言/备注'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    textareaValue: '',
    length: 0,
    focus: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindinput (e) {
      let { value } = e.detail;
      let { length, textareaValue } = this.data;
      this.setData({
        textareaValue: value,
        length: value.length,
      })
    },
    bindconfirm (e) {
      let data = this.data.textareaValue;
      this.triggerEvent('inputDone', data)
    },
    bindfocus (e) {
      this.setData({
        focus: true
      })
    },
    bindblur (e) {
      this.setData({
        focus: false
      })
      let data = this.data.textareaValue;
      this.triggerEvent('inputDone', data)
    },
    bindlinechange (e) {},
  }
})
