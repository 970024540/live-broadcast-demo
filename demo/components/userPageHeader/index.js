const { globalData,mall_api_post }=getApp()
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true
  },
  properties: {
    width: {
      type: String,
      value: '123rpx'
    },
    colorText: {
      type: String, // light dark
      value: 'dark'
    },
    imgUrl:{
      type:Number,
      value:0 //0:达人  1：买家秀  2：生活
    },
    datas:{
      type:Object,
      value:{}
    },
    showBtn:{ //是否显示关注按钮
      type:Boolean,
      value:true
    },
    member_id:{
      type:String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    img_404: globalData.default_img
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickHandle() { //关注-取消关注
      if (!this.data.member_id) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
        wx.navigateTo({
          url: '/pages/loginByMsg/index'
        })
      } else {
        let params = {
          member_id: this.data.member_id,
          uuid: this.data.datas.uuid
        }
        wx.showLoading({
          title: '正在请求',
          mask: true
        })
        mall_api_post('/api/mobile/vstore/attention/cors', params, res => {
          wx.hideLoading()
          if (res.status == 'success') {
            let datas = this.data.datas;
            datas.isAttention = !datas.isAttention;
            this.setData({
              datas
            })
          }
          wx.showToast({
            title: res.message,
            icon: 'none'
          })
        }, error => {
        })
      }
    },
    imgClick(){
      let imgUrlObj =[
        "/packageCommunity/doyenPage/index", //达人，生活
        "/packageCommunity/buyerPage/index", //买家秀
        "/packageCommunity/lifePage/index",  //生活
        "/packageCommunity/doyenPage/index"  //达人，生活
      ]
      wx.navigateTo({
        url: imgUrlObj[this.data.imgUrl]+'?author_id='+this.data.datas.author_id
      })
    }
  }
})
