import request from "request";

let url =
  "http://api.musixmatch.com/ws/1.1/track.search?q=bruno major&page=1&s_track_rating=desc&apikey=972aab8dd3f24cb5dbd68aec9564750d";
request(
  {
    url: encodeURI(url),
    json: true,
  },
  (e, r, body) => {
    for (let value of body.message.body.track_list) {
      console.log(value.track);
    }
  }
);
