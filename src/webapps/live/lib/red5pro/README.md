<h3 align="center">
  <img src="assets/red5pro_logo.png" alt="Red5 Pro Logo" />
</h3>
<p align="center">
  <a href="#publisher">publisher</a> &bull;
  <a href="#subscriber">subscriber</a> &bull;
  <a href="#shared-object">shared object</a>
</p>

---

# Red5 Pro HTML5 SDK
> The **Red5 Pro HTML5 SDK** allows you to integrate live streaming video into your desktop and mobile browser.

* [Quickstart](#quickstart)
  * [Installation](#installation)
* [Requirements](#requirements)
* [Usage](#usage)
  * [Publisher](#publisher)
    * [WebRTC](PUBLISHER_README.md#webrtc)
    * [Flash/RTMP](PUBLISHER_README.md#flash)
    * [Auto Failover](PUBLISHER_README.md#auto-failover-and-order)
    * [Lifecycle Events](PUBLISHER_README.md#lifecycle-events)
  * [Subscriber](#subscriber)
    * [WebRTC](SUBSCRIBER_README.md#webrtc)
    * [Flash/RTMP](SUBSCRIBER_README.md#flash)
    * [HLS](SUBSCRIBER_README.md#hls)
    * [Auto Failover](SUBSCRIBER_README.md#auto-failover-and-order)
    * [Lifecycle Events](SUBSCRIBER_README.md#lifecycle-events)
  * [Shared Object](#shared-object)
    * [Usage](SHARED_OBJECT_README.md#shared-object-usage)
    * [Lifecycle Events](SHARED_OBJECT_README.md#lifecycle-events-shared-object)
* [Contributing](#contributing)

## Quickstart
To begin working with the *Red5 Pro HTML5 SDK* in your project:

### Installation
In a browser:  
[download the latest release](https://account.red5pro.com/download)

```html
<!-- *Recommended WebRTC Shim -->
<script src="http://webrtc.github.io/adapter/adapter-latest.js"></script>
<!-- Red5 Pro SDK -->
<script src="lib/red5pro/red5pro-sdk.min.js"></script>
<!-- video container -->
<div id="video-container">
  <video id="red5pro-subscriber" width="640" height="480" controls autoplay></video>
</div>
<!-- Create subscriber -->
<script>
  (function(red5pro) {

    var rtcSubscriber = new red5pro.RTCSubscriber();
    var viewer = new red5pro.PlaybackView();
    viewer.attachSubscriber(rtcSubscriber);

    rtcSubscriber.init({
      protocol: 'ws',
      host: 'localhost',
      port: 8081,
      app: 'live',
      streamName: 'mystream',
      iceServers: [{urls: 'stun:stun2.l.google.com:19302'}]
    })
    .then(function() {
      console.log('Playing!');
    })
    .catch(function(err) {
      console.log('Something happened. ' + err);
    });

  }(window.red5prosdk));
</script>
```

# Requirements
The **Red5 Pro HTML SDK** is intended to communicate with a [Red5 Pro Server](https://www.red5pro.com/), which allows for broadcasting and consuming live streams utilizing [WebRTC](https://developer.mozilla.org/en-US/docs/Web/Guide/API/WebRTC) and other protocols, including [RTMP](https://en.wikipedia.org/wiki/Real_Time_Messaging_Protocol) and [HLS](https://en.wikipedia.org/wiki/HTTP_Live_Streaming).

As such, you will need a distribution of the [Red5 Pro Server](https://www.red5pro.com/) running locally or accessible from the web, such as [Amazon Web Services](https://www.red5pro.com/docs/server/awsinstall/).

> **[Click here to start using the Red5 Pro Server today!](https://account.red5pro.com/login)**

# Usage
This section describes using the **Red5 Pro HTML SDK** browser install to create sessions for a [Publisher](#publisher) and a [Subscriber](#subscriber).

## Publisher
Please refer to the [Publisher Readme](PUBLISHER_README.md) for information about setting up a broadcast session.

## Subscriber
Please refer to the [Subscriber Readme](SUBSCRIBER_README.md) for information about setting up a subscriber session.

# Shared Object
Please refer to the [SharedObject Documentation](SHARED_OBJECT_README.md) for information about using SharedObjects in both Publishers and Subscribers.

# Contributing
> Please refer to the [Contributing Documentation](CONTRIBUTING.md) to learn more about contributing to the development of the Red5 Pro HTML SDK.
