
var noop = function noop() {};
var recorder = {
};

/***
 * @class
 * 表示请求过程中发生的异常
 */
var RecordError = (function () {
    function RecordError(message) {
        Error.call(this, message);
        this.message = message;
    }

    RecordError.prototype = new Error();
    RecordError.prototype.constructor = RecordError;

    return RecordError;
})();

function startRecord(options) {

    var callProcess = options.process;
    var callSuccess = options.success || noop;
    var callFail = options.fail || noop;
    var callComplete = options.complete || noop;
    
    if (typeof options !== 'object') {
        var message = '请求传参应为 object 类型，但实际传了 ' + (typeof options) + ' 类型';
        throw new RecordError(message);
    }

    if (typeof callProcess !== 'function') {
      var message = '刷新Ui函数不存在';
      throw new RecordError(message);
    }

    // 初始化录音器
    recorder = {
      maxDuration: 60,
      duration: 0,
      src: null,
      timer: null,
    };    

    //设置定时器
    recorder.timer = setInterval(function(){
        recorder.duration += 1;
        callProcess.call(this, null);
        if (recorder.duration >= recorder.maxDuration && recorder.timer){
            clearInterval(recorder.timer);
        }
    }, 1000);


    //开始录音
    wx.startRecord({
      success: function (res) {
            if (res.tempFilePath) {
                recorder.src = res.tempFilePath;
                //callSuccess.apply(null, arguments);
                callSuccess.apply(null, arguments);
                return;
            }else{
                message = '录音文件保存失败';
                var error = new RecordError(message);
                callFail.apply(null,error);
            }
        },

      fail: callFail,
      complete: callComplete,
    });
};


function stopRecord(options) {

    var callSuccess = options.success || noop;
    var callFail = options.fail || noop;
    var callComplete = options.complete || noop;

    if (typeof options !== 'object') {
      var message = '请求传参应为 object 类型，但实际传了 ' + (typeof options) + ' 类型';
      throw new RecordError(message);
    }

    wx.stopRecord({
      success: function (res) {
            if (recorder.timer){
              console.log("clear timer");
                clearInterval(recorder.timer);
            }
            callSuccess.apply(null, arguments);
        },
        fail: callFail,
        complete: callComplete,
    });

};

function getRecordDuration(){
    return recorder.duration || 0;
}

function getRecordSrc(){
    return recorder.src || null;
}

module.exports = {
    RecordError: RecordError,
    startRecord: startRecord,
    stopRecord: stopRecord,
    getRecordDuration: getRecordDuration,
    getRecordSrc: getRecordSrc,
};