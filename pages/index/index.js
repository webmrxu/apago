//index.js
//获取应用实例
const app = getApp()
var whisper = require('../../vendor/index');
var config = require('../../config');

Page({
  data: {
    fps: 24, // 动画帧
    windowWidth: 0, // 屏幕宽度
    windowHeight: 0, // 屏幕高度
    videoHeight: 374, // video 元素高度，对应canvas元素高度
    hiddenCanvas: true,
    voiceHeight: 50,
    isRecording: false,
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
          videoHeight: 400,
          infoHeight: system.windowHeight - system.windowWidth * 400 / 375 - 50
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
    // if (this.data.videoHeight == 374){
    //   this.setData({
    //     videoHeight: 100
    //   })
    // } else {
    //   this.setData({
    //     videoHeight: 374
    //   })
    // }
    if (this.isPlay()){
      this.pause()
    } else {
      this.play()
    }
  },
  onInfoTwo: function(){
    // this.setData({
    //   videoHeight: 374
    // })
  },
  startRecord: function () {
    var $this = this
    $this.setData({
      isRecording: true,
    });
    whisper.startRecord({
      success(result) {
        $this.setData({
          isRecording: false,
        });
        console.log('录音成功:', result);
      },
      fail(error) {
        console.log('录音失败:', error);
      },
      process() {
        var rec = wx.createAnimation({
          duration: 1000,
          timingFunction: 'ease',
        }).opacity(1).step().opacity(0).step();
        var content = wx.createAnimation({
          duration: 1000,
          timingFunction: 'ease',
        }).opacity(0.4).step().opacity(1).step();

        $this.setData({
          duration: whisper.getRecordDuration(),
          recAnimation: rec.export(),
          contentAnimation: content.export(),
        });
      },
      compelete() {

      },
    });
  },
  stopRecord: function () {
    var $this = this;
    whisper.stopRecord({
      success(result) {
        console.log('SET TIMMER STOP:', result);
        $this.setData({
          isRecording: false,
        });
        console.log('停止录音:', result);
        //隔500毫秒后上传录音
        setTimeout(() => { $this.saveVoice('自动上传') }, 500);
      },
      fail(error) {
        console.log('停止录音失败:', error);
      }
    });
  },
  saveVoice: function (tag) {

    //上传
    var $this = this;

    var src = whisper.getRecordSrc();
    if (!src) {
      wx.showToast({
        title: '没有听清',
        icon: 'loading',
        duration: 1000
      });
      // return; 
    }
    wx.showToast({
      title: '正在上传...',
      icon: 'loading',
      duration: 60000
    });
    console.log(whisper.getSession)
    return
    whisper.uploadFile({
      url: config.service.whisperUrl + '/session=' + whisper.getSession().session + '&tag=' + tag + '&duration=' + $this.data.duration,
      filePath: src,
      name: 'whisper',
      success: function (res) {
        wx.hideToast();
      },
      fail: function (res) {
        console.log(res)
        wx.hideToast();
      },
      saved: function (res) {
        console.log(res);

        wx.showToast({
          title: res.translate,
          icon: 'info',
          duration: 1000
        });

        var explode = $this.selectComponent("#explode");
        var translate = res.pa;
        var words = Array();

        translate = translate.split(" ");
        console.log(translate)
        for (var i = 0; i < translate.length; i++) {
          words[i] = { content: translate[i], id: i }
        }
        console.log(words)

        explode.setData({
          mainx: "",
          content: words,
          opacity: 1
        });

      }
    });
  }
})
