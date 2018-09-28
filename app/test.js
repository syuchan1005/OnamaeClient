const net = require('net');
const tls = require('tls');


const setting = {
  ipInterval: 720, // 12 hours
  update: {
    host: 'ddnsclient.onamae.com',
    port: 65010,
  },
  check: {
    host: 'ddnsclient.onamae.com',
    port: 65000,
  },
  $data: {
    ip: '0.0.0.0',
    ipUpdate: '2018/99/99 99:99:99',
  },
};

const task = {
  user: {
    id: '7450743',
    pass: 'SYUu1005',
  },
};

const tlsSocket = tls.connect(setting.update.port, setting.update.host);
tlsSocket.on('secureConnect', () => {
  tlsSocket.setEncoding('utf8');
  let count = 0;
  tlsSocket.on('data', (str) => {
    console.log(str);
    if (count === 0) {
      count += 1;
    } else {
      tlsSocket.end();
    }
  });
  // tlsSocket.write(`\nLOGIN\nUSERID:${task.user.id}\nPASSWORD:${task.user.pass}\n.`);
  tlsSocket.write(`\nLOGOUT\n.`);
});
