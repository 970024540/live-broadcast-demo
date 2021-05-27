const app = getApp();
const appoint = {
  sto: false,
  sf: true
}
Component({
  properties: {
    orderInfo: {
      type: Object,
      default: {}
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  data: {
    prov: 0, // 服务商下标
    providers: [],
    entity: '寄件方付',
    regionAddr: [],
    express_name: '', // 物流商名称
    appoint: false, // 是否有预约上门时间
    formData: {
      contact: '',      // 寄件人姓名
      mobile: '',       // 寄件方手机号
      province: '',     // 省
      city: '',         // 市
      county: '',       // 区
      company: '',      // 如果要打印电子面单需要填写该字段,先不考虑
      sendStartTime: '',// 预约上门时间,暂时毛得啥用
      address: '',      // 寄件人详细地址
      pay_method: 1,      // 付款方式 1.寄方付
      parcel_quantity: 1, // 包裹数
      remark: '',         // 备注
      corp_id: 0,         // 服务商 id
      is_protect: 1,      // 是否保价,写死
      ship_zip: 1         // 物流编号,写死
    },
    startDate: '',
    date: '',
    time: '',
    checked: false, // 是否勾选服务信息
  },
  lifetimes: {
    ready () {
      this.get_dlcorp();
      let time = new Date();
      this.setData({
        startDate: time.toLocaleDateString().replace(/\//g, '-')
      })

      let { ship_name, ship_mobile, ship_area, ship_addr } = this.properties.orderInfo;
      let formData = this.data.formData;
      let regionAddr = ship_area.split('/');
      let [province, city, county] = regionAddr;
      Object.assign(formData, {
        province,
        city,
        county,
        address: ship_addr,
        contact: ship_name,
        mobile: ship_mobile
      });
      this.setData({
        formData,
        regionAddr
      })
    }
  },
  methods: {
    inputChange (e) {
      let name = e.target.dataset.name;
      let value = e.detail.detail.value;
      let formData = this.data.formData;
      formData[name] = value;
      this.setData({ formData });
    },
    whoPay() {
      let self = this;
      wx.showActionSheet({
        itemList: ['寄件方付'], // '收件方付' 需要再加入
        success(res) {
          let formData = self.data.formData;
          formData.pay_method = res.tapIndex + 1;
          self.setData({ formData, entity: res.tapIndex == 0 ? '寄件方付' : '收件方付' });
        }
      })
    },
    get_dlcorp () {
      app.get_dlcorp((res, format_res) => {
        let providers = [];
        let formData = this.data.formData;
        for (let i = 0; i < res.length; i++) {
          let { name, corp_id, corp_code, disabled } = res[i];
          if (corp_code.toLowerCase() === 'sto' && (disabled == 'true' || disabled == true)) {
            formData.corp_id = corp_id;
            this.setData({
              express_name: name,
              formData
            })
          }
          if (disabled == 'true' || disabled == true) {
            providers.push({
              key: corp_id,
              value: name,
              appoint: !!appoint[corp_code.toLowerCase()]
            })
          }
        }
        this.setData({ providers });
      })
    },
    provChange (e) {
      let idx = e.detail.value;
      let { providers, formData } = this.data;
      let { key, value, appoint } = providers[idx];
      formData.corp_id = key;
      this.setData({
        appoint,
        formData,
        express_name: value
      });
    },
    appointChange (e) {
      let name = e.currentTarget.dataset.name;
      let value = e.detail.value;
      this.setData({
        [name]: value
      })
    },
    bindAddrChange ({ detail }) {
      let [province, city, county] = detail;
      let formData = this.data.formData;
      Object.assign(formData, {province, city, county});
      this.setData({
        regionAddr: detail,
        formData
      })
    },
    handleService ({ detail }) {
      this.setData({ checked: detail.value.length > 0 })
    },
    validate (data, flag = true) {
      if (data.contact == '') {
        if (flag) wx.showToast({ title: '姓名不能为空!', icon: 'none' });
        return false;
      }
      if (!/^1[3|4|5|6|7|8|9]\d{9}$/.test(data.mobile)) {
        if (flag) wx.showToast({ title: '手机号格式不正确!', icon: 'none' });
        return false;
      }
      if (!data.province || !data.address) {
        if (flag) wx.showToast({ title: '地址不能为空!', icon: 'none' });
        return false;
      }
      if (!this.data.checked) {
        if (flag) wx.showToast({ title: '请阅读服务信息并确认', icon: 'none' });
        return false;
      }
      return true;
    },
    close () {
      this.setData({show: false})
    },
    confirm () {
      let { date, time, formData } = this.data;
      if (!this.validate(formData)) {
        return;
      }
      if (date != '' && time != '') {
        formData.sendStartTime = Math.floor(new Date(date + ' ' + time).getTime() / 1000);
      }

      let self = this;
      wx.showModal({
        title: '提示',
        content: '确认上述信息?',
        cancelText: '检查一下',
        confirmText: '确认',
        success (res) {
          if (res.confirm) {
            self.triggerEvent('confirm', formData);
            self.setData({show: false});
          }
        }
      })
    }
  }
})
