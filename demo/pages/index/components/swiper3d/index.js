const app = getApp();
const get_url_parms_obj = require('../../../../utils/index.js').get_url_parms_obj;
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    goodsArea: {
      type: Object
    },
    source: {
      type: Array,
      value: () => [],
      observer () {
        this.computeSwiperHeight();
      },
    },
    type: {
      type: String,
      value: ''
    }
  },
  temp_index: 0,
  data: {
    currentBannerIndex: 0,
    swiperHeight: 750,
    temp_url: ''
  },
  methods: {
    computeSwiperHeight () {
      let {source, type} = this.data;
      if (source.length == 0) return;
      let image = source[0];
      if (type == 'image3d') {
        this.setData({
          swiperHeight: image.height * 400  / image.width
        })
      } else if (type == 'goods3d') {
        let { t_w, t_h } = get_url_parms_obj(image.thumbnail_pic)
        if (!!t_w) {
          this.setData({
            swiperHeight: t_h * 400 / t_w + 150
          })
        } else {
          this.setData({
            temp_url: image.thumbnail_pic || image.image_default[0]
          })
        }
      }
    },
    onImageLoad (e) {
      if (e.type == 'load') {
        let {height, width} = e.detail;
        this.setData({
          swiperHeight: height * 400 / width + 150
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
          temp_url: source[this.temp_index].thumbnail_pic || source[this.temp_index].image_default[0]
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
