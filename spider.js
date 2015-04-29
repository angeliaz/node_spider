// include the modules needed
var express = require('express');
var cheerio = require('cheerio');
var superagent = require('superagent');
var eventproxy = require('eventproxy');
var parse = require('superagentparse');
var url = require('url');
var fs = require('fs');
var mysql = require('mysql');

// mysql database connect
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '***',
    database:'staff',
    port: 3307
});
conn.connect();

var url = 'http://dajia.qq.com/';

superagent.get(url)
	.parse(parse('utf-8'))
	.end(function(err, data) {

		if(err) return next(err);

		var pageUrls = [], pageData = [];
		var $ = cheerio.load(data.text);

		$('#lightBlogList .item').each(function (idx, element) {
			var $element = $(element);
			var $title = $element.find('.clear a');

			var href = $title.attr('href');
			var title = $title.text();
			var description = $element.find('.con p').text();
			var author = $element.find('.author').text();
			var time = $element.find('.time').text();
			var readCount = parseInt($element.find('.read .num').text().match(/\d+/)[0]);

			var obj = {
				url: href,
				title: title,
				description:description,
				author: author,
				readCount: readCount,
				createTime: time
			};

			pageUrls.push(href);
			pageData.push(obj);
		});

		// 数据写到文件
		// {flag: 'a'}：文件有内容，则追加
		// fs.writeFile('./test.js', JSON.stringify(pageData), {flag: 'a'}, function (err) {});
		
		// 数据写到数据库
		var i = 0, len = pageData.length;
		for(; i < len; i++) {
			var item = pageData[i];
			var insertSql = 'insert into document(title, url, description, author, readCount) values("'+item.title+'", "'+encodeURIComponent(item.url) +'", "'+item.description+'", "'+item.author+'", '+item.readCount+')';
			/*conn.query(insertSql, function (err, res) {
				if(err) console.log(err);
			});*/
		}

		conn.query('select * from document limit 5', function (err, res) {
			console.log(res);
		});

		conn.end();
		
	});
