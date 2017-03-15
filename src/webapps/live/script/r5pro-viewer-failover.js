/* global document, Promise */
(function (window, document, red5pro) {
  'use strict';

  red5pro.setLogLevel('debug');
  var iceServers = window.r5proIce;
  var qAudioBW = window.r5proAudioBandwidth || -1;//50;
  var qVideoBW = window.r5proVideoBandwidth || -1;//256;

  var protocol = window.location.protocol;
  var port = window.location.port ? window.location.port : (protocol === 'http' ? 80 : 443);
  protocol = protocol.substring(0, protocol.lastIndexOf(':'));
  function getSocketLocationFromProtocol (protocol) {
    return protocol === 'http' ? {protocol: 'ws', port: 8081} : {protocol: 'wss', port: 8083};
  }

  var statusField = document.getElementById('status-field');
  var eventLogField = document.getElementById('event-log-field');
  var clearLogButton = document.getElementById('clear-log-button');

  var subscriber;
  var view;

  var desiredBandwidth = (function() {
    var bw;
    if (qAudioBW != -1 || qVideoBW != -1) {
      bw = {};
      if (qAudioBW != -1) {
        bw.audio = qAudioBW;
      }
      if (qVideoBW != -1) {
        bw.video = qVideoBW;
      }
    }
    return bw;
  })();
  var baseConfiguration = {
    host: window.targetHost,
    app: window.r5proApp,
    streamName: window.r5proStreamName,
    buffer: isNaN(window.r5proBuffer) ? 2 : window.r5proBuffer,
    iceServers: iceServers
  };
  var rtcConfig = {
    protocol: getSocketLocationFromProtocol(protocol).protocol,
    port: getSocketLocationFromProtocol(protocol).port,
    subscriptionId: 'subscriber-' + Math.floor(Math.random() * 0x10000).toString(16),
    bandwidth: desiredBandwidth
  };
  var rtmpConfig = {
    protocol: 'rtmp',
    port: 1935,
    width: '100%',
    height: '100%',
    embedWidth: window.r5proVideoWidth,
    embedHeight: window.r5proVideoHeight,
    mimeType: 'rtmp/flv',
    useVideoJS: false,
    swf: 'lib/red5pro/red5pro-subscriber.swf',
    swfobjectURL: 'lib/swfobject/swfobject.js',
    productInstallURL: 'lib/swfobject/playerProductInstall.swf'
  };
  var hlsConfig = {
    protocol: protocol,
    port: port,
    mimeType: 'application/x-mpegURL',
    swf: 'lib/red5pro/red5pro-video-js.swf',
    swfobjectURL: 'lib/swfobject/swfobject.js',
    productInstallURL: 'lib/swfobject/playerProductInstall.swf'
  };

  var targetViewTech = window.r5proViewTech;
  var playbackOrder = targetViewTech ? [targetViewTech] : ['rtc', 'rtmp', 'hls'];

  clearLogButton.addEventListener('click', function () {
    while (eventLogField.children.length > 1) {
      eventLogField.removeChild(eventLogField.lastChild);
    }
  });

  function onSubscribeStart (subscriber) {
    console.log('[subscriber]:: Subscriber started - ' + subscriber.getType());
  }

  function hasEstablishedSubscriber () {
    return typeof subscriber !== 'undefined';
  }

  function updateStatus (message) {
    statusField.innerText = message;
  }

  function addEventLog (eventLog) {
    var p = document.createElement('p');
    var text = document.createTextNode(eventLog);
    p.appendChild(text);
    eventLogField.appendChild(p);
  }

  function showSubscriberImplStatus (subscriber) {
    var type = subscriber ? subscriber.getType().toLowerCase() : undefined;
    switch (type) {
      case 'rtc':
        updateStatus('Using WebRTC-based Playback!');
        break;
      case 'rtmp':
      case 'livertmp':
      case 'rtmp - videojs':
        updateStatus('Failover to use Flash-based Playback.');
        break;
      case 'hls':
        updateStatus('Failover to use HLS-based Playback.');
        break;
      default:
        updateStatus('No suitable Publisher found. WebRTC, Flash and HLS are not supported.');
        break;
    }
  }

  function onSubscriberEvent (event) {
    var eventLog = '[Red5ProSubscriber] ' + event.type + '.';
    console.log(eventLog);
    addEventLog(eventLog);

    if (event.type === 'Subscribe.Metadata') {
      var value = event.data.orientation;
      if (subscriber.getType().toLowerCase() === 'hls' ||
          subscriber.getType().toLowerCase() === 'rtc') {
        var container = document.getElementById('video-holder');
        var element = document.getElementById('red5pro-subscriber-video');
        if (container) {
          container.style.height = value % 180 != 0 ? element.offsetWidth + 'px' : element.offsetHeight + 'px';
        }
      }
    }
  }

  function determineSubscriber () {
    return new Promise(function (resolve, reject) {
      var subscriber = new red5pro.Red5ProSubscriber();
      subscriber.on('*', onSubscriberEvent);

      var config = {
        rtc: Object.assign({}, baseConfiguration, rtcConfig),
        rtmp: Object.assign({}, baseConfiguration, rtmpConfig),
        hls: Object.assign({}, baseConfiguration, hlsConfig)
      };
      console.log('[viewer]:: Configuration\r\n' + JSON.stringify(config, null, 2));

      subscriber.setPlaybackOrder(playbackOrder)
        .init(config)
        .then(function (selectedSubscriber) {
          subscriber.off('*', onSubscriberEvent);
          showSubscriberImplStatus(selectedSubscriber);
          resolve(selectedSubscriber);
        })
        .catch(function (error) {
          subscriber.off('*', onSubscriberEvent);
          showSubscriberImplStatus(null);
          reject(error);
        });

    });
  }

  function preview (selectedSubscriber) {
    return new Promise(function (resolve, reject) {

      subscriber = selectedSubscriber;
      view = new red5pro.PlaybackView('red5pro-subscriber-video');
      view.attachSubscriber(subscriber);

      var type = selectedSubscriber.getType().toLowerCase();
      switch (type) {
        case 'rtc':
          resolve({
            subscriber: subscriber,
            view: view
          });
          break;
        case 'rtmp':
        case 'livertmp':
        case 'rtmp - videojs':
          var holder = document.getElementById('video-holder');
          holder.style.height = '405px';
          resolve({
            subscriber: subscriber,
            view: view
          });
          break;
        case 'hls':
          view.view.classList.add('video-js', 'vjs-default-skin');
          view.view.width = 600;
          view.view.height = 300;
          resolve({
            subscriber: subscriber,
            view: view
          });
          break;
        default:
          reject('View not available for ' + type + '.');
      }

    });
  }

  function subscribe () {
    return new Promise(function (resolve, reject) {
      subscriber.on('*', onSubscriberEvent);
      subscriber.play()
      .then(function () {
          onSubscribeStart(subscriber);
          resolve();
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }

  function unsubscribe () {
    return new Promise(function (resolve, reject) {
      if (hasEstablishedSubscriber()) {
        subscriber.stop()
          .then(function() {
            subscriber.off('*', onSubscriberEvent);
            resolve();
          })
          .catch(function (error) {
            reject(error);
          });
      }
      else {
        resolve();
      }
    });
  }

  function tearDownSubscriber () {
    if (view) {
      view.view.src = '';
      view = undefined;
    }
    if (subscriber) {
      subscriber.setView(undefined);
      subscriber = undefined;
    }
  }

  determineSubscriber()
    .then(preview)
    .then(subscribe)
    .catch(function (error) {
      var errorStr = typeof error === 'string' ? error : JSON.stringify(error, null, 2);
      console.error('[viewer]:: Error in subscribing to stream - ' + errorStr);
    });

  window.addEventListener('beforeunload', function () {
    unsubscribe()
      .then(function () {
        tearDownSubscriber();
      });
  });

  window.subscriberLog = function (message) {
    console.log('[RTMP SUBSCRIBER]:: ' + message);
  };

})(this, document, this.red5prosdk);

