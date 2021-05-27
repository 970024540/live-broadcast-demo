const app = getApp();
Component({
  properties: {
    brands: {
      type: Object,
      default: {}
    },
  },
  data: {
    address: {}
  },
  lifetimes: {
    attached () {
      app.notokan_api_post('mobileapi.aftersales.returnAddress', {}, res => {
        if (res.rsp == 'succ') {
          this.setData({ address: res.data })
        }
      })
    }
  }
})
