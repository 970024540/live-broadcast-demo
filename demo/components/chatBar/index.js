// components/chatBar/index.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    share_member_id: {
      type: String,
      optionalTypes: [Number],
      value: '',
    },
    useSlot: {
      type: Boolean,
      value: false,
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
    jumpToChat () {
      wx.navigateTo({
        url: `/packageUserOther/chat/index?share_member_id=${this.data.share_member_id}`,
      })
    },
  }
})
