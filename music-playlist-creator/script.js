// JavaScript for Opening and Closing the Modal
const modal = document.getElementById("festivalModal");
const modalOverlay = document.querySelector(".modal-overlay");
const viewerModalClose = document.querySelector('.modal-overlay .close');

// Keep track of the current playlist for shuffling
let currentPlaylist = null;

// --- Playlist Data Management ---
const PLAYLISTS_KEY = 'playlists';
let playlists = [];
let editIndex = null;

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
   for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
   }
   return shuffled;
}

// Function to update the modal with songs
function updateModalWithSongs(songs, playlistAuthor) {
   const modalContent = document.querySelector('#festivalModal .modal-content');
   modalContent.querySelectorAll('.modal-album-list').forEach(el => el.remove());
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

   currentPlaylist = playlist;


   document.getElementById('festivalName').innerText = playlist.playlist_name;
   document.getElementById('festivalImage').src = playlist.playlist_art;
   document.getElementById('festivalDates').innerText = playlist.playlist_author;


   const songs = playlist.songs || [];


   updateModalWithSongs(songs, playlist.playlist_author);


   modalOverlay.style.display = "block";
}

const shuffleButton = document.getElementById('shuffleButton');
if (shuffleButton) {
  shuffleButton.addEventListener('click', function() {
    if (currentPlaylist && currentPlaylist.songs) {
      const shuffledSongs = shuffleArray(currentPlaylist.songs);
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
    <input type="text" name="songDuration" placeholder="Duration " value="${song.duration || ''}" required>
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
    if (!cover) cover = playlists[editIndex].playlist_art;
  }
  if (editIndex === null && !cover) {
    coverInput.focus();
    alert('Cover image URL is required when adding a new playlist.');
    return;
  }
  const songDivs = songsContainer.querySelectorAll('.song-fields');
  const songs = Array.from(songDivs).map(div => {
    let songCover = cover;

    if (editIndex !== null) {
      const title = div.querySelector('input[name="songTitle"]').value.trim();
      const existingSong = playlists[editIndex].songs.find(s => s.title === title);
      if (existingSong && existingSong.cover) {
        songCover = existingSong.cover;
      }
    }

    return {
      title: div.querySelector('input[name="songTitle"]').value.trim(),
      artist: div.querySelector('input[name="songArtist"]').value.trim(),
      duration: div.querySelector('input[name="songDuration"]').value.trim(),
      cover: songCover
    };
  });
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
    // Check if this is the Graduation playlist (ID 2) and set liked state based on liked_by_user property
    const isLiked = playlist.playlistID === 2 ?
      (playlist.liked_by_user || false) :
      (playlist.like_count > 0);

    card.innerHTML = `
      <article class="card-article">
        <img src="${playlist.playlist_art}" alt="Playlist Art">
        <div class="album-info">
          <h3 class="playlist-title">${playlist.playlist_name}</h3>
          <p class="artiste-name">${playlist.playlist_author}</p>
          <div class="num-of-likes">
            <span class="heart-button ${isLiked ? 'liked' : 'unliked'}">❤️</span>
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

      // Special handling for Graduation playlist (ID 2)
      if (playlist.playlistID === 2) {
        // Toggle liked state
        playlist.liked_by_user = !playlist.liked_by_user;

        // Update visual state
        if (playlist.liked_by_user) {
          this.classList.remove('unliked');
          this.classList.add('liked');
          playlist.like_count = 6; // Initial (5) + 1
        } else {
          this.classList.remove('liked');
          this.classList.add('unliked');
          playlist.like_count = 5; // Back to initial
        }
      } else {
        // Normal handling for other playlists
        if (this.classList.contains('liked')) {
          this.classList.remove('liked');
          this.classList.add('unliked');
          playlist.like_count = 0;
        } else {
          this.classList.remove('unliked');
          this.classList.add('liked');
          playlist.like_count = 1;
        }
      }

      savePlaylists();
      renderPlaylists();
    };
    playlistContainer.appendChild(card);
  });
}

// --- Search & Sort Events ---
// Get the search and clear buttons
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');

// Search functionality
function performSearch() {
  renderPlaylists();
}

// Clear search functionality
function clearSearch() {
  searchBar.value = '';
  renderPlaylists();
}

// Event listeners for search
searchBar.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    performSearch();
  }
});

searchBtn.addEventListener('click', performSearch);
clearSearchBtn.addEventListener('click', clearSearch);

// Sort dropdown event
sortDropdown.onchange = renderPlaylists;

// --- Initial Load ---
window.addEventListener('DOMContentLoaded', () => {
  // Clear localStorage to force reload from data.json
  localStorage.removeItem(PLAYLISTS_KEY);
  console.log("Cleared localStorage to force reload from data.json");

  loadPlaylists().then(() => {
    console.log("Playlists loaded:", playlists);
    renderPlaylists();
  });
});


let body = document.querySelector("body")
let pageid = body.id
