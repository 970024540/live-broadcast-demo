let {
  globalData,
  mall_api_post,
  notokan_api_post,
  reportUserAction
} = getApp();
let ossUrlTest = require('../../utils/index.js').ossUrlTest;
const Base64 = require('../../miniprogram_npm/js-base64/index').Base64;
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    goodsData: {
      type: Object,
      value: {},
      obsever: function(v) {
        this.setData({
          is_fav: v.is_fav,
          fav_count: v.fav_count,
        })
      }
    },
    listStyle: {
      type: Number,
      value: 2
    },
    Index: {
      type: Number,
      value: 0
    },
    sourceId: {
      type: String,
      value: '浏览'
    },
    //内容场景ID--默认微信推荐ID
    scene_id: {
      type: String,
      value: ''
    },
    sourceId: {
      type: String,
      value: '浏览'
    },
    trigger: {
      type: Boolean,
      value: false
    },
    //传父组件URL参数 - 商品列表-猜你喜欢
    params: {
      type: Object,
    },
    //获取微信打开场景ID和URL
    optionsParams: {
      type: Object,
    },
    traceId: {
      type: String,
      value: ''
    },
    showResembleDot: {
      type: Boolean,
      value: true
    }
  },

  data: {
    host: globalData.image_host + '/',
    showResemble: false,
    is_fav: false,
    fav_count: 0,
  },
  methods: {
    jumpGoodsDetail(e) {
      let {
        trigger,
        goodsData,
        Index,
        sourceId,
        scene_id,
        traceId,
        params,
        optionsParams
      } = this.properties;
      if (trigger) {
        let obj = {
          item: goodsData,
          index: Index
        }
        return this.triggerEvent('itemClick', obj);
      }
      let self = this;
      let goodsid = goodsData.goods_id;

      let url = `/packageGoods/goodsDetailView/index?goods_id=${goodsid}&soid=${sourceId}`;
      if (!!traceId) {
        url = url + `&trid=${Base64.encode(traceId)}`;
      }
      //内容上报
        if (!!params && !!params.scene_id) {
          //如果是链接进入，使用链接上的scene_id
          let str = "";
          let str2 = ""
          Object.keys(params).map(key => {
            if (key == 'scene_type' || key == 'scene_id') {
              let s = `&${key}=${params[key]}`;
              str += s;
            }
          });
          if (!!optionsParams.query && !!optionsParams.query.appmsg_compact_url) {
            str2 = '&scene_url=' + optionsParams.query.appmsg_compact_url
          } else {
            str2 = '&scene_url=' + !!params['scene_url'] ? params['scene_url'] : optionsParams.path
          }
          url = url + str + str2 + '&scene_relation=goods_detail_recommend'
        } else {
        //否则用推荐位scene_id
          url = url + `&scene_id=${scene_id}&scene_type=ec_recommend&scene_relation=oneself`
        }
      url = url.replace(/undefined/g, '');
      wx.navigateTo({
        url
      })
    },
    handleOpenAnalogy(e) {
      this.setData({
        showResemble: !this.data.showResemble
      })
    },
    addFav(e) {
      let self = this;
      let {
        is_fav,
        fav_count,
        goodsData
      } = this.data;
      let member_id = wx.getStorageSync('user_info').member_id;
      if (!member_id) return wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      let params = {
        member_id,
        gid: goodsData.goods_id
      };
      let url = is_fav ? 'mobileapi.member.del_fav' : 'mobileapi.member.add_fav';
      wx.showLoading({
        title: '正在请求',
        mask: true
      });
      notokan_api_post(url, params, res => {
        wx.hideLoading();
        if (res.rsp == 'succ') {
          this.setData({
            is_fav: !is_fav,
            fav_count: is_fav ? fav_count - 1 : fav_count + 1,
          })
          wx.showToast({
            title: res.data
          })
        }
      })
    },
    selectResembleGoods(e) {
      let vm = this;
      let {
        image_default,
        cat_id
      } = e.currentTarget.dataset.item;
      let {
        index
      } = e.currentTarget.dataset;
      let url = ossUrlTest(image_default[0]);
      let member_id = wx.getStorageSync('user_info').member_id;
      let params = {
        image: url,
        params_type: 'imageUrl',
        member_id: member_id,
        tags: cat_id
      };
      wx.showLoading({
        title: '正在请求',
        mask: true,
      })
      mall_api_post('/api/imageSearch/searchGoodsImage', params, res => {
        if (res.status == 'success' && res.data.bn_arr.length) {
          let bn_arr = res.data.bn_arr.join(' ')
          let params = {
            q: '',
            offset: 0,
            limit: 30,
            fq: `bn:(${bn_arr})`
          }
          mall_api_post('/api/mobile/Goods/getGoodsList/cors', params, res => {
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
            vm.triggerEvent('handleMaskStatus', {
              type: false,
              index,
            })
            wx.hideLoading()
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

  }
})