// packageActive/livePlayBack/index.js
const app = getApp();
let shareConfig = Object.assign({}, app.shareConfig);
let videoContext = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 20,
    menuButtonWidth: 90,
    menuButtonHeight: 30,
    menuButtonBottom: 45,

    room_id: '',
    name: '影儿商城', // 直播名称
    poster: 'http://mall.yingerfashion.com/yinger-m/img/logo_dog.png',
    duration: 0,
    currentSrc: '',
    showGoodsTimeLine: true,
    showGoodsList: false,
    goodsSeekIndex: -1,
    goods: [],

    viewCount: 9856,
    upvoteCount: '',
    commentCount: '',

    member_id: '',
    share_member_id: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    videoContext = null;
    let member_id = '';
    wx.setNavigationBarTitle({
      title: app.globalData.shopName
    })
    let user_info = wx.getStorageSync('user_info');
    let { room_id, mid = ''} = options;
    if (room_id) {
      this.setData({
        share_member_id: mid,
        member_id: user_info.member_id || '',
        room_id,
      })
      this.getVideoPlayBack(room_id);
    } else {
      wx.showToast({
        title: '路径错误',
        icon: 'none',
        complete () {
          wx.navigateBack();
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const systemInfo = wx.getSystemInfoSync();
    const rect = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
      menuButtonWidth: rect.width,
      menuButtonHeight: rect.height,
      menuButtonBottom: rect.bottom,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
    shareConfig.title = this.data.name || shareConfig.title;
    shareConfig.title = shareConfig.title + '-' +  this.data.member_id;
    shareConfig.path = `/packageActive/livePlayBack/index?room_id=${this.data.room_id}&mid=${this.data.member_id}`;
    shareConfig.imageUrl = this.data.poster || shareConfig.imageUrl;
    return shareConfig;
  },
  goBack () {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index',
        })
      }
    })
  },
  getVideoPlayBack(room_id) {
    wx.showLoading({
      title: '正在请求',
      mask: true,
    })
    app.mall_api_post('/api/mobile/WeiXin/livePlayback', { room_id,app_id:app.globalData.appid}, res => {
      wx.hideLoading();
      if (res.status == 'success') {
        let {goods = [], cover_img, name, replays = []} = res.data;
        if (replays.length == 0) {
          this.setData({
            goods,
            poster: cover_img,
            name,
          })
          wx.showToast({
            title: '回放视频生成中, 请稍后观看',
            icon: 'none'
          })
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
          return;
        }
        let m3u8 = replays.find(v => v.media_url.indexOf('.m3u8') > -1);
        this.setData({
          currentSrc: m3u8 ? m3u8.media_url : replays[0].media_url,
          goods,
          poster: cover_img,
          name,
        })
        // this.randomCount();
      }
    })
  },
  randomCount () {
    // 生成观看人数, 点赞人数, 评论人数, 取最大的商品的id
    let {goods} = this.data;
    let item = [...goods].sort((a, b) => b.goods_id - a.goods_id)[0];
    // console.log(item)
    let id = item.goods_id || '172326';
    id = (id + '').slice(0, 6);
    let upvoteCount = `${parseInt(id / 1000)/10}万`;
    let commentCount = parseInt(id % 10000) > 2000 ? parseInt(id % 10000) - 888 : parseInt(id % 10000) + 1888;
    this.setData({
      upvoteCount,
      commentCount,
    })
  },
  loadedmetadata ({detail}) {
    let {duration, width, height} = detail;
    this.setData({
      duration,
    })
    videoContext = wx.createVideoContext('video', this);
  },
  ended () {},
  videoClick () {
    this.setData({
      showGoodsTimeLine: !this.data.showGoodsTimeLine,
      showGoodsList: false,
      goodsSeekIndex: -1,
    })
  },
  showGoodsListHandle () {
    this.setData({
      showGoodsList: true,
      showGoodsTimeLine: false,
      goodsSeekIndex: -1,
    })
  },
  hideGoodsListHandle () {
    this.setData({
      showGoodsList: false,
      showGoodsTimeLine: false,
      goodsSeekIndex: -1,
    })
  },
  showToast () {
    wx.showToast({
      title: '直播已结束',
      icon: 'none',
    })
  },
  goodsTimelineClick ({currentTarget}) {
    let {index} = currentTarget.dataset;
    let { start_time } = this.data.goods[index];
    
    this.setData({
      goodsSeekIndex: index
    })
    // 跳转
    if (start_time > 0 && start_time < this.data.duration) {
      videoContext.seek(start_time);
    }
  },
  goodsClick ({currentTarget}) {
    let { index } = currentTarget.dataset;
    let {url} = this.data.goods[index];
    let mid = this.data.share_member_id || '';
    url = url.indexOf('?') > 0 ? `/${url}&custom_params=${mid}` : `/${url}?custom_params=${mid}`
    wx.navigateTo({
      url: url,
    })
  },
  doNothing () {},
})