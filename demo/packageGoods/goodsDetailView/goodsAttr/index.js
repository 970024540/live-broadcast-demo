// packageGoods/goodsDetailView/goodsAttr/index.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true
  },
  properties: {
    goods_attr: {
      type: Object,
      value: () => {},
      observer (v) {
        let attrs = [];
        for (const key in v) {
          const value = v[key];
          if (value) attrs.push({ key, value });
        }
        this.setData({
          attrs
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    attrs: [],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showGoodsAttr () {
      this.setData({
        show: true
      })
    },
    hideGoodsAttr () {
      this.setData({
        show: false
      })
    },
  }
})
