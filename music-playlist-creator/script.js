// JavaScript for Opening and Closing the Modal
const modal = document.getElementById("festivalModal");
const modalOverlay = document.querySelector(".modal-overlay");
const span = document.getElementsByClassName("close")[0];

function openModal(festival) {
   // Update the modal header with the clicked album info
   document.getElementById('festivalName').innerText = festival.title;
   document.getElementById('festivalImage').src = festival.img;
   document.getElementById('festivalDates').innerText = festival.author;

   // Create some sample tracks for the album
   const tracks = [
      { title: festival.title + " - Original Mix", duration: "3:45" },
      { title: festival.title + " - Radio Edit", duration: "2:55" },
      { title: festival.title + " - Extended Mix", duration: "5:20" }
   ];

   // Update all album list items
   const albumImgs = document.querySelectorAll(".modal-album-img");
   const albumTitles = document.querySelectorAll(".modal-album-title");
   const albumArtists = document.querySelectorAll(".modal-album-artist");
   const albumNames = document.querySelectorAll(".modal-album-name");
   const albumDurations = document.querySelectorAll(".modal-album-duration");

   // Set values for each album list item with different track variations
   for (let i = 0; i < albumImgs.length && i < tracks.length; i++) {
      albumImgs[i].src = festival.img;
      albumTitles[i].innerText = tracks[i].title;
      albumArtists[i].innerText = festival.author;
      albumNames[i].innerText = "Track " + (i + 1);
      albumDurations[i].innerText = tracks[i].duration;
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
// Handle like buttons
const likeButtons = document.querySelectorAll(".like-button");
const unlikeButtons = document.querySelectorAll(".unlike-button");

likeButtons.forEach(button => {
   button.addEventListener("click", function(event) {
      // Stop event propagation to prevent modal from opening
      event.stopPropagation();

      // Find the parent container
      const container = this.closest(".num-of-likes, .num-of-like");

      // Find the like count element within the container
      const likeCountElement = container.querySelector(".like-count");

      if (likeCountElement) {
         // Get current count and increment it
         let count = parseInt(likeCountElement.textContent);
         count++;

         // Update the like count
         likeCountElement.textContent = count;
      }
   });
});

unlikeButtons.forEach(button => {
   button.addEventListener("click", function(event) {
      // Stop event propagation to prevent modal from opening
      event.stopPropagation();

      // Find the parent container
      const container = this.closest(".num-of-likes, .num-of-like");

      // Find the like count element within the container
      const likeCountElement = container.querySelector(".like-count");

      if (likeCountElement) {
         // Get current count and decrement it
         let count = parseInt(likeCountElement.textContent);
         count--;

         // Update the like count
         likeCountElement.textContent = count;
      }
   });
});
