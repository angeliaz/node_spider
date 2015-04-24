// include the modules needed
var express = require('express');
var cheerio = require('cheerio');
var superagent = require('superagent');
var eventproxy = require('eventproxy');
var parse = require('superagentparse');
var url = require('url');

// begin to excute here
var ep = new eventproxy();
var app = express();
var originUrl = 'http://www.qq.com/';

// 抓取网页内容
superagent
	.get(originUrl)
    .end(function (err, data) {
		if (err) {
			return next(err);
		}

        var topicUrls = [];
      	var $ = cheerio.load(data.text);
      
	    $('#today .fleft').each(function (idx, element) {
	        var $element = $(element);
	        var href = $element.attr('href');
	        topicUrls.push(href);
	    });

	    // 异步并发
	    ep.after('topic_html', topicUrls.length, function(topics) {

			topics = topics.map(function (topicPair) {
				var topicUrl = topicPair[0];
				var topicHtml = topicPair[1];
				var $ = cheerio.load(topicHtml);
				return ({
					title: $('title').text().trim(),
					href: topicUrl,
					commit: $('title').text()
				})
			});

			console.log('final:');
			console.log(topics);

		});

		topicUrls.forEach(function (topicUrl) {
			superagent.get(topicUrl)
				// here is the key, can be also: 
  				// CP932, CP936, CP949, CP950, GB2313, GBK, GB18030, Big5, Shift_JIS, EUC-JP
				.parse(parse('gbk'))
				.end(function (err, res) {
					console.log('fetch ' + topicUrl + ' successful');
					ep.emit('topic_html', [topicUrl, res.text]);
				});
		});

});