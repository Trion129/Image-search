var express = require("express");
var app = express();
var https = require("https");

var pastqueries = [];

function formatparam(params){
	var array=[];
	for(key in params){
		array.push(encodeURIComponent(key)+"="+encodeURIComponent(params[key]));
	}
	return array.join("&");
}

app.get("/",function(req,res){
    res.end(JSON.stringify(pastqueries));
});

app.get("/:query",function(req,res){
	var params = {
        q: req.params.query,
        count: req.query.count || "5",
        offset: req.query.offset || "0",
        safeSearch: "Off"
    };
    var options = {
        hostname: "bingapis.azure-api.net",
        headers: {
            "Ocp-Apim-Subscription-Key": "49c6d5c3ab874460aab03f0113e2fb4d"
        },
        path: "/api/v5/images/search?"+formatparam(params)
    };
    var result = [];
    try{
    https.get(options, function(resp) {
        resp.setEncoding("utf8");
        var body = "";
    	resp.on('data',function(data){
            body += data;
    	});
        resp.on("error",function(){
            res.write("Error occured in resp");
        });
        resp.on('end',function(){
            var fdata = JSON.parse(body);
            for(var i = 0;i < fdata.value.length;i++){
                var option = fdata.value[i];
                result.push({
                    name: option.name,
                    thumbnail: option.thumbnailUrl,
                    image: option.contentUrl,
                    webpage: option.hostPageUrl
                })
            }
            if(req.params.query != "favicon.ico"){
                pastqueries.unshift(req.params.query);
            }
            res.write(JSON.stringify(result));
            res.end();
        });
    });
    }
    catch(e){
        res.write(JSON.stringify({"error": "Unable to reach server"}));
        res.end();
    }
});

app.listen(process.env.PORT || 8080);