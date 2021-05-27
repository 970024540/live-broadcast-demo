const app = getApp();
const get_url_parms_obj = require('../../../../utils/index.js').get_url_parms_obj;
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    goodsArea: {
      type: Object,
      value: () => {}
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
      vaue: false
    },
    showSell: {
      type: Boolean,
      value: true
    },
    tagScrollSite: {
      type: String,
      value: '1'
    },
    showName: {
      type: Boolean,
      value: true
    },
    tagBgColor: {
      type: String,
      value: '#000'
    }
  },
  temp_index: 0,
  data: {
    currentBannerIndex: 0,
    swiperHeight: 750,
    temp_url: ''
  },
  methods: {
    computeSwiperHeight() {
      let { source, goodsArea } = this.data;
      if (source.length == 0) return;
      let item = source[0];
      let { width, height } = get_url_parms_obj(item.images);
      if (!!width) {
        this.setData({
          swiperHeight: height * 400 / width + 230
        })
      } else {
        this.setData({
          temp_url: item.image_url
        })
      }
    },
    onImageLoad(e) {
      if (e.type == 'load') {
        let { height, width } = e.detail;
        this.setData({
          swiperHeight: height * 400 / width + 230
        })
      } else {
        this.temp_index += 1;
        let source = this.data.source;
        if (this.temp_index >= source.length) {
          this.setData({
            swiperHeight: 750
          })
          return;
        }
        this.setData({
          temp_url: source[this.temp_index].image_url
        })
      }
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
