const app = getApp();
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    tabData: {
      type: Array,
      value: () => []
    },
    goodsArea: {
      type: Object,
      value: () => {}
    },
    other: {
      type: Object,
      value: () => {
        type: 'list'
      }
    }
  },
  data: {
    suffix: 0,
    data: [],
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    defIndex: 0,
  },
  lifetimes: {
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
      if (this._observer) this._observer.disconnect();
    },
    ready () {
      this.initObserver()
    },
  },
  ready() {
    this.initObserver()
  },
  detached: function () {
    // 在组件实例被从页面节点树移除时执行
    if (this._observer) this._observer.disconnect();
  },
  methods: {
    initObserver() {
      if (this._observer) this._observer.disconnect();
      this._observer = this.createIntersectionObserver()
      this._observer
        .relativeToViewport({ bottom: 100 })
        .observe('.observer-goods-hot', (res) => {
          this.init();
        })
    },
    init() {
      let tabData = this.properties.tabData;
      this.setData({
        data: tabData
      })
      this.getScrollGoodsData(0);
      if (this._observer) this._observer.disconnect();
    },
    getScrollGoodsData(tabIndex) {
      let entity = this.data.tabData[tabIndex];
      let { groupType, options } = entity;
      let opt = {
        sortKey: options.sortKey || 'sell_num', // top依据 sell_num销售量 browse_num浏览量
        sortValue: options.sortValue || 'desc', // 排序方式
        top: `${options.top || 10}`, // 榜单数量
        day: `${options.day || 7}`,
      }
      if (groupType == 'groupbuy') {
        opt.group_buy = 'true';
      } else if (groupType == 'selector') {
        if (options.brand_id.length > 0) opt.brand_id = options.brand_id.join(',');
        if (options.cat_id) opt.cat_id = options.cat_id;
      }
      if (groupType != 'groupbuy' && options.priceRangeFrom > 0 && options.priceRangeTo > options.priceRangeFrom) {
        opt.price = `[${options.priceRangeFrom} TO ${options.priceRangeTo}]`;
      }
      app.mall_api_post('/api/goods/hotSale/cors', opt, res => {
        if (res.status == 'success') {
          let data = res.data;
          data.map(item => {
            item.sale_num = item.sale_num > 10000 ? Math.round(item.sale_num / 1000) + 'k' : item.sale_num;
            item.browse_num = item.browse_num > 10000 ? Math.round(item.browse_num / 1000) + 'k' : item.browse_num;
            item.brand = item.goods_brands && item.goods_brands.brand_name ? item.goods_brands.brand_name : '';
            item.brand_keywords = item.goods_brands && item.goods_brands.brand_keywords ? item.goods_brands.brand_keywords : '';
            item.image_url = item.images && item.images.url ? item.images.url : app.globalData.default_img;
          })
          let str = Object.assign(this.data.data[tabIndex].data, data);
          let _key = `data[${tabIndex}].data`;
          let _key2 = `data[${tabIndex}].hideLoading`;
          this.setData({
            [_key]: str,
            [_key2]:true
          });
        } else {
          entity.data = [];
        }
      })
    },
    handleSwitch(e) {
      let suffix = e.detail.key;
      this.setData({
        suffix
      })
      if (this.data.data[suffix].data.length == 0) this.getScrollGoodsData(suffix);
    },
    jumpUrl(event) {
      let { url, type = '' } = event.currentTarget.dataset;
      if (type == 'tabbar') {
        wx.switchTab({
          url: url
        })
      } else {
        wx.navigateTo({
          url: url
        })
      }
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
    },
  }
})
