//index.js
//获取应用实例
const app = getApp()
var whisper = require('../../vendor/index');
var config = require('../../config');
var recorderSrc = '';
var hostUrl = "https://anydata.22332008.com/info.php";
var timer;
Page({
  data: {
    fps: 24, // 动画帧
    windowWidth: 0, // 屏幕宽度
    windowHeight: 0, // 屏幕高度
    screenHeight: 0, 
    bgTopHeight: 120,
    videoHeight: 0, // video 元素高度，对应canvas元素高度
    isRecording: false, // 正在录音
    // isParsing: true,//语言解析中
    recorderSrc: "", // 语音文件
    inputValue: "", // 输入值
    voiceOrKeyboard: 'voice', // 'voice' 语音输入， 'keyboard' 键盘
    showQuickInput: true, // 展示快捷输入
    showActivites: false, // 热门活动
    voiceTitle: "按住 说话",
    stopVoiceTitle: '松开 结束',
    toView: "",
    recorderResponseMsg: [
      {
        left: '大家好，我是中中机器人，从今天开始我成为您的银行助手，随时随地解答您的问题。'
      }
      // {
      //   left: true,
      //   teletext: true,
      //   title: '话费充值76折大优惠',
      //   img: 'https://cloud.bankofchina.com/sz/wx/fodder/image/d978998e-4e18-4d7f-9ef1-95624f6cb0b5.jpg',
      //   url: 'https://mp.weixin.qq.com/s/zYqXbQjdBG09bC4kXFvZiw',
      //   des: '中国银行深圳分行充值大优惠，手机话费充值 7.6 折'
      // }
    ],
    isPlay: false, // 视频是否播放中
    ctx: {},
    videoContext: {},
    currentTime: 0, // 当前视频播放的进度
    logoImg: 'https://www.apago.top/video/logos.png', // logo图片资源地址
    cursorImgs: [
      'https://anydata.22332008.com/mini/examples/imgs/cursor/gif-0.gif',
      'https://anydata.22332008.com/mini/examples/imgs/cursor/gif-1.gif',
      'https://anydata.22332008.com/mini/examples/imgs/cursor/gif-2.gif',
      'https://anydata.22332008.com/mini/examples/imgs/cursor/gif-3.gif',
      'https://anydata.22332008.com/mini/examples/imgs/cursor/gif-4.gif',
      'https://anydata.22332008.com/mini/examples/imgs/cursor/gif-5.gif'
    ],
    indicatorDots: true,
    interval: 5000,
    duration: 1000,
    current: 0,
    autoplay: false,
    showBottom: false,
    bottomCursor: [
      [{
        img: 'https://anydata.22332008.com/mini/examples/imgs/icon/icon_guest.png',
        icon: 'fa fa-calendar-check-o',
        title: '客户端下载',
        keyWord: '客户端下载'
      },
      {
        img: 'https://anydata.22332008.com/mini/examples/imgs/icon/icon_guest.png',
        icon: 'fa fa-calendar-check-o',
        title: '新版本介绍',
        keyWord: '新版本介绍'
      },
      {
        img: 'https://anydata.22332008.com/mini/examples/imgs/icon/icon_guest.png',
        icon: 'fa fa-calendar-check-o',
        title: '手机银行限额',
        keyWord: '手机银行限额'
      },
      {
        img: 'https://anydata.22332008.com/mini/examples/imgs/icon/icon_guest.png',
        icon: 'fa fa-calendar-check-o',
        title: '网上银行限额',
        keyWord: '网上银行限额'
      },
      {
        img: 'https://anydata.22332008.com/mini/examples/imgs/icon/icon_guest.png',
        icon: 'fa fa-calendar-check-o',
        title: '自助关联',
        keyWord: '自助关联'
      },
      {
        img: 'https://anydata.22332008.com/mini/examples/imgs/icon/icon_guest.png',
        icon: 'fa fa-calendar-check-o',
        title: '扫码取款',
        keyWord: '扫码取款'
      },
      {
        img: 'https://anydata.22332008.com/mini/examples/imgs/icon/icon_guest.png',
        icon: 'fa fa-calendar-check-o',
        title: '话费/流量充值',
        keyWord: '话费/流量充值'
      },
      {
        img: 'https://anydata.22332008.com/mini/examples/imgs/icon/icon_guest.png',
        icon: 'fa fa-calendar-check-o',
        title: '转账汇款',
        keyWord: '转账汇款'
      }],
      [{
        img: 'https://anydata.22332008.com/mini/examples/imgs/icon/icon_guest.png',
        icon: 'fa fa-calendar-check-o',
        title: '中银E代',
        keyWord: '中银E代'
      },
      {
        img: 'https://anydata.22332008.com/mini/examples/imgs/icon/icon_guest.png',
        icon: 'fa fa-calendar-check-o',
        title: '二维码支付',
        keyWord: '二维码支付'
      },
      {
        img: 'https://anydata.22332008.com/mini/examples/imgs/icon/icon_guest.png',
        icon: 'fa fa-calendar-check-o',
        title: '积存金',
        keyWord: '积存金'
      },
      {
        img: 'https://anydata.22332008.com/mini/examples/imgs/icon/icon_guest.png',
        icon: 'fa fa-calendar-check-o',
        title: '手机号转账',
        keyWord: '手机号转账'
      }]
    ]
  },
  canvasIdErrorCallback: function (e) {
    console.error('canvas画布启动失败：' + e.detail.errMsg)
  },
  videoBinderror: function(e) {
    console.error('视频播放错误' + e.detail.errMsg)
  },
  onReady: function () {
    /**
     * 页面初始化
     */
    this.initPage()
    /**
     * 页面资源加载
     */
    this.downlodFile()
    /**
     * 音乐播放
     */
    const audioCtx = wx.createAudioContext('audio')
    audioCtx.play()
  },
  bindtimeupdate: function(event) {
    /**
     * 视频播中放触发事件，获取视频播放信息，进度
     */
    let currentTIme = event.detail.currentTime.toFixed(1) * 1000;
    // 保存动画播放时间
    this.setData({
      currentTime: currentTIme
    })
  },
  initPage: function() {
    /**
     * 获取设备信息
     */
    wx.getSystemInfo({
      success: (system) => {
        console.log(system)
        this.setData({
          windowWidth: system.windowWidth,
          windowHeight: system.windowHeight,
          screenHeight: system.screenHeight
        })
      }
    })

    /**
     * 获取视频组件上下文
     */
    this.videoContext = wx.createVideoContext('video')
    this.setData({
      videoContext: wx.createVideoContext('video')
    })

    /**
     * 设置导航条
     */
    // wx.setNavigationBarTitle({
    //   title: '中国银行深圳分行'
    // })

    /**
     * 获取视频的高度宽度
     */
    var query = wx.createSelectorQuery()
    // query.select('#video').boundingClientRect()
    // query.exec((res) => {
    //   if (res[0]){
    //     let videoHeigh = res[0].height
    //     this.setData({
    //       videoHeight: videoHeigh
    //     })
    //   }
    // })

    query.select('#home-img').boundingClientRect()
    query.exec((res) => {
      if (res[0]) {
        let videoHeigh = res[0].height
        this.setData({
          videoHeight: videoHeigh
        })
      }
    })
  },
  downloadImg: function(img){
    if (Object.prototype.toString.call(img) === "[object Array]"){ // 加载一组图片
      img.forEach((v, i) => {
        wx.downloadFile({
          url: v,
          success: function (res) {
            if (res.statusCode === 200) {
              img[i] = res.tempFilePath
            }
          },
          fail: () => { console.log(img + ':图片加载失败') }
        })
      })
      return ;
    }
    wx.downloadFile({
      url: img,
      success: function (res) {
        if (res.statusCode === 200) {
          img = res.tempFilePath
        }
      },
      fail: () => { console.log(img + ':图片加载失败') }
    })
  },
  downlodFile: function() {
    // this.downloadImg(this.data.logoImg)
    // this.downloadImg(this.data.gif76)
  },
  play: function() {
    this.videoContext.play()
    this.setData({
      isPlay: true
    })
  },
  pause: function() {
    this.videoContext.pause()
    this.setData({
      isPlay: false
    })
  },
  isPlay: function() {
    return this.data.isPlay
  },
  videoBindplay: function() {
    /**
     * 视频开始播放时触发
     * 如果视频循环播放，只会在第一次循环时触发事件
     */
    this.setData({
      isPlay: true
    })
  },
  videoBindPause: function() {
    /**
     * 视频暂停时触发
     */
    this.setData({
      isPlay: false
    })
  },
  easeIn: function (t, b, c, d) {
    return c * (t /= d) * t + b;
  },
  onInfoOne: function(){
    if (this.isPlay()){
      this.pause()
    } else {
      this.play()
    }
  },
  onInfoTwo: function(){
    
  },
  startRecord: function () {
    /**
     * 开始录音
     */
    var $this = this
    if (this.data.isRecording){
      return false
    }
    $this.setData({
      isRecording: true,
    });
    wx.startRecord({
      success: (res) => {
        if (res.tempFilePath) {
          console.log(res.tempFilePath)
            recorderSrc = res.tempFilePath
            $this.setData({
              recorderSrc: res.tempFilePath,
            });
            $this.saveVoice()
        } else {
          console.log("录音文件保存失败")
        }
      },
      fail: () => {
        console.log('开始录音失败')
      }
    });
    
  },
  stopRecord: function () {
    // console.log('stop')
    /**
     * 停止录音
     * 上传录音文件
     */
    var $this = this;
    $this.setData({
      isRecording: false,
    });
    wx.stopRecord({
      success: function (res) {
        console.log(res);
      },
      fail: (error)=> {
        console.log('停止录音失败:', error);
      }
    });
  },
  saveVoice: function () {
    //上传
    let $this = this;
    let src = recorderSrc;
    // console.log('录音文件地址是：'+src)
    if (!src) {
      wx.showToast({
        title: '没有听清',
        icon: 'loading',
        duration: 1000,
        mask: true
      });
      return false; 
    }

    wx.showToast({
      title: '请稍后',
      icon: 'loading',
      duration: 60000,
      mask: true
    });

    wx.uploadFile({
      url: hostUrl,
      filePath: src,
      name: "whisper",
      formData: {
        action: "sendVoice"
      },
      success: function(response) {
        wx.hideToast()
        let data = JSON.parse(response.data);
        if (data.code == '0') {
          if (!data.translate) {
            wx.showToast({
              title: '语音未识别',
              icon: 'loading',
              duration: 1000,
              mask: true
            });
            return false
          }
          // console.log('翻译成功：' + data.translate)
          // console.log('回复成功：' + data.message)
          let chatObjR = {
            right: data.translate,
            _time: 'tr-' + (new Date()).getTime(),
            _rightVoice: true
          }
          $this.data.recorderResponseMsg.push(chatObjR)
          $this.setData({
            recorderResponseMsg: $this.data.recorderResponseMsg,
            toView: chatObjR._time
          })
          let chatObjL
          if (data.url) {
            chatObjL = {
              teletext: true,
              title: data.message,
              img: data.image,
              url: data.url,
              disc: data.disc,
              left: data.message,
              _time: 'tl-' + (new Date()).getTime()
            }
          } else {
            chatObjL = {
              left: data.message,
              _time: 'tl-' + (new Date()).getTime()
            }
          }
          $this.data.recorderResponseMsg.push(chatObjL)
          $this.setData({
            recorderResponseMsg: $this.data.recorderResponseMsg,
            toView: chatObjL._time
          })
        }
        recorderSrc = false
      },
      fail: function(error) {
        recorderSrc = false
        console.log("获取录音文件失败")
      }
    })     
  },
  sendTextMessage() {
    this.setData({
      showBottom: false
    })
    // console.log(this.data.inputValue)
    let $this = this
    if (!this.data.inputValue) {
      wx.showToast({
        title: '请先输入文字内容',
        icon: 'none',
        duration: 1000,
        mask: true
      });
      return;
    }
    function clearInputValue() {
      // 清除文字内容
      $this.setData({
        inputValue: ''
      })
    }
    this.sendText(this.data.inputValue, clearInputValue)

  },
  sendText(text, callBack) {
    this.setData({
      showBottom: false
    })
    /**
     * 发送文字
     */
    // console.log(text)
    if (!text) {
      return
    }

    let $this = this
    let chatObjR = {
      right: text,
      _time: 'tr-' + (new Date()).getTime()
    }
    $this.data.recorderResponseMsg.push(chatObjR)
    $this.setData({
      recorderResponseMsg: $this.data.recorderResponseMsg,
      toView: chatObjR._time
    })

    wx.showLoading({
      title: '请稍后',
      mask: true
    })
    wx.request({
      url: hostUrl,
      data: {
        action: 'sendText',
        content: text,
      },
      success: (response) => {
        let data = response.data
        let chatObjL
        if (data.url) {
          chatObjL = {
            teletext: true,
            title: data.message,
            img: data.image,
            url: data.url,
            disc: data.disc,
            left: data.message,
            _time: 'tl-' + (new Date()).getTime()
          }
        } else {
          chatObjL = {
            left: data.message,
            _time: 'tl-' + (new Date()).getTime()
          }
        }
        $this.data.recorderResponseMsg.push(chatObjL)
        $this.setData({
          recorderResponseMsg: $this.data.recorderResponseMsg,
          toView: chatObjL._time
        })
        // 完成回调
        if (callBack) {
          callBack()
        }
      },
      fail: (error) => {
        console.log('输入文字聊天失败')
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  bindKeyInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  toggleVoiceOrKeyboard() {
    // voiceOrKeyboard: 'voice'; // 'voice' 语音输入， 'keyboard' 键盘
    if(this.data.voiceOrKeyboard === 'voice') {
      this.setData({
        voiceOrKeyboard: 'keyboard'
      })
    } else {
      this.setData({
        voiceOrKeyboard: 'voice'
      })
    }
  },
  navigateTo(event) {
    // console.log(event.currentTarget.dataset.url)
    let url = event.currentTarget.dataset.url
    wx.navigateTo({
      url: '../teletext/teletext?url='+url
    })
  },
  toggleActivites() {
    let status = !this.data.showActivites
    this.setData({
      showActivites: status
    })
  },
  inputFocus() {
    this.setData({
      showQuickInput: false,
      showActivites: false
    })
  },
  inputBlur() {
    this.setData({
      showQuickInput: true,
      showActivites: false
    })
  },
  bubble() {
    // console.log('冒泡')
    this.setData({
      showQuickInput: true,
      showActivites: false,
      showBottom: false
    })
  },
  cancelBubble() {
    // console.log('取消冒泡')
  },
  showBottomContent() {
    /**
     * 切换底部操作栏显示和隐藏
     */
    // console.log(this)
    let status = !this.data.showBottom
    this.setData({
      showBottom: status
    })
  },
  showQuickMes(event) {
    /**
     * 点击底部图文
     */
    // console.log(event.currentTarget.dataset)
    let item = event.currentTarget.dataset.item
    let keyWodrd = item.keyWord
    // console.log(keyWodrd)
    this.sendText(keyWodrd, hiddenBottom)
    let hiddenBottom = function() {
      this.setData({
        showBottom: false
      })
    }
  },
  audioPlay() {
    /**
     * 开始轮播
     */
    timer = setTimeout(() => {
      this.setData({
        autoplay: true,
        current: 1
      })
    }, 12000)
  }
})
