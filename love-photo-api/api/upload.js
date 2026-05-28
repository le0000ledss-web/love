const COS = require('cos-nodejs-sdk-v5');

// 允许的来源域名
const ALLOWED_ORIGINS = [
  'https://le0000ledss-web.github.io',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

module.exports = async (req, res) => {
  // CORS
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' });
  }

  const { key, contentType } = req.body || {};
  if (!key || !contentType) {
    return res.status(400).json({ error: '缺少 key 或 contentType' });
  }

  const cos = new COS({
    SecretId: process.env.COS_SECRET_ID,
    SecretKey: process.env.COS_SECRET_KEY,
  });

  const bucket = process.env.COS_BUCKET || 'loveinteract-1437872748';
  const region = process.env.COS_REGION || 'ap-chengdu';

  try {
    // 生成预签名上传 URL（有效期 5 分钟）
    const uploadUrl = cos.getObjectUrl({
      Bucket: bucket,
      Region: region,
      Key: key,
      Sign: true,
      Method: 'PUT',
      Expires: 300,
      Headers: { 'Content-Type': contentType },
    });

    // 下载 URL（公开访问）
    const downloadUrl = `https://${bucket}.cos.${region}.myqcloud.com/${key}`;

    res.status(200).json({ uploadUrl, downloadUrl });
  } catch (err) {
    res.status(500).json({ error: err.message || '生成上传 URL 失败' });
  }
};
