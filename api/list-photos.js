// Vercel redeploy trigger: 2026-05-29
const COS = require('cos-nodejs-sdk-v5');
const { createHash } = require('crypto');

module.exports = async (req, res) => {
  // CORS
  const origin = req.headers.origin || '';
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: '仅支持 GET 请求' });
  }

  const prefix = req.query.prefix || 'photos/';

  const cos = new COS({
    SecretId: process.env.COS_SECRET_ID,
    SecretKey: process.env.COS_SECRET_KEY,
  });

  const bucket = process.env.COS_BUCKET || 'loveinteract-1437872748';
  const region = process.env.COS_REGION || 'ap-chengdu';

  try {
    const data = await new Promise((resolve, reject) => {
      cos.getBucket({
        Bucket: bucket,
        Region: region,
        Prefix: prefix,
        MaxKeys: 500,
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    const photos = (data.Contents || [])
      .filter(item => !item.Key.endsWith('/') && item.Size > 0)
      .map(item => {
        const downloadUrl = `https://${bucket}.cos.${region}.myqcloud.com/${item.Key}`;
        // Generate a stable ID from the key
        const id = createHash('md5').update(item.Key).digest('hex').slice(0, 16);
        return {
          id,
          key: item.Key,
          url: downloadUrl,
          lastModified: item.LastModified,
          size: item.Size,
          date: item.LastModified ? item.LastModified.slice(0, 10) : ''
        };
      })
      .sort((a, b) => b.lastModified.localeCompare(a.lastModified));

    res.status(200).json({ photos });
  } catch (err) {
    res.status(500).json({ error: err.message || '获取照片列表失败' });
  }
};