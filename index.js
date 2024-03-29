'use strict';

// Imports dependencies and set up http server
const request = require('request'),
  PAGE_ACCESS_TOKEN = 'EAAefv3Tk6usBAFHxV9SNO9MZCmeI0ZCBRPADt8P8GCJK0TA3rMQ55FyyDTxusfd7zY9qVvpy2BfnZBb2xMAgjEvjqyjRg1Y5LO6YKgpV09ZBha7DqiMGyftx7rH5ZCW0wZCqZBEbXL1EGD1RHyFZBxyLDtJLLZBJvQbaZADCZAg2VkOewZDZD',
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express(),
  VERIFY_TOKEN = 'kieuchicong'

app.use(bodyParser.urlencoded({ "extended": false }));
app.use(bodyParser.json());

// Sets server port and logs message on success
const server = app.listen(process.env.PORT || 9000, () => console.log('webhook is listening'));

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {

  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {

      try {

        // Gets the body of the webhook event

        console.log('--->entry:', JSON.stringify(entry));
        console.log('--->body:', JSON.stringify(body))
        let webhook_event;
        if (entry.messaging == undefined) {
          webhook_event = entry.standby[0];
        }
        else {
          webhook_event = entry.messaging[0];
        }

        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);

        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message);
        } else if (entry.messaging[0].postback) {
          handlePostback(sender_psid, entry.messaging[0].postback);
        }
      } catch (error) {
        console.log('--->error:', error);
      }

    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
  console.log("hello, my name is app");

  // Your verify token. Should be a random string.

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }


});


// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;

  // Checks if the message contains text
  let text = JSON.stringify(received_message.text);
  if (text.includes('HELLO')|| text.includes('hi')|| text.includes('HI') || text.includes('chào') || text.includes('hello') || text.includes('chào bot') || text.includes('muốn') || text.includes('đặt') || text.includes('món')|| text.includes('mua') || text ==='đặt món' || text.includes('ĐẶT MÓN') || text.includes('dat mon') ){
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [
            {
              "title": "Bạn muốn đặt món đúng không?",
              "subtitle": "",
              "buttons": [{
                "type": "postback",
                "title": "OK",
                "payload": "NLP_OK",
              },
              {
                "type": "postback",
                "title": "No",
                "payload": "NLP_NO",
              }

              ]
            }
          ]
        }
      }
    }
  }  
  
  else if (received_message.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    response = {
      "text": `You sent the message: "${received_message.text}"`
    }
  } else if (received_message.attachments) {

    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "list",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  }
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  }
  if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }
  if (payload === 'NLP_NO') {
    response = { "text": "Không sao đâu\n Nếu cần hãy gõ \"đặt món\" để gọi tôi nhé" }
  }


  if (payload === 'choose_store') {
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [
            {
              "title":"Welcome!",
              "image_url":"http://icons.iconarchive.com/icons/paomedia/small-n-flat/256/shop-icon.png",
              "subtitle":"We have the right hat for everyone.",
              "default_action": {
                "type": "web_url",
                "url": "https://www.facebook.com/messages/t/kieuchiconguet",
                "messenger_extensions": true,
                "webview_height_ratio": "tall",
                "fallback_url": "https://www.facebook.com/kieuchiconguet"
              },
              "buttons":[
                {
                  "type":"web_url",
                  "url":"https://www.facebook.com/kieuchiconguet",
                  "title":"View Website"
                },{
                  "type":"postback",
                  "title":"Start Chatting",
                  "payload":"DEVELOPER_DEFINED_PAYLOAD"
                }              
              ]      
            },
            {
              "title": "Shopee",
              "subtitle": "",
              "image_url": "https://image.flaticon.com/icons/png/512/227/227324.png",
              "buttons": [{
                "type": "postback",
                "title": "Chọn món ăn",
                "payload": "choose_dish",
              }

              ]
            },
            {
              "title": "Rubic 8",
              "subtitle": "",
              "image_url": "https://image.flaticon.com/icons/png/512/227/227324.png",
              "buttons": [{
                "type": "postback",
                "title": "Chọn món ăn",
                "payload": "choose_dish",
              }
              ]
            },
            {
              "title": "Mr Cây",
              "subtitle": "",
              "image_url": "https://image.flaticon.com/icons/png/512/227/227324.png",
              "buttons": [{
                "type": "postback",
                "title": "Chọn món ăn",
                "payload": "choose_dish",
              }

              ]
            },
            {
              "title": "Phủi Quán",
              "subtitle": "",
              "image_url": "https://image.flaticon.com/icons/png/512/227/227324.png",
              "buttons": [{
                "type": "postback",
                "title": "Chọn món ăn",
                "payload": "choose_dish",
              }
              ]
            },
            {
              "title": "Cơm ngon mẹ làm",
              "subtitle": "",
              "image_url": "https://image.flaticon.com/icons/png/512/227/227324.png",
              "buttons": [{
                "type": "postback",
                "title": "Chọn món ăn",
                "payload": "choose_dish",
              }

              ]
            }
          ]
        }
      }
    }
  }


  if (payload === 'start' || payload ==='NLP_OK') {
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [
            {
              "title": "Chào mừng bạn đã đến với \nhệ thống đặt đồ ăn VNU FOOD BOOKING :v",
              "subtitle": "",
              "image_url": "https://image.flaticon.com/icons/png/512/227/227324.png",
              "buttons": [{
                "type": "postback",
                "title": "Chọn món ăn",
                "payload": "choose_dish",
              },
              {
                "type": "postback",
                "title": "Chọn cửa hàng",
                "payload": "choose_store",
              }

              ]
            }
          ]
        }
      }
    }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);

}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v3.3/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
      console.log('res:', res);
      console.log('body_req:',body);
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

setInterval(() => server.getConnections(
  (err, connections) => console.log(`${connections} connections currently open`)
), 1000);

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

let connections = [];

server.on('connection', connection => {
  connections.push(connection);
  connection.on('close', () => connections = connections.filter(curr => curr !== connection));
});

function shutDown() {
  console.log('Received kill signal, shutting down gracefully');
  server.close(() => {
    console.log('Closed out remaining connections');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  connections.forEach(curr => curr.end());
  setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}