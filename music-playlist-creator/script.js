// JavaScript for Opening and Closing the Modal
const modal = document.getElementById("festivalModal");
const modalOverlay = document.querySelector(".modal-overlay");
const viewerModalClose = document.querySelector('.modal-overlay .close');

// Keep track of the current playlist for shuffling
let currentPlaylist = null;

// --- Playlist Data Management ---
const PLAYLISTS_KEY = 'playlists';
let playlists = [];
let editIndex = null; // null for add, index for edit

// --- DOM Elements ---
const playlistContainer = document.querySelector('#playlist-cards');
const searchBar = document.getElementById('searchBar');
const sortDropdown = document.getElementById('sortDropdown');
const addPlaylistBtn = document.getElementById('addPlaylistBtn');
const playlistModal = document.getElementById('playlistModal');
const closePlaylistModal = document.getElementById('closePlaylistModal');
const playlistForm = document.getElementById('playlistForm');
const modalTitle = document.getElementById('modalTitle');
const songsContainer = document.getElementById('songsContainer');
const addSongBtn = document.getElementById('addSongBtn');

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
   // Remove all previous song elements
   const modalContent = document.querySelector('#festivalModal .modal-content');
   // Remove all .modal-album-list elements
   modalContent.querySelectorAll('.modal-album-list').forEach(el => el.remove());
   // Add a .modal-album-list for each song
   songs.forEach(song => {
      const songDiv = document.createElement('div');
      songDiv.className = 'modal-album-list';
      songDiv.innerHTML = `
         <img class="modal-album-img" src="${song.cover}"/>
         <div>
            <p class="modal-album-title">${song.title}</p>
            <p class="modal-album-artist">${playlistAuthor}</p>
            <p class="modal-album-name">${song.title}</p>
         </div>
         <p class="modal-album-duration">${song.duration}</p>
      `;
      modalContent.appendChild(songDiv);
   });
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
const shuffleButton = document.getElementById('shuffleButton');
if (shuffleButton) {
  shuffleButton.addEventListener('click', function() {
    if (currentPlaylist && currentPlaylist.songs) {
      // Shuffle the songs
      const shuffledSongs = shuffleArray(currentPlaylist.songs);
      // Update the modal with shuffled songs
      updateModalWithSongs(shuffledSongs, currentPlaylist.playlist_author);
    }
  });
}

if (viewerModalClose) {
  viewerModalClose.onclick = function() {
    modalOverlay.style.display = "none";
  }
}

window.onclick = function(event) {
  if (event.target == modalOverlay) {
    modalOverlay.style.display = "none";
  }
}

// --- Utility Functions ---
function savePlaylists() {
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}
function loadPlaylists() {
  const stored = localStorage.getItem(PLAYLISTS_KEY);
  if (stored) {
    playlists = JSON.parse(stored);
    return Promise.resolve();
  } else {
    // Fallback to data.json
    return fetch('./data/data.json')
      .then(res => res.json())
      .then(data => { playlists = data; savePlaylists(); });
  }
}

// --- Modal Form Logic ---
function openPlaylistModal(isEdit = false, index = null) {
  playlistModal.style.display = 'block';
  playlistForm.reset();
  songsContainer.innerHTML = '<h3>Songs</h3>';
  editIndex = isEdit ? index : null;
  modalTitle.textContent = isEdit ? 'Edit Playlist' : 'Add Playlist';
  if (isEdit && index !== null) {
    const pl = playlists[index];
    document.getElementById('playlistName').value = pl.playlist_name;
    document.getElementById('playlistAuthor').value = pl.playlist_author;
    document.getElementById('playlistCover').value = '';
    (pl.songs || []).forEach(song => addSongFields(song));
  } else {
    addSongFields();
  }
}
function closeModal() {
  playlistModal.style.display = 'none';
}
if (closePlaylistModal) {
  closePlaylistModal.onclick = closeModal;
}
window.onclick = function(e) {
  if (e.target === playlistModal) closeModal();
};
addPlaylistBtn.onclick = () => openPlaylistModal(false);

// --- Dynamic Song Fields ---
function addSongFields(song = {}) {
  const div = document.createElement('div');
  div.className = 'song-fields';
  div.innerHTML = `
    <input type="text" name="songTitle" placeholder="Song Title" value="${song.title || ''}" required>
    <input type="text" name="songArtist" placeholder="Artist" value="${song.artist || ''}" required>
    <input type="text" name="songDuration" placeholder="Duration (e.g. 3:45)" value="${song.duration || ''}" required>
    <button type="button" class="removeSongBtn">Remove</button>
  `;
  div.querySelector('.removeSongBtn').onclick = () => div.remove();
  songsContainer.appendChild(div);
}
addSongBtn.onclick = () => addSongFields();

// --- Handle Add/Edit Playlist Submission ---
playlistForm.onsubmit = function(e) {
  e.preventDefault();
  const name = document.getElementById('playlistName').value.trim();
  const author = document.getElementById('playlistAuthor').value.trim();
  const coverInput = document.getElementById('playlistCover');
  let cover = coverInput.value.trim();
  if (editIndex !== null) {
    // Edit: if cover is blank, keep the old one
    if (!cover) cover = playlists[editIndex].playlist_art;
  }
  if (editIndex === null && !cover) {
    coverInput.focus();
    alert('Cover image URL is required when adding a new playlist.');
    return;
  }
  const songDivs = songsContainer.querySelectorAll('.song-fields');
  const songs = Array.from(songDivs).map(div => ({
    title: div.querySelector('input[name="songTitle"]').value.trim(),
    artist: div.querySelector('input[name="songArtist"]').value.trim(),
    duration: div.querySelector('input[name="songDuration"]').value.trim(),
    cover: cover // Use playlist cover for all songs
  }));
  const playlist = {
    playlist_name: name,
    playlist_author: author,
    playlist_art: cover,
    like_count: 0,
    date_added: Date.now(),
    songs
  };
  if (editIndex !== null) {
    // Edit
    playlist.like_count = playlists[editIndex].like_count;
    playlist.date_added = playlists[editIndex].date_added;
    playlists[editIndex] = playlist;
  } else {
    // Add
    playlists.push(playlist);
  }
  savePlaylists();
  closeModal();
  renderPlaylists();
};

// --- Render Playlists ---
function renderPlaylists() {
  let filtered = playlists.slice();
  // Search
  const query = (searchBar.value || '').toLowerCase();
  if (query) {
    filtered = filtered.filter(pl =>
      pl.playlist_name.toLowerCase().includes(query) ||
      pl.playlist_author.toLowerCase().includes(query)
    );
  }
  // Sort
  const sort = sortDropdown.value;
  filtered.sort((a, b) => {
    if (sort === 'name') {
      return a.playlist_name.localeCompare(b.playlist_name);
    } else if (sort === 'likes') {
      if (b.like_count !== a.like_count) return b.like_count - a.like_count;
      return a.playlist_name.localeCompare(b.playlist_name); // Tie-breaker
    } else {
      // date
      if (b.date_added !== a.date_added) return b.date_added - a.date_added;
      return a.playlist_name.localeCompare(b.playlist_name);
    }
  });
  // Render
  playlistContainer.innerHTML = '';
  if (filtered.length === 0) {
    playlistContainer.innerHTML = "<p class='no-playlists'>No playlists found</p>";
    return;
  }
  filtered.forEach((playlist, idx) => {
    const realIdx = playlists.indexOf(playlist);
    const card = document.createElement('div');
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
          <button class="editPlaylistBtn">Edit</button>
          <button class="deletePlaylistBtn">Delete</button>
        </div>
      </article>
    `;
    // Open modal on card click (except buttons)
    card.querySelector('.card-article').onclick = (e) => {
      if (e.target.classList.contains('editPlaylistBtn') || e.target.classList.contains('deletePlaylistBtn')) return;
      openModal(playlist);
    };
    // Edit
    card.querySelector('.editPlaylistBtn').onclick = (e) => {
      e.stopPropagation();
      openPlaylistModal(true, realIdx);
    };
    // Delete
    card.querySelector('.deletePlaylistBtn').onclick = (e) => {
      e.stopPropagation();
      if (confirm('Delete this playlist?')) {
        playlists.splice(realIdx, 1);
        savePlaylists();
        renderPlaylists();
      }
    };
    // Like
    card.querySelector('.heart-button').onclick = function(e) {
      e.stopPropagation();
      if (this.classList.contains('liked')) {
        this.classList.remove('liked');
        this.classList.add('unliked');
        playlist.like_count = Math.max(0, (playlist.like_count || 0) - 1);
      } else {
        this.classList.remove('unliked');
        this.classList.add('liked');
        playlist.like_count = (playlist.like_count || 0) + 1;
      }
      savePlaylists();
      renderPlaylists();
    };
    playlistContainer.appendChild(card);
  });
}

// --- Search & Sort Events ---
searchBar.oninput = renderPlaylists;
sortDropdown.onchange = renderPlaylists;

// --- Initial Load ---
window.addEventListener('DOMContentLoaded', () => {
  loadPlaylists().then(renderPlaylists);
});


// Event listeners for like/unlike buttons will be added after the playlists are loaded


// window.addEventListener("DOMContentLoaded", () => {
//     const playlistContainer = document.querySelector("#playlist-cards");

//     if (!playlistContainer) {
//         console.error("Playlist container not found!");
//         return;
//     }

//     fetch("./data/data.json")
//     .then(response => {
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         return response.json();
//     })
//     .then(playlists => {
//         console.log("Playlists loaded:", playlists); // Debug log

//         if(!playlists || playlists.length === 0) {
//             playlistContainer.innerHTML = "<p class='no-playlists'>No playlists found</p>";
//             return;
//         }

//         // Clear existing hardcoded content
//         playlistContainer.innerHTML = "";

//         playlists.forEach(playlist => {
//             const card = document.createElement("div");
//             card.className = 'cards';
//             card.innerHTML = `
//             <article class="card-article">
//                 <img src="${playlist.playlist_art}" alt="Playlist Art">
//                 <div class="album-info">
//                     <h3 class="playlist-title">${playlist.playlist_name}</h3>
//                     <p class="artiste-name">${playlist.playlist_author}</p>
//                     <div class="num-of-likes">
//                         <span class="heart-button ${playlist.like_count > 0 ? 'liked' : 'unliked'}">❤️</span>
//                         <span class="like-count">${playlist.like_count || 0}</span>
//                     </div>
//                 </div>
//             </article>`;

//             card.querySelector('.card-article').onclick = () => {
//                 // Pass the entire playlist object to openModal
//                 openModal(playlist);
//             };
//             playlistContainer.appendChild(card);
//         });

//         // Add event listeners for heart buttons
//         playlistContainer.querySelectorAll('.heart-button').forEach(button => {
//             button.addEventListener('click', function(event) {
//                 event.stopPropagation();
//                 const container = this.closest('.num-of-likes');
//                 const likeCountElement = container.querySelector('.like-count');

//                 if(likeCountElement) {
//                     let count = parseInt(likeCountElement.textContent);

//                     // Toggle liked/unliked state
//                     if(this.classList.contains('liked')) {
//                         // If already liked, unlike it
//                         this.classList.remove('liked');
//                         this.classList.add('unliked');
//                         count = Math.max(0, count - 1); // Ensure count doesn't go below 0
//                     } else {
//                         // If unliked, like it
//                         this.classList.remove('unliked');
//                         this.classList.add('liked');
//                         count++;
//                     }

//                     // Update the like count
//                     likeCountElement.textContent = count;
//                 }
//             });
//         });



// })
// .catch(err => {
//     playlistContainer.innerHTML = '<p class="no-playlists">Failed to load playlists</p>';

// });
// });
