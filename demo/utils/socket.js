const resend_type = [1,2,3,4,5,6,7,8,9,10]; // 需要重发的消息类型
const app = getApp();
const robotHost = app.globalData.robotHost;
var Socket = function ({ user_id, onopen, onmessage, onstateChange, onclose, onerror}) {
  this.user_id = user_id;
  this.device_id = null;
  this.token = null;
  this.onopen = onopen;
  this.onmessage = onmessage;
  this.onstateChange = onstateChange;
  this.onclose = onclose;
  this.onerror = onerror;
  this.ws = null;
  this.readyState = 0;
  this.heartBeatTimer = null;
  this.reconnectTimer = null;
  this.reconnectCount = 0;
  this.isReconnecting = false;
  this.unsendMessage = [];
  this.init();

};

Socket.prototype = {
  init: async function () {
    let me = this;
    me.setState(0);
    let {device_id, token} = await me.checkAuth();
    // let url = `ws://127.0.0.1:8001`;
    let url = `wss://${robotHost}:8181/ws?userId=${me.user_id}&deviceId=${device_id}&token=${token}`;
    let ws = wx.connectSocket({
      url: url,
    })
    ws.onOpen(function (e) {
      if (me.reconnectTimer) {
        clearTimeout(me.reconnectTimer);
        me.reconnectTimer = null;
      }
      me.setState(1);
      me.isReconnecting = false;
      for (let i = 0; i < me.unsendMessage.length; i++){
        let msg = me.unsendMessage[i];
        ws.send({
          data: JSON.stringify(msg),
          fail: (e) => {
            console.log('socket resend error: ', e);
            
          }
        });
      }
      me.unsendMessage = [];
      if (me.onopen && typeof me.onopen === 'function') me.onopen(e);
    });
    ws.onMessage(function (e) {
      try {
        let data = JSON.parse(e.data);
        if (me.onmessage && typeof me.onmessage === 'function') me.onmessage(data);
        me.heartBeat();
      } catch (error) {
        console.error(error);
      }
    });
    ws.onError(function () {
      me.reconnect();
      me.setState(3);
      if (me.onerror && typeof me.onerror === 'function') me.onerror(e);
    });
    ws.onClose(function () {});
    this.ws = ws;
  },
  setState: function (state) {
    this.readyState = state;
  },
  getLocalChatUserId: function () {
    return this.user_id;
  },
  send: function (msg) {
    let defaultOption = {
      SenderDeviceId: this.device_id,
      SenderId: this.user_id,
      RequestId: 12,
      MessageId: '1',
      SendTime: Date.now(),
      ToUserIds: null,
      ServiceType: 0,
    }
    msg = Object.assign(defaultOption, msg);
    if (this.readyState != 1) {
      if (resend_type.includes(msg.MessageBody.MessageType)) this.unsendMessage.push(msg);
      if (!this.isReconnecting && this.readyState != 0) {
        this.reconnectCount = 0;
        this.reconnect();
      }
      return;
    }
    // console.log('socket send: ', msg);
    this.ws.send({
      data: JSON.stringify(msg),
      fail: (e) => {
        console.log('socket send error: ', e);
        if (resend_type.includes(msg.MessageBody.MessageType)) this.unsendMessage.push(msg);
        if (!this.isReconnecting && this.readyState != 0) {
          this.reconnectCount = 0;
          this.reconnect();
        }
      }
    });
  },
  reconnect: function () {
    if (this.isReconnecting) return;
    this.isReconnecting = true;
    if (this.ws) this.ws.close();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartBeatTimer) {
      clearTimeout(this.heartBeatTimer);
      this.heartBeatTimer = null;
    }
    if (this.reconnectCount < 10) {
      this.reconnectCount += 1;
      if (this.reconnectCount > 3) {
        wx.removeStorageSync('chat_socket_storage');
      }
      let timeout = Math.ceil(this.reconnectCount / 3) * 3000;
      this.reconnectTimer = setTimeout(() => {
        this.isReconnecting = false;
        this.init();
      }, timeout);
    } else {
      this.isReconnecting = false;
    }
  },
  destroy: function () {
    this.user_id = '';
    this.setState(3);
    if (this.ws) this.ws.close();
    this.ws = null;
    this.unsendMessage = [];
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartBeatTimer) {
      clearTimeout(this.heartBeatTimer);
      this.heartBeatTimer = null;
    }
    this.reconnectCount = 0;
    this.isReconnecting = false;
  },
  heartBeat: function () {
    return
    if (this.heartBeatTimer) {
      clearTimeout(this.heartBeatTimer);
      this.heartBeatTimer = null;
    }
    this.heartBeatTimer = setTimeout(() => {
      this.send({ type: 9003 });
    }, 540000); // 9分钟
  },
  checkAuth: function () {
    let me = this;
    let chat_socket_storage = wx.getStorageSync('chat_socket_storage');
    let {device_id, token, user_id, sign_at} = chat_socket_storage;
    let tokenExpired = sign_at * 1000 < Date.now() - 8 * 3600 * 1000;
    if (device_id && token && !tokenExpired) {
      me.device_id = device_id;
      me.token = token;
      me.user_id = user_id;
      return Promise.resolve({ device_id, token});
    }
    return new Promise((resolve) => {
      wx.request({
        url: `https://${robotHost}:8096/api/v1/pub/auth/ws?user_id=${me.user_id}&device_type=5&nonce_str=123456`,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          if (res.statusCode == 200) {
            let { device_id, token, user_id, sign_at} = res.data;
            wx.setStorageSync('chat_socket_storage', { device_id, token, user_id, sign_at });;
            me.device_id = device_id;
            me.token = token;
            me.user_id = user_id;
            resolve({ device_id, token});
            return
          }
          me.device_id = null;
          me.token = null;
          resolve({});
        },
        fail: function () {
          me.device_id = null;
          me.token = null;
          resolve({});
        }
      })
    })
  },
}

const ChatSocket = function () {
  this.instance = null;
  this.options = null;
};
ChatSocket.prototype.init = function (options) {
  if (this.instance) this.destroy();
  this.options = options;
  this.instance = new Socket(options);
  return this;
}
ChatSocket.prototype.destroy = function () {
  this.options = null;
  if (this.instance) {
    this.instance.destroy();
    this.instance = null;
  }
}
ChatSocket.prototype.getInstance = function () {
  if (this.instance) return this.instance;
  if (this.options) this.instance = new Socket(this.options);
  return this.instance;
}

let chatSocket = new ChatSocket();

export default chatSocket;