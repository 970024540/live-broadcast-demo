const { mall_api_post, burySharePoint }=getApp();
const app=getApp();
let shareConfig = Object.assign({}, app.shareConfig);
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    datas:{
      type:Object,
      value:{}
    },
    member_id:{
      type:String,
      value:''
    },
    goodsIds:{
      type:Array,
      value:[]
    },
    showTitle: {
      type: Boolean,
      value: true,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    binLove() {
      let member_id = this.isLogin();
      if (!member_id) return;
      let val={
        member_id: member_id,
        article_id: this.data.datas.article_id,
        video_id: this.data.datas.video_id,
      }
      wx.showLoading({
        title:'请求中'
      })
      mall_api_post('/api/mobile/vstore/liked/cors', val ,res=>{
        wx.hideLoading()
        if(res.status=="success"){
          wx.showToast({title: res.message})
          let datas = Object.assign({}, this.data.datas );
          if (datas.isLiked){
            datas.liked= datas.liked-1
            datas.isLiked=false
          }else{
            datas.liked = parseInt(datas.liked) + 1
            datas.isLiked = true
          }
          this.setData({
            datas: datas
          })
        }else{
          wx.showToast({ title: res.message, icon: 'none' })
        }
      })
    },
    binComments() {
      this.triggerEvent('binComments') 
    },
    forward() {//转发 
      let member_id = this.isLogin();
      if (!member_id) return;
      let item = this.data.datas;
      let params = {
        article_id: item.article_id,
        video_id: item.video_id,
        member_id: member_id,
        author_id: item.author_id,
        platform: 'webchat',
        type: 2
      };
      if (item.video_id) {
        params.parent_video_id = item.parent_id
      } else {
        params.parent_article_id = item.parent_id
      }
      wx.showLoading({
        title: '请求中'
      })
      mall_api_post('/api/mobile/vstore/share/cors', params, res => {
        wx.hideLoading();
        if(res.status=="success"){
          wx.showToast({ title: res.message })
        }else{
          wx.showToast({ title: res.message, icon: 'none' })
        }
      })
      //上报商品分享
      if (this.data.goodsIds.length>0) {
        burySharePoint({
          goods_id: this.data.goodsIds, //当前页商品ID
          share_num: 1,
          share_source: "goods_detail"
        })
      }
    },
    isLogin() {
      if (!this.data.member_id) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
        wx.navigateTo({
          url: '/pages/loginByMsg/index'
        })
        return 0;
      } else {
        return this.data.member_id;
      }
    },
  }
})
