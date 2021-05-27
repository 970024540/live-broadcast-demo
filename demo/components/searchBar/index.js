// components/searchBar/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showResult: {
      type: Boolean,
      value: true,
      observer(newVal,oldVal,changer){
        if (newVal){
          this.setData({
            showResultBox: true
          })
        }
      }
    },
    placeholder: {
      type: String,
      value: '搜索'
    },
    value: {
      type: String,
      value: '',
      observer (v) {
        this.setData({
          inputValue: v
        })
      },
    },
    focus: {
      type: Boolean,
      value: true
    },
    typeOther:{
      type:Boolean,
      value:false
    },
    resultTop: {
      type: String,
      value: '82rpx'
    }
  },

  pageLifetimes: {
    show() {
      this.setData({
        inputValue: this.data.value
      })
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    inputValue: '',
    inputFocus: false,
    showResultBox: false,
  },


  /**
   * 组件的方法列表
   */
  methods: {
    inputFocus () {
      this.setData({
        inputFocus: true
      })
    },
    input(e) {
      let value = e.detail.value;
      this.setData({
        inputValue: value
      })
      this.triggerEvent('input', {value}, { bubbles: false });
    },
    focus() {
      wx.hideTabBar({
        aniamtion: true,
        success: {},
        fail: {},
        complete: {}
      })
      let showResultBox = this.data.showResult;
      this.setData({
        inputFocus: true,
        showResultBox,
      })
      this.triggerEvent('focus');
    },
    blur() {
      this.setData({
        inputFocus: false,
      })
      this.triggerEvent('blur');
    },
    confirm() {
      wx.showTabBar({
        animation: true,
        complete: () => {
          this.triggerEvent('confirm', { value: this.data.inputValue }, { bubbles: false });
        }
      })
    },
    cancel () {
      wx.showTabBar({
        animation: true,
        success:{},
        fail: {},
        complete: {}
      })
      this.setData({
        inputFocus: false,
        showResultBox: false,
        inputValue: '',
      })
      this.triggerEvent('cancel');
    },
    hiddeResult () {
      wx.showTabBar({
        animation: false,
        success:{},
        fail: {},
        complete: {}
      })
      this.setData({
        inputFocus: false,
        showResultBox: false,
      })
      this.triggerEvent('hiddenResCancel');
    },
    doNothing () {
      return;
    }
  }
})
