Component({
  externalClasses: ['time-class'],
  properties:{
    desc: {
      type: Number,
      required: true
    }
  },
  observers: {
    'desc':function(val){
      clearInterval(this.data.timer);
      this.compute();
    }
  },
  data:{
    time: '00:00:00',
    timer: 0
  },
  lifetimes: {
    detached: function() {
      clearInterval(this.data.timer)
    }
  },
  methods: {
    compute() {
      let des = this.properties.desc;
      let d = 0, h, m, s;

      let timer = setInterval(() => {
        let now = new Date().getTime();
        if (des < now) {
          this.setData({time: '00:00:00'});
          // clearInterval(timer);
          return false;
        }

        d = Math.floor((des - now) / 86400000);
        let interval = parseInt(((des - now) % 86400000) / 1000);

        h = Math.floor(interval / 3600);
        m = Math.floor((interval % 3600) / 60);
        s = (interval % 3600) % 60;
        
        h = (h % 10) == h ? `0${h}` : h;
        m = (m % 10) == m ? `0${m}` : m;
        s = (s % 10) == s ? `0${s}` : s;

        if (d) {
          this.setData({time: `${d}天 ${h}:${m}:${s}`})
        } else {
          this.setData({time: `${h}:${m}:${s}`})
        }

        if (d == 0 && h == 0 && m == 0 && s == 0) {
          clearInterval(timer);
          this.triggerEvent('onTimeEnd');
        }
      }, 1000);
      this.setData({ timer })
    }
  }
})