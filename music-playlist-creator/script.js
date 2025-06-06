// JavaScript for Opening and Closing the Modal
const modal = document.getElementById("festivalModal");
const modalOverlay = document.querySelector(".modal-overlay");
const span = document.getElementsByClassName("close")[0];

// Keep track of the current playlist for shuffling
let currentPlaylist = null;

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
   // Create a copy of the array to avoid modifying the original
   const shuffled = [...array];

   // Fisher-Yates shuffle algorithm
   for (let i = shuffled.length - 1; i > 0; i--) {
      // Generate a random index from 0 to i
      const j = Math.floor(Math.random() * (i + 1));
      // Swap elements at indices i and j
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
   }

   return shuffled;
}

// Function to update the modal with songs
function updateModalWithSongs(songs, playlistAuthor) {
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
      albumArtists[i].innerText = playlistAuthor;
      albumNames[i].innerText = songs[i].title;
      albumDurations[i].innerText = songs[i].duration;
   }
}

function openModal(playlist) {
   // Store the current playlist for shuffling
   currentPlaylist = playlist;

   // Update the modal header with the clicked album info
   document.getElementById('festivalName').innerText = playlist.playlist_name;
   document.getElementById('festivalImage').src = playlist.playlist_art;
   document.getElementById('festivalDates').innerText = playlist.playlist_author;

   // Get the actual songs from the playlist
   const songs = playlist.songs || [];

   // Update the modal with songs
   updateModalWithSongs(songs, playlist.playlist_author);

   // Show the modal overlay
   modalOverlay.style.display = "block";
}

// Add event listener for shuffle button
document.getElementById('shuffleButton').addEventListener('click', function() {
   if (currentPlaylist && currentPlaylist.songs) {
      // Shuffle the songs
      const shuffledSongs = shuffleArray(currentPlaylist.songs);

      // Update the modal with shuffled songs
      updateModalWithSongs(shuffledSongs, currentPlaylist.playlist_author);
   }
});

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
                        <span class="heart-button ${playlist.like_count > 0 ? 'liked' : 'unliked'}">❤️</span>
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

        // Add event listeners for heart buttons
        playlistContainer.querySelectorAll('.heart-button').forEach(button => {
            button.addEventListener('click', function(event) {
                event.stopPropagation();
                const container = this.closest('.num-of-likes');
                const likeCountElement = container.querySelector('.like-count');

                if(likeCountElement) {
                    let count = parseInt(likeCountElement.textContent);

                    // Toggle liked/unliked state
                    if(this.classList.contains('liked')) {
                        // If already liked, unlike it
                        this.classList.remove('liked');
                        this.classList.add('unliked');
                        count = Math.max(0, count - 1); // Ensure count doesn't go below 0
                    } else {
                        // If unliked, like it
                        this.classList.remove('unliked');
                        this.classList.add('liked');
                        count++;
                    }

                    // Update the like count
                    likeCountElement.textContent = count;
                }
            });
        });



})
.catch(err => {
    playlistContainer.innerHTML = '<p class="no-playlists">Failed to load playlists</p>';

});
});
