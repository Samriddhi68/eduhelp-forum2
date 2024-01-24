
const firebaseConfig = {
  apiKey: "AIzaSyBgfS31_rkbCQl1kplgNeSsGW8pF5Q8dB0",
  authDomain: "eduhelp-forum-5aaa0.firebaseapp.com",
  projectId: "eduhelp-forum-5aaa0",
  storageBucket: "eduhelp-forum-5aaa0.appspot.com",
  messagingSenderId: "986564422440",
  appId: "1:986564422440:web:9e6d6d385ae824939bbe1d"
};

firebase.initializeApp(firebaseConfig);

document.addEventListener('DOMContentLoaded', () => {
 
  const cloudinary = window.cloudinary.createUploadWidget({
    cloudName: 'dv2crm4zi',
    uploadPreset: 'gy5eebqo',
  }, (error, result) => {
    if (error) {
      console.error('Upload error:', error);
    } else if (result && result.event === 'success') {
      
      const fileDetails = {
        name: result.info.original_filename,
        url: result.info.secure_url,
       
      };

      
      firebase.firestore().collection('materials').add(fileDetails)
        .then(() => {
          
          fetchMaterials();
        })
        .catch((error) => {
          console.error('Error saving to Firestore:', error);
        });
    }
  });

  
  document.querySelector('#uploadButton').addEventListener('click', () => {
    cloudinary.open();
  });

  
  fetchMaterials();
});


function fetchMaterials() {
  const materialsList = document.getElementById('materialsList');
  materialsList.innerHTML = ''; 

  firebase.firestore().collection('materials').get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const material = doc.data();
        const materialItem = document.createElement('div');
        materialItem.innerHTML = `<a href="${material.url}" target="_blank">${material.name}</a>`;
        materialsList.appendChild(materialItem);
      });
    })
    .catch((error) => {
      console.error('Error fetching materials:', error);
    });
}
