const app = getApp();
const {
  getUserInfo,
  formatTime
} = require('../../utils/index.js')
Page({

  /**
   * 页面的初始数据
   */
  obj_ident: new Set(), // 已选中商品的索引
  sku_ident: '',
  data: {
    member_id: '',
    cart: [],
    total_quantity: 0,
    cart_total_price: '0.00',
    discount_amount: '0.00',
    subtotal: '0.00',
    total_abroad_tax: 0,
    total_freight: 0,
    collocation_price: '0.00',
    checkedAll: false,
    goodsPopupType: 0,
    goods_data: {},
    currentSelectNum: 0,
    currentSelectId: 0,
    actionsSwipe: [
      {
        name: '收藏',
        width: 60,
        color: '#fff',
        fontsize: '20',
        icon: '',
        background: '#dd2453;'
      },
      {
        name: '删除',
        color: '#fff',
        fontsize: '20',
        width: 60,
        icon: '',
        background: '#333333'
      },
    ],
    goodId:[],//用来上报微信行为数据
    wxRecommend:false,
    urlParams:"",
    optionsParams:"",
    disabled_goods: [],
    showDelSelectBtn: false,
    cpnsList: [],
    showPopupList: 0,
    discount_detail: {},
    show_prize_description: false,
    showLoginModal:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.obj_ident.clear();
    this.sku_ident = '';
  },  
  loginBtn(){
    this.setData({
      showLoginModal:true
    })
  },
  handleOk() {
    const user_info = getUserInfo();
    this.setData({
      member_id: user_info.member_id,
      showLoginModal: false
    })
    this.getCartList(true);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const user_info = getUserInfo();
    if (!!user_info) {
      this.setData({
        member_id: user_info.member_id
      })
      this.getCartList(true);
    } else {
      wx.showToast({
        title: '请登录',
        icon: 'none'
      })
    }
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.obj_ident.clear();
    this.getCartList(true);
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

  getCartList (init) {
    let params = {
      member_id: this.data.member_id,
      obj_ident: JSON.stringify([...this.obj_ident])
    }
    let goodId=[];
    // 请求在800ms内完成则不显示loading
    let timer = setTimeout(() => {
      wx.showLoading({
        title: '正在请求',
        icon: 'none'
      })
    }, 500);
    params.wx_app_id=app.globalData.appid;
    app.notokan_api_post("mobileapi.cart.get_list_vstore", params, res => {
      clearTimeout(timer);
      timer = null;
      wx.hideLoading();
      if (res.rsp == 'succ') {
        let { goods = {}, disabled_goods = [], sales_rules = {}, satisfied_sales_rules = {}, cart_total_price, discount_amount, subtotal, total_abroad_tax, total_freight, collocation_price = '0.00'} = res.data;
        let cart = [];
        let total_quantity = 0;
        let showDelSelectBtn = false;

        for(let key in goods) {
          // let sales_orders = [];
          // if (sales_rules[key] && sales_rules[key].sales_orders.length) {
          //   sales_rules[key].sales_orders.map(item => {
          //     sales_orders.push(item)
          //   })
          // }

          let arr = goods[key];
          let i = 0;
          let dis_num = 0;
          arr.map(item => {
            let item_goods_id = item.params.goods_id;
            if (!!init) { goodId.push(item_goods_id)};
            // item.sales_orders_arr = [];
            // sales_orders.map(k => {
            //   if (k.goods_id && k.goods_id.indexOf(item_goods_id) > -1) {
            //     item.sales_orders_arr.push(k.rule_name);
            //   }
            // })
            item.maxCount = item.obj_items.buy_limit > 0 ? Math.min(item.obj_items.buy_limit, item.store.store) : item.store.store;
            let now = Date.now();
            let f_time = item.obj_items.from_time * 1000;
            let t_time = item.obj_items.to_time * 1000;
            if ((f_time > 0 && t_time > 0) && !(now > f_time && now < t_time) && now < t_time) {
              item.disabled = true;
              item.disabled_reason = now < f_time ? `限时购，${formatTime(f_time, 'MM月dd日hh:mm')}开始` : `限时购，${formatTime(t_time, 'MM月dd日hh:mm')}结束`;
              dis_num++;
            } else if (item.is_selected == 1) {
              item.checked = true;
              i++;
              total_quantity += item.quantity - 0;
              showDelSelectBtn = true;
            } else {
              item.checked = false;
            }
          })
          let cpns_id = '';
          if (sales_rules[key] && sales_rules[key].sales_coupons.length) {
            let temp = sales_rules[key].sales_coupons.map(item => {
              return item.cpns_id;
            })
            cpns_id = `[${temp.join(',')}]`;
          }
          cart.push({
            brand: key,
            cpns_id,
            checkedCount: i,
            disabledCount: dis_num,
            checked: i == arr.length - dis_num,
            goods: arr,
          })
        }
        this.setData({
          cart_total_price,
          discount_amount,
          subtotal,
          total_abroad_tax,
          total_freight,
          cart,
          total_quantity,
          checkedAll: cart.filter(item => { return item.checked == true }).length == cart.length,
          disabled_goods,
          sales_rules,
          showDelSelectBtn,
          discount_detail: satisfied_sales_rules,
          collocation_price
        });
        if(!!init){
          this.setData({
            goodId,
            wxRecommend: true,
          })
        }
      }
    })
  },
  checkItem ({currentTarget}) {
    let {itemIndex, groupIndex} = currentTarget.dataset;
    let {cart} = this.data;
    let group = cart[groupIndex];
    let item = group.goods[itemIndex];
    if (item.obj_items.collocation_id > 0) return this.checkCollocation([item.obj_items.collocation_id], item.checked);
    item.checked = !item.checked;
    group.checkedCount += item.checked ? 1 : -1;
    group.checked = group.checkedCount == group.goods.length - group.disabledCount;
    item.checked ? this.obj_ident.add(item.obj_ident) : this.obj_ident.delete(item.obj_ident);
    this.setData({
      cart,
      checkedAll: this.computeCheckStatus(),
    });
    this.getCartList();
  },
  checkCollocation (id, checked) {
    let {cart} = this.data;
    cart.map(item => {
      let goods_arr = item.goods;
      goods_arr.map(goods => {
        if (id.indexOf(goods.obj_items.collocation_id) > -1) {
          goods.checked = !checked && !goods.disabled;
          goods.checked ? this.obj_ident.add(goods.obj_ident) : this.obj_ident.delete(goods.obj_ident);
        }
      })
      item.checkedCount = item.goods.filter(v => v.checked).length;
      item.checked = item.checkedCount == goods_arr.length - item.disabledCount;
    })
    this.setData({
      cart,
      checkedAll: this.computeCheckStatus(),
    })
    this.getCartList();
  },
  checkGroup ({currentTarget}) {
    let { groupIndex } = currentTarget.dataset;
    let { cart } = this.data;
    let group = cart[groupIndex];
    let needCollocationCheck = [];
    let checked_temp = group.checked;
    group.goods.map(item => {
      if (item.obj_items.collocation_id > 0) {
        needCollocationCheck.push(item.obj_items.collocation_id);
      } else {
        item.checked = !checked_temp && !item.disabled;
        item.checked ? this.obj_ident.add(item.obj_ident) : this.obj_ident.delete(item.obj_ident);
      }
    })
    group.checkedCount = group.goods.filter(v => v.checked).length;
    group.checked = group.checkedCount == group.goods.length - group.disabledCount;
    if (needCollocationCheck.length) {
      this.checkCollocation(needCollocationCheck, checked_temp);
    } else {
      this.setData({
        cart,
        checkedAll: this.computeCheckStatus(),
      })
      this.getCartList();
    }
  },
  checkAll () {
    let { cart, checkedAll } = this.data;
    cart.map(item => {
      let goods_arr = item.goods;
      goods_arr.map(goods => {
        goods.checked = !checkedAll && !goods.disabled;
        goods.checked ? this.obj_ident.add(goods.obj_ident) : this.obj_ident.delete(goods.obj_ident);
      })
      item.checked = !checkedAll;
      item.checkedCount = checkedAll ? goods_arr.length - item.disabledCount : 0;
    })
    this.setData({
      cart,
      checkedAll: !checkedAll,
      showDelSelectBtn: !checkedAll
    })
    this.getCartList();
  },
  computeCheckStatus() {
    let {cart} = this.data;
    return cart.filter(item => { return item.checked == true }).length == cart.length;

  },
  handlerCloseButton (e) {
    let index = e.detail.index;
    let {groupIndex, itemIndex} = e.currentTarget.dataset;
    let {cart} = this.data;
    let item = cart[groupIndex].goods[itemIndex];
    if (index == 0) this.favGoods(item.obj_items.goods_id);
    if (index == 1) {
      let item_collocation_id = item.obj_items.collocation_id;
      wx.showModal({
        title: '警告',
        content: item_collocation_id ? '确认删除？(将删除所有套餐产品)' : '确认删除？',
        confirmColor: '#dd2543',
        success: (res) => {
          if (res.confirm) {
            let idents = [];
            if (item_collocation_id) {
              cart.map(v => {
                v.goods.map(k => {
                  if (k.checked) this.obj_ident.delete(item.obj_ident);
                  if (k.obj_items.collocation_id == item_collocation_id) idents.push({ "obj_type": "goods", "obj_ident": k.obj_ident });
                })
              })
            } else {
              if (item.checked) this.obj_ident.delete(item.obj_ident);
              idents.push({ "obj_type": "goods", "obj_ident": item.obj_ident });
            }
            this.delGoods(idents, item_collocation_id);
          }
        }
      })
    }
  },
  favGoods(goods_id) {
    app.notokan_api_post('mobileapi.member.add_fav', {
      gid: goods_id,
      member_id: this.data.member_id
    }, res => {
      if (res.rsp == 'succ') {
        wx.showToast({
          title: res.data,
          icon: 'none'
        })
      }
    })
  },
  delSelected () {
    wx.showModal({
      title: '提示',
      content: '确认删除？',
      confirmColor: '#dd2543',
      success: (res) => {
        if (res.confirm) {
          let idents = [];
          let item_collocation_id = '';
          let { cart } = this.data;
          cart.map(v => {
            v.goods.map(k => {
              if (k.checked) {
                this.obj_ident.delete(k.obj_ident);
                idents.push({ "obj_type": "goods", "obj_ident": k.obj_ident })
                if (k.obj_items.collocation_id) item_collocation_id = k.obj_items.collocation_id;
              }
            })
          })
          this.delGoods(idents, item_collocation_id);
        }
      }
    })
  },
  delGoods(idents, collocation_id) {
    let {cart, member_id} = this.data;
    let params = {
      member_id: this.data.member_id,
      obj_type: JSON.stringify(idents)
    }
    if (!!collocation_id) params.collocation_id = collocation_id;
    app.notokan_api_post("mobileapi.cart.remove", params, res => {
      if (res.rsp == 'succ') {
        this.getCartList();
      }
    })
  },
  handleChangeNum(e) {
    let { itemIndex, groupIndex } = e.currentTarget.dataset;
    let value = e.detail.value;
    let { cart, member_id } = this.data;
    let item = cart[groupIndex].goods[itemIndex];
    let params = {
      quantity: value > item.store.store ? item.store.store : value,
      obj_type: item.obj_type,
      obj_ident: item.obj_ident,
      member_id
    }
    app.notokan_api_post("mobileapi.cart.update", params, res => {
      if (res.rsp == 'succ') {
        this.getCartList();
      }
    })
  },
  changeSku ({currentTarget}) {
    this.sku_ident = '';
    let { itemIndex, groupIndex } = currentTarget.dataset;
    let {member_id, cart} = this.data;
    let item = cart[groupIndex].goods[itemIndex];
    if (item.disabled) return;
    let goods_id = item.obj_items.goods_id;
    wx.showLoading({
      title: '正在请求',
      mask: true,
    })
    app.notokan_api_post('mobileapi.products.get_all_goods', {
      member_id,
      goods_id,
    }, res => {
      if (res.rsp == 'succ' && res.data.length) {
        let goods_data = res.data[0];
        goods_data.id = goods_id;
        app.notokan_api_post('mobileapi.products.get_products_list', {
          goods_id,
        }, res => {
          if (res.rsp == 'succ') {
            wx.hideLoading();
            goods_data.product = res.data;
            goods_data.store = 0;
            res.data.forEach(item => {
              goods_data.store += item.store - 0;
            });
            this.sku_ident = item.obj_ident;
            this.setData({
              goodsPopupType: 2,
              goods_data,
              currentSelectNum: item.quantity,
              currentSelectId: item.obj_items.product_id,
            })
          } else {
            wx.hideLoading();
            wx.showToast({
              title: '网络错误',
              icon: 'none'
            })
          }
        })
      } else {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误!',
          icon: 'none'
        })
      }
    })
  },
  hidePopup () {
    this.setData({
      goodsPopupType: 0,
      goods_data: {},
      currentSelectNum: 0,
      currentSelectId: 0,
    })
  },
  submitHandle ({detail}) {
    let { product_id, num } = detail;
    let params = {
      member_id: this.data.member_id,
      product_id,
      obj_ident: this.sku_ident,
      num,
    }
    wx.showLoading({
      title: '正在请求',
      mask: true,
    })
    app.notokan_api_post('mobileapi.cart.updateCartSku', params, res => {
      wx.hideLoading();
      if (res.rsp == 'succ') {
        wx.showToast({
          title: '修改成功'
        })
        this.getCartList();
      } else {
        wx.showToast({
          title: res.data || '网络错误!',
          icon: 'none'
        })
      }
    });
  },
  buyNow () {
    if (this.obj_ident.size == 0) return wx.showToast({
      title: '请选择商品',
      icon: 'none'
    })
    let { cart, cart_total_price, subtotal, discount_amount, discount_detail, total_abroad_tax, total_freight, collocation_price} = this.data;
    let goods = [];
    cart.map(v => {
      v.goods.map(k => {
        if (k.checked) goods.push(k)
      })
    })
    let _data = {
      cart_total_price,
      subtotal,
      discount_amount,
      total_abroad_tax,
      total_freight,
      collocation_price,
      // discount_detail,
      goods,
      app_id:app.globalData.appid
    }
    let date_stamp = Date.now();
    wx.setStorageSync('cart_data_' + date_stamp, _data);
    wx.navigateToMiniProgram({
      appId: 'wx280a90f7bcf6aa06',
      path: 'packageGoods/orderConfirm/index?isExtra=true&date_stamp='+date_stamp,  //例如  pages/home/main?id=123
      extraData: _data,
      envVersion: 'release', // 体验版  trial   正式版  release
      success(res) {
        // 打开成功
        
      }
    })
    // wx.navigateTo({
    //   url: '/packageGoods/orderConfirm/index?date_stamp=' + date_stamp
    // })
  },
  addToFav () {
    let { disabled_goods, member_id } = this.data;
    let goods = disabled_goods.map(i => {
      let buy_code = i.params && i.params.extends_params && i.params.extends_params.buy_code ? i.params.extends_params.buy_code : ''
      return { obj_ident: i.obj_ident, goods_id: i.obj_items.goods_id, buy_code }
    })
    let params = {
      member_id: this.data.member_id,
      goods: JSON.stringify(goods)
    }
    wx.showLoading({
      title: '正在请求',
      mask: true,
    })
    app.notokan_api_post("mobileapi.cart.batchAddFav", params, res => {
      wx.hideLoading();
      if (res.rsp == 'succ') {
        this.getCartList();
      }
    })
  },
  clearDisabledGoods () {
    wx.showModal({
      title: '提示',
      content: '确认清空？',
      confirmColor: '#dd2543',
      success: (res) => {
        if (res.confirm) {
          let { disabled_goods, member_id } = this.data;
          let idents = disabled_goods.map(i => { return { "obj_type": "goods", "obj_ident": i.obj_ident } })
          let params = {
            member_id: this.data.member_id,
            obj_type: JSON.stringify(idents)
          }
          wx.showLoading({
            title: '正在请求',
            mask: true,
          })
          app.notokan_api_post("mobileapi.cart.remove", params, res => {
            wx.hideLoading();
            if (res.rsp == 'succ') {
              this.getCartList();
            }
          })
        }
      }
    })
  },
  selectResembleGoods({ currentTarget }) {
    let vm = this;
    let index = currentTarget.dataset.index;
    let item = this.data.disabled_goods[index];
    let cat_id = item.obj_items.cat_id;
    let url = item.obj_items.thumbnail_url;
    let params = {
      image: url,
      params_type: 'imageUrl',
      member_id: this.data.member_id,
      tags: cat_id
    };
    wx.showLoading({
      title: '正在请求',
      mask: true,
    })
    app.mall_api_post('/api/imageSearch/searchGoodsImage', params, res => {
      if (res.status == 'success' && res.data.bn_arr.length) {
        let bn_arr = res.data.bn_arr.join(' ')
        let params = {
          q: '',
          offset: 0,
          limit: 30,
          fq: `bn:(${bn_arr})`
        }
        app.mall_api_post('/api/mobile/Goods/getGoodsList/cors', params, res => {
          wx.hideLoading();
          if (res.code == 200 && res.data.length) {
            wx.setStorageSync('resemble_data', res.data)
            wx.navigateTo({
              url: '/pages/resembleGoodsListView/index'
            })
          } else {
            wx.showToast({
              title: '没有找到相关商品',
              icon: 'none'
            })
          }
        })
      } else {
        wx.hideLoading()
        wx.showToast({
          title: '没有找到相关商品',
          icon: 'none'
        })
      }
    })
  },
  getCpnsList ({currentTarget}) {
    let params = {
      member_id: this.data.member_id,
      cpns_id: currentTarget.dataset.cpnsid
    }
    wx.showLoading({
      title: '正在请求',
      mask: true
    })
    app.notokan_api_post("wap2.card.cartGetCard", params, res => {
      wx.hideLoading();
      if (res.rsp == 'succ') {
        let data = res.data;
        data.map(item => {
          item.time_range = formatTime(item.start_time * 1000, 'MM-dd hh:mm:ss') + '至' + formatTime(item.end_time * 1000, 'MM-dd hh:mm:ss')
        })
        this.setData({
          cpnsList: data,
          showPopupList: 1
        })
      }
    })
  },
  getCard ({currentTarget}) {
    let { cpnsList, member_id } = this.data;
    let index = currentTarget.dataset.index;
    let cpns_id = cpnsList[index].cpns_id;
    let params = {
      member_id: member_id,
      scene: 0,
      cpns_id: cpns_id
    }
    wx.showLoading({
      title: '正在请求',
      mask: true
    })
    app.notokan_api_post("wap2.card.getCard", params, res => {
      wx.hideLoading();
      if (res.rsp == 'succ') {
        wx.showToast({
          title: '领取成功'
        })
        cpnsList[index].status = 1;
        this.setData({
          cpnsList,
        })
      } else {
        wx.showToast({
          title: res.message || '领取失败',
          icon: 'none'
        })
      }
    })
  },
  showDiscountDetail () {
    console.log("showDiscountDetail");
    let { total_quantity, discount_amount, discount_detail} = this.data;
    if (total_quantity > 0 && discount_amount > 0 || !!discount_detail.order_lottery) {
      this.setData({
        showPopupList: 2
      })
    }
  },
  hideCpnsList () {
    this.setData({
      cpnsList: [],
      showPopupList: 0
    })
  },
  togglePrizeDescription () {
    this.setData({
      show_prize_description: !this.data.show_prize_description
    })
  },
  doNothing () {},
})