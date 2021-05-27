import { formatTime } from '../../utils/index.js';
Component({
  properties: {
    card: {
      type: Object,
      value: {}
    }
  },
  data: {
    s_time: '',
    e_time: '',
    cart_title:'',
    card_type: {
      "0": {
        title: "折扣券",
        type: "danger"
      },
      "1": {
        title: "优惠券",
        type: "danger"
      },
      "2": {
        title: "通用券",
        type: "dark"
      }
    },
  },
  attached() {
    let card = this.data.card;
    this.setData({
      cart_title: this.data.card_type[card.cardInfo.type].title,
      s_time: formatTime(card.cardInfo.start_time * 1000, 'yyyy.MM.dd'),
      e_time: formatTime(card.cardInfo.end_time * 1000, 'yyyy.MM.dd')
    })
  },
  methods: {
    showDetail() {
      let card = this.data.card;
      if (card.status == 1) {
        wx.showModal({
          showCancel: false,
          title: '卡券规则',
          content: card.cardInfo.description
        })
      }
    }
  }
})
