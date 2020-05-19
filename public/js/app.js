const hideTextLink = document.querySelector('.hidetext');
const hideTextModal = document.querySelector('.hideText-modal');
const hideTextForm = document.querySelector('.hideText-modal form');
const revealTextLink = document.querySelector('.revealtext');
const revealTextModal = document.querySelector('.revealText-modal');
const revealTextForm = document.querySelector('.revealText-modal form');


hideTextLink.addEventListener('click',() =>{
    hideTextModal.classList.add('open');
   });

hideTextModal.addEventListener('click', (e)=>{
    if(e.target.classList.contains('hideText-modal')){
      hideTextModal.classList.remove('open');
      hideTextForm.reset();
  
    }
  });

revealTextLink.addEventListener('click',() =>{
    revealTextModal.classList.add('open');
   });

revealTextModal.addEventListener('click', (e)=>{
    if(e.target.classList.contains('revealText-modal')){
      revealTextModal.classList.remove('open');
      revealTextForm.reset();
  
    }
  });




hideTextForm.addEventListener('submit', (e)=>{
    e.preventDefault();

const myRSA_Encrypt = firebase.functions().httpsCallable('myRSA_Encrypt');
var text=document.getElementById('chosen_text').value;
myRSA_Encrypt({text:text}).then(data =>{
  console.log(data.toString());
})


var img=document.getElementById('myHidingImage');
console.log(text);
console.log(img);

hideTextForm.reset();
hideTextModal.classList.remove('open');

})
