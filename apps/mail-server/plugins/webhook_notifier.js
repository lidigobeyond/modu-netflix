'use strict';

const http = require('http');
const https = require('https');
const { Writable } = require('stream');
const { URL } = require('url');

exports.register = function () {
  // data_post: 메시지 수신 완료 후 본문을 notes에 저장
  this.register_hook('data_post', 'capture_body');
  // queue: notes에서 꺼내 웹훅 전송 후 OK 반환
  this.register_hook('queue', 'send_webhook');
};

exports.capture_body = function (next, connection) {
  const txn = connection.transaction;
  if (!txn) return next();

  const chunks = [];
  const collector = new Writable({
    write(chunk, _enc, cb) {
      chunks.push(chunk);
      cb();
    },
  });

  collector.on('finish', () => {
    txn.notes.raw_body = Buffer.concat(chunks).toString('utf8');
    next();
  });

  collector.on('error', (err) => {
    this.logerror(`capture_body stream error: ${err.message}`);
    next();
  });

  txn.message_stream.pipe(collector);
};

exports.send_webhook = function (next, connection) {
  const txn = connection.transaction;
  if (!txn) return next(OK);

  const webhookUrl = (
    process.env.WEBHOOK_URL ||
    this.config.get('webhook_notifier.ini', 'ini').main?.url ||
    ''
  ).trim();

  if (!webhookUrl) {
    this.logerror('No WEBHOOK_URL configured');
    return next(OK);
  }

  const from = txn.mail_from ? txn.mail_from.address() : '';
  const to = txn.rcpt_to ? txn.rcpt_to.map((r) => r.address()) : [];
  const subject = txn.header.get('Subject') || '';
  const rawBody = txn.notes.raw_body || '';

  const payload = JSON.stringify({ from, to, subject, rawBody });

  let url;
  try {
    url = new URL(webhookUrl);
  } catch (e) {
    this.logerror(`Invalid WEBHOOK_URL: ${webhookUrl}`);
    return next(OK);
  }

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  const transport = url.protocol === 'https:' ? https : http;
  const req = transport.request(options, (res) => {
    this.loginfo(`Webhook delivered: HTTP ${res.statusCode}`);
    next(OK);
  });

  req.on('error', (err) => {
    this.logerror(`Webhook delivery failed: ${err.message}`);
    next(OK);
  });

  req.write(payload);
  req.end();
};
