const express = require('express');
const app = express();
const axios = require('axios');
var cors = require('cors')

const port = 8081;



app.listen(port, () => {
  console.log('Listening on port ' + port);
});

app.use(cors({
    origin: '*'
}));

app.use(express.static(process.cwd()+"/yelp-business/dist/yelp-business/"));

app.get('/', (req,res) => {
    res.sendFile(process.cwd()+"/yelp-business/dist/yelp-business/index.html")
  });

var yelp_api_url_business = {
    'base_request': 'https://api.yelp.com/v3/businesses',
    'Bearer Token': 'b8XpVjk4LvcP1DO19qRsgFVnBpuc2zNYF2aIhIRz4WmpnSQlfac6nm1kJGwap_X1oFzEkk8iJdU6lBQ4JRoRBZHdh7arNmmRcrTB_p9j29jMF4e_fTPRYB1IBJknY3Yx'
}

var yelp_api_url_autocomplete = {
    'base_request': 'https://api.yelp.com/v3/autocomplete',
    'Bearer Token': 'b8XpVjk4LvcP1DO19qRsgFVnBpuc2zNYF2aIhIRz4WmpnSQlfac6nm1kJGwap_X1oFzEkk8iJdU6lBQ4JRoRBZHdh7arNmmRcrTB_p9j29jMF4e_fTPRYB1IBJknY3Yx'
}

google_location_api = {
    'base_request': 'https://maps.googleapis.com/maps/api/geocode/json',
    'key': 'AIzaSyDlV8mjvdpeGNKyQSMrV5-T6yQvsvPGm34'
}

ipinfo_get_url = {
        'base_request':'https://ipinfo.io',
        'token': '07d5fd93925771'
}

var one_mile_to_km = 1.60934
var max_businesses = 10

app.get('/', (req, res) => res.send('My first Node API!'));

function sendReposnse(resp, dictInput){
    resp.setHeader('Content-Type', 'application/json');
    return resp.json(dictInput);
}

function filterUsefulBuisnessInfo(resp) {
    var info_dict = {}

    //id
    info_dict['id'] = resp['id']

    //Status
    if (resp.hasOwnProperty('hours')) {
        if  (resp['hours'][0]['is_open_now'] == false) {
            info_dict['status'] = 'Closed';
        } else {
            info_dict['status'] = 'Open Now';
        }
    }

    //Address
    var loc = resp['location']
    info_dict["address"] = loc['display_address'].join(", ")


    //Category
    var catLength = resp['categories'].length;
    var categories = []
    for (var i=0; i <catLength; i++) 
        categories.push(resp['categories'][i]['title']);
    info_dict['category'] = categories.join(' | ');

    //Phone Number
    info_dict['phone_no'] = resp['phone'];

    //Price 
    info_dict['price'] = resp['price'];

    //Photos
    info_dict['photos'] = resp['photos'];

    //More Info
    info_dict['info_url'] = resp['url'];

    //Coordinates
    info_dict['coordinates'] = resp['coordinates'];

    return info_dict
}

app.get('/get_autocomplete_words/', async function(req, res) {
    var final_response = {"message": "", "data":[]};
    var params = req.query;
    var keyword = params['kw']
    var url = yelp_api_url_autocomplete['base_request'].concat('?text=', keyword);
    var headers = {
    'Authorization': 'Bearer '.concat(yelp_api_url_autocomplete['Bearer Token'])};

    var resp = await axios.get(url, {'headers': headers});
    if (resp.status != 200) {
        final_response['message'] = 'invalid response from yelp api, status code from yelp api: '.concat(resp.status.toString());
        res.setHeader('Content-Type', 'application/json');
        return sendReposnse(res, final_response);
    }

    var respData = resp.data['terms'];
    var respDataLen = respData.length;
    dataToSend = [];
    for(var i=0; i<respDataLen; i++) {
        dataToSend.push(respData[i]['text']);
    }
    final_response['data'] = dataToSend;
    return sendReposnse(res, final_response);
})

app.get('/get_business_info/', async function(req, res) {
    var final_response = {"message": "", "data":[]};
    var params = req.query
    var business_id = params['id']
    var url = yelp_api_url_business['base_request'].concat('/', business_id.toString());
    var headers = {
    'Authorization': 'Bearer '.concat(yelp_api_url_business['Bearer Token'])};

    var resp = await axios.get(url, {'headers': headers});
    if (resp.status != 200) {
        final_response['message'] = 'invalid response from yelp api, status code from yelp api: '.concat(resp.status.toString());
        res.setHeader('Content-Type', 'application/json');
        return sendReposnse(res, final_response);
    }
    var respData = filterUsefulBuisnessInfo(resp.data)
    final_response['data'] = respData
    return sendReposnse(res, final_response);
})

function filterReview(respData) {
var reviews = respData['reviews'];
var numReviews = reviews.length;

dataSend = [];
for(var i=0; i < numReviews; i++) {
        var review = reviews[i];
        var reviewObj = {};
        reviewObj['rating'] = review['rating'];
        reviewObj['name'] = review['user']['name'];
        reviewObj['text'] = review['text'].replace('\n', '');
        reviewObj['tc'] = review['time_created'].split(' ')[0];
        dataSend.push(reviewObj);
    }
    return dataSend;
}

app.get('/get_business_reviews/', async function(req, res) {
    var final_response = {"message": "", "data":[]};
    var params = req.query
    var business_id = params['id']
    var url = yelp_api_url_business['base_request'].concat('/', business_id.toString(), '/reviews');
    var headers = {
    'Authorization': 'Bearer '.concat(yelp_api_url_business['Bearer Token'])};

    var resp = await axios.get(url, {'headers': headers});
    if (resp.status != 200) {
        final_response['message'] = 'invalid response from yelp api, status code from yelp api: '.concat(resp.status.toString());
        res.setHeader('Content-Type', 'application/json');
        return sendReposnse(res, final_response);
    }

    var respData = filterReview(resp.data)
    final_response['data'] = respData
    return sendReposnse(res, final_response);
})

async function getLocIP(ip_address) {
    var base_request = ipinfo_get_url['base_request'];
    var token = ipinfo_get_url['token'];
    var url = base_request.concat('/', ip_address.toString(), '?token=', token);    
    var resp = await axios.get(url);
  
    var status_code = resp.status;
    var return_var = {
        'status': status_code,
        'long': -1,
        'lat': -1
    };
   
    if (status_code != 200) {
        return return_var;
    }
    lat_lang = resp.data['loc'].split(',');
    return_var['lat'] = lat_lang[0];
    return_var['long'] = lat_lang[1];

    return return_var;
}

async function getLocGoogle(location) {
   
    var url = google_location_api['base_request'];
    var loc_arr = location.split(' ');
    var address = loc_arr.join('+');

    var paramsObj = {}
    paramsObj['address'] = address;
    paramsObj['key'] = google_location_api['key'];
    
    var resp = await axios.get(url, {params:paramsObj});
    var return_var = {
        'status': resp.data['status'],
        'status_code': resp.status,
        'lat': -1,
        'long': -1
    }

    if (resp.data['results'].length == 0) {
        return return_var;
    }

    var loc =  resp.data['results'][0]['geometry']['location'];
    return_var['status_code'] = 200;
    return_var['lat'] = loc['lat'];
    return_var['long'] = loc['lng'];
    return return_var;
}

async function getYelpSearch(keyword, category, lat, long, radius) {
    var url = yelp_api_url_business['base_request']+'/search'

    var headersObj = {
    'Authorization': 'Bearer '+yelp_api_url_business['Bearer Token']
    }
    
    var paramsObj = {};
    paramsObj['term'] = keyword;
    paramsObj['latitude'] = lat;
    paramsObj['longitude'] = long;
    paramsObj['categories'] = category;
    paramsObj['radius'] = radius;
    var resp = await axios.get(url, {headers: headersObj, params: paramsObj});
    return {'status_code': resp.status, 'data':resp.data}
}

function filterUsefulBusinessesSearch(respData) {
    var businesses = respData['businesses'];
    var business_return = [];

    var bLen = Math.min(businesses.length, 10);

    for (var i=0; i < bLen; i++) {
        info_dict = {};
        var business = businesses[i];
        info_dict['id'] = business['id'];
        info_dict['name'] = business['name'];
        info_dict['rating'] = business['rating'];
        info_dict['image_url'] = business['image_url'];
        info_dict['distance']  = Math.round(parseFloat(business['distance']*100)/(1000*one_mile_to_km))/100;
        business_return.push(info_dict)
    }
    return business_return
}

app.get('/get_businesses/', async function(req, res) {
    var final_response = {'message':'','data':[]}

    var params = req.query
 
    var keyword = params['keyword']
    var category = params['category']
    var radius = Math.round(parseFloat(params['radius'])*one_mile_to_km*1000)
    var location = params['location']
    var lat = 0
    var long  = 0
    if ((location == undefined) || (location =="")){
        var ipinfo = params['ip'];
        var location_api_resp = await getLocIP(ipinfo);
        if (location_api_resp['status'] != 200) {
            final_response['message'] =  'invalid response from ipinfo api , status code from ipinfo api: '.concat(location_api_resp['status'].toString())
            return sendReposnse(res, final_response);
        }
        lat = location_api_resp['lat'];
        long = location_api_resp['long'];
    } else {
        var googleResp = await getLocGoogle(location);
        if (googleResp['status_code'] != 200) {
            final_response['message'] = 'message: invalid response from google api , status code from google api: '.concat(googleResp['status_code'].toString());
            return sendReposnse(res, final_response);
        }
        if (googleResp['status'] != 'OK') {
            final_response["message"] = 'Please update location, location is not found';
            return sendReposnse(res, final_response);
        }
        lat = googleResp['lat'];
        long = googleResp['long'];
    }
    var yelResp =  await getYelpSearch(keyword, category, lat, long, radius);
    if (yelResp['status_code'] != 200) {
        final_response['message'] = 'invalid response from yelp api , status code from yelp api: '.concat(resp.status_code.toString())
        return sendReposnse(res, final_response);
    }

    resp_text = yelResp['data'];
    if (resp_text['businesses'].length== 0) {
        final_response["message"] = 'Please update your query, No such business is found';
        final_response['data'] = [];
        return sendReposnse(res, final_response);
    }
    
    returnData = filterUsefulBusinessesSearch(resp_text);
    final_response['data'] = returnData
    return sendReposnse(res, final_response);
})

