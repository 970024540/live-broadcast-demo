const app = getApp();
const get_url_parms_obj = require('../../../../utils/index.js').get_url_parms_obj;
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    goodsArea: {
      type: Object,
      value: () => { }
    },
    source: {
      type: Array,
      value: () => [],
      observer() {
        this.computeSwiperHeight();
      },
    },
    sale: {
      type: Boolean,
      value: false
    },
    tagColor:{
      type:String,
      value:'#000'
    },
    other:{
      type:Object,
      value:{}
    }
  },
  temp_index: 0,
  data: {
    currentBannerIndex: 0,
    swiperHeight: 750,
    temp_url: ''
  },
  methods: {
    clickGoodsItem(e) {
      let vm = this;
      let { index, goodsid, soid } = e.currentTarget.dataset;
      wx.navigateTo({
        url: `/packageGoods/goodsDetailView/index?goods_id=${goodsid}&soid=${soid}`
      })
      //用户行为上报
      let obj = {
        action_list: [{
          action_type: "EXPOSE",
          action_time: parseInt(new Date().getTime() / 1000),
          action_param: {
            product_id: goodsid,
            positon: index + 1,
            source_id: soid,
            coupon_stock_id: ''
          }
        }]
      }
      let str = JSON.stringify(obj);
      app.reportUserAction(str);
    },
    computeSwiperHeight() {
      let { other } = this.data;
      let height=788;
      if(other.showName) height+=40;
      this.setData({
        swiperHeight: height
      })
    },
    bannerChange: function (e) {
      let current = e.detail.current;
      this.setData({
        currentBannerIndex: current
      });
    },
    clickGoodsItem(e) {
      let vm = this;
      let { index, goodsid, soid } = e.currentTarget.dataset;
      wx.navigateTo({
        url: `/packageGoods/goodsDetailView/index?goods_id=${goodsid}&soid=${soid}`
      })
      //用户行为上报
      let obj = {
        action_list: [{
          action_type: "EXPOSE",
          action_time: parseInt(new Date().getTime() / 1000),
          action_param: {
            product_id: goodsid,
            positon: index + 1,
            source_id: soid,
            coupon_stock_id: ''
          }
        }]
      }
      let str = JSON.stringify(obj);
      app.reportUserAction(str);
    }
  }
})
