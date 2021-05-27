const { globalData, mall_api_post,mall_api_get }=getApp()
import { ossUrlTest } from '../../utils/index.js';
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true
  },
  properties: {
    member_id: { //会员id
      type: String,
      value: ''
    },
    article_id:{ //文章
      type:String,
      value:''
    },
    video_id:{  //视频Id
      type:String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    host: globalData.host,
    default_img: globalData.default_img,
    offset:0,
    comment_total: '',//评论总数
    commentData:[],//评论列表
    isBtn: true,//是否显示加载更多按钮
    inputShow: false,
    focus: false, //input聚焦
    inputValue: '',
    placeholderInput:'挥一挥衣袖，在评论区留下你的倩影...',
    replyObj:{}, //点击回复的当前对象
    replyIndex:'1', //回复级数 '1'==第一级  '2'==第二级
    parentId:0 //父级id，第二级回复需要
  },

  ready (){
    this.commentsList();
  },
  methods: {
    isLogin(){
      if (!this.data.member_id) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        })
        wx.navigateTo({
          url: '/pages/loginByMsg/index',
        })
        return 0;
      }else{
        return this.data.member_id;
      }
    },
    commentsList() { //请求列表
      let val = {
        article_id: this.data.article_id,
        video_id: this.data.video_id,
        member_id: this.data.member_id,
        offset: this.data.offset,
        limit: 4
      }
      wx.showLoading({
        title: '请求中'
      })
      mall_api_post('/api/mobile/vstore/getCommentsById', val, res => {
        wx.hideLoading()
        if (res.status == "success") {
          res.data.comments.forEach(item=>{
            item.reply_comment.forEach(val=>{
              if (val.members){
                val.members.nickname = val.members.nickname ? val.members.nickname : '影儿会员'
              }
            })
          })
          this.triggerEvent('updateCommentCount', res.data.comment_total)
          this.setData({
            comment_total: res.data.comment_total,
            commentData: [...this.data.commentData, ...res.data.comments],
            isBtn: res.data.comments.length == 4 ? true : false
          })
        }
      })
    },
    addcommentsClick() { //添加评论
      let member_id=this.isLogin();
      if (!member_id) return;
      this.setData({
        placeholderInput: '挥一挥衣袖，在评论区留下你的倩影...',
        inputShow: true,
        focus: true
      })
    },
    bindblur(e) { //关闭评论input
      this.setData({
        height: 0,
        inputShow: false
      });
    },
    inpClick(){
      this.setData({
        inputShow: true
      });
    },
    bindInput(e) {
      this.setData({
        inputValue: e.detail.value
      })
    },
    sendClick() { //发送评论
      if (!this.data.inputValue){
        wx.showToast({ title: '请输入内容', icon: 'none' })
        return ;
      }
      let data={
        body: this.data.inputValue,
        article_id: this.data.article_id,
        member_id: this.data.member_id,
        video_id: this.data.video_id,
      }
      if (this.data.replyObj.comment_id) {//一级二级评论
        let { parent_id, members, comment_id} = this.data.replyObj;
        data.parent_id = this.data.replyIndex == '1' ? comment_id : this.data.parentId;
        data.is_record_reply_member_id = parent_id==0?false:true;
        data.uuid = members?members.uuid:'';
      }
      wx.showLoading({
        title: '请求中'
      })
      mall_api_post('/api/mobile/vstore/comment/cors',data,res=>{
        wx.hideLoading()
        wx.showToast({ title: res.message })
        if(res.status=="success"){
          this.setData({
            replyObj:{},
            offset:0,
            commentData:[],
            inputShow: false,
            inputValue:''
          })
          this.commentsList();
        }else{
          wx.showToast({ title: res.message, icon: 'none' })
        }
      })
    },
    clickReply( {target} ){ //一级二级回复
      let member_id = this.isLogin();
      if (!member_id) return;
      let { dataset } = target;
      this.setData({
        placeholderInput: `回复${dataset.item.members?dataset.item.members.nickname:'影儿会员'}`,
        replyObj: dataset.item,
        replyIndex: dataset.reply,
        parentId: dataset.parentid||0,
        inputShow: true,
        focus: true
      })
    },
    deleteComments( {target} ){ //删除评论
      let { item, reply, key } = target.dataset;
      wx.showLoading({
        title: '删除中'
      })
      mall_api_get(`/api/mobile/vstore/deleteComment/cors/${item.comment_id}`, {}, res => {
        wx.hideLoading()
        if (res.status == "success") {
          let data = JSON.parse(JSON.stringify(this.data.commentData));
          if (reply == '1'){ //一级评论删除
            data.splice(key,1)
          }else{ //二级评论删除
            data.forEach(val=>{
              if (item.parent_id == val.comment_id){
                val.reply_comment.splice(key,1)
              }
            })
          }
          this.setData({
            commentData: data,
            comment_total: parseInt(this.data.comment_total)-1
          })
          wx.showToast({ title: res.message })
          this.triggerEvent('updateCommentCount', this.data.comment_total)
        } else {
          wx.showToast({ title: res.message, icon: 'none' })
        }
      })
    },
    moreComments(){ //查看更多
      this.setData({
        offset: this.data.offset+4
      })
      this.commentsList();
    },
    getCommentLiked({target}){ //点赞
      let member_id = this.isLogin();
      if (!member_id) return;
      let {item,reply,key} = target.dataset;
      let data={
        comment_id: item.comment_id,
        member_id:member_id
      }
      wx.showLoading({
        title: '请求中'
      })
      mall_api_post('/api/mobile/vstore/liked/cors', data, res => {
        wx.hideLoading()
        if (res.status == "success") {
          let data = JSON.parse(JSON.stringify(this.data.commentData));
          if (reply == '1'){
            data[key]=this.forReply(data[key]);
          }else{
            data.forEach(val => {
              if (item.parent_id == val.comment_id) {
                val.reply_comment[key]=this.forReply(val.reply_comment[key])
              }
            })
          }
          this.setData({
            commentData: data
          })
          wx.showToast({ title: res.message })
        }else{
          wx.showToast({ title: res.message ,icon:'none'})
        }
      })
    },
    forReply(item){
        if (item.isLiked) {
          item.liked = item.liked - 1
          item.isLiked = false
        } else {
          item.liked = parseInt(item.liked) + 1
          item.isLiked = true
        }
      return item;
    },
    //监听input获得焦点
    bindfocus: function(e) {
      // let that = this;
      // let height = 0;
      // let height_02 = 0;
      // wx.getSystemInfo({
      //   success: function(res) {
      //     height_02 = res.windowHeight;
      //   }
      // })
      // height = e.detail.height - (app.globalData.height_01 - height_02);
      // console.log('app is', app.globalData.height_01);
      this.setData({
        height: e.detail.height,
      })
    },
  }
})