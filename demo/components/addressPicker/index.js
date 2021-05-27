// components/addressPicker/index.js
const china_address = require('../../utils/address/address_v3.js').default;
const column1 = Object.keys(china_address);
let column2 = Object.keys(china_address['北京']);
let column3 = china_address['北京']['北京市'];
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true,
  },
  scrolling: false,
  properties: {
    label: {
      type: String,
      default: '',
    },
    selected: {
      type: Array,
      default: [],
      observer: function (v) {
        this.setData({
          area: v.join('/')
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    multiIndex: [0, 0, 0],
    addressArray: [column1, column2, column3],
    regionAddr: ['北京', '北京市', '东城区'],
    area: '',
    showAddressPicker: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showPicker () {
      this.setData({
        showAddressPicker: true
      })
    },
    close () {
      this.setData({
        showAddressPicker: false
      })
    },
    bindMultiPickerColumnChange({ detail }) {
      let column, value;
      let { regionAddr, addressArray, multiIndex } = this.data;
      let columnArr = detail.value;
      if (columnArr[0] != multiIndex[0]) {
        column = 0;
        value = columnArr[0];
      } else if (columnArr[1] != multiIndex[1]) {
        column = 1;
        value = columnArr[1];
      } else if (columnArr[2] != multiIndex[2]) {
        column = 2;
        value = columnArr[2];
      } else {
        return
      }
      if (regionAddr[column] == value) return;
      let currentColumnValue = addressArray[column][value];
      regionAddr[column] = currentColumnValue;
      multiIndex[column] = value;
      if (column == 0) {
        column2 = Object.keys(china_address[currentColumnValue]);
        column3 = china_address[currentColumnValue][column2[0]];
        regionAddr[1] = column2[0];
        regionAddr[2] = column3[0];
        multiIndex[1] = 0;
        multiIndex[2] = 0;
      }
      if (column == 1) {
        column3 = china_address[regionAddr[0]][currentColumnValue];
        regionAddr[2] = column3[0];
        multiIndex[2] = 0;
      }
      this.setData({
        addressArray: [column1, column2, column3],
        regionAddr,
        multiIndex
      })
    },
    bindChange() {
      if (this.scrolling) return;
      this.close();
      this.triggerEvent('change', this.data.regionAddr);
    },
    reset () {
      column2 = Object.keys(china_address['北京']);
      column3 = china_address['北京']['北京市'];
      this.setData({
        multiIndex: [0, 0, 0],
        addressArray: [column1, column2, column3],
        regionAddr: ['北京', '北京市', '东城区'],
        area: '',
      })
    },
    bindpickstart () {
      this.scrolling = true;
    },
    bindpickend () {
      wx.nextTick(() => {
        this.scrolling = false;
      })
    },
  }
})
