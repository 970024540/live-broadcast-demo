const app = getApp()
const { globalData}=getApp();
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    datas: {
      type: Object
    }
  },
  data: {
    state: ['', '距开始还剩', '距结束仅剩'],
    timeType: ['', 'from_time', 'to_time'],
    showToast: false
  },
  methods: {
    time_end() {
      if (this.data.datas.type == 2) {
        console.log('2')
        this.triggerEvent('onTimeEnd');
      }
    }
  }
})
