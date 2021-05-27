// components/releaseBtn/index.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true
  },
  properties: {
    brand_name:{
      type:String,
      value:""
    },
    title:{
      type:String,
      value:""
    },
    goodsData:{
      type:Object,
      value:[],
    },
    showPrice:{
      type:Boolean,
      value:false
    },
    content_id:{
      type:String,
      value:''
    },
    content_type:{
      type:Number,
      value:1 // 1是视频 2是文章 3是组合包
    },
    share_member_id:{
      type:String,
      value:''
    },
    author_id:{
      type:String,
      value:""
    },
    isSharePoint:{
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentIndex: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeSwiper({ currentTarget}){
      let type = currentTarget.dataset.type;
      let arrLength = this.properties.goodsData.length;
      let { currentIndex}=this.data;
      if(type=='last'){
        if (currentIndex>0){
          currentIndex--;
        }else{
          currentIndex=0;
        }
      }else if(type=='next'){
        if (arrLength > 4 && currentIndex < arrLength - 4){
          currentIndex++;
        }else{
          currentIndex = 0;
        }
      };
      this.setData({
        currentIndex
      })
    },
    swiperChangeHandle (e) {
      let { source, current} = e.detail;
      if (source == 'touch') {
        this.setData({
          currentIndex: current
        })
      }
    },
    jumpGoodsDetail({ currentTarget}){
      let {goodsid}=currentTarget.dataset;
      let url="";
      let obj = {
        goods_id: goodsid || '',
        member_id: this.data.share_member_id || this.data.buy_code || '',
        author_id: this.data.author_id || '',
        content_id: this.data.content_id,
        content_type: this.data.content_type,
        scene_id: this.data.content_type==1 ? 1905095557807 : 1905097724017,
        scene_type: this.data.content_type==1 ? 'discovery_video' : 'goods_page',
        scene_relation: 'oneself',
      }
      if (this.data.isSharePoint) {
        obj.type = this.data.content_type==1 ? 'video' : 'article'
      }

      for (var key in obj) url += '&' + key + '=' + obj[key];
      wx.navigateTo({
        url: '/packageGoods/goodsDetailView/index?' + url.slice(1),
      })
    }
  }
})
