// packageGoods/goodsListView/filterPopup/index.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true
  },
  properties: {
    facet_counts: {
      type: Object,
      value: () => {},
      observer: 'facet_counts_watch'
    },
    fq: {
      type: String,
      value: '',
      observer(v) {
        let fq_obj = {};
        if (!!v) {
          v.split(',').map(item => {
            let arr = item.split(':');
            fq_obj[arr[0]] = arr[1];
          })
        }
        this.setData({
          fq_obj
        })
      },
    }
  },

  /**
   * 组件的初始数据
   */
  temp_fields_arr: [],
  data: {
    minCount: 0,
    price1: '',
    price2: '',
    selectedItems: {},
    fields: {},
    label: {
      brand: { name: '品牌', order: 0 },
      goods_cat: { name: '品类', order: 1 },
      price: { name: '价格', order: 2 },
      spec_color: { name: '颜色', order: 4 },
      spec_size: { name: '尺码', order: 5 },
      year_season: { name: '年份', order: 6 },
      apply_age: { name: '适用年龄', order: 7 },
      apply_sex: { name: '适用性别', order: 8 },
      fashion_element: { name: '流行元素', order: 9 },
      material: { name: '材质成分', order: 10 },
      neck_style: { name: '领型', order: 11 },
      style: { name: '风格', order: 12 },
      type: { name: '款式', order: 13 },
      swaist_style: { name: '腰型', order: 14 },
      sleeve_style: { name: '袖型', order: 15 },
      model: { name: '版型', order: 16 },
      sleeve_length: { name: '袖长', order: 17 },
      clothes_length: { name: '衣长', order: 18 },
      profile: { name: '廓形', order: 19 },
      commuting: { name: '通勤', order: 20 },
      thickness: { name: '厚薄', order: 21 },
      elastic_force: { name: '弹力', order: 22 },
      skirt_type: { name: '裙型', order: 23 },
      skirt_length: { name: '裙长', order: 24 },
      clothes_placket: { name: '衣门襟', order: 25 },
      combining_form: { name: '组合形式', order: 26 },
      pattern: { name: '图案', order: 27 },
    },
    fq_obj: {},
  },

  /**
   * 组件的方法列表
   */
  methods: {
    facet_counts_watch (v) {
      if (!v.facet_ranges) return;
      let { label, fq_obj} = this.data;
      let selectedItems = {};
      let fields = {};
      this.temp_fields_arr = [];
      let query = fq_obj;
      let price_obj = this.formatPriceObj(v.facet_ranges.price);
      let fields_obj = v.facet_fields;
      for (let key in fields_obj) {
        let item = fields_obj[key];
        let list = {};
        if (Array.isArray(item)) continue;
        for (let k in item) {
          let label = k;
          let value = k;
          if (key == 'spec_size' && k == '00') label = '均码';
          list[value] = {
            label,
            value: k,
            selected: query[key] == k,
          }
          if (query[key] == k) {
            selectedItems[key] = { key: `${key}:${k}`, count: item[k], label };
          }
        }
        this.temp_fields_arr.push({
          key,
          label: label[key].name,
          order: label[key].order,
          list,
          show: true
        })
      }
      this.temp_fields_arr.sort((a, b) => {
        return a.order - b.order;
      }).map((item, index) => {
        item.show = index < 3;
        fields[item.key] = item;
      })
      this.setData({
        fields
      })
    },
    clickItem({currentTarget}) {
      let {key, key1} = currentTarget.dataset;
      let { facet_counts, selectedItems, price1, price2, fields} = this.data;
      let item1 = fields[key].list[key1];
      let facet_queries_key = `${key}:${item1.value}`;
      let count = facet_counts.facet_queries[facet_queries_key];
      if (item1.selected) {
        item1.selected = !item1.selected;
        delete selectedItems[key];
      } else {
        if (key == 'price') {
          price1 = '';
          price2 = '';
        }
        let list = fields[key].list;
        for (let i in list) {
          const v = list[i];
          v.selected = i == key1;
        }
        selectedItems[key] = { key: facet_queries_key, count, label: item1.label };
      }
      this.setData({
        selectedItems, price1, price2, fields
      })
      this.computeCount();
    },
    inputChange(e) {
      let value = e.detail.value;
      let key = "price" + e.currentTarget.dataset.index;
      let { selectedItems, price1, price2, fields } = this.data;
      if (selectedItems['price']) {
        delete selectedItems['price'];
        let list = fields['price'].list;
        for (let i in list) {
          const v = list[i];
          v.selected = false;
        }
      }
      this.setData({
        selectedItems, fields,
        [key]: value
      })
    },
    clearPriceInput() {
      let { selectedItems, price1, price2 } = this.data;
      price1 = '';
      price2 = '';
      this.setData({
        price1, price2
      })
      if (selectedItems['price']) {
        delete selectedItems['price'];
        this.setData({
          selectedItems
        })
        this.computeCount();
      }
    },
    priceInputQuery() {
      const { price1, price2, selectedItems } = this.data;
      if (!price1 && !price2) {
        wx.showToast({
          title: '请输入价格',
          icon: 'none'
        })
      } else {
        let min = Math.min(price1, price2);
        let max = Math.max(price1, price2);
        let key = `price:[${min} TO ${max}]`;
        selectedItems.price = {};
        selectedItems.price = { key, count: 0, label: `${min}~${max}` };
        this.setData({
          selectedItems
        })
        this.computeCount();
      }
    },
    formatPriceObj(ranges) {
      let { price1, price2, label, fq_obj} = this.data;
      price1 = '';
      price2 = '';
      let { after, before, between, counts, end, gap, start } = ranges;
      let price = {
        key: 'price',
        label: label['price'].name,
        order: label['price'].order,
        list: {},
        show: true
      };
      let keys = Object.keys(counts);
      let length = keys.length;
      if (length == 0 && fq_obj.price) {
        let price_arr = fq_obj.price.slice(1, -1).split(' TO ');
        price1 = price_arr[0];
        price2 = price_arr[1];
      }
      let now_total_percent = 0;
      for (let i = 0; i < length; i++) {
        const value = parseInt(keys[i]);
        // {label: '500元以下', value: '[* TO 500]', selected: false},
        let obj = {
          label: '',
          subLabel: '',
          value: '',
          selected: false,
        };
        if (i > 9) break;
        if (fq_obj.price) {
          let price_arr = fq_obj.price.slice(1, -1).split(' TO ');
          if (price_arr[0] == value && (price_arr[1] == (value - 0 + gap) || price_arr[1] == '*')) {
            let price_arr_1 = isNaN(parseInt(price_arr[1])) ? '*' : parseInt(price_arr[1]);
            obj.label = price_arr_1 == '*' ? `${value}以上` : `${value} ~ ${price_arr_1}`;
            obj.value = `[${value} TO ${price_arr_1}]`;
            obj.subLabel = '已选择';
            price.list[obj.value] = obj;
            obj.selected = true;
            if (price_arr_1 == '*') {
              break;
            } else {
              continue;
            }
          } else {
            price1 = price_arr[0];
            price2 = price_arr[1];
          }
        }
        if (i == 9) {
          obj.label = `${value}元以上`;
          obj.value = `[${value} TO *]`;
          obj.subLabel = `${(100 - now_total_percent).toFixed(1)}%已选择`;
        } else {
          obj.label = `${value} ~ ${value - 0 + gap}`;
          obj.value = `[${value} TO ${value - 0 + gap}]`;
          let count = counts[keys[i]];
          let percent = parseInt((count / between) * 1000) / 10;
          now_total_percent += percent;
          obj.subLabel = `${percent}%的选择`;
        }
        price.list[obj.value] = obj;
      }
      this.temp_fields_arr.push(price);
      this.setData({
        price1, price2
      })
    },
    toggleList({currentTarget}) {
      let key = currentTarget.dataset.key;
      let fields = this.data.fields;
      fields[key].show = !fields[key].show;
      this.setData({
        fields
      })
    },
    computeCount() {
      let {selectedItems} = this.data;
      let keys = Object.keys(selectedItems);
      let values = keys.map(key => {
        return selectedItems[key];
      })
      // let counts = [];
      let params = [];
      values.forEach(item => {
        // if (item.count) counts.push(item.count);
        params.push(item.key);
      })
      // this.minCount = counts.length ? Math.min(...counts) : 0;
      this.triggerEvent('filterChange', params.join(','));
    },
    filterDone({currentTarget}) {
      let state = currentTarget.dataset.state;
      if (!state) {
        let { price1, price2, selectedItems, fields} = this.data;
        price1 = '';
        price2 = '';
        selectedItems = {};
        for (let i in fields) {
          let item = fields[i];
          for (let k in item.list) {
            let ele = item.list[k];
            ele.selected = false;
          }
        }
        this.setData({
          price1, price2, selectedItems, fields
        })
        this.computeCount();
      } else {
        this.triggerEvent('filterDone', state);
      }
    },
  }
})
