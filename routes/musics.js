import express from "express";
import request from "request";
import scrappingAPI from "../scrapping";

const musicRouter = express.Router();

const apikey = process.env.API_KEY;
const apiBaseUrl = "http://api.musixmatch.com/ws/1.1/";

// musixmatch api 기능 모음
/*
- 해당 아티스트가 보유하고 있는 앨범들 정보
http://api.musixmatch.com/ws/1.1/artist.albums.get?artist_id=27561640&s_release_date=desc&page_size=100

- 검색(아티스트명, 노래제목, 가사)
- 검색 결과는 처음엔 10개의 결과를 보여준 후 see all 버튼 클릭 시, page_size 의 값을 100 으로 설정하여 보여준다
http://api.musixmatch.com/ws/1.1/track.search?q=bruno%20major&page_size=100&s_track_rating=desc

- 한 개의 앨범 정보
http://api.musixmatch.com/ws/1.1/album.tracks.get?album_id=26862948&page_size=100

- 한 개의 트랙 정보
http://api.musixmatch.com/ws/1.1/track.get?commontrack_id=67804542
*/

const musixmatchAPI = (apiMethod, params) => {
  let apiUrl = apiBaseUrl + apiMethod + "?";
  for (let key in params) {
    apiUrl = apiUrl + key + "=" + params[key] + "&";
  }

  const apiResultPromise = new Promise((resolve, reject) => {
    request(
      {
        url: encodeURI(apiUrl),
        json: true,
      },
      (e, r, body) => {
        resolve(body.message.body);
      }
    );
  });

  return apiResultPromise;
};

const isEmpty = function (value) {
  if (
    value == "" ||
    value == null ||
    value == undefined ||
    (value != null && typeof value == "object" && !Object.keys(value).length)
  ) {
    return true;
  } else {
    return false;
  }
};

musicRouter.get("/search", (req, res) => {
  const { search, see } = req.query;

  res.cookie("search", search, { maxAge: 60 * 60 * 24 * 1000 });

  Promise.all([
    musixmatchAPI("track.search", {
      q_lyrics: search,
      page_size: 100,
      s_track_rating: "desc",
      apikey,
    }),
    musixmatchAPI("track.search", {
      q_track_artist: search,
      page_size: 100,
      s_track_rating: "desc",
      apikey,
    }),
  ])
    .then(([lyricsResult, trackArtistResult]) => {
      if (isEmpty(trackArtistResult.track_list)) {
        res.render("musics/search", {
          result: lyricsResult.track_list,
          search,
          see,
          cookieSearch: req.cookies.search,
        });
      } else {
        res.render("musics/search", {
          result: trackArtistResult.track_list,
          search,
          see,
          cookieSearch: req.cookies.search,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/error");
    });
});

musicRouter.get("/lyrics/:commontrack_id/:album_id", (req, res) => {
  const { commontrack_id, album_id } = req.params;

  // 노래 제목, 아티스트명, 가사 가져오기
  const getTrackPromise = musixmatchAPI("track.get", {
    commontrack_id,
    apikey,
  });

  getTrackPromise
    .then((result) => {
      if (isEmpty(result)) {
        throw new Error();
      }
      let trackArr = result.track.track_share_url.split("/");

      let artist_name = trackArr[4];
      let track_name = trackArr[5].split("?")[0];

      const artistAndTitle = artist_name + "/" + track_name;
      const trackPromise = scrappingAPI.getLyrics(artistAndTitle);

      // 해당 트랙의 앨범 정보
      const getAlbumPromise = musixmatchAPI("album.tracks.get", {
        album_id,
        page_size: 100,
        apikey,
      });

      Promise.all([trackPromise, getAlbumPromise])
        .then(([track, albums]) => {
          if (isEmpty(track) || isEmpty(albums)) {
            throw new Error();
          }
          let lyricsData = track.lyrics.join().split("\n");
          let albumSrc = "http:" + track.albumImg;

          res.render("musics/lyrics", {
            result,
            albumSrc,
            lyrics: lyricsData,
            albums: albums.track_list,
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/error");
        });
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/error");
    });
});

module.exports = musicRouter;
