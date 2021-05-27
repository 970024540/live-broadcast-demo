// components/skuSelect/index.js
let m_data = {
  keys: [],
  computedData: {},
  product_list: {}
}
Component({
  /**
   * 组件的属性列表
   */
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  properties: {
    scheme_price: {
      type: Number|String,
      value: 0
    },
    goods_data: {
      type: Object,
      value: {},
      observer: 'watch'
    },
    currentSelectId: {
      type: Number,
      value: 0
    }, //当前已选择的商品product_id, 用于初始化选择状态
    currentSelectNum: {
      type: Number,
      value: 0
    }, //当前已选择的商品数量, 用于初始化选择状态
    goodsPopupType: { // 弹窗按钮类型, 0为关闭,1为加入购物车和购买按钮都有,2为加入购物车,3为立即购买,4为预付定金,5为团购 6为砍价 7预约购买
      type: Number,
      value: 0,
      observer: 'popupTypeHandle'
    },
    store: {
      type: Number || String,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    baseUrl: 'http://mall.yingerfashion.com/',
    showPopup: false,
    goods_cover: '',
    spec_item: {},
    product_list: {},
    storeCount: 0,
    chooseProduct: {},
    notSelectSpec: '',
    selectedSpec: '',
    selectedCount: 1,
    maxCount: 5
  },

  /**
   * 组件的方法列表
   */
  methods: {
    watch (newVal, oldVal, changedPath) {
      let data = newVal
      m_data = {
        keys: [],
        computedData: {},
        product_list: {}
      }
      if (data.id) {
        this.setData({
          goods_cover: data.m_url,
          chooseProduct: {},
          notSelectSpec: '',
          selectedSpec: '',
          selectedCount: 1,
          storeCount: data.store
        })
        if (data.is_prepay) data.buy_limit = 1
        this.initProductInfo()
        this.initSelectedState()
      } else {
        // 
      }
    },
    popupTypeHandle(newVal, oldVal, changedPath) {
      this.setData({
        showPopup: newVal !== 0
      })
    },
    submit(e) {
      let type = e.currentTarget.dataset.submitType
      let chooseProduct = this.data.chooseProduct
      if (!chooseProduct.product_id) return wx.showToast({ title: `请选择 ${this.data.notSelectSpec}`, icon: 'none' })
      chooseProduct.goodsPopupType = type
      chooseProduct.goods_id = this.data.goods_data.id
      chooseProduct.num = this.data.selectedCount
      chooseProduct.store_id = this.data.goods_data.brand_id;
      chooseProduct.abroad_id=this.data.goods_data.abroad_id;
      chooseProduct.freight=this.data.goods_data.freight;
      chooseProduct.abroad_tax=this.data.goods_data.abroad_tax;
      this.triggerEvent('submitHandle', chooseProduct, { bubbles: false })
      this.hidePopup()
    },
    changeBuyCount({ detail }) {
      this.setData({
        selectedCount: detail.value
      })
    },
    /**
     * spec_item: {1: {id: 1, name: '颜色', selected: '', children: {红色: {name: 红色, store: 10, disabled: false}}}}
     * product_list: {hash_id: {product_id: '', 颜色: '', 尺码: '', spec_info: '', name: '', price: '', makprice: '', store: ''}}
     */
    initProductInfo() {
      let goods_data = this.data.goods_data
      let product = goods_data.product
      let spec_item = {}
      let product_list = {}
      let notSelectSpec = ''
      product.forEach(element => {
        let spec_value = element.spec_desc.spec_value
        let product_key = element.spec_desc.spec_name.sort((a, b) => a.spec_id - b.spec_id).map(item => {
          let id = item.spec_id
          if (spec_item[id]) {

          } else {
            spec_item[id] = {}
            spec_item[id].id = id
            spec_item[id].name = item.spec_name
            spec_item[id].selected = ''
            spec_item[id].children = {}
            notSelectSpec += `${item.spec_name} `
          }
          if (spec_item[id].children[spec_value[id]]) {
            spec_item[id].children[spec_value[id]].store += (element.store - 0)
          } else {
            spec_item[id].children[spec_value[id]] = {}
            spec_item[id].children[spec_value[id]].disabled = false
            spec_item[id].children[spec_value[id]].name = spec_value[id]
            spec_item[id].children[spec_value[id]].store = (element.store - 0)
          }
          return spec_value[id]
        })
        product_key = product_key.join(';')
        m_data.product_list[product_key] = { product_id: element.product_id, bn: element.bn, spec_info: element.spec_info, brand_name: goods_data.brand_name, name: element.name, price: element.price, mktprice: element.mktprice, store: element.store }
      })
      let maxCount = goods_data.buy_limit > 0 ? Math.min(goods_data.buy_limit, goods_data.store) : goods_data.store;
      let obj_values = Object.keys(spec_item).map(key => { return spec_item[key]});
      m_data.keys = obj_values.sort((a, b) => a.id - b.id).map(item => {
        let children_values = Object.keys(item.children).map(key => { return item.children[key] });
        return children_values.map(k => { return k.name })
      })
      m_data.computedData = {}
      this.triggerEvent('computeSpecItem', spec_item)
      m_data.spec_item = Object.assign({}, product_list)
      this.setData({
        notSelectSpec: notSelectSpec,
        spec_item: Object.assign({}, spec_item),
        maxCount: maxCount
      })
    },
    initSelectedState() {
      let { currentSelectId, goods_data, spec_item, currentSelectNum} = this.data;
      if (currentSelectId) {
        let selectProduct = goods_data.product.find(item => item.product_id == currentSelectId)
        let goods_spec_value = selectProduct.spec_desc.spec_value
        let goods_spec_name = selectProduct.spec_desc.spec_name
        goods_spec_name.sort((a, b) => a.spec_id - b.spec_id).map(item => {
          spec_item[item.spec_id].selected = goods_spec_value[item.spec_id]
        })
        this.setData({
          spec_item: spec_item,
          selectedCount: currentSelectNum
        })
        this.computeProduct()
      }
    },
    computeStore(key) {
      var result = 0,
        i, j, m,
        items, n = [];
      //检查是否已计算过
      if (typeof m_data.computedData[key] != 'undefined') {
        return m_data.computedData[key];
      }
      items = key.split(";");
      //已选择数据是最小路径，直接从已端数据获取
      if (items.length === m_data.keys.length) {
        return m_data.product_list[key] ? m_data.product_list[key].store : 0;
      }
      //拼接子串
      for (i = 0; i < m_data.keys.length; i++) {
        for (j = 0; j < m_data.keys[i].length && items.length > 0; j++) {
          if (m_data.keys[i][j] == items[0]) {
            break;
          }
        }
        if (j < m_data.keys[i].length && items.length > 0) {
          //找到该项，跳过
          n.push(items.shift());
        } else {
          //分解求值
          for (m = 0; m < m_data.keys[i].length; m++) {
            result += this.computeStore(n.concat(m_data.keys[i][m], items).join(";")) - 0;
          }
          break;
        }
      }
      //缓存
      m_data.computedData[key] = result;
      return result;
    },
    computeProduct() {
      let chooseKeysArr = []
      let spec_key_srr = []
      let notSelectSpec = ''
      let selectedSpec = ''
      let chooseProduct = {}
      let spec_item = this.data.spec_item;
      let obj_values = Object.keys(spec_item).map(key => { return spec_item[key] });
      obj_values.sort((a, b) => a.id - b.id).map(item => {
        chooseKeysArr.push(item.selected)
        spec_key_srr.push(item.id)
        if (item.selected == '') notSelectSpec += `${item.name} `
      })
      let chooseArr = chooseKeysArr.filter(item => { return item != '' })
      if (chooseArr.length == chooseKeysArr.length) {
        chooseProduct = m_data.product_list[chooseKeysArr.join(';')]
        selectedSpec = chooseArr.join(' ')
      }
      let storeCount = chooseArr.length ? this.computeStore(chooseArr.join(';')) : this.data.goods_data.store
      let maxCount = this.data.goods_data.buy_limit > 0 ? Math.min(this.data.goods_data.buy_limit, storeCount) : storeCount;
      m_data.keys.map((v, k) => {
        v.map((m, i) => {
          let tempKeysArr = chooseKeysArr.concat([])
          tempKeysArr[k] = m
          let key = tempKeysArr.filter(item => { return item != '' }).join(';')
          let itemStore = this.computeStore(key)
          spec_item[spec_key_srr[k]].children[m].disabled = itemStore <= 0
        })
      })
      let selectedCount = this.data.selectedCount;
      if (selectedCount > maxCount) {
        selectedCount = maxCount;
        wx.showToast({
          title: `${maxCount < storeCount ? '只能购买' : '库存只有'}${maxCount}件哦`,
          icon: 'none'
        })
      }
      this.setData({
        notSelectSpec: notSelectSpec,
        chooseProduct: chooseProduct,
        selectedSpec: selectedSpec,
        storeCount: storeCount,
        maxCount: maxCount,
        spec_item: spec_item,
        selectedCount
      })
    },
    selectSpec(e) {
      let clickSpec = e.currentTarget.dataset.clickSpec;
      let value = this.data.spec_item[clickSpec[0]];
      let item = value.children[clickSpec[1]];
      if (item.disabled || item.store == 0) return
      value.selected = value.selected == item.name ? '' : item.name
      this.setData({
        spec_item: this.data.spec_item
      })
      this.computeProduct();
      this.triggerEvent('computeSpecItem', this.data.spec_item)
    },
    hidePopup () {
      let detail = {type: 0}
      this.triggerEvent('hidePopup', detail, { bubbles: true })
    }
  }
})
