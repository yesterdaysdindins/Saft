

    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
      var hashParams = {};
      var e, r = /([^&;=]+)=?([^&;]*)/g,
          q = window.location.hash.substring(1);
      while ( e = r.exec(q)) {
         hashParams[e[1]] = decodeURIComponent(e[2]);
      }
      return hashParams;
    }

    var oauthSource = document.getElementById('oauth-template').innerHTML,
        oauthTemplate = Handlebars.compile(oauthSource),
        oauthPlaceholder = document.getElementById('oauth');

    var params = getHashParams();

    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    var songsTable = document.getElementById("songs_table");
    var songsTableBody = document.getElementById("songs_table_body");
    var songs = [];
    var users = [];


    if (error) {
      alert('There was an error during the authentication');
    } else {
      if (access_token) {
        $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
              'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
              GetPlaylists(response.id);

              $('#login').hide();
              $('#loggedin').show();
            }
        });

      } else {
          // render initial screen
          $('#login').show();
          $('#loggedin').hide();
      }

      function GetPlaylists(user_id){
          $.ajax({
              url: 'https://api.spotify.com/v1/users/'+user_id+'/playlists',
              headers: {
                'Authorization': 'Bearer ' + access_token
              },
              success: function(response) {
                var tracks = (response.items[1].tracks.href);
                GetTracks(tracks, 0);

                $('#login').hide();
                $('#loggedin').show();
              }
          });
      }

      function GetTracks(tracks, offset){
          $.ajax({
              url: tracks+"?offset="+offset,
              headers: {
                'Authorization': 'Bearer ' + access_token
              },

              success: function(response) {

              songs.push(response.items);
              if (offset<response.total){
                GetTracks(tracks, offset+100);
              }
              else {
                    console.log(songs);
                    AddTracksToTable(songs);
                  };

                $('#login').hide();
                $('#loggedin').show();
              }
          });
      }



    }
    function AddTracksToTable(tracks){

      songs.forEach(function(chunk){
        chunk.forEach(function(cellData){

          if (!users.includes(cellData.added_by.id)){
            users.push(cellData.added_by.id);
          }

          var userFilter = document.getElementById("users_select").value;

          if (userFilter == "all" || userFilter == cellData.added_by.id){

            var row = document.createElement('tr');

            var track = document.createElement('td');
            track.appendChild(document.createTextNode(cellData.track.name));
            row.appendChild(track);

            var artist = document.createElement('td');
            var artists = "";
            $.each (cellData.track.artists, function(index, value){
              artists += value.name+", "
            });
            artists = artists.slice(0, -2);
            artist.appendChild(document.createTextNode(artists));
            row.appendChild(artist);

            var addedBy = document.createElement('td');
            addedBy.appendChild(document.createTextNode(cellData.added_by.id));
            row.appendChild(addedBy);

            songsTableBody.appendChild(row);

          }
        });
      });

      select = document.getElementById("users_select");
      if ($("#users_select  option").length == 1){
        console.log($("#users_select > option").length);
        for(i in users){
          var opt = document.createElement("option");
          opt.value = users[i];
          opt.innerHTML = users[i];
          select.appendChild(opt);
        }
      }
    }

$("#users_select").on("change", function(){
  $("#songs_table_body").empty();
  AddTracksToTable(songs);
});
