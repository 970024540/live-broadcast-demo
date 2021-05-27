// pages/goodsDetailView/index.js
const app = getApp();
let shareConfig = Object.assign({}, app.shareConfig);
let drawCanvas = false;
let pos = null;
let goodsQcodeImage = null;
let goodsQcode = null;
const {
  formatTime,
  getCurrentPageUrlWithArgs,
  parseOptions,
  textWrap,
  ossUrlTest,
} = require('../../utils/index');
Page({
  /**
   * 页面的初始数据
   */
  detail_img_prev: [],
  detailTop: 0,
  timer: null,
  page_open_time: 0, // 避免提前打开秒杀页面到时间后没有刷新页面，导致判断系统时间错误，小程序不支持performance,定时器有一定误差
  data: {
    $doubleEleven: app.globalData.$doubleEleven,
    schemes: {},      // 该商品所有团购活动
    total: 0,         // 该商品总团购人数
    totalBuy: 0,
    joinlist: [],     // 该商品正在拼团列表(最多取10条)
    isgroup: false,   // 是否是团购商品 groupbuy_scheme.length > 0
    scheme_id: '',    // 团购活动规则 id
    scheme_price: 0,  // 团购优惠价
    join_list_id: '', // 团 id
    shareGroup: false,// 是否分享进来(带有 scheme_id 和 join_list_id)
    join_list_status: false,
    canstart: true,   // 是否能开团
    isgroupStart: false,     // 是否团购未开始
    showBargaining: false,
    isnew: false, // 是否享受新人专享优惠
    bargaiData: {},   // 砍价数据
    active_banner_index: 0,
    is_can_buy: true,
    qcode: 'https://mall.yingerfashion.com/public/img/c71aba0550663ae2cd5aac6b1ef2f8ec1777ef49.png',
    goods_id: 0,
    showLoginModal: false,
    urlParams: {},
    goods_data: {},
    collocation_data: [],
    banner_list: [],
    banner_video: {
      poster: '',
      src: ''
    },
    showDetailTab: true,
    showQcodeModal: false,
    host: app.globalData.image_host,
    goodsPopupType: 0, // 2.加入购物车  3.立即购买  4.预付定金  5.团购  6.砍价 7.预约购买
    user_info: null,
    member_id: '',
    share_member_id: '',
    buy_code: 0,
    second_buy_code: 0,
    content_id: 0,
    content_type: '',//内容类型 1：视频;2：文章;3:组合包
    spec_item: {},
    currentTab: 0,
    top: 0,
    is_fav: false,
    richContent: '',
    active_status: false,
    prepay_status: false,
    active_end_time: 0,
    deposit_start_time: '',
    deposit_end_time: '',
    optionsParams: {},
    goodId: [],
    fav_goods_list: false,
    cart_num: 0,
    bargaiEndTime: '',//砍价结束时间戳

    bannerTimer: {
      type: 0,
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
    }, // 双11添加，过时可删

    subScribe: {}, //预约数据
    sub_type: 1,  //预约活动进行状态
    isSubscribe: false, //预约购买页面

    isCrowd: false, //众人团
    crowdBuy: {},    //众人团数据
    crowdType: 1,
    buyList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var optionsParams = wx.getLaunchOptionsSync();
    let params = parseOptions(options);
    if (options.type == 'scene') {
      params.goods_id = params.gid;
      params.member_id = params.mid;
    }
    let {goods_id} = params;
    if (!goods_id) return;
    this.setData({
      goods_id: goods_id,
      urlParams: params,
      optionsParams,
      // share_member_id: custom_params || '',
    });
    if (!!params.type && params.type=='ad') {
      //埋点，记录打开的分享次数
      this.burySharePoint({
        goods_id,
        share_open_num: 1,
        share_source: params.type
      });
    }
    // this.getGoodsDetail();
    // this.get_collocation_data(goods_id);
    wx.reportAnalytics('view_goods_detail', {
      goods_id,
      scene: '分类列表',
    });
    if (!this.data.urlParams.soid) return;
     //用户行为上报
     let obj = {
      action_list: [{
        action_type: "CLICK_PRODUCT",
        action_time: parseInt(new Date().getTime() / 1000),
        action_param: {
          product_id: goods_id,
          source_id: !!this.data.urlParams.soid ? this.data.urlParams.soid : '浏览',
          coupon_stock_id: ""
        },
      }]
    }
    if (!!this.data.urlParams.trid) {
      obj.action_list[0].trace_id = this.data.urlParams.trid;
    }
    let str = JSON.stringify(obj);
    app.reportUserAction(str);
    //新粉注册判断登录显示;
    let showLoginModal= app.handleIsChk(optionsParams.query.isChk);
    this.setData({
          showLoginModal
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.getBargaiDetail(); //砍价详情
    this.getGoodsSubscribe(); // 预约购买
    this.fetchGroupDetail();
    this.getGoodsDetail();
    this.get_collocation_data();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.updateUser();
    if (this.data.user_info) this.doFav('check');
    this.updateShareConfig();
    this.reportCont();
    this.getCartNum();
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      showDetailTab: true,
      top: 0
    })
    this.getBargaiDetail();  // 砍价详情
    this.getGoodsSubscribe(); // 预约购买
    this.fetchGroupDetail();
    this.getGoodsDetail();
    this.get_collocation_data();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  updateShareConfig() {
    let params = this.data.urlParams;
    let store_id = 0;
    let buy_code = 0;
    let {
      goods_id
    } = this.data;
    if (params.member_id instanceof Array) {
      let len = params.member_id.length;
      params.member_id = params.member_id[len - 1];
    }

    if (!!params.member_id && params.member_id != this.data.member_id) {
      buy_code = params.member_id;
      app.setStoreId(params.member_id);
      store_id = params.member_id;
    } else {
      store_id = wx.getStorageSync('store_id') || 0;
      if(!!store_id) buy_code=store_id;
    }

    if (!!params.store_id && params.store_id != "undefined" && params.store_id != this.data.member_id) {
      buy_code = params.store_id;
    }
    let share_member_id = app.globalData.store_login ? this.data.member_id : (!!params.member_id ? params.member_id : this.data.member_id)
    if (this.data.isgroup) {
      shareConfig.title = '【团购】影儿商城-' + share_member_id
    } else if (this.data.showBargaining){
      shareConfig.title = '【砍价】影儿商城-' + share_member_id
    } else if (this.data.isCrowd) {
      shareConfig.title = '【众人团】影儿商城-' + share_member_id
    } else {
      shareConfig.title = '影儿商城-' + share_member_id
    }
    shareConfig.path = `/packageGoods/goodsDetailView/index?goods_id=${goods_id}&member_id=${share_member_id}`;
    if (this.data.shareGroup) {
      // 二级参团 (感觉叫中间商截胡更合适点)
      shareConfig.path += `&scheme_id=${this.data.scheme_id}&join_list_id=${this.data.join_list_id}`;
    }
    if (!!params.custom_params && params.custom_params != this.data.member_id){
      buy_code = params.custom_params; //custom_params 从直播间带过来的分享人ID
    }
    this.setData({
      buy_code: buy_code,
      second_buy_code: params.author_id || 0,
      content_id: params.content_id || 0,
      content_type: params.content_type || '',
      share_member_id,
    })

  },
  onShareAppMessage() {
    let vm=this;
    //上报商品分享
    app.burySharePoint({
      goods_id: this.data.goods_id,
      share_num: 1,
      share_source: "goods_detail"
    })
    //上报内容分享
    vm.reportCont('share');
    return shareConfig
  },
  // 发起砍价
  getBargainClick(){
    let now = parseInt(new Date().getTime() / 1000);
    let { bargaiEndTime}=this.data;
    if (!bargaiEndTime || now >= bargaiEndTime) {
      wx.showToast({
        title: '砍价活动已结束!',
        icon:'none'
      });
      this.setData({
        showBargaining: false
      });
      return
    }
    this.getShow(6);
  },
  /************************* 团购 *************************/
  participateGroup({ detail }) {
    this.setData({
      scheme_id: detail.scheme_id,
      join_list_id: detail.join_list_id,
      scheme_price: this.data.schemes[detail.scheme_id].scheme_price
    })
    this.getShow(5);
  },
  initiateGroup({ detail }) {
    this.setData({
      scheme_id: detail.scheme_id,
      scheme_price: this.data.schemes[detail.scheme_id].scheme_price
    });
    this.getShow(5);
  },
  copyStr ({currentTarget}) {
    !!this.data.goods_data.name && wx.setClipboardData({
      data: this.data.goods_data.name,
    })
  },
  startGroup() {
    if (this.data.shareGroup) {
      this.getShow(5);
      return;
    }
    if (!this.data.canstart) {
      wx.showToast({
        title: this.data.isgroupStart ?'商品团购活动未开始!':'商品团购活动已结束!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    let el = this.selectComponent('#groupbuy');
    el.selectScheme();
  },
  /************************* 团购 *************************/

  handleCancel() {
    this.setData({
      showLoginModal: false
    })
  },
  handleOk() {
    this.updateUser();
    this.updateShareConfig();
    this.setData({
      showLoginModal: false
    })
  },
  detailScroll({ detail }) {
    if (!this.data.goods_data.id) return;
    let deltaY = detail.deltaY;
    let top = detail.scrollTop;
    if (this.data.currentTab == 0 && top > this.detailTop) {
      this.setData({
        currentTab: 1
      });
    } else if (this.data.currentTab == 1 && top < this.detailTop) {
      this.setData({
        currentTab: 0
      });
    }
    let show = this.data.showDetailTab;
    if (!show && deltaY > 40) {
      this.setData({
        showDetailTab: true
      })
    } else if (show && deltaY < -40) {
      this.setData({
        showDetailTab: false
      })
    }
  },
  scrollToView(e) {
    if (!this.data.goods_data.id) return;
    let type = e.currentTarget.dataset.type;
    this.setData({
      top: type == 1 ? this.detailTop : 0,
    });
  },
  richTextClick (e) {
    let urls = this.detail_img_prev;
    if (urls.length == 0) return;
    wx.previewImage({
      urls,
    })
  },
  submitHandle({ detail }) {
    let vm = this;
    let type = detail.goodsPopupType // 2 加入购物车, 3 立即购买 , 4 预付定金 , 5 团购 , 6 砍价 , 7 预购
    if (type==2&&!this.data.user_info) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      this.setData({
        showLoginModal: true
      })
      return
    }
    let {
      member_id,
      buy_code,
      second_buy_code,
      goods_id,
      goods_data,
      urlParams,
      optionsParams,
      is_can_buy,
      active_status
    } = this.data;
    

    if ((goods_data.is_prepay || !!goods_data.from_time) && this.checkTime(goods_data.server_now_time - 0 + this.page_open_time)) return;
    let info = '';
    if (type == 4 && !this.data.prepay_status) info = '未到预付时间';
    if (!is_can_buy) info = '商品已失效';
    if (active_status) info = '活动尚未开始';
    if (info) {
      return wx.showToast({
        title: info,
        icon: 'none'
      })
    }
    if (type == 4) return this.doPrepay(detail); // 跳转到预付
    // let route=`${this.route}?goods_id=${goods_id}&member_id=${member_id}&author_id=${second_buy_code}`
    let route = getCurrentPageUrlWithArgs();
    let { product_id, num } = detail;
    if (type == 5) {
      let { valid_buy_count, member_buyed_num } = this.data.schemes[this.data.scheme_id];
      if (valid_buy_count != 0 && num > (valid_buy_count - member_buyed_num)) {
        wx.showToast({
          title: `当前只能购买${valid_buy_count - member_buyed_num}件`,
          icon: 'none'
        })
        return;
      }
    }
    if (type == 6) { //跳至砍价详情页
      if (this.data.bargaiData.together_buy_items == '0' && num != 1) {//together_buy_items:同款同码同时多件参与砍价(0不能，1能)',
        wx.showToast({
          title: `当前只能购买1件`,
          icon: 'none'
        })
        return;
      }
      wx.navigateTo({
        url: `/packageBargain/bargainDetail/index?goods_id=${goods_id}&member_id=${member_id}&num=${num}&product_id=${product_id}&buy_code=${buy_code}`
      })
      return;
    }
    if (type == 7 && this.data.subScribe.valid_buy_count != '0') {
      if (num > this.data.subScribe.valid_buy_count - this.data.subScribe.buyed) {
        if (this.data.subScribe.valid_buy_count == this.data.subScribe.buyed) {
          wx.showToast({
            title: '您已经超出限购数量',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: `当前只能购买${this.data.subScribe.valid_buy_count - this.data.subScribe.buyed}件`,
            icon: 'none'
          })
        }
        return;
      }
    }
    if (type == 8 && this.data.crowdBuy.valid_buy_count != '0') {
      if (num > this.data.crowdBuy.valid_buy_count - this.data.crowdBuy.buyed) {
        if (this.data.crowdBuy.valid_buy_count == this.data.crowdBuy.buyed) {
          wx.showToast({
            title: '您已经超出限购数量',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: `每个ID限购${this.data.crowdBuy.valid_buy_count}件，您还可以购买${this.data.crowdBuy.valid_buy_count - this.data.crowdBuy.buyed}件`,
            icon: 'none'
          })
        }
        return;
      }
    }
    let params = {
      product_id,
      num,
      buy_code: buy_code||'',
      second_buy_code,
      member_id: this.data.user_info?this.data.user_info.member_id:'',
      buy_url: encodeURIComponent(route)
    };
    if (urlParams.content_id && urlParams.content_type) {
      params.content_id = urlParams.content_id;
      params.content_type = urlParams.content_type;
    }
    if (type == 3 || type == 5 || type == 7 || type == 8) {
      params.btype = "is_fastbuy"
    };
    let scene_obj = wx.getStorageSync('scene_obj');
    if (!!urlParams.scene_id) {
      //统计销量
      Object.keys(urlParams).map(key => {
        if (key == 'scene_type' || key == 'scene_id' || key == 'scene_relation') {
          params[key] = urlParams[key]
        }
      });
      if (!!optionsParams.query && !!optionsParams.query.appmsg_compact_url) {
        params['scene_url'] = optionsParams.query.appmsg_compact_url
      } else {
        params['scene_url'] = !!urlParams['scene_url'] ? urlParams['scene_url'] : optionsParams.path
      }
    } else if (!!scene_obj) {
      scene_obj.scene_relation = "goods_detail_recommend";
      Object.assign(params, scene_obj);
    }
    if (!!vm.data.urlParams.soid) {
      params.source_id = vm.data.urlParams.soid || '浏览'
      if (!!urlParams.trid) {
        params.source_id += `,${urlParams.trid}`
      }
    };
    if (type == 2) {
      wx.showLoading({
        title: '请求中...',
      })
      params.wx_app_id=app.globalData.appid;
      app.notokan_api_post('mobileapi.cart.add_vstore', params, res => {
        wx.hideLoading()
        if(res.rsp == 'succ'){
          wx.showToast({
            title: '添加购物车成功',
            icon: 'success'
          })
          vm.getCartNum();
        }
      })
    } else if (type == 3 || type == 5 || type == 7 || type == 8) {
      let cart_data = {
        product_id: detail.product_id,
        num: detail.num,
        buy_code: this.data.buy_code,
        product_price: detail.price,
        fast_buy: true,
        freight: detail.freight,
        abroad_id: detail.abroad_id,
        abroad_tax: detail.abroad_tax,
        is_prepay: false,
        name: detail.name,
        brand_name: detail.brand_name,
        spec_info: detail.spec_info,
        src: this.data.banner_list[0],
        app_id:app.globalData.appid
      }
      if (type == 5) {
        cart_data.scheme_id = this.data.scheme_id;
        cart_data.scheme_price = detail.price - this.data.scheme_price;
        cart_data.groupbuy_goods_id = this.data.goods_id;
        if (this.data.join_list_id) {
          cart_data.join_list_id = this.data.join_list_id;
        }
      }
      if (type == 7) {
        cart_data.book_id = this.data.subScribe.book_id
        cart_data.book_discount = this.data.subScribe.scheme_price
      }
      if (type == 8) {
        cart_data.multi_id = this.data.crowdBuy.scheme_id
        cart_data.multi_discount = this.data.crowdBuy.discount_price
      }
      wx.setStorageSync("cart_data", cart_data)

      console.log('缓存！！', cart_data)
      wx.navigateToMiniProgram({
        appId: 'wx280a90f7bcf6aa06',
        path: 'packageGoods/orderConfirm/index?isExtra=true',  //例如  pages/home/main?id=123
        extraData: cart_data,
        envVersion: 'release', // 体验版:  trial 正式版:  release
        success(res) {
          // 打开成功
          if(app.globalData.roomid){
            wx.navigateTo({
              url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?custom_params=''&room_id=${app.globalData.roomid}`,
            })
          }
        }
      })
    }
  },
  // 调转到定金支付
  doPrepay(product) {
    let data = this.data
    let goods_data = data.goods_data
    let query = `?goods_id=${data.goods_id}&rule_id=${goods_data.rule_id}&product_id=${product.product_id}&member_id=${data.buy_code}&second_buy_code=${data.second_buy_code}`
    wx.navigateTo({
      url: '/packageGoods/depositDetailView/index' + query,
    })
  },
  // 跳转到搭配
  handle_collocation(e) {
    let id = e.currentTarget.dataset.id;
    let { content_id='', content_type=''}=this.data.urlParams;
    wx.navigateTo({
      url: `/packageGoods/collocationListView/index?collocation_id=${id}&member_id=${this.data.member_id}&second_buy_code=${this.data.second_buy_code}&goods_id=${this.data.goods_id}&content_id=${content_id}&content_type=${content_type}`,
    })
  },
  // 跳转到购物车
  jumpToCart() {
    wx.navigateTo({
      url: '/pages/newCart/index'
    })
  },
  // 收藏
  doFav(type) {
    if (!this.data.member_id) {
      if (type != 'check') {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
        this.setData({
          showLoginModal: true
        })
      }
      return
    }
    
    let params = {
      gid: this.data.goods_id,
      member_id: this.data.member_id
    }
    wx.reportAnalytics('add_goods_favorites', {
      goods_id: this.data.goods_id,
      goods_name: this.data.goods_data.name
    });
    let is_fav = this.data.is_fav;
    if (!is_fav) params.buy_code = this.data.buy_code;
    let url = type == 'check' ? 'mobileapi.member.get_fav' : (is_fav ? 'mobileapi.member.del_fav' : 'mobileapi.member.add_fav')
    app.notokan_api_post(url, params, res => {
      if (res.rsp == 'succ') {
        let fav = type == 'check' ? res.data : wx.showToast({
          title: res.data
        }) || !is_fav
        this.setData({
          is_fav: fav
        })
        if (res.data == '商品收藏添加成功') {
          this.reportCont('collect')
        }
      }
    })
  },
  getBargaiDetail(){
    let parmas={
      goods_id: this.data.goods_id,
      member_id: this.data.member_id
    }
    app.notokan_api_post('mobileapi.bargainList.getProductBargainData',parmas,res=>{
      if (res.rsp == 'succ' && res.data && res.data.status == 1) {
        this.setData({
          showBargaining:true,
          bargaiEndTime:res.data.end_time,
          bargaiData:res.data
        })
      }
    })
  },
  fetchGroupDetail() {
    let params = this.data.urlParams;
    let options = {
      goods_id: this.data.goods_id,
      member_id: this.data.member_id,
      offset: 0,
      limit: 20
    }
    if (params.join_list_id) {
      options.join_list_id = params.join_list_id;
    }

    app.notokan_api_post('mobileapi.groupbuy.getGroupBuyList', options, res => {
      if (res.rsp == 'succ' && res.data.groupbuy_scheme) {
        let { total_grouped_num, total_buyed_num, scheme_join_list, groupbuy_scheme, join_list_status } = res.data;
        this.setData({
          schemes: {},
          isgroup: groupbuy_scheme.length > 0,
          join_list_status: join_list_status || false
        });
        if (!groupbuy_scheme.length) return;    // 非团购,后面逻辑不用执行

        let { scheme_id, shareGroup, join_list_id, scheme_price, schemes}=this.data;

        // join_list_status false未满,true已满
        if (params.scheme_id && params.join_list_id && !join_list_status) {
          // 分享(join_list_id 的团满了,当做非分享处理)
          scheme_id = params.scheme_id;
          shareGroup=true;
          join_list_id = params.join_list_id;
        } else {
          // 非分享
          scheme_id = groupbuy_scheme[0].scheme_id;
          shareGroup=false;
          scheme_price= groupbuy_scheme[0].scheme_price;
        }
        
        let _canstart = false, isShowId=0;
        groupbuy_scheme.forEach(item => {
          if (shareGroup && item.scheme_id == scheme_id) {
            scheme_price = item.scheme_price;
          }
          if (item.is_start_groupbuy == 1) {
            _canstart = true;
            if (isShowId == 0) isShowId=item.scheme_id;
          }
          if (item.from_time) item.startTime = formatTime(item.from_time * 1000, 'MM月dd日hh:mm');
          schemes[item.scheme_id] = item;
          
        })
        if (!shareGroup && isShowId != 0) { // 如果是分享进来的则跳过，如果有多个团购且第一个团购是未开始的，则显示开启的团购
          scheme_id = schemes[isShowId].scheme_id;
          scheme_price = schemes[isShowId].scheme_price;
        }
        this.setData({
          scheme_id,
          shareGroup,
          join_list_id,
          scheme_price,
          schemes,
          canstart: _canstart,
          isgroupStart: schemes[scheme_id].is_start_groupbuy==0,
          total: total_grouped_num,
          totalBuy: total_buyed_num,
          joinlist: scheme_join_list,
        })
      }
    })
  },
  getGoodsDetail() {
    // 重置小程序码
    drawCanvas = false;
    goodsQcodeImage = null;
    goodsQcode = null;
    pos = null;
    // 生成小程序码
    this.createWXACode();
    let params = {
      goods_id: this.data.goods_id,
      member_id: this.data.member_id
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
        
        this.setData({
          isnew: !!_data.privilege_rule_id
        })
        if (this.data.isnew) {
          res.data[0].price2 = res.data[0].price;
          res.data[0].price = res.data[0].new_member_sell_price;
        }

        this.fetchVideoSrc(_data.video_id);
        let banner_list = res.data.map(item => {
          return ossUrlTest(item.l_url);
        });
        this.downFile(banner_list[0], 'goodsQcodeImage');
        shareConfig.imageUrl = banner_list[0];
        let article = _data.intro || '';
        let src_arr = [];
        if (!!article) {
          let reg = /http.*?\.(jpeg|jpg|png)/img;
          article = article.replace(/<img\ssrc="data:image\/png;base64.*>/img, '');
          src_arr = article.match(reg);
        }
        goodId.push(_data.goods_id);
        this.setData({
          banner_list: banner_list,
          richContent: article,
          is_can_buy: _data.is_can_buy,
          goodId,
          fav_goods_list:true
        })
        this.detail_img_prev = src_arr;
        this.getProductList(res.data);
        this.hitHistory()//记录足迹
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
    goods_data.id = this.data.goods_id;
    let params = {
      goods_id: this.data.goods_id
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
       // goods_data.is_presell = goods_data.is_presell == 'true' && !!goods_data.presell_from_time && goods_data.presell_from_time * 1000 > Date.now();
        
        if (goods_data.is_prepay || !!goods_data.from_time) {
          if (this.checkTime(goods_data.server_now_time)) return;
          this.page_open_time = 0;
          this.setData({
            goods_data: goods_data,
            active_end_time: formatTime(goods_data.from_time, 'MM月dd日hh:mm'),
            deposit_start_time: formatTime(goods_data.deposit_start_time, "yyyy-MM-dd"),
            deposit_end_time: formatTime(goods_data.deposit_end_time, "yyyy-MM-dd"),
          })
          this.initTimer();
          this.timer = setInterval(() => {
            this.initTimer();
          }, 1000)
        } else {
          this.setData({
            goods_data: goods_data,
            active_end_time: formatTime(goods_data.from_time, 'MM月dd日hh:mm'),
            deposit_start_time: formatTime(goods_data.deposit_start_time, "yyyy-MM-dd"),
            deposit_end_time: formatTime(goods_data.deposit_end_time, "yyyy-MM-dd"),
          })
        }
        
        wx.nextTick(() => {
          this.drawCanvasImage();
          const query = wx.createSelectorQuery()
          query.select('#detail').boundingClientRect(res => {
            this.detailTop = res && res.top && res.top > 43 ? res.top - 43 : 0 ;
          }).exec()
        })
      } else {
        wx.showToast({
          title: res.data,
          icon: 'none'
        });
      }
    })
  },
  
  checkTime (server_now_time) {
    // 本地系统时间与服务器时间相差超过60秒，终止
    let diff_time = Math.abs(Date.now() - server_now_time * 1000);
    let diff_time_error = diff_time > 60000;
    if (diff_time_error) {
      wx.showModal({
        title: '警告',
        content: `本地系统时间异常${diff_time}`,
        showCancel: false,
        complete: () => {
          wx.navigateBack()
        }
      })
      return true;
    }
    return false;
  },

  fetchVideoSrc(video_id) {
    if (!video_id) return;
    app.mall_api_get(`/api/video/getMezzanineInfo/cors/${video_id}`, {}, response => {
      let res = response.data;
      if (!res.transcode.length) return;
      let poster = res.transcode[0].videos.cover_url || '';
      let src = res.transcode[0].file_url || '';
      this.setData({
        banner_video: {
          poster,
          src: src.replace(/http\:/, 'https:')
        }
      })
    })
  },

  initTimer() {
    let { goods_data, bannerTimer} = this.data;
    let { from_time, to_time, deposit_start_time, deposit_end_time, is_prepay} = goods_data;
    let now = Date.now()
    let prepay_status = false
    let active_status = false
    if (is_prepay) {
      prepay_status = deposit_start_time < now && deposit_end_time > now;
    }

    if (!!from_time) {
      active_status = from_time > now;
      bannerTimer = from_time > now ? { type: 0, ...this.calcTime(from_time - now) } : { type: 1, ...this.calcTime(to_time - now) };
    }
    this.setData({
      prepay_status,
      active_status,
      bannerTimer
    })
    this.page_open_time += 1;
  },
  calcTime(time_stamp) {
    let t = time_stamp / 1000;
    let day = Math.floor(t / (24 * 3600));
    let hour = Math.floor((t - day * 24 * 60 * 60) / 3600);
    let minute = Math.floor((t - day * 24 * 60 * 60 - hour * 60 * 60) / 60);
    let second = Math.floor(t - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60);
    return { day, hour: hour > 9 ? hour : '0' + hour, minute: minute > 9 ? minute : '0' + minute, second: second > 9 ? second : '0' + second };
  },
  get_collocation_data() {
    let goods_id = this.data.goods_id;
    app.notokan_api_post('mobileapi.products.get_collocation', {
      goods_id: goods_id
    }, (res) => {
      if (res.rsp == "succ") {
        this.setData({
          collocation_data: res.data
        })
      }
    })
  },
  onTimeEnd() {
    console.log('3')
    if (this.data.isCrowd) {
      this.setData({
        crowdType : 3
      })
    }
    if (this.data.isSubscribe) {
      console.log('ggg')
      this.setData({
        sub_type: 5
      })
    }
    this.data.is_can_buy = false
  },
  selectSpec({currentTarget}) {
    if (this.data.isgroup) {
      this.getShow(currentTarget.dataset.type);
    };
    if (this.data.isSubscribe) {
      if (this.data.subScribe.straight_alone == 'true') {
        this.getShow(currentTarget.dataset.type);
      }else{
        wx.showToast({
          title: '该商品只能预约后抢购',
          icon: 'none',
          duration: 2000
        });
      }
    } else {
      this.getShow(currentTarget.dataset.type);
    }
  },
  joinCrowd() {
    if (!this.data.member_id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      this.setData({
        showLoginModal: true
      })
      return
    }
    switch (this.data.crowdType) {
      case 1:
        wx.showToast({
          title: '活动未开始',
          icon: 'none'
        });
        break;
      case 2:
        this.getShow(8);
        break;
      case 3:
        wx.showToast({
          title: '活动已结束',
          icon: 'none'
        });
        break;
    }
  },
  selectSubscr(){
    if (!this.data.member_id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      this.setData({
        showLoginModal: true
      })
      return
    }
    switch (this.data.sub_type) {
      case 1: wx.showToast({
        title: '预约未开始',
        icon: 'none',
        duration: 2000
      });
        break;
      case 2:
        wx.showLoading({
          title: '请求中',
        })
        app.notokan_api_post('mobileapi.book.appoint', {
          member_id: this.data.member_id,
          goods_id: this.data.goods_id
        }, res => {
          wx.hideLoading()
          if (res.rsp == 'succ') {
            wx.showToast({
              title: res.res,
              icon: 'success',
              duration: 2000
            })
            this.getGoodsSubscribe();
          } else {
            wx.showToast({
              title: res.res,
              icon: 'none',
              duration: 2000
            })
          }
        })
        break;
      case 3:
        if (this.data.subScribe.booked == 1) {
          wx.showToast({
            title: '请等待抢购开始后购买',
            icon: 'none',
            duration: 2000
          });
        } else {
          wx.showToast({
            title: '抱歉，您未参与预约，无法购买！',
            icon: 'none',
            duration: 2000
          });
        }
        break;
      case 4:
        if (!this.data.subScribe.booked) {
          wx.showToast({
            title: '抱歉，您未参与预约，无法购买！',
            icon: 'none',
            duration: 2000
          });
        } else if (this.data.subScribe.book_status != 'succ') {
          wx.showToast({
            title: '抱歉，您未获得抢购资格，无法购买！',
            icon: 'none',
            duration: 2000
          });
        } else {
          this.getShow(7);
        }
        break;
      case 5:
        wx.showToast({
          title: '活动已结束',
          icon: 'none',
          duration: 2000
        });
        break;
    }
  },
  getShow(type) {
    let vm = this
    let {goods_data, prepay_status, is_can_buy, active_status} = this.data;
    if (!goods_data.goods_id) return;
    if (type == 1 && this.data.isgroup) return; // 团购特殊处理
    if (type == 1 && this.data.isCrowd) return; // 众人团特殊处理
    if (type == 4 && !prepay_status) return;
    if (!is_can_buy) return;
    if (active_status) return;
    this.setData({ 
      goodsPopupType: type
    })
  },
  hidePopup() {
    this.setData({
      goodsPopupType: 0
    })
  },
  computeSpecItem({
    detail
  }) {
    this.setData({
      spec_item: detail
    })
  },
  downFile(url, type) {
    wx.downloadFile({
      url: url.replace(/^http:/, 'https:'),
      header: {},
      success: (res) => {
        if (type == 'goodsQcodeImage') {
          this.computeImagePosition(res.tempFilePath);
        } else if (type == 'goodsQcode') {
          goodsQcode = res.tempFilePath
          this.setData({
            qcode: goodsQcode
          })
        }
        this.drawCanvasImage();
      },
      fail: function(res) {
        // this.downFile(url, type);
      },
      complete: function(res) {},
    })
  },
  // 生成小程序码
  createWXACode() {
    let { goods_id, share_member_id} = this.data;
    let params = {
      page: 'packageGoods/goodsDetailView/index', //'packageGoods/goodsDetailView/index'
      width: 400,
      is_hyaline: true,
      scene: `gid=${goods_id}&mid=${share_member_id}`
    }
    app.post('/index.php/miniprogram/default/getWXACodeUnlimit', params, res => {
      if (res.msg == 'success') {
        let url = app.globalData.host + res.data.img_url;
        this.downFile(url, 'goodsQcode');
      }
    }, fail => {

    })
  },
  canvasIdErrorCallback: function(e) {

  },
  prevQcodeImg() {
    !drawCanvas && this.drawCanvasImage();
    this.setData({
      showQcodeModal: !this.data.showQcodeModal
    })
  },
  computeImagePosition (path) {
    wx.getImageInfo({
      src: path,
      success: (res) => {
        // 根据宽高比例缩放,计算图片大小和位置
        let {width, height} = res;
        pos = {
          width, height
        };
        if (width > height) {
          pos.distW = 280;
          pos.distH = 280 / width * height;
          pos.x = 0;
          pos.y = 140 - pos.distH / 2;
        } else {
          pos.distH = 280;
          pos.distW = 280 / height * width;
          pos.x = 140 - pos.distW / 2;
          pos.y = 0;
        }
        goodsQcodeImage = path;
        this.drawCanvasImage();
      },
      fail: () => {
        pos = null;
        goodsQcodeImage = path;
        this.drawCanvasImage();
      }
    })
  },
  drawCanvasImage() {
    let goods_data = this.data.goods_data;
    let goods_name = goods_data.name;
    if (!goodsQcodeImage || !goodsQcode || !goods_name) return;
    let ctx = wx.createCanvasContext('qcodeCanvas');
    ctx.save();
    ctx.setFillStyle('white');
    ctx.fillRect(0, 0, 300, 400);
    if (pos) {
      ctx.drawImage(goodsQcodeImage, 0, 0, pos.width, pos.height, pos.x + 10, pos.y + 10, pos.distW, pos.distH);
    } else {
      ctx.drawImage(goodsQcodeImage, 10, 10, 290, 290);
    }
    ctx.drawImage(goodsQcode, 240, 325, 50, 50);
    ctx.restore();
    let textWarpArr = textWrap(ctx, {
      font: "12px 'Microsoft Yahei, PingFang,sans-serif'",
      width: 280,
      text: goods_name,
      maxLine: 2,
    });
    ctx.setTextAlign('left');
    ctx.setFillStyle('#181818');
    textWarpArr.map((line, i) => {
      ctx.fillText(line, 11, 310 + i * 18, 280);
    })

    ctx.restore();
    ctx.font = "10px 'Microsoft Yahei, PingFang,sans-serif'";
    ctx.setTextAlign('center');
    ctx.setFillStyle('#888888');
    ctx.fillText(`${this.data.share_member_id || ''}`, 265, 386);

    ctx.restore();
    ctx.font = "lighter 12px 'Microsoft Yahei, PingFang,sans-serif'";
    ctx.setTextAlign('left');
    ctx.setFillStyle('#dd2543');
    ctx.fillText('￥', 11, 370);

    ctx.restore();
    ctx.font = "20px 'Microsoft Yahei, PingFang,sans-serif'";
    ctx.setTextAlign('left');
    ctx.setFillStyle('#dd2543');
    ctx.fillText(`${goods_data.price}`, 26, 370);


    ctx.restore();
    ctx.font = "lighter 10px 'Microsoft Yahei, PingFang,sans-serif'";
    ctx.setTextAlign('center');
    ctx.setFillStyle('#888888');
    let text = `(长按识别小程序)`; // · ${this.data.share_member_id}
    ctx.fillText(text, 150, 390); 
    ctx.draw();
    drawCanvas = true
  },
  save2Local: function () {
    wx.canvasToTempFilePath({
      //通过id 指定是哪个canvas
      canvasId: 'qcodeCanvas',
      success(res) {
        //成功之后保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (res) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
          },
          fail: function (err) {
            if (err.errMsg == 'saveImageToPhotosAlbum:fail auth deny') {
              wx.showToast({
                title: '请打开相册访问权限',
                icon: 'none'
              })
            }
          }
        })
      }
    })
  },
  prevImage ({currentTarget}) {
    let index = currentTarget.dataset.index;
    let banner_list = this.data.banner_list;
    wx.previewImage({
      urls: banner_list,
      current: banner_list[index],
      fail: () => {
        wx.showToast({
          title: '预览失败',
          icon: 'none'
        })
      }
    })
  },
  doFavBrand () {
    wx.showLoading({
      title: '正在请求',
      mask: true
    })
    app.notokan_api_post('mobileapi.member.memberFavBrand', {
      member_id: this.data.member_id,
      brand_id: this.data.goods_data.brand_id,
    }, res => {
      wx.hideLoading();
      wx.showToast({
        title: res.data || '操作失败',
        icon: 'none'
      })
    })
  },
      /**************** 商品预约 ******************/
  getGoodsSubscribe() {
    app.notokan_api_post('mobileapi.activity.all', {
      member_id: this.data.member_id,
      goods_id:this.data.goods_id
    }, res => {
      if (res.rsp == 'succ' && res.data && res.data.multi) {
        let { multi: crowdBuy } = res.data
        this.setData({
          crowdBuy: crowdBuy,
          crowdType: crowdBuy.type,
          scheme_price: crowdBuy.discount_price,
          isCrowd: true
        })
      } 
      if (res.rsp == 'succ'&&res.data&&res.data.appoint) {
        let { appoint: subScr } = res.data
        subScr.book_from_time_sub = formatTime(subScr.book_from_time * 1000, 'MM-dd hh:mm');
        subScr.sale_from_time_buy = formatTime(subScr.sale_from_time * 1000, 'MM-dd hh:mm');
          this.setData({ 
            subScribe: subScr,
            sub_type:subScr.type,
            scheme_price: subScr.scheme_price,
            isSubscribe: true
          }) 
        } 
    })
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
  swiperChange (e) {
    this.setData({
      active_banner_index: e.detail.current
    })
  },
  hitHistory() {
    if (!this.data.member_id) return;
    app.mall_api_post("/api/wap/history/cors",{
        goods_id: this.data.goods_id,
        member_id: this.data.member_id
      },
      response => {
        console.log("足迹上报",response)
      }
    );
  },
  getCartNum(){
    let self=this;
    if (!this.data.member_id)return ;
    app.notokan_api_post('mobileapi.products.get_member_cart_num',{
      member_id:this.data.member_id,
      wx_app_id:app.globalData.appid
    },res=>{
      if(res.rsp=='succ'){
        self.setData({
          cart_num: res.data.cart_num
        })
      }
    })
  },
  reportCont(val) {
    //上传内容数据
    let form = {};
    let { urlParams, member_id, optionsParams} = this.data;
    if (!urlParams.scene_id) return;
    Object.keys(urlParams).map(key => {
      if (key == 'scene_type' || key == 'scene_id'  || key == 'scene_relation') {
        form[key] = urlParams[key]
      }
    });
    //判断从猜你喜欢进入，取query参数
    if (!!optionsParams.query && !!optionsParams.query.appmsg_compact_url) {
      form['scene_url'] = optionsParams.query.appmsg_compact_url
    } else {
      form['scene_url'] = !!urlParams['scene_url'] ? urlParams['scene_url'] : 'packageGoods/goodsDetailView/index'
    }
    if (!!member_id) {
      form.member_id = member_id;
    }
    let scene_obj = wx.getStorageSync('scene_obj');
    if (!scene_obj) {
      form.browse_content_num = 1;
    } else if (!val && urlParams.scene_id != scene_obj.scene_id) {
      form.browse_content_num = 1;
    }
    wx.setStorageSync('scene_obj', form);
    if(!val){
      form.browse_goods_num = 1;
      form.goods_id = urlParams.goods_id;
    }
    switch (val) {
      case 'collect':
        //收藏
        form.collect_num = 1;
        break
      case 'add':
        //加入购物车
        form.add_cart_num = 1
        break
        case 'share':
        form.share_num=1
        break
    }
    app.reportContent(form);
  }
})