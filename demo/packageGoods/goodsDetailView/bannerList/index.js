// packageGoods/goodsDetailView/bannerList/index.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true
  },
  properties: {
    banner_video: {
      type: Array,
      value: () => []
    },
    banner_list: {
      type: Array,
      value: () => []
    },
    goodsData: {
      type: Object,
      value: () => {},
      observer (v) {

        let { isnew, isgroup, schemes, scheme_id, showBargaining, bargaiData } = this.data;

        let price = v.price || '0.00';
        if (isgroup) {
          price = parseInt(price - schemes[scheme_id].scheme_price).toFixed(2);
        } else if (showBargaining) {
          price = bargaiData.mini_price;
        }
        let priceFloat ='.'+( price.split(".")[1]||'00');
        let priceInt = parseInt(price)||0;
        
        this.setData({
          price,
          priceInt,
          priceFloat
        })
      }
    },
    isnew: {
      type: Boolean,
      value: false
    },
    isgroup: {
      type: Boolean,
      value: false
    },
    schemes: {
      type: Object,
      value: () => { }
    },
    scheme_id: {
      type: String,
      value: ''
    },
    showBargaining: {
      type: Boolean,
      value: false
    },
    bargaiData: {
      type: Object,
      value: () => { }
    },
    bannerTimer: {
      type: Object,
      value: () => {
        return {
          type: 0,
          day: 0,
          hour: 0,
          minute: 0,
          second: 0,
        }
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    price: '',
    priceInt:0,
    priceFloat:'.00'
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
