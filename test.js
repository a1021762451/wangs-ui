const axios = require('axios')

const fs = require('fs')
const crypto = require('crypto')
const FormData = require('form-data')
const qqCookie =
  'uuid=144115351473100336; _qpsvr_localtk=0.7747212492948581; RK=vwkBGdH/XA; ptcz=b2950804771882f18a22fd3a4d7438f7fe309d85705c6016a505e4cc4e70afcc; p_uin=o1460741515; pt4_token=i0a7uu*nx91tvob9JaOXeKcfYJ8BJLFcKtAvlehu3cU_; p_skey=sVurzv0uLd8*WIjGNLBlM4GLcUO8SzJnbkblWzvc*0E_; uin=o1460741515; daid=823'
const qqCookieObj = parseCookie(qqCookie)
// #qq号列表
const qqList = [102762451]
// #一个qq遍历几次
const qqCount = 5
// # 小红书列表
let redList = []
// # 小红书分页
let redPage = 1
// # 取小红书第几项
let redIndex = 0
const imgName = 'temp.png'
init()
// 多个账号循环
async function init() {
  for (let i = 0; i < qqList.length; i++) {
    // todo 取信息
    for (let j = 0; j < qqCount; j++) {
      await oneOperation()
      await sleep(1000)
    }
  }
}
// 将cookie转成对象
function parseCookie(cookie) {
  return cookie.split('; ').reduce((acc, cur) => {
    const [key, value] = cur.split('=')
    acc[key] = value
    return acc
  }, {})
}
// 文件计算md5 hash值
function calculateMD5(filePath) {
  return new Promise((resolve, reject) => {
    // 获取文件长度
    fs.stat(filePath, (err, stats) => {
      if (err) {
        return reject(err)
      }
      const fileLen = stats.size

      // 创建 MD5 哈希对象
      const md5Hash = crypto.createHash('md5')
      const stream = fs.createReadStream(filePath)

      stream.on('data', (chunk) => {
        md5Hash.update(chunk)
      })

      stream.on('end', () => {
        const checksum = md5Hash.digest('hex')
        resolve({ checksum, file_len: fileLen, file_path: filePath })
      })

      stream.on('error', (err) => {
        reject(err)
      })
    })
  })
}
async function downloadImg(url) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  })
  const writer = fs.createWriteStream(imgName)
  response.data.pipe(writer)
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}
// 休眠函数
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 获取小红书列表
async function getRedList() {
  let response = await axios.post(
    'https://edith.xiaohongshu.com/api/sns/web/v1/search/notes',
    {
      keyword: '\u53E4\u7B5D',
      page: redPage,
      page_size: 20,
      search_id: '2eh1fnfra91hk21h2tcms',
      sort: 'general',
      note_type: 0,
      ext_flags: [],
      image_formats: ['jpg', 'webp', 'avif'],
    },
    {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'cache-control': 'no-cache',
        'content-type': 'application/json;charset=UTF-8',
        cookie:
          'abRequestId=a40db8f6-199a-5577-946e-d5ca476d021d; xsecappid=xhs-pc-web; a1=1954346cf6d09x74ykh9qtc928sk3wvqqjsiqkxhy50000322425; webId=67930d7eaa383bbda05761cb36e0ae2a; websectiga=3633fe24d49c7dd0eb923edc8205740f10fdb18b25d424d2a2322c6196d2a4ad; gid=yj24q4Kf2dAiyj24q4KSiVTCKf8jCW4vTxjAMxv9SjJYM328TqEhAA888qJJ4J280WSJYK0Y; web_session=040069b707a8fd5d6837f0058a354ba8e51d30; webBuild=4.58.0; acw_tc=0a4a468717406440379688772e51873224aa5aae9413e0ca6f37da422f2fbd; loadts=1740644039112',
        origin: 'https://www.xiaohongshu.com',
        pragma: 'no-cache',
        priority: 'u=1, i',
        referer: 'https://www.xiaohongshu.com/',
        'sec-ch-ua':
          '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'x-b3-traceid': 'b08e69f69bfc9e84',
        'x-mns':
          'awiZ/hmJH1G3D7OLKNEixZiFof2Tuxkvo437DBPRCxClWl5Jgo7HnhOGNp5obZbpyP9fHJ2ZnojSvFL1z00vDyO/HZ3hjdcZZ4J0QNghTHfedLv9elIdNyhkpyvte+XyKNNIIItcZRH/a8LlnJ+SHQ6buFFCDvm9HDNFSi54+bmY9+NwcJaaj/SM9X4aFZLgN44NQNlobvGI5+Rcm33eipf2dC18apw3IYxQFedoxfwoGtCfmH3+k0hRnD0lhRlGwDcaiJ5iE24ea6QEOe0p7NGhIG8bm8GIGjPfNbL2FEJoumXlt3LLPWI65xuGYphEKcI5JvvtLe980HNLzQuinIfYxyMB41lL2RT7vtQLL2eJZfMCad+Sa7thYt34P+f8pHhTmJ0d1QfdCZNPed0EbS5DE/Xf1koY41eQSOLTW73fI8vk124O23lp8Of9QnwyLhgtDnYigB1L8gJKuN0Q65RE07Hpy863/NBTHX/B4B15NSF2o46TLiEp3nw9',
        'x-s':
          'XYW_eyJzaWduU3ZuIjoiNTYiLCJzaWduVHlwZSI6IngyIiwiYXBwSWQiOiJ4aHMtcGMtd2ViIiwic2lnblZlcnNpb24iOiIxIiwicGF5bG9hZCI6IjI5MWY4NzU2NjFiMjM1MjhmMTQ1ODAyMjY1Yjg5M2Y3OTkxYWRhZTFiNDExNjc5MjY3MzMzMWFkNmZiMGU0YmNmM2NhYTJjZDU2MmUyM2M0YTYxYWU4MzAxNmQxNjMyNjQ2NWMwNjQ4OThmY2EzZWRmMjAwYTA5MzIyNzA3ZTRhYzEzNDg4OWVhZWIwMDQ4ZmQ4ZTZkNmJmYWViNTEyYmVlNmIwMmUyYjM3ZjVkMThhYTljMzk4MDhiMTk2ZDQyYjFmNDkwMzA0MmRhMzJjMGRmNzViZTc3NjdjZDQ5ZGM1YTFiMWU4NWE5Y2UwZjViMmU4MWY1MGU5YThiMmQyOGFlY2I2NGYzODZiNWJjYzk0YzMwZWVmZmQwYjdhZjQ0YzU1NzgzZTc4YzRkZmMxMTAxYzk0ZWVjMzY4ZjIwYTcyNDJjZWU3OGUyZTNlZjUzNzRkMzc4Y2U1ZTkzZjQzY2VlMmU3OTQ2ZmE4NTBkM2Q3YmVjNDI4MGVlOTBmMzQxNTIzYzc3OGVmYmFmNDdiNGZjZWYzZWUyM2FiODAyZjFjIn0=',
        'x-s-common':
          '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',
        'x-t': '1740644059782',
        'x-xray-traceid': 'caa33c42cb01cd2552a4394a5570f626',
      },
    }
  )
  response = response.data
  redList = response['data']['items']
}
// 获取小红书列表一项
async function getOneNote() {
  if (redIndex >= redList.length) {
    await getRedList()
    redPage += 1
  }
  redNote = redList[redIndex]
  redIndex += 1
  note_card = redNote['note_card']
  display_title = note_card['display_title']
  image_list = note_card['image_list']
  info_list = image_list[0]['info_list']
  img_url = info_list[1]['url']
  return {
    display_title,
    img_url,
  }
}
// 发布一次
async function oneOperation() {
  const { display_title, img_url } = await getOneNote()
  if (!display_title || !img_url) {
    console.log('没有获取到标题或图片')
    return
  }
  console.log('准备发布帖子:', display_title)
  // 下载图片 并保存在同级目录下， 先下载好，再继续操作
  await downloadImg(img_url)
  const imageInfo = await calculateMD5(imgName)
  console.log(imageInfo, 'imageInfo------------------')
  const controlInfo = await FileBatchControl(imageInfo)
  const fileInfo = await FileUpload(controlInfo)
  await PublishFeed({
    ...fileInfo,
    display_title,
  })
  return
}
// qq频道上传前校验
async function FileBatchControl(params) {
  let response = await axios.post(
    'https://pd.qq.com/api/c/pt/trpc.group_pro.feed_upload_oidb_proxy.UploadOidbProxy/FileBatchControl',
    {
      control_req: {
        0: {
          uin: '',
          token: {
            type: 4,
            data: '',
            appid: 823,
          },
          appid: 'qchannel_photo',
          checksum: params.checksum,
          check_type: 0,
          file_len: params.file_len,
          env: {
            refer: 'huodong',
            deviceInfo: 'h5',
            source: 5,
          },
          model: 0,
          biz_req: {
            sPicTitle: '',
            sPicDesc: '',
            sAlbumName: '',
            sAlbumID: '',
            iAlbumTypeID: 22,
            iBitmap: 0,
            iUploadType: 0,
            iUpPicType: 0,
            iBatchID: 1740651916309000,
            sPicPath: '',
            iPicWidth: 0,
            iPicHight: 0,
            iWaterType: 0,
            iDistinctUse: 0,
            mutliPicInfo: {},
            iNeedFeeds: 0,
            iUploadTime: new Date().getTime(),
            stExtendInfo: {},
            stExternalMapExt: {},
            mapExt: {},
          },
          session: '',
          asy_upload: 0,
        },
      },
    },
    {
      headers: {
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        cookie: qqCookie,
        origin: 'https://pd.qq.com',
        pragma: 'no-cache',
        priority: 'u=1, i',
        referer: 'https://pd.qq.com/g/pd52816251?subc=hot',
        'sec-ch-ua':
          '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        traceparent: '00-e4bba51cf5f6fffdc6e52c40d58cdeab-56f88a8f5b222bf8-01',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      },
    }
  )
  response = response.data
  session = response['data']['control_rsp']['0']['session']
  console.log(session, 'session------------------')
  return { session }
}
// 图片上传
async function FileUpload(params) {
  const form = new FormData()
  form.append('file', fs.createReadStream(imgName))
  form.append('appid', 'qchannel_photo')
  form.append('session', params.session)
  form.append('offset', '0')

  let response = await axios.post(
    'https://pd.qq.com/api/c/pt/trpc.group_pro.feed_upload_oidb_proxy.UploadOidbProxy/FileUpload',
    form,
    {
      headers: {
        ...form.getHeaders(),
        accept: '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'cache-control': 'no-cache',
        'content-type':
          'multipart/form-data; boundary=----WebKitFormBoundaryeQGtMdHNw0d4g7Lc',
        cookie: qqCookie,
        origin: 'https://pd.qq.com',
        pragma: 'no-cache',
        priority: 'u=1, i',
        referer: 'https://pd.qq.com/g/pd52816251?subc=hot',
        'sec-ch-ua':
          '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        traceparent: '00-88d385429762325e9e8d5ad49bcab699-29081b35966d74ed-01',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      },
    }
  )
  response = response.data
  sOriUrl = response['data']['biz_rsp']['sOriUrl']
  // console.log(sOriUrl, 'sOriUrl------------------')
  return { sOriUrl }
}
// 发布帖子
async function PublishFeed(params) {
  // 获取bkn
  const bkn = hi(qqCookieObj.p_skey)
  // console.log(bkn, 'bkn------------------')
  const data = {
    feed: {
      createTime: '1740653664',
      poster: {
        id: '144115220314800593',
      },
      channelInfo: {
        sign: {
          guild_id: '672147634042495265',
          channel_id: '680403829',
        },
      },
      contents: {
        contents: [
          {
            type: 1,
            text_content: {
              text: params.display_title,
            },
          },
        ],
      },
      images: [
        {
          task_id: '6786541517516755',
          width: 640,
          height: 853,
          picUrl: params.sOriUrl,
          picId: '6786541517516755',
          display_index: 0,
        },
      ],
      videos: [],
      title: {},
      feedType: 1,
    },
    client_content: {
      clientImageContents: [
        {
          task_id: '6786541517516755',
          url: params.sOriUrl,
        },
      ],
      clientVideoContents: [],
    },
  }
  data.jsonFeed = JSON.stringify(data.feed)
  let response = await axios.post(
    'https://pd.qq.com/qunng/guild/gotrpc/auth/trpc.qchannel.commwriter.ComWriter/PublishFeed',
    data,
    {
      params: {
        bkn: bkn,
      },
      headers: {
        accept: 'application/json',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        cookie: qqCookie,
        origin: 'https://pd.qq.com',
        pragma: 'no-cache',
        priority: 'u=1, i',
        referer: 'https://pd.qq.com/g/pd52816251?subc=hot',
        'sec-ch-ua':
          '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        traceparent: '00-0b4806715c4be90bab8a00f945466fec-ce228d995dd0b872-01',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'x-oidb': '{"uint32_service_type":10}',
        'x-qq-client-appid': '537246381',
      },
    }
  )
  response = response.data
  const error = response['error']
  if (error.code === 0) {
    console.log('发送成功')
    const publishLogStr = `${qqList[0]}---${params.display_title}`
    // 写入本地publishLog.txt
    fs.appendFileSync('./publishLog.txt', publishLogStr + '\n')
    // 删除图片，img.jpg
    fs.unlinkSync(imgName)
  }
}
// 获取bkn ,参数是cookie中p_skey
function hi(e) {
  if (typeof e != 'string' || e === '' || e === null) return ''
  let t = 5381
  for (let n = 0, i = e.length; n < i; ++n)
    t += (t << 5) + e.charAt(n).charCodeAt()
  return t & 2147483647
}
