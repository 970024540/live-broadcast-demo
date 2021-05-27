const app = getApp();
const robotHost = app.globalData.robotHost;
const socket = require('./socket').default;
let chatSocket = null;
const def_chat_avatar = 'http://zone-yingerfashion.oss-cn-shenzhen.aliyuncs.com/storage/images/avatar/3c1b15bb4b0325b23db64346ba0ac31b.png';
let listTop = [
  {
    type: 1,
    content: '您好，影儿机器人为您服务，请问有什么可以帮您~',
    timestamp: 0,
    sendUserId: '-1',
    isHistory: false,
  },
  {
    type: 1001,
    content: [],
    hotQaBanner: [{
        title: '领优惠券',
        icon: 'icon-ziyuan77',
        msg: '怎么领优惠券？',
        link: '',
      },
      {
        title: '查询物流',
        icon: 'icon-wuliuchaxun',
        msg: '查询物流？',
        link: '',
      },
      {
        title: '售后服务',
        icon: 'icon-shouhouwuyou',
        msg: '申请售后',
        link: '',
      },
      {
        title: '查询活动',
        icon: 'icon-huodong',
        msg: '有什么活动？',
        link: '',
      },
    ],
    timestamp: 1,
    sendUserId: '-1',
    isHistory: false,
    showLoadingMsg: false,
  }
];
let chatInstance = {
  messageList: [...listTop],
  chatUserId: '',
  localChatUserId: '',
  chatUser: {
    avatar: def_chat_avatar,
    member_id: '',
    nickname: '影儿小管家',
  },
  userInfo: {},
  share_member_id: '',

  dataChangeHandler: () => {},

  pageHide () {
    let {messageList} = chatInstance;
    let len = messageList.length;
    if (len > 20) {
      chatInstance.messageList = messageList.slice(-6);
    }
  },


  getInstance: function (options) {
    let {share_member_id, dataChangeHandler} = options;
    let { share_member_id: old_share_member_id} = chatInstance;
    let old_member_id = chatInstance.userInfo.member_id || '';
    let userInfo = app.globalData.userInfo || {};
    let member_id = userInfo.member_id || '';
    share_member_id = share_member_id == member_id ? '' : share_member_id;
    chatInstance.share_member_id = share_member_id;
    chatInstance.dataChangeHandler = dataChangeHandler;
    chatInstance.userInfo = userInfo;
    chatSocket = socket.getInstance();
    if (chatSocket) {
      if (member_id != old_member_id) {
        // 登录者信息更改，重连, 重置到和机器人聊天
        wx.removeStorageSync('chat_socket_storage');
        chatInstance.destroySocket(true);
        chatInstance.initSocket(member_id);
        return;
      }
      if (share_member_id != old_share_member_id) {
        // 分享人变化，重置到和机器人聊天
        chatInstance.destroySocket(false);
        chatInstance.chatUser = {
          avatar: def_chat_avatar,
          member_id: '',
          nickname: '影儿小管家',
        }
        chatInstance.chatUserId = '';
        dataChangeHandler({
          messageList: chatInstance.messageList,
          localChatUserId: chatInstance.localChatUserId,
          chatUserId: chatInstance.chatUserId,
          chatUser: chatInstance.chatUser,
        }, 'scrollToView');
        return;
      }
      dataChangeHandler({
        messageList: chatInstance.messageList,
        localChatUserId: chatInstance.localChatUserId,
        chatUserId: chatInstance.chatUserId,
        chatUser: chatInstance.chatUser,
      }, 'scrollToView');
    } else {
      chatInstance.initSocket(member_id);
    }
  },
  initSocket (member_id) {
    chatSocket = socket.init({
      user_id: member_id,
      onmessage: (data) => chatInstance.onmessage(data),
      onopen: async (e) => {
        chatInstance.localChatUserId = chatSocket.getLocalChatUserId();
        if (chatInstance.messageList[1].content.length == 0) {
          await chatInstance.fetchHotQa();
        }
        chatInstance.dataChangeHandler({
          messageList: chatInstance.messageList,
          localChatUserId: chatInstance.localChatUserId,
          chatUserId: chatInstance.chatUserId,
          chatUser: chatInstance.chatUser,
        }, 'scrollToView');
      }
    }).getInstance();
  },
  destroySocket (socketDestroy = false) {
    chatInstance.messageList = [...listTop];
    socketDestroy && chatSocket.destroy();
  },
  chatTriggerEvent (e) {
    let {eventName, params} = e.detail;
    if (this[eventName] && typeof this[eventName] == 'function') {
      this[eventName](params);
    }
  },
  fetchHotQa () {
    return this.request({url: '/hotqa/List'}).then(res => {
      if (res.success) {
        chatInstance.messageList[1].content = res.data || [];
        listTop[1].content = res.data || [];
      }
    })    
  },
  sendMsg (e) {
    let {msg, addToList = true} = e.detail;
    msg = this.handle_send_message(msg, addToList);
    chatSocket.send(msg);
  },
  onmessage: async function (payload) {
    let {
      userInfo,
      chatUserId,
      localChatUserId
    } = chatInstance;
    let {
      message,
      service_type
    } = payload;
    let {
      message_body,
      receiver_id,
      receiver_type,
      request_id,
      send_at,
      sender_device_id,
      sender_id,
      sender_type,
      status,
    } = message;
    let {
      MessageContent,
      MessageType,
      knowledge,
    } = message_body;
    if ([9, 17].includes(MessageType)) {
      if (MessageType == 17) {
        chatInstance.dataChangeHandler({
          showLoadingMsg: true,
        }, 'scrollToView')
      }
      return;
    }
    if (MessageType == 15) {
      this.requestSutffService();
      return;
    }
    if (MessageType == 13) {
      chatInstance.dataChangeHandler({
        showLoadingMsg: false,
      })
    }
    if (MessageContent && [6, 7, 8, 10, 11, 12, 13, 14].includes(MessageType)) {
      MessageContent = JSON.parse(MessageContent);
    }
    if (MessageType == 13) {
      MessageContent = MessageContent ? MessageContent.StockList : [];
    }
    let msg = {
      type: MessageType,
      content: MessageContent,
      timestamp: send_at,
      sendUserId: sender_id,
      status: 0,
      isHistory: false,
    }
    if (MessageType == 12) {
      if (!MessageContent || !MessageContent.length) {
        let list = [];
        this.addHistoryMsgToList(list);
        return wx.showToast({
          title: '没有更多消息了',
          icon: 'none',
        })
      }
      let list = [];
      MessageContent.map(v => {
        let {
          object_id,
          type,
          content,
          sender_id: history_sender_id,
          send_at: history_send_at
        } = v;
        if (content && [6, 7, 8, 10, 11, 12, 13, 14].includes(type)) {
          content = JSON.parse(content);
        }
        if (type == 13) {
          content = content ? content.StockList : [];
        }
        let msg = {
          type: type,
          content: content,
          timestamp: +new Date(history_send_at - 0),
          sendUserId: history_sender_id,
          status: 0,
          isHistory: true,
        }
        list.push(msg);
      })
      list.reverse();
      this.addHistoryMsgToList(list);
      return;
    } else if (MessageType == 14 && MessageContent.MemberId) {
      let {
        MemberId,
        Nickname,
        Imgurl
      } = MessageContent;
      chatInstance.chatUser = {
        avatar: Imgurl || def_chat_avatar,
        member_id: MemberId,
        nickname: Nickname || '影儿小管家',
      };
      chatInstance.chatUserId = MemberId;
      chatInstance.dataChangeHandler({
        chatUser: chatInstance.chatUser,
        chatUserId: chatInstance.chatUserId,
      });
      this.addMsgToList(msg);
      this.addMsgToList({
        type: 1,
        content: '亲亲，我来啦，很高兴为您服务~',
        timestamp: send_at,
        sendUserId: sender_id,
        status: 0,
        isHistory: false,
      });
      return;
    }
    if (knowledge) {
      let content = knowledge.knowledge ? knowledge.knowledge.content : '';
      let actions = this.formatActions(content);
      if (actions) msg.actions = actions;
      if (knowledge.subKnowledges) msg.subKnowledges = knowledge.subKnowledges;
    }
    if (msg.content == '请选择您的订单~') {
      if (userInfo.member_id) {
        msg.type = 8;
        msg.content = await this.getUserOrder(userInfo.member_id);
      } else {
        msg.content = '请登录后查询';
      }
    }
    msg.isHistory = true;
    this.addMsgToList(msg);
  },
  handle_send_message (msg, addToList = true) {
    let {
      chatUser,
      localChatUserId,
      chatUserId
    } = chatInstance;
    let result = {
      MessageBody: {},
      // MessageId: '1',
      PackageType: 5,
      ReceiverId: `${chatUserId}`,
      ReceiverType: 1, // 1用户 2 群组
      // RequestId: 12,
      // SendTime: Date.now(),
      // SenderDeviceId: chat_device_id,
      // SenderId: `${localChatUserId}`, // 这里不能设置
      ServiceType: !!chatUserId ? 1 : 0,
      // ToUserIds: null,
    }
    result = Object.assign(result, msg);
    let {
      MessageType,
      MessageContent
    } = result.MessageBody;
    addToList && this.addMsgToList({
      type: MessageType || 1,
      content: MessageContent,
      timestamp: Date.now(),
      sendUserId: localChatUserId,
      status: 0,
    })
    return result;
  },
  addMsgToList (msg) {
    let {
      messageList
    } = chatInstance;
    messageList.push(msg);
    chatInstance.dataChangeHandler({
      messageList: chatInstance.messageList,
    }, 'scrollToView');
  },
  addHistoryMsgToList (list) {
    let {
      messageList
    } = chatInstance;
    chatInstance.messageList = [...list, ...messageList];
    chatInstance.dataChangeHandler({
      messageList: chatInstance.messageList,
    }, 'scrollToView', 'top');
  },
  fetchHistoryMsg () {
    let msg = {
      MessageBody: {
        Command: 1001,
        MessageContent: '22',
        MessageType: 9
      },
      Data: {
        Position: chatInstance.messageList.filter(v => v.isHistory == true).length,
      },
      PackageType: 2,
    };
    msg = this.handle_send_message(msg, false);
    chatSocket.send(msg);
  },
  requestSutffService () {
    let {share_member_id, localChatUserId} = chatInstance;
    let shareMemberId = share_member_id == localChatUserId ? '' : share_member_id;
    let msg = {
      MessageBody: {
        Command: 1001,
        MessageType: 9,
        shareMemberId,
      },
      PackageType: 5,
    };
    msg = this.handle_send_message(msg, false);
    chatSocket.send(msg);
  },
  getUserOrder (userId) {
    wx.showLoading({
      title: '正在请求',
      mask: true,
    })
    return this.request({
      url: `/orderList/list?userId=${userId}`,
      method: 'POST',
    })
  },
  getActivityGoods (params) {
    wx.showLoading({
      title: '正在请求',
      mask: true,
    })
    let {text, time} = params;
    let arr = text.split(',');
    let page = arr[2] || 1;
    let {chatUserId, messageList} = chatInstance;
    let currentItem = null;
    if (page > 1) {
      currentItem = messageList.find(v => v.showMore == text && v.timestamp == time);
    }
    this.request({
      url: `/activity/activityList?condition=${text}`,
    }).then(res => {
      let {MessageContent = []} = res;
      let showMore = '';
      MessageContent = MessageContent ? JSON.parse(MessageContent) : [];
      if (MessageContent && MessageContent.length == 4) {
        showMore = `${arr[0]},${arr[1]},${page - 0 + 1}`;
      }
      if (page == 1) {
        let msg = {
          type: 7,
          content: MessageContent,
          timestamp: Date.now(),
          sendUserId: chatUserId,
          status: 0,
          isHistory: true,
          showMore,
        }
        this.addMsgToList(msg);
      } else if (currentItem) {
        currentItem.content.push(...MessageContent);
        currentItem.showMore = showMore;
        chatInstance.dataChangeHandler({
          messageList: chatInstance.messageList,
        });
      }
    })
  },

  request (options) {
    let {url, data = {}, header, method = 'GET', dataType = 'json', timeout = 5000} = options;
    let defaultHeader = {
      Authorization: wx.getStorageSync('chat_socket_storage').token,
    }
    header = Object.assign(defaultHeader, header);
    url = `https://${robotHost}:8096${url}`
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        data,
        dataType,
        header,
        method: method.toUpperCase(),
        timeout,
        success: (res) => {
          wx.hideLoading();
          if (res.statusCode == 200 && res.data) {
            resolve(res.data);
          }
          resolve(false);
        },
        fail: (res) => {
          wx.hideLoading();
          resolve(false);
        },
      })
    })
  },

  formatActions (content = "") {
    if (!content) return false;
    let reg = /\<a\s+href="(.+?)".*?>(.+?)\<\/a\>/gi;
    let result = [...content.matchAll(reg)];
    let arr = [];
    result.map(v => {
      let [str, link, title] = v;
      arr.push({
        title,
        link: link.replace(/&amp;/g, '&'),
      })
    })
    return arr.length ? arr : false;
  }
}

export default chatInstance;