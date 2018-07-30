//index.js
//获取应用实例
const app = getApp()
var whisper = require('../../vendor/index');
var config = require('../../config');
var recorderSrc = '';
var hostUrl = "https://anydata.22332008.com/info.php";
Page({
  data: {
    fps: 24, // 动画帧
    windowWidth: 0, // 屏幕宽度
    windowHeight: 0, // 屏幕高度
    screenHeight: 0, 
    bgTopHeight: 120,
    videoHeight: 0, // video 元素高度，对应canvas元素高度
    isRecording: false,
    recorderSrc: "", // 语音文件
    inputValue: "", // 输入值
    voiceOrKeyboard: 'voice', // 'voice' 语音输入， 'keyboard' 键盘
    voiceTitle: "按住 说话",
    stopVoiceTitle: '松开 结束',
    toView: "",
    recorderResponseMsg: [
      {
        right: 'helo hel helo heloh eloh elohelo oh helo helo elohel ohelohel ohelohelohelo'
      },
      {
        left: true,
        teletext: true,
        title: '中国银行深圳分行',
        img: 'https://anydata.22332008.com/mini/examples/imgs/top-title.png',
        url: 'https://mp.weixin.qq.com/s/zYqXbQjdBG09bC4kXFvZiw',
        des: '中国银行深圳分行充值大优惠，手机话费充值 7.6 折'
      }
    ],
    isPlay: false, // 视频是否播放中
    ctx: {},
    videoContext: {},
    currentTime: 0, // 当前视频播放的进度
    logoImg: 'https://www.apago.top/video/logos.png', // logo图片资源地址
    gif76: ['https://www.apago.top/examples/imgs/76-01.jpg', 
      'https://www.apago.top/examples/imgs/76-02.jpg',
      'https://www.apago.top/examples/imgs/76-03.jpg',
      'https://www.apago.top/examples/imgs/76-04.jpg'],
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
    wx.setNavigationBarTitle({
      title: '中国银行深圳分行'
    })

    /**
     * 获取视频的高度宽度
     */
    var query = wx.createSelectorQuery()
    query.select('#video').boundingClientRect()
    query.exec((res) => {
      
      let videoHeigh = res[0].height
      this.setData({
        videoHeight: videoHeigh
      })
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
    console.log('录音文件地址是：'+src)
    if (!src) {
      wx.showToast({
        title: '没有听清',
        icon: 'loading',
        duration: 1000
      });
      return false; 
    }

    wx.showToast({
      title: '正在上传...',
      icon: 'loading',
      duration: 60000
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
              duration: 1000
            });
            return false
          }
          console.log('翻译成功：' + data.translate)
          console.log('回复成功：' + data.message)
          let chatObjR = {
            right: data.translate,
            _time: 'tr-' + (new Date()).getTime()
          }
          $this.data.recorderResponseMsg.push(chatObjR)
          $this.setData({
            recorderResponseMsg: $this.data.recorderResponseMsg,
            toView: chatObjR._time
          })
          let chatObjL = {
            left: data.message,
            _time: 'tl-' + (new Date()).getTime()
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
    // console.log(this.data.inputValue)
    let $this = this
    if (!this.data.inputValue) {
      wx.showToast({
        title: '请先输入文字内容',
        icon: 'none',
        duration: 1000
      });
      return;
    }
    let chatObjR = {
      right: this.data.inputValue,
      _time: 'tr-' + (new Date()).getTime()
    }
    $this.data.recorderResponseMsg.push(chatObjR)
    $this.setData({
      recorderResponseMsg: $this.data.recorderResponseMsg,
      toView: chatObjR._time
    })

    wx.showLoading({
      title: '加载中'
    })
    wx.request({
      url: hostUrl,
      data:{
        action: 'sendText',
        content: this.data.inputValue,
      },
      success: (response) => {
        console.log(response)
        let data = response.data
        let chatObjL
        if (data.url) {
          chatObjL = {
            teletext: true,
            title: data.message,
            img: data.image,
            url: data.url,
            des: '中国银行深圳分行充值大优惠，手机话费充值 7.6 折',
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
  }
})
