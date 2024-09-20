const line = require('@line/bot-sdk');
const express = require('express'); 
const axios = require('axios');
const dotenv = require('dotenv'); 
const app = express();
const env = dotenv.config().parsed;



const lineConfig = {
    channelAccessToken: env.ACCESS_TOKEN,
    channelSecret: env.SECRET_TOKEN
  }
  
  const client = new line.Client(lineConfig)

  function apiSnap(inpStr) {
    return axios.post('https://apiportal-c01.scgjwd.com/api/1/rest/feed-master/queue/SCG/CBM_SCGL/SCG_Logistics_OMS_integration/linechatbot-big%20Task',
        { msg: inpStr },
        { headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer Nqg4s4w05FZPv9ipbbd7GkigiNacTuwJ' } }
    ).then(response => {
        console.log("IN Func, af call API");
        return response.data; // คืนค่าข้อมูลจาก API
    }).catch(error => {
        console.error(error); // จัดการข้อผิดพลาด
        throw error; // ส่งต่อข้อผิดพลาด
    });
}



  app.get('/' ,(req,res) =>{
    res.status(200).send("ต่อได้")
  })
  app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
    try {
      const events = req.body.events
      console.log('event>>>>>', events)
      return events.length > 0 ? await events.map(item => handleEvent(item)) : res.status(200).send("OK")
    } catch (error) {
      res.status(500).end()
    }
  });
  
  const handleEvent = async (event) => {
    try {
        const message = event.message.text; // รับข้อความจาก event
        const apiResponse = await apiSnap(message); // เรียกใช้ apiSnap และรอการตอบกลับ

        // ส่งข้อความตอบกลับไปยังผู้ใช้ LINE
        await client.replyMessage(event.replyToken, {
            type: 'text',
            text: apiResponse.msg || 'No response from API'
        });
    } catch (error) {
        console.error('Error handling event:', error);
        await client.replyMessage(event.replyToken, {
            type: 'text',
            text: 'An error occurred while processing your message.'
        });
    }
};


const PORT = 8080

  app.listen(PORT, () =>{
    console.log(`server runing on port [${PORT}]`)
  })