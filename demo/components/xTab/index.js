// components/xTab/index.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  properties: {
    tabs: {
      type: Array,
      value: () => [],
      observer (tabs) {
        this.setData({
          mTabs: tabs
        })
      }
    },
    currentTab: {
      type: Object,
      value: () => {},
      observer (tab) {
        this.setData({
          activeTab: tab
        })
      }
    },
    mask: {
      type: Boolean,
      value: true
    },
    maskTop: {
      type: String,
      value: '190rpx'
    },
    flat: {
      type: Boolean,
      value: true
    },
    height: {
      type: String,
      value: '86rpx'
    },
    trigger: {
      type: String,
      value: 'lazy', // lazy 点击相同tab时不触发, always 总是触发
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    mTabs: {},
    activeTab: {
      index: 0,
      optionsIndex: null,
      optionsValue: null
    },
    showOptionsIndex: 999
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeTab ({currentTarget}) {
      let { mTabs, activeTab, showOptionsIndex, trigger} = this.data;
      let index = currentTarget.dataset.index;
      let tab = mTabs[index];
      let optionsIndex = tab.optionsIndex || 0;
      let optionsValue = tab.options && tab.options.length ? tab.options[optionsIndex].value : null;
      let currentTab = {
        index,
        optionsIndex,
        optionsValue,
        target: 'tab'
      }
      if (index == activeTab.index) {
        if (showOptionsIndex == index) {
          this.setData({
            showOptionsIndex: 999
          })
        } else if (tab.options && tab.options.length) {
          this.setData({
            showOptionsIndex: index
          })
        } else {
          if (trigger == 'always') this.triggerEvent('tabChange', currentTab);
        }
        return;
      } else {
        this.setData({
          showOptionsIndex: 999
        })
        this.triggerEvent('tabChange', currentTab);
      }
    },
    changeOptions ({currentTarget}) {
      let { mTabs, activeTab } = this.data;
      let optionsIndex = currentTarget.dataset.optionsIndex;
      let index = activeTab.index;
      let tab = mTabs[index];
      let tabOptionsIndex = tab.optionsIndex || 0;
      let optionsValue = tab.options && tab.options.length ? tab.options[optionsIndex].value : null;
      let currentTab = {
        index,
        optionsIndex,
        optionsValue,
        target: 'option'
      }
      mTabs[index].optionsIndex = optionsIndex;
      this.setData({
        mTabs,
        showOptionsIndex: 999
      })
      if (optionsIndex == tabOptionsIndex) {
        this.setData({
          showOptionsIndex: 999
        })
        return
      }
      this.triggerEvent('tabChange', currentTab);
    },
    maskClick () {
      this.setData({
        showOptionsIndex: 999
      })
    }
  }
})
