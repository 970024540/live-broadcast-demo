const app = getApp()
const { globalData}=getApp();
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    goods_data_price: {
      type: Number || String
    },
    subScribe: {
      type: Object,
      value: null
    }
  },
  data: {
    state: ['', '距预约开始还有', '距预约结束还有', '距购买开始还有', '距购买结束还有'],
    timeType: ['', 'book_from_time', 'book_to_time', 'sale_from_time', 'sale_to_time'],
    process: ['参与预约', '等待结果', '获取资格', '前往购买'],
    member_id: '',
    timeId: '',   // 列表轮播定时
  },
  methods: {
    time_end() {
      if (this.data.subScribe.type == 4) {
        this.triggerEvent('onTimeEnd');
      }
    }
  }
})
