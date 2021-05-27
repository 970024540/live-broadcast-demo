Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    styles:{
      type:Object,
      observer: function (oldVal, newVal){
        // console.log("oldVal", oldVal)
      }
    }
  },
  data: {
    text: '距本场开始',
    des: 0
  },
  ready() { 
    this.compute();
  },
  methods: {
    compute() {
      let now = +new Date();
      let { stime = '', etime = '',time} = this.properties.styles.desc;
      let _stime = stime ? new Date(stime.replace(/-/g, "/")).getTime() : 0;
      let _etime = etime ? new Date(etime.replace(/-/g, "/")).getTime() : 0;
      let text='';
      let des=0;
      if (time) {
        if (now < _stime) {
          text = '距本场开始';
          des = _stime;
        } else if (now >= _stime && now <= _etime) {
          text = '本场还剩';
          des = _etime;
        } else if (now > _etime) {
          text = '本场已结束';
          des = 0;
        }
        this.setData({
          text,
          des
        });
      }
    }
  },
})