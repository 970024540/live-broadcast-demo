Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    datas: {
      type: Object,
      observer: 'initModal'
    },
    pageId: {
      type: String,
      value: ''
    }
  },
  timer: null,
  data:{
    showNewGuyModal: false,
    showModal: false,
    duration: 5,
  },
  created () {
    
  },
  methods: {
    initModal() {
      let { showModal = false, pageId, datas} = this.data;
      if (!pageId || !datas) return;
      let { modal, new_guy={} } = datas;
      let user_info = wx.getStorageSync('user_info');
      let memberId = !!user_info && user_info.member_id ? user_info.member_id : '';
      //未登录以及新人弹框为true时显示新人弹框内容，否则显示普通弹框
      let { time_range, duration = 5000, delay, active } = (!memberId && !!new_guy.active) ? new_guy : modal;
      
      // 上次显示modal的时间
      let lastShowModalTime = wx.getStorageSync(`lastShowModalTime_${pageId}`) || 0;
      // modal显示的间隔时间 3 小时
      let showModalGap = 3 * 3600 * 1000;
      let in_range = true;
      //没有时间范围不显示
      if (!time_range || time_range.length < 1) in_range = false; 
      let start_time = new Date(time_range[0]).getTime();
      let end_time = new Date(time_range[1]).getTime();
      let _now = Date.now();
      // 已经显示还不到3小时 或 未开始 或 已结束时不显示
      if (_now < start_time || _now > end_time || lastShowModalTime + showModalGap > _now) in_range = false;
      if (in_range) {
        if (!memberId && !!new_guy.active){
          this.setData({
            showNewGuyModal: true,
            duration
          })
        }else{
          this.setData({
            showModal: active,
            duration
          })
        }
        wx.setStorageSync(`lastShowModalTime_${pageId}`, _now);  
        this.init_timer(duration);
      }
    },
    init_timer(duration) {
      this.timer = setInterval(() => {
        if (duration > 1) {
          duration -= 1;
          this.setData({
            duration
          })
        } else {
          this.closeModal();
          clearInterval(this.timer)
          this.timer = null;
        }
      }, 1000);
    },
    jumpClick({ currentTarget }) {
      let { url, isbtnlogin } = currentTarget.dataset;
      if (isbtnlogin) return; //按钮登录为true时点击图片不跳转
      wx.navigateTo({
        url,
        fail: () => {
          wx.switchTab({
            url,
          })
        }
      })
    },
    closeModal() {
      this.setData({
        showModal:false,
        showNewGuyModal: false
      })
    }
  }
})