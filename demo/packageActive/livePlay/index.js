// packageActive/livePlay/index.js
const app = getApp();
const joinParams = require('../../utils/index.js').joinParams;
const { formatTime } = require('../../utils/index.js');
// let livePlayer = requirePlugin('live-player-plugin');
let shareConfig = Object.assign({}, app.shareConfig);
import { getCurrentPageUrlWithArgs } from '../../utils/index.js';
let timer = null;
let roomForRefresh = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomList: [],
    loadedAll: false,
    liveStatusCode: {
      101: '直播中',
      102: '未开始',
      103: '已结束',
      104: '禁播',
      105: '暂停中',
      106: '异常',
      107: '已过期',
    },
    params: {},
    showLoginModal: false,
    share_member_id: '',
    member_id: '',
    willPlay: null,
    willPlayList: [],
    backPlayList: [],
    currentBannerIndex: 0,
    swiperHeight: 728
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let member_id = '';
    let user_info = wx.getStorageSync('user_info');
    this.data.params = options;
    this.getRoomList(true);
    this.reportCont();
    let { room_id, scene_id, mid = '' } = options;
    if (scene_id) wx.setStorageSync('scene_obj', options);
    if (!user_info.member_id) {
      this.setData({
        showLoginModal: true,
      })
    } else {
      member_id = user_info.member_id;
    }
    this.setData({
      share_member_id: mid,
      member_id,
    })
    wx.setNavigationBarTitle({
      title: app.globalData.shopName
    })
    if (false && room_id) {
      // 延时2秒钟等待上报完成,异步状态,2秒也不可靠
      wx.showLoading({
        title: '正在加载',
        mask: true,
      })
      // 获取直播间状态
      livePlayer.getLiveStatus({ room_id: room_id }).then(res => {
        // 已结束, 跳回放页面
        if (res.liveStatus == 103) {
          setTimeout(() => {
            wx.hideLoading();
            wx.navigateTo({
              url: `/packageActive/livePlayBack/index?room_id=${room_id}&mid=${mid}`,
            })
          }, 2000)
        } else if (res.liveStatus < 103 || res.liveStatus == 105) {
          setTimeout(() => {
            wx.hideLoading();
            this.toLiveRoom(room_id);
          }, 2000)
        }
      })
    }
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

  },
  loginOK() {
    let user_info = wx.getStorageSync('user_info');
    this.setData({
      showLoginModal: false,
      member_id: user_info.member_id,
    })
    // let { room_id = '' } = this.data.params;
    // if (room_id) this.toLiveRoom(room_id);
  },
  itemClick({ currentTarget }) {
    let { roomid, status } = currentTarget.dataset;
    if (status == 103) {
      wx.navigateTo({
        url: `/pages/livePlayBack/index?room_id=${roomid}&mid=${this.data.share_member_id}`,
      })
    } else {
      this.toLiveRoom(roomid);
    }
  },
  dd() { },
  toLiveRoom(roomid) {
    let { share_member_id, member_id } = this.data;
    app.globalData.roomid=roomid;
    wx.navigateTo({
      /**
       * 优先取分享人的ID, 进入直播后购买商品和再次分享带的都是分享人ID
       * 其次取自己的ID, 进入直播后购买商品的buy_code不会记录到, 再次分享记录的是自己的ID
       */
      url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?custom_params=${share_member_id || member_id}&room_id=${roomid}`,
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.loadedAll) this.getRoomList();
  },
  bannerChange: function (e) {
    let current = e.detail.current;
    this.setData({
      currentBannerIndex: current
    });
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    let { from, target } = options;
    let { member_id, share_member_id, roomList } = this.data;
    if (from == 'button') {
      let { index } = target.dataset;
      let item = roomList[index];
      let liveStatus = item.live_status == 101 ? '正在直播: ' : item.live_status == 102 ? '即将直播: ' : '';
      shareConfig.title = `${liveStatus}${item.name}${member_id || share_member_id}`;
      /**
       * 优先取自己的ID, 没有登录则取分享人的ID, 否则为空
       */
      shareConfig.path = `/packageActive/livePlay/index?room_id=${item.roomid}&mid=${member_id || share_member_id}`;
      shareConfig.imageUrl = item.cover_img;
    } else {
      shareConfig.title = `影儿商城-${member_id || share_member_id}`;
      shareConfig.path = `/packageActive/livePlay/index?mid=${member_id || share_member_id}`;
      shareConfig.imageUrl = '';
    }
    return shareConfig;
  },
  getRoomList(reset = false) {
    let { roomList, loadedAll } = this.data;
    if (this.data.loading || loadedAll) return;
    this.data.loading = true;
    wx.showLoading({
      title: '正在加载',
      mask: true,
    })
    app.mall_api_post('/api/mobile/WeiXin/liveList', { 
      start: reset ? 0 : roomList.length || 0,
      limit: 10,
      app_id:app.globalData.appid
    }, res => {
      this.data.loading = false;
      wx.hideLoading();
      if (res.status == 'success') {
        let data = res.data || [];
        data.map(item => {
          item.end_time_str = formatTime(item.end_time * 1000, 'yyyy/MM/dd');
          roomList.push(item);
        });
        this.formatPlayList(roomList);
        loadedAll = data.length < 10;
        this.data.roomList = roomList;
        this.setData({
          loadedAll, 
        })
      }
    })
  },
  formatPlayList(list) {
    let { } = this.data;
    let willPlay = null;
    let willPlayList = [];
    let backPlayList = [];
    list.map(item => {
      if (item.live_status < 103 || item.live_status == 105) {
        willPlayList.push(item);
      } else if (item.live_status == 103) {
        backPlayList.push(item);
      }
    })
    if (willPlayList.length) {
      willPlay = willPlayList.pop();
    }
    this.setData({
      willPlay,
      willPlayList: willPlayList.reverse(),
      backPlayList,
    })
  },
  goodsClick({ currentTarget }) {
    let { index } = currentTarget.dataset;
    let { url } = this.data.willPlay.goods[index];
    let mid = this.data.share_member_id || '';
    url = url.indexOf('?') > 0 ? `/${url}&custom_params=${mid}` : `/${url}?custom_params=${mid}`
    wx.navigateTo({
      url: url,
    })
  },

  reportCont(val, member_id) {
    //场景上报多种情况
    let form = {};
    let _params = this.data.params.scene_id ? this.data.params : '';
    if (!!_params && !_params.scene_id) return;
    Object.keys(_params).map(key => {
      if (key == 'scene_type' || key == 'scene_id' || key == 'scene_relation') {
        form[key] = _params[key];
        form['scene_url'] = getCurrentPageUrlWithArgs()
      }
    });
    form.browse_content_num = 1;
    if (form['scene_id']) app.reportContent(form);
  }
})