// JavaScript for Opening and Closing the Modal
const modal = document.getElementById("festivalModal");
const modalOverlay = document.querySelector(".modal-overlay");
const span = document.getElementsByClassName("close")[0];

function openModal(playlist) {
   // Update the modal header with the clicked album info
   document.getElementById('festivalName').innerText = playlist.playlist_name;
   document.getElementById('festivalImage').src = playlist.playlist_art;
   document.getElementById('festivalDates').innerText = playlist.playlist_author;

   // Get the actual songs from the playlist
   const songs = playlist.songs || [];

   // Update all album list items
   const albumImgs = document.querySelectorAll(".modal-album-img");
   const albumTitles = document.querySelectorAll(".modal-album-title");
   const albumArtists = document.querySelectorAll(".modal-album-artist");
   const albumNames = document.querySelectorAll(".modal-album-name");
   const albumDurations = document.querySelectorAll(".modal-album-duration");

   // Set values for each album list item with actual songs
   for (let i = 0; i < albumImgs.length && i < songs.length; i++) {
      albumImgs[i].src = songs[i].cover;
      albumTitles[i].innerText = songs[i].title;
      albumArtists[i].innerText = playlist.playlist_author;
      albumNames[i].innerText = songs[i].title;
      albumDurations[i].innerText = songs[i].duration;
   }

   // Show the modal overlay
   modalOverlay.style.display = "block";
}

span.onclick = function() {
   modalOverlay.style.display = "none";
}
window.onclick = function(event) {
   if (event.target == modalOverlay) {
      modalOverlay.style.display = "none";
   }
}
// Event listeners for like/unlike buttons will be added after the playlists are loaded


window.addEventListener("DOMContentLoaded", () => {
    const playlistContainer = document.querySelector("#playlist-cards");

    if (!playlistContainer) {
        console.error("Playlist container not found!");
        return;
    }

    fetch("./data/data.json")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(playlists => {
        console.log("Playlists loaded:", playlists); // Debug log

        if(!playlists || playlists.length === 0) {
            playlistContainer.innerHTML = "<p class='no-playlists'>No playlists found</p>";
            return;
        }

        // Clear existing hardcoded content
        playlistContainer.innerHTML = "";

        playlists.forEach(playlist => {
            const card = document.createElement("div");
            card.className = 'cards';
            card.innerHTML = `
            <article class="card-article">
                <img src="${playlist.playlist_art}" alt="Playlist Art">
                <div class="album-info">
                    <h3 class="playlist-title">${playlist.playlist_name}</h3>
                    <p class="artiste-name">${playlist.playlist_author}</p>
                    <div class="num-of-likes">
                        <span class="like-button" id="like">👍</span>
                        <span class="unlike-button" id="unlike">👎</span>
                        <span class="like-count">${playlist.like_count || 0}</span>
                    </div>
                </div>
            </article>`;

            card.querySelector('.card-article').onclick = () => {
                // Pass the entire playlist object to openModal
                openModal(playlist);
            };
            playlistContainer.appendChild(card);
        });

playlistContainer.querySelectorAll('.like-button').forEach(button => {
    button.addEventListener('click', function(event) {
        event.stopPropagation();
        const container = this.closest('.num-of-likes, .num-of-like');
        const likeCountElement = container.querySelector('.like-count');
        if(likeCountElement) {
            let count = parseInt(likeCountElement.textContent);
            count++;
            likeCountElement.textContent = count;
        }});

});

playlistContainer.querySelectorAll('.unlike-button').forEach(button => {
    button.addEventListener('click', function(event) {
        event.stopPropagation();
        const container = this.closest('.num-of-likes, .num-of-like');
        const likeCountElement = container.querySelector('.like-count');
        if(likeCountElement) {
            let count = parseInt(likeCountElement.textContent);
            count--;
            likeCountElement.textContent = count;
        }});

});



})
.catch(err => {
    playlistContainer.innerHTML = '<p class="no-playlists">Failed to load playlists</p>';

});
});



