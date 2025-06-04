// JavaScript for Opening and Closing the Modal
const modal = document.getElementById("festivalModal");
const modalOverlay = document.querySelector(".modal-overlay");
const span = document.getElementsByClassName("close")[0];

function openModal(festival) {
   document.getElementById('festivalName').innerText = festival.title;
   document.getElementById('festivalImage').src = festival.img;
   document.getElementById('festivalDates').innerText = festival.author;

   // Update all album list items
   const albumImgs = document.querySelectorAll(".modal-album-img");
   const albumTitles = document.querySelectorAll(".modal-album-title");
   const albumArtists = document.querySelectorAll(".modal-album-artist");
   const albumNames = document.querySelectorAll(".modal-album-name");
   const albumDurations = document.querySelectorAll(".modal-album-duration");

   // Set values for each album list item
   for (let i = 0; i < albumImgs.length; i++) {
      albumImgs[i].src = festival.img;
      albumTitles[i].innerText = festival.title;
      albumArtists[i].innerText = festival.author;
      albumNames[i].innerText = festival.name;
      albumDurations[i].innerText = festival.duration;
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
