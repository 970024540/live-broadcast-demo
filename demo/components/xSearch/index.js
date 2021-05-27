// components/xSearch/index.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true
  },
  timer: null,
  properties: {
    showHistorySearchList:{
      type:Boolean,
      value:true
    },
    showHotSearchList:{
      type: Boolean,
      value: true
    },
    searchHistoryLimit: {
      type: Number,
      default: 20
    },
    showImgSearch: {
      type: Boolean,
      value: true
    },
    tigger: {
      type: Boolean,
      value: false
    },
    initValue: {
      type: String,
      value: '',
    },
    showResult: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    searchSuggestList: [],
    searchHistory: [],
    hotSearchList: [],
    loading:false
  },
  lifetimes: {
    attached: function () {
      this.getHotSearchList();
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    clickSearch(){
      wx.nextTick(() => {
        this.selectComponent('#searchBar').inputFocus();
      })
    },
    inputCancel(){
      this.triggerEvent('cancelBox');
    },
    refreshHotList () {
      this.getHotSearchList(true);
    },
    getHotSearchList(refresh = false) {
      let session_hot_list = wx.getStorageSync('hot_search_list');
      if (!refresh && session_hot_list) {
        this.setData({
          hotSearchList: session_hot_list
        })
      } else {
        app.mall_api_get('/api/hotSearch/setting/cors', {}, res => {
          if (res.status == 'success') {
            let data = res.data;
            let hotSearchList = [];
            data.map(item => {
              if (item.enable == 1) hotSearchList.push(item);
            })
            this.setData({
              hotSearchList
            })
            wx.setStorageSync('hot_search_list', hotSearchList);
          }
        })
      }
    },
    inputFocus() {
      let self =this;
      if (!!wx.getStorageSync('search_history')){
        let arr = JSON.parse(wx.getStorageSync('search_history'));
        this.setData({
          searchHistory: arr.slice(0, 19)
        })
      }
    },
    cancel(){
      this.setData({
        searchSuggestList: []
      })
    },
    getSearchRecord(detail,type) { // 异业拉新赠送礼品活动
      let val = type == 'submit' ? detail.value:detail;
      let self=this;
      if (val === '招行') { 
        let userInfo = wx.getStorageSync('user_info');
        let parmas = {
          keyword: val,
          member_id: userInfo ? userInfo.member_id : ''
        }
        app.notokan_api_post('mobileapi.giftExchangeCode.addWantGiftSearchRecord', parmas, res => {
          if (res.rsp == 'succ') {
            wx.navigateTo({
              url: '/packageActive/scarvesView/index'
            })
          } else {
            if (type=='submit'&& self.data.tigger ) {
              self.triggerEvent('submit', detail)
            } else {
              wx.navigateTo({
                url: `/packageGoods/goodsListView/index?q=${encodeURIComponent(val || '')}&come_from=search`,
                success: function (res) {
                  if (res.errMsg == "navigateTo:ok") {
                    self.cancel();
                  }
                }
              })
            }
          }
        })
        return false;
      }else{
        return true;
      }
    },
    submit({detail}) {
      let self = this;
      this.selectComponent('#searchBar').hiddeResult();
      this.setSearchHistory(detail.value);

      if (!this.getSearchRecord(detail,'submit')) return ; // 异业拉新赠送礼品活动

      let giftData = wx.getStorageSync('giftData') || {};
      if (giftData.status != 1 && giftData.status != 4 && detail.value === giftData.keyword){
        wx.setStorageSync('showGiftStor', true);
        wx.setStorageSync('gift_enum', '0');
      }
      if (this.data.tigger) {
        this.triggerEvent('submit', detail)
      } else {
        wx.navigateTo({
          url: `/packageGoods/goodsListView/index?q=${encodeURIComponent(detail.value||'')}&come_from=search`,
          success: function (res) {
            if (res.errMsg == "navigateTo:ok") {
              self.cancel();
            }
          }
        })
      }
    },
    imageSearch() {
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: res => {
          let file = res.tempFiles[0]
          if (file.size > 1024 * 1024 * 10) return wx.showToast({
            title: '图片超出大小限制',
            icon: 'none'
          })
          let img = wx.getFileSystemManager().readFileSync(file.path, 'base64');
          let member_id = wx.getStorageSync('user_info').member_id;
          let params = {
            image: img,
            params_type: 'imageBase64',
            member_id: member_id,
            page: 1,
            limit: 30
          }
          // 选择照片后IOS不显示loading，暂时的解决办法, 目前7.0.7和7.0.8的有这个问题
          setTimeout(() => {
            wx.showLoading({
              title: '正在请求',
            })
            app.mall_api_post('/api/imageSearch/searchGoodsImage', params, res => {
              wx.hideLoading()
              if (res.data.bn_arr.length) {
                let bn_arr = res.data.bn_arr.join(' ')
                // wx.navigateTo({
                //   url: `/packageGoods/goodsListView/index?fq=bn: (${ bn_arr })`
                // })
              let options = {
                  q: '',
                  offset: 0,
                  limit: 30,
                  fq: `bn:(${bn_arr})`,
                  imgSearch: 1
                };
                app.mall_api_post('/api/mobile/Goods/getGoodsList/cors',options, res => {
                  if (res.status == 'OK') {
                    var _data = res.data;
                    if (_data.length > 0) {
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
                  }
                });
              } else {
                wx.showToast({
                  title: '没有找到相关数据',
                  icon: 'none'
                })
              }
            })
          }, 500)
        },
        fail: res => {

        }
      })
    },
    bindKeyInput(e){
      if (this.data.tigger) return;
      let value=e.detail.value;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        this.getSearchSuggest(value);
      }, 800);
    },
    getSearchSuggest(value) {
      //请求搜索建议
      if(!value) {
        this.setData({
          searchSuggestList: []
        })
        return;
      }
      this.setData({
        loading: true
      })
      app.mall_api_get("/api/mobile/Goods/suggest/cors",{q: value},res => {
          this.setData({
            loading:false
          })
          if (res.status == "success") {
            this.setData({
              searchSuggestList:res.data
            })
          }
        }
      );
    },
    setSearchHistory(value){
      if (!value || value.replace(/\r\n/, '') == '') return;
      let { searchHistory} = this.data;
      searchHistory.unshift(value);
      this.setData({
        searchHistory
      })
      searchHistory = [...new Set(searchHistory)];
      this.setData({
        searchHistory
      })
      wx.setStorageSync("search_history", JSON.stringify(searchHistory))
    },
    searchByChoose(e) {
      let self=this;
      let item = e.currentTarget.dataset.item;
      this.selectComponent('#searchBar').hiddeResult();
      this.setSearchHistory(item);

      if (!this.getSearchRecord(item, 'serachBtn')) return; // 异业拉新赠送礼品活动

      let giftData = wx.getStorageSync('giftData') || {};
      if (giftData.status != 1 && giftData.status != 4 && item=== giftData.keyword) {
        wx.setStorageSync('showGiftStor', true);
        wx.setStorageSync('gift_enum', '0');
      }
      wx.navigateTo({
        url: `/packageGoods/goodsListView/index?q=${encodeURIComponent(item||'')}&come_from=search`,
        success:function(res){
          if (res.errMsg =="navigateTo:ok"){
            self.cancel();
          }
        }
      })
    },
    clearSearchHistory(){
      let self=this;
      wx.removeStorage({
        key: 'search_history',
        success(res) {
          self.setData({
            searchHistory:[]
          })
        }
      })
    }
  }
})
