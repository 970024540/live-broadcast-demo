Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    level: {
      type: null,
      value: 1,
      observer (level) {
        let { levelList, levelStrList } = this.data;
        if (parseInt(level) == level) {
          this.setData({
            lvl: levelList[level]
          })
        } else {
          let l = levelStrList[level] || 1;
          this.setData({
            lvl: levelList[l]
          })
        }
      }
    },
    color: {
      type: String,
      value: ''
    },
  },
  data:{
      levelList: {
        1: { icon: 'icon-v1', color: '#dbba80' },
        2: { icon: 'icon-v2', color: '#faab2b' },
        3: { icon: 'icon-v3', color: '#7c4191' },
        4: { icon: 'icon-v4', color: '#8BC34A' },
        5: { icon: 'icon-v5', color: '#2196F3' },
        6: { icon: 'icon-v6', color: '#FF5722' },
        7: { icon: 'icon-v7', color: '#673AB7' },
        vip: { icon: 'icon-VIP', color: '#212121' },
      },
      levelStrList: {
        普通会员: 1,
        高级会员: 2,
        超级会员: 3,
        影粉: 1,
        时尚卡: 2,
        金卡: 3,
        白金卡: 4,
        钻石卡: 5,
        黑卡: 6
      },
    lvl: { icon: 'icon-v1', color: '#dbba80' }
  },
  methods: {
  }
})