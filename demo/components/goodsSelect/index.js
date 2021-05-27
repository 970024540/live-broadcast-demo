// components/goodsSelect/index.js
const app = getApp();
const {ossUrlTest} = require('../../utils/index.js');
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true,
  },
  properties: {
    limit: {
      type: Number,
      value: 5
    },
    showGuide: {
      type: Boolean,
      value: false
    },
    selected: {
      type: Array,
      value: [],
      observer (val) {
        let {selectedList, goodsList} = this.data;
        goodsList.map(item => {
          item.selected = !!~val.findIndex(ele => ele.goods_id == item.goods_id);
        })
        this.setData({
          selectedList: val,
          goodsList
        })
      },
    }
  },

  lifetimes: {
    attached() {
      let list = this.data.goodsList;
      if (!list.length) this.fetchGoods();
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    goodsList: [],
    offset: 0,
    loading: false,
    loadedAll: false,
    selectedList: [],
    prevGoods: null,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    search ({detail}) {
      this.setData({
        q: detail.value,
        offset: 0,
        goodsList: [],
        loadedAll: false
      }, () => {
        this.fetchGoods();
      })
    },
    chooseItem ({currentTarget}) {
      let id = currentTarget.dataset.id;
      let { selectedList, goodsList, limit} = this.data;
      let index = goodsList.findIndex(ele => ele.goods_id == id);
      let item = goodsList[index];
      if (item.selected) {
        item.selected = false;
        let selectedIndex = selectedList.findIndex(ele => ele.goods_id == item.goods_id);
        if (selectedIndex > -1) selectedList.splice(selectedIndex, 1);
      } else {
        if (selectedList.length >= limit) return wx.showToast({
          title: `最多只能选择${limit}个`,
          icon: 'none'
        })
        item.selected = true;
        selectedList.push(item)
      }
      this.setData({
        selectedList, goodsList,
        prevGoods: null
      })
    },
    closePrev () {
      this.setData({
        prevGoods: null
      })
    },
    handlePrevGoods ({currentTarget}) {
      let {list, index} = currentTarget.dataset;
      let item = this.data[list][index];
      if (item.computed_spec_info) {
        this.setData({
          prevGoods: item
        })
      } else {
        wx.showLoading({
          title: '正在请求',
        })
        app.mall_api_post('/api/mobile/Goods/getProductList', { goods_id: item.goods_id }, res => {
          wx.hideLoading();
          if (res.status == 'success') {
            item.computed_spec_info = this.computeGoodsSpec(res.data);
          }
          this.setData({
            prevGoods: item
          })
        }, error => {
          wx.hideLoading();
          this.setData({
            prevGoods: item
          })
        })
      }
    },
    fetchGoods () {
      let {q, offset, loading, loadedAll, goodsList, selectedList} = this.data;
      let params = {
        q: q,
        offset: offset,
        limit: 10,
      }
      if (loadedAll || loading) return;
      this.setData({
        loading: true
      })
      app.mall_api_get('/api/mobile/Goods/getGoodsList', params, res => {
        if (res.status == 'OK') {
          let data = res.data;
          data.map((item, index) => {
            item.price = parseInt(item.price).toFixed(2);
            item.mktprice = parseInt(item.mktprice).toFixed(2);
            item.cover = item.image_default && item.image_default[0] ? ossUrlTest(item.image_default[0]) : app.globalData.default_img;
            item.selected = !!~selectedList.findIndex(ele => ele.goods_id == item.goods_id);
          })
          loadedAll = data.length < 10;
          goodsList = [...goodsList, ...data];
          loading = false;
          offset = goodsList.length;
          this.setData({
            offset, loading, loadedAll, goodsList
          })
        } else {
          loading = false;
          this.setData({
            loading
          })
        }
      }, error => {
        loading = false;
        this.setData({
          loading
        })
      })
    },
    shareNow () {
      let list = this.data.selectedList;
      if (!list.length) return wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      let goods_id = list.map(item => { return item.goods_id }).join(',');
      let cover_url = list[0].cover;
      this.triggerEvent('shareNow', {goods_id, cover_url});
    },
    clickShareMask () {
      wx.showModal({
        title: '提示',
        content: '当前内容未分享，是否取消分享？',
        confirmText: "是",
        confirmColor: "#ff5722",
        cancelColor: "#000000",
        cancelText: "否",
        success: (res) => {
          if (res.confirm) {
            this.triggerEvent('selectCancel');
          }
        } 
      })
    },
    computeGoodsSpec (list) {
      let spec_info = {};
      let spec_name = list[0].spec_desc.spec_name;
      spec_name.map(spec => {
        spec_info[spec.spec_id] = { name: spec.spec_name, value: new Set()}
      })
      list.map(item => {
        let item_spec = item.spec_desc.spec_value;
        Object.keys(item_spec).map(key => {
          spec_info[key].value.add(item_spec[key]);
        })
      })
      let tmp = []
      Object.keys(spec_info).map(key => { 
        let item = spec_info[key];
        let info = item.name + ': ' + [...item.value].join(' ');
        tmp.push(info);
      })
      return tmp;
    },
    resetSelect () {
      let {goodsList, selectedList, prevGoods} = this.data;
      goodsList.map(item => {
        item.selected = false;
      })
      this.setData({
        goodsList,
        selectedList: [],
        prevGoods: null
      })
    },
    selectCancel () {
      this.triggerEvent('selectCancel')
    },
    selectOK () {
      let list = this.data.selectedList;
      if (!list.length) return wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      this.triggerEvent('selectOK', {goods: list})
    },
  }
})
