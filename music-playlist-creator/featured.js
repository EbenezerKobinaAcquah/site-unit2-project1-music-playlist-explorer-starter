// JavaScript for the Featured Playlist page

document.addEventListener('DOMContentLoaded', () => {
    // Fetch the playlists from data.json
    fetch('./data/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(playlists => {
            if (!playlists || playlists.length === 0) {
                displayError("No playlists found");
                return;
            }

            // Select a random playlist
            const randomIndex = Math.floor(Math.random() * playlists.length);
            const featuredPlaylist = playlists[randomIndex];

            // Display the featured playlist
            displayFeaturedPlaylist(featuredPlaylist);
        })
        .catch(error => {
            console.error('Error loading playlists:', error);
            displayError("Failed to load playlists");
        });
});

function displayFeaturedPlaylist(playlist) {
    // Update the playlist image, name, and author
    document.getElementById('featured-img').src = playlist.playlist_art;
    document.getElementById('featured-playlist-name').textContent = playlist.playlist_name;
    document.getElementById('featured-playlist-author').textContent = playlist.playlist_author;
    document.getElementById('featured-like-count').textContent = playlist.like_count || 0;

    // Update the song count
    const songCount = playlist.songs ? playlist.songs.length : 0;
    document.querySelector('.featured-song-count').textContent = `${songCount} songs`;

    // Set the heart button state based on like count
    const heartButton = document.querySelector('.heart-button');
    if (playlist.like_count > 0) {
        heartButton.classList.remove('unliked');
        heartButton.classList.add('liked');
    } else {
        heartButton.classList.remove('liked');
        heartButton.classList.add('unliked');
    }

    // Add event listener to the heart button
    heartButton.addEventListener('click', function() {
        const likeCountElement = document.getElementById('featured-like-count');
        let count = parseInt(likeCountElement.textContent);

        if (this.classList.contains('liked')) {
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
    });

    // Display the songs
    displaySongs(playlist.songs || []);
}

function displaySongs(songs) {
    const songsContainer = document.getElementById('featured-songs-container');
    songsContainer.innerHTML = ''; // Clear existing content

    if (songs.length === 0) {
        songsContainer.innerHTML = '<p class="no-songs">No songs in this playlist</p>';
        return;
    }

    // Create a song item for each song
    songs.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'featured-song-item';

        songItem.innerHTML = `
            <div class="song-number">${index + 1}</div>
            <div class="song-image">
                <img src="${song.cover}" alt="${song.title}" />
            </div>
            <div class="song-details">
                <h4 class="song-title">${song.title}</h4>
                <p class="song-duration">${song.duration}</p>
            </div>
        `;

        songsContainer.appendChild(songItem);
    });
}

function displayError(message) {
    const featuredContent = document.querySelector('.featured-content');
    featuredContent.innerHTML = `<div class="error-message">${message}</div>`;
}
