Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    fromTime: {
      type: Number,
    },
    toTime: {
      type: Number,
    },
    type: {
      type: String,
      value: 'dark'
    },
    isSimple: {
      type: Boolean,
      value: false
    },
    showHours: {
      type: Boolean,
      value: false
    },
    isOpenText: {
      type: Boolean,
      value: false
    },
    preStartLabel:{
      type:String,
      value:''
    },
    endLabel:{
      type:String,
      value:''
    },
    StartingLabel:{
      type:String,
      value:''
    },
    index: { // 此属性为解决多tab切换倒计时不更新问题
      type: Number,
      value: -1,
      observer () {
        this.init();
      }
    },
    moduleType: { // 倒计时组件类型 '2'：商品分组居头部布局   '1'：组件倒计时  ''：活动页面倒计时
      type:String,
      value:'',
    },
    padding_rl:{
      type: String,
      value: '0',
    }
  },
  time_bomb: null,
  data: {
    timeType: 0,
    res: '',
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
    theme: {
      dark: {
        bgColor: "#5f646e",
        color: "#fff"
      },
      danger: {
        bgColor: "#FB4F5B",
        color: "#fff"
      },
      warning: {
        bgColor: "#FDEDD3",
        color: "#fff"
      },
      success: {
        bgColor: "#28C76F",
        color: "#fff"
      },
      purple: {
        bgColor: "#A543D0",
        color: "#fff"
      },
      white: {
        bgColor: "#fff",
        color: "#333"
      }
    }
  },
  ready() {
    wx.nextTick(() => {
      this.init();
    })
  },
  methods: {
    init(){
      if (this.time_bomb) {
        clearInterval(this.time_bomb);
        this.time_bomb = null;
      }
      let { fromTime, toTime } = this.data;
      let { timeType } = this.data;
      this.time_bomb = setInterval(() => {
        let _now = new Date().getTime();
        if (_now < fromTime) {
          //尚未开始
          timeType = 0;
          this.calc_time(fromTime - _now);
        } else if (_now > fromTime && _now < toTime) {
          //活动已开始,计算结束时间
          timeType = 1;
          this.calc_time(toTime - _now);
        } else if (_now > toTime) {
          //已结束
          timeType = -1;

          this.calc_time(_now - toTime);
        }
       
        this.setData({ timeType });
      }, 1000)
    },
    calc_time(time_stamp) {
      let { showHours } = this.data;
      let t = time_stamp / 1000;
      let day = Math.floor(t / (24 * 3600));
      let hour = Math.floor((t - day * 24 * 60 * 60) / 3600);
      let minute = Math.floor((t - day * 24 * 60 * 60 - hour * 60 * 60) / 60);
      let second = Math.floor(t - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60);
      if (showHours) {
        hour = day * 24 + hour;
      }
      this.setData({ day, hour, minute, second });
    }
  }
})
