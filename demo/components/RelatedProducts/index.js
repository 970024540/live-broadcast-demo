let {
  globalData
} = getApp();
const app = getApp();
const {
  getCurrentPageUrlWithArgs, formatTime
} = require('../../utils/index');
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true
  },
  properties: {
    imgWidth: {
      type: String,
      value: '144'
    },
    commonInit: {
      type: String,
      value: 'btn' //btn:显示立即抢购按钮  radio:显示radio
    },
    btnText: {
      type: String,
      value: "立即加购" //按钮文字 
    },
    datas: {
      type: Object,
      value: {}
    },
    share_member_id: {
      type: String, //分享人ID
      value: ""
    },
    author_id: {
      type: String,
      value: ''
    },
    showVideo: {
      type: Boolean,
      value: false
    },
    isSharePoint: {
      type: Boolean,
      value: false
    },
    content_id: {
      type: String,
      value: ""
    },
    content_type: {
      type: Number,
      value: 1 //1视频 2文章 3组合包
    }
  },
  ready() {
    this.updateUser();
  },
  /**
   * 组件的初始数据
   */
  data: {
    selected: false,
    base_host: globalData.test,
    spec_info: '',
    goods_data: {},
    goodsPopupType: 0,
    scheme_price: 0, // 团购优惠价
    user_info: null,
    member_id: '',
    is_can_buy: true,
    active_status: false,
    prepay_status: false,
    active_end_time:0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
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
    handleAnimalChange() { },
    jumpGoodsDetail({
      currentTarget
    }, url = '') {
      if (this.data.commonInit == 'radio') return;
      let obj = {
        goods_id: this.properties.datas.goods_id || '',
        member_id: this.data.share_member_id || '',
        author_id: this.data.author_id || '',
        content_id: this.data.content_id,
        content_type: this.data.showVideo ? 1 : 2,
        scene_id: this.data.showVideo ? 1905095557807 : 1905097724017,
        scene_type: this.data.showVideo ? 'discovery_video' : 'goods_page',
        scene_relation: 'oneself',
        scene_url:'packageCommunity/PersonalDetails/index/goodsImg'
      }
      if (this.properties.isSharePoint) {
        obj.type = this.data.showVideo ? 'video' : 'article'
      }

      for (var key in obj) url += '&' + key + '=' + obj[key];
      wx.navigateTo({
        url: '/packageGoods/goodsDetailView/index?' + url.slice(1),
      })
    },
    radioClick() {
      let data = this.data.datas;
      data.checked = !data.checked;
      this.setData({
        datas: data
      })
      this.triggerEvent('changeRadio', this.data.datas)
    },
    getGoodsDetail() {
      let params = {
        goods_id: this.data.datas.goods_id,
        member_id: ''
      };
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      let goodId = [];
      app.notokan_api_post('mobileapi.products.get_all_goods', params, res => {
        wx.hideLoading();
        if (res.rsp == "succ") {
          if (!res.data.length) return;
          let _data = res.data[0];
          this.getProductList(res.data);
        } else {
          wx.showToast({
            title: res.data,
            icon: 'none'
          })
        }
      })
    },
    getProductList(data) {
      let goods_data = data[0];
      goods_data.id = goods_data.goods_id;
      let params = {
        goods_id: goods_data.goods_id
      };
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      app.notokan_api_post("mobileapi.products.get_products_list", params, res => {
        wx.hideLoading();
        if (res.rsp == "succ") {
          goods_data.product = res.data;
          goods_data.store = 0;
          res.data.forEach(item => {
            goods_data.store += item.store - 0;
            if (this.data.isnew) item.price = goods_data.new_member_sell_price;
          });
          goods_data.to_time = goods_data.to_time * 1000;
          goods_data.from_time = goods_data.from_time * 1000;
          goods_data.deposit_start_time = goods_data.deposit_start_time * 1000;
          goods_data.deposit_end_time = goods_data.deposit_end_time * 1000;
          if (goods_data.is_prepay || !!goods_data.from_time) {
            if (this.checkTime(goods_data.server_now_time)) return;
            this.setData({
              goods_data: goods_data,
            });
            this.initTimer();
            this.timer = setInterval(() => {
              this.initTimer();
            }, 1000);
          };
          this.setData({
            goods_data: goods_data,
            goodsPopupType: 2,
          })
        } else {
          wx.showToast({
            title: res.data,
            icon: 'none'
          });
        }
      });
    },
    hidePopup() {
      this.setData({
        goodsPopupType: 0,
      });
    },
    checkTime(server_now_time) {
      // 本地系统时间与服务器时间相差超过60秒，终止
      let diff_time_error = Math.abs(Date.now() - server_now_time * 1000) > 60000;
      if (diff_time_error) {
        wx.showModal({
          title: '警告',
          content: `本地系统时间异常${Date.now()}`,
          showCancel: false,
          complete: () => {
            wx.navigateBack()
          }
        })
        return true;
      }
      return false;
    },
    initTimer() {
      let goods_data = this.data.goods_data;
      let now = Date.now();
      let prepay_status = false
      let active_status = false;
      if (goods_data.is_prepay) {
        prepay_status = goods_data.deposit_start_time < now && goods_data.deposit_end_time > now;
      }

      if (!!goods_data.from_time) {
        active_status = goods_data.from_time > now;
      }
      this.setData({
        prepay_status,
        active_status,
      });
    },
    computeSpecItem({
      detail
    }) {},
    submitHandle({ detail }) {
      let self = this;
      let { is_can_buy, active_status, share_member_id, author_id, prepay_status } = this.data;
      if (!this.data.member_id) {
        return wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/loginByMsg/index'
          })
        }, 2000)
      };
      let type = detail.goodsPopupType // 2 加入购物车, 3 立即购买 , 4 预付定金
      let info = '';
      if (type == 4 && !prepay_status) info = '未到预付时间';
      if (!is_can_buy) info = '商品已失效';
      if (active_status) info = '活动尚未开始';
      if (info) {
        return wx.showToast({
          title: info,
          icon: 'none'
        })
      };
      this.setData({
        goodsPopupType: 0,
        spec_info: detail.spec_info
      });
      let { product_id, num } = detail;
      let route = getCurrentPageUrlWithArgs();
      var optionsParams = this.showVideo ? 'packageCommunity/communityShortVideoDetail/index' : 'packageCommunity/PersonalDetails/index';
      let params = {
        product_id,
        num,
        buy_code: share_member_id,
        second_buy_code: author_id,
        member_id: this.data.member_id,
        buy_url: encodeURIComponent(route),
        content_id: this.data.content_id,
        content_type: this.data.showVideo ? 1 : 2,
        scene_id: this.data.showVideo ? 1905095557807 : 1905097724017,
        scene_type: this.data.showVideo ? 'discovery_video' : 'goods_page',
        scene_url: `${optionsParams}?${this.data.content_id}`,
        scene_relation: "oneself",
      };
      params.wx_app_id=app.globalData.appid;
      app.notokan_api_post('mobileapi.cart.add_vstore', params, res => {
        wx.hideLoading()
        if (res.rsp == 'succ') {
          wx.showToast({
            title: '添加购物车成功',
            icon: 'success'
          });
          self.reportCont();
        } else {
          wx.showToast({
            title: res.data,
            icon: 'none'
          })
        }
      })
    },
    reportCont() {
      //上传内容数据
      var optionsParams = this.showVideo ? 'packageCommunity/communityShortVideoDetail/index' : 'packageCommunity/PersonalDetails/index';
      let form = {
        scene_id: this.data.showVideo ? 1905095557807 : 1905097724017,
        scene_type: this.data.showVideo ? 'discovery_video' : 'goods_page',
        scene_url: `${optionsParams}?${this.data.content_id}`,
        add_cart_num: 1,
        scene_relation: 'oneself',
        member_id: this.data.share_member_id || '',
      };
      app.reportContent(form);
    },
  }
})