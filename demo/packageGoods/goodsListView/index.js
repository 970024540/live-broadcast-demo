let brands = require('brands.js').brands;
const mall_api_post = getApp().mall_api_post;
const app = getApp();
let shareConfig = Object.assign({}, app.shareConfig);
const {getCurrentPageUrlWithArgs} = require('../../utils/index');
const Base64 = require('../../miniprogram_npm/js-base64/index').Base64;
const list_order = {
  "1": "",
  "2": "price asc",
  "3": "price desc",
  "4": "view_count desc"
}

Page({

  /**
   * 页面的初始数据
   */
  searchParams: {
    q: '',
    offset: 0,
    limit: 10,
    sort: '',
    fq: ''
  },
  cache_data: {},
  data: {
    showGift:false,
    showLoginModal: false,
    user_info:{},
    member_id:'',
    router_query: {},
    goods_list: [],
    baseUrl: app.globalData.host + '/',
    loadAll: false,
    showFilter: false,
    currentOrderIndex: 1,
    searchValue: '',
    listStyle: 2, // 1 大 2 中 3 小,
    priceAsc: false,
    currentTab: {
      index: 0,
      optionsIndex: 0,
      optionsValue: '综合'
    },
    tabs: [
      { name: '综合', options: [
        { label: '综合', value: '综合'},
        { label: '新品', value: '新品' }
      ]},
      { name: '销量' },
      { name: '价格' },
      // { name: '折扣', options: [
      //   { label: '5折以下', value: '5折以下'},
      //   { label: '6折', value: '6折' },
      //   { label: '7折', value: '7折' },
      // ] },
      { name: '筛选' }
    ],
    fq: '',
    facet_counts: {},
    soid:"浏览"
  },

  /**
     * 生命周期函数--监听页面加载
     */
  onLoad: function (options) {
    this.searchParams = {
      q: '',
      offset: 0,
      limit: 10,
      sort: '',
      fq: ''
    }
    for (let key in options) {
      options[key] = decodeURIComponent(options[key])
    }
    let _soid = options.soid || options.q || '';
    this.setData({
      router_query:options,
      soid: _soid
    });
    let user_info=app.getLocalUserInfo();
    let member_id=!!user_info?user_info.member_id:'';
    let store_id=options.member_id;
    if(member_id!=store_id){
      app.setStoreId(store_id);
    };
    this.updateSearchParams()
    this.getGoodsList();
    if(!_soid)return;
    app.collectSearchKeyword({
      keyword: _soid,
      source: 'goods'
    })
    if (wx.getStorageSync('showGiftStor')){
      this.setData({
        showGift:true
      })
      wx.removeStorageSync('showGiftStor')
    }
  },
  showLogin() {
    this.setData({
      showLoginModal: true
    })
  },
  handleOk() {
    this.setData({
      showLoginModal: false
    })
  },
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { 
    this.updateUser();
    this.updateShareConfig();
    let listStyle = wx.getStorageSync('listStyle') || 2;
    this.setData({
      listStyle
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  onPageScroll(e) {
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.searchParams.offset = 0;
    this.setData({
      loadAll: false,
      goods_list: [],

    })
    this.getGoodsList();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loadAll) return
    this.getGoodsList();
  },
  onShareAppMessage() {
    return shareConfig
  },
  /**
   * 用户点击右上角分享
   */
  updateShareConfig() {
    let params = this.data.urlParams;
    let member_id = this.data.member_id;
    
    let path = getCurrentPageUrlWithArgs();
    let reg1=/member_id/;
    let reg2=/store_id/;
    if (reg1.test(path) || reg2.test(path)){
      shareConfig.title = `影儿商城-${member_id}`;
      path.replace(/member_id=\d*/, 'member_id='+member_id);
      path.replace(/store_id=\d*/,'member_id='+member_id);
      shareConfig.path = path;
      shareConfig.imageUrl = '';
    }else{
      shareConfig.title = `影儿商城-${member_id}`;
      shareConfig.path = `${path}&member_id=${member_id}`
      shareConfig.imageUrl = ''
    }
  },
  updateUser() {
    /**************** localUserInfo ******************/
    let user_info = app.getLocalUserInfo();
    if (!!user_info) {
      this.setData({
        member_id: user_info.member_id,
        user_info: user_info,
      })
    }
  },
  updateSearchParams() {
    let query = this.data.router_query;

    this.searchParams.offset = 0;
    this.searchParams.limit = 10;
    this.searchParams.sort = '';
    this.searchParams.q = query.q || '';

    let fqArr = [];
    this.searchParams.sort = query.sort || '';
    if (query.come_from == 'search') {
      this.setData({
        searchValue: query.keyword || ''
      })
    }
    if (query.keyword) {
      fqArr.push(`keyword:"${query.keyword}"|| name:"${query.keyword}"`)
    } else if (query.cat_id) {
      fqArr.push(`goods_cat:"${query.cat_id}"`)
    }
    if(query.discount_rate){
      fqArr.push(`discount_rate:${query.discount_rate}`);
    }

    if (query.tags) {
      fqArr.push(`tag_name:"${query.tags}"`)
    }

    if (query.brand_name) {
      fqArr.push(`brand:"${query.brand_name}"`)
    }

    if (query.price) {
      let priceArr = query.price.slice(1, -1).split(',')
      fqArr.push(`price:[${priceArr[0]} TO ${priceArr[1]}]`)
    }
    if (!!query.fq) {
      fqArr.push(query.fq);
    }
    this.searchParams.fq = fqArr.join(',');
  },

  getGoodsList() {
    this.searchParams.platform = 'wxapplet';
    if(this.loading) return;
    this.loading=true;
    this.setData({
      fq: this.searchParams.fq
    })

    mall_api_post('/api/mobile/Goods/getGoodsList/cors', this.searchParams, res => {
      this.loading=false;
      if (res.code == 200) {
        let res_data = res.data;
        let action_list=[];
        res_data.map((item,index) => {
          item.price = parseFloat(item.price).toFixed(2)
          item.mktprice = parseFloat(item.mktprice).toFixed(2);
          action_list.push({
          action_type: "EXPOSE",
          action_time: parseInt(new Date().getTime() / 1000),
          action_param: {
            product_id: item.goods_id,
            positon: index + this.searchParams.offset + 1,
            source_id: this.data.soid,
            coupon_stock_id: ""
          }
        })
        })
        let data = [...this.data.goods_list, ...res_data];
        let loadAll = res_data.length < 10;
        this.searchParams.offset = data.length;
        this.setData({
          goods_list: data,
          facet_counts: res.facet_counts,
          loadAll
        })
        //上报曝光
        if (!res_data.length)return;
        if (!this.data.soid)return;
        let obj={};
        obj.action_list = action_list;
        let str = JSON.stringify(obj);
        app.reportUserAction(str);
      }
    }, err => {
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    })
  },

  changeListStyle() {
    let listStyle = this.data.listStyle;
    listStyle = listStyle + 1 > 3 ? 1 : listStyle + 1;
    wx.setStorageSync('listStyle', listStyle);
    this.setData({
      listStyle
    })
  },
  clickGoodsItems(e) {
    let {
      goods_id,
      index
    } = e.currentTarget.dataset;
    let {
      router_query
    } = this;
    wx.navigateTo({
      url: `/packageGoods/goodsDetailView/index?goods_id=${goods_id}&soid=${router_query.soid}`
    });
  
  },
  filterChange ({detail}) {
    let fq = detail;
    this.searchParams.offset = 0;
    this.searchParams.fq = fq;
    this.setData({
      goods_list: [],
      loadAll: false
    })
    this.getGoodsList();
  },

  hideDrawer (e) {
    let currentTab = {
      index: 0,
      optionsIndex: 0,
      optionsValue: '综合'
    }
    if (this.cache_data.currentTab) {
      currentTab = this.cache_data.currentTab;
    }
    this.setData({
      currentTab
    })
  },
  tabChange ({detail}) {
    let { index, optionsIndex, optionsValue, target } = detail;
    let priceAsc = this.data.priceAsc;
    let orderby = this.searchParams.sort;
    let fq = this.searchParams.fq;
    let q = this.searchParams.q;
    if (index == 3) {
      this.cache_data.currentTab = this.data.currentTab;
      this.setData({
        currentTab: detail
      })
      return;
    } else {
      this.cache_data.currentTab = null;
    }
    if (index == 0) {
      if (optionsValue == '综合') {
        fq = '';
        q = '';
        orderby = '';
      } else if (optionsValue == '新品') {
        let year = new Date().getFullYear();
        fq = `year:${year}`;
        q = '';
        orderby = '';
      }
      if(this.data.router_query.fq){
        fq+=(fq?',':'')+this.data.router_query.fq;
      }
    } else if (index == 1) {
      orderby = "buy_count desc";
    } else if (index == 2) {
      priceAsc = !priceAsc;
      orderby = priceAsc ? "price asc" : "price desc";
    }

    this.searchParams.offset = 0;
    this.searchParams.q = q;
    this.searchParams.sort = orderby;
    this.searchParams.fq = fq;
    this.setData({
      priceAsc,
      goods_list: [],
      loadAll: false,
      currentTab: detail
    }, () => {
      this.getGoodsList();
    })
  },
})