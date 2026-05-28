# Love Photo API (Vercel Serverless)

用于情侣网页的照片上传代理 API。密钥存于 Vercel 环境变量，不暴露在代码中。

## 部署步骤

### 1. 创建 Vercel 项目
- 访问 https://vercel.com
- 用 GitHub 登录
- 导入此目录（`love-photo-api`）
- 在项目设置 → Environment Variables 添加：
  - `COS_SECRET_ID` = `你的腾讯云 SecretId`
  - `COS_SECRET_KEY` = `你的腾讯云 SecretKey`
  - `COS_BUCKET` = `loveinteract-1437872748`（可选）
  - `COS_REGION` = `ap-chengdu`（可选）

### 2. 获取 API 地址
部署后 Vercel 会分配一个域名，如 `https://love-photo-api.vercel.app`。API 端点为：
```
POST https://love-photo-api.vercel.app/api/upload
```

### 3. 更新前端 HTML
将 `index.html` 中的 `UPLOAD_API` 常量改为你的 Vercel API 地址。

## 本地测试
```bash
cd love-photo-api
npm install
vercel dev
```

## 工作原理
1. 前端 POST 请求 `{ key: "photos/username/filename.jpg", contentType: "image/jpeg" }`
2. 后端生成 COS 预签名上传 URL（有效期 5 分钟）
3. 前端用该 URL 直传文件到 COS
4. 返回下载 URL 供前端保存到 Firebase

## 安全说明
- 密钥仅存于 Vercel 环境变量，GitHub 仓库中无密钥
- 预签名 URL 有时效性，无法复用
- CORS 仅允许白名单域名
