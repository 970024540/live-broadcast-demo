// components/releaseBtn/index.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true
  },
  properties: {
    bottom:{
      type:'String',
      value:'0'
    }
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
    buyerClick() {
      wx.navigateTo({
        url: '/packageCommunity/PublishContent/index',
      })
    },
  }
})
