const hideTextLink = document.querySelector('.hidetext');
const hideTextModal = document.querySelector('.hideText-modal');
const hideTextForm = document.querySelector('.hideText-modal form');
const revealTextLink = document.querySelector('.revealtext');
const revealTextModal = document.querySelector('.revealText-modal');
const revealTextForm = document.querySelector('.revealText-modal form');
var dict ={0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,'a':10,'b':11,'c':12,'d':13,'e':14,'f':15,'g':16,'h':17,'i':18,'j':19,'k':20,'l':21,'m':22,'n':23,'o':24,'p':25,'q':26,'r':27,'s':28,'t':29,'u':30,'v':31,'w':32,'x':33,'y':34,'z':35,'A': 36,
'B': 37,
'C': 38,
'D': 39,
'E': 40,
'F': 41,
'G': 42,
'H': 43,
'I': 44,
'J': 45,
'K': 46,
'L': 47,
'M': 48,
'N': 49,
'O': 50,
'P': 51,
'Q': 52,
'R': 53,
'S': 54,
'T': 55,
'U': 56,
'V': 57,
'W': 58,
'X': 59,
'Y': 60,
'Z': 61,
'+':62,'/':63,'=':64}

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


revealTextForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  var sourceimg = document.getElementById('SourceImage');
  var hiddenimg = document.getElementById('SourceImageReveal');
  var originalimg = document.getElementById('SourceOriginal');
  //var originalimg = document.getElementById('originalRevealingImage');
  hiddenimg.style.display="none";
  originalimg.style.display="none";
  const myRSA_Decrypt = firebase.functions().httpsCallable('myRSA_Decrypt');

  canvas = document.getElementById('Canvas');
  context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = hiddenimg.width;
  canvas.height = hiddenimg.height;


  context.drawImage(hiddenimg, 0,0,canvas.width,canvas.height);
  var imageDataHidden = context.getImageData(0, 0, canvas.width, canvas.height);
  console.log(imageDataHidden);
  
  context.drawImage(originalimg,0,0,canvas.width,canvas.height);
  var imageDataOriginal = context.getImageData(0, 0, canvas.width, canvas.height);
  console.log(imageDataOriginal);

  var HiddenMsg=[];
  var decodedMsg;
  console.log(imageDataHidden.data[0]);
  var length = imageDataHidden.data[0];
  console.log(length);
  for(var i=0;i<length;i++){
    //consol e.log(HiddenMsg)
    HiddenMsg[i]=Math.abs(imageDataOriginal.data[i+1]-imageDataHidden.data[i+1]);
  }

  console.log(HiddenMsg);
  //myRSA_Decrypt({RSA:HiddenMsg}).then(data =>{
    //console.log(data);
  //})
  /*
      myRSA_Decrypt({msg:HiddenMsg}).then(data=>{
        console.log(data);
      })
*/
      var myImage=[];
      const ref = firebase.firestore().collection('images');
      ref.onSnapshot(snapshot => {
        snapshot.forEach(doc => {
            console.log(HiddenMsg);
            console.log(doc.data().rsa);
            if(closeEnough(doc.data().rsa,HiddenMsg)){
              myImage.push({...doc.data(), id: doc.id});
            }
        });
        /*
        if(myImage.length==0){
          console.log("No matching results,please encrypt a file with our website.");
        }
        else{
          */
        if(myImage.length>0){  
          decodedMsg=(myImage[0].decodedData);
        //}
        document.getElementById('revealed').style.display="block";
        
        document.getElementById('revealed').textContent="Your revealed text is:"+decodedMsg;
      }
      else{

        alert("No matching");
        document.getElementById('revealed').style.display="none";
        document.getElementById('revealed').textContent="";
      }
        document.getElementById("myBtn").style.display="none"; 
        sourceimg.style.display="none";
        document.getElementById("Canvas").style.display="none"; 
        hiddenimg.style.display="none";
        originalimg.style.display="none";
        revealTextForm.reset();
        revealTextModal.classList.remove('open');

      })
})

hideTextForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    document.getElementById("myBtn").style.display="block"; 
    
    document.getElementById("SourceImage").style.display="block";
    document.getElementById("Canvas").style.display="block";
    document.getElementById('revealed').style.display="none";
    document.getElementById('revealed').textContent="";
const myRSA_Encrypt = firebase.functions().httpsCallable('myRSA_Encrypt');
const addImage = firebase.functions().httpsCallable('addImage');
var text=document.getElementById('chosen_text').value;
var img=document.getElementById('myHidingImage');
console.log(text);
console.log(img.value);
//if(text==""||text.length>20){
  //alert("Please set your message to be 1~20 characters");
  //hideTextForm.reset();
//}

if(img.value=="")
alert("Please choose an image")
else{
myRSA_Encrypt({text:text}).then(data =>{
  
  //console.log(data.data.data);
  console.log(data.data);
  console.log(data.data.decodedData)
  var arr=[];
  for(var i=0;i<data.data.data.length;i++){
    arr[i]=dict[data.data.data[i]];
  }
  if(init(data.data)==false){
    alert("Picture chosen is not good enough for hiding,please choose another.");
    document.getElementById("Canvas").style.display="none";
    window.location.reload();
  }
  else{
  addImage({RSA:arr,decodedData:data.data.decodedData})
  .then(() =>{
    console.log("done");
    document.getElementById("myBtn").style.display="block";

  })
  .catch(error =>{
    console.log(error);
  });
}
});
  
}


hideTextForm.reset();
hideTextModal.classList.remove('open');

})


function onFileSelectedHide(event) {
  var selectedFile = event.target.files[0];
  var reader = new FileReader();

  var imgtag = document.getElementById("SourceImage");
  imgtag.title = selectedFile.name;

  reader.onload = function(event) {
    imgtag.src = event.target.result;
  };
  reader.readAsDataURL(selectedFile);

}
function onFileSelectedReveal(event) {
  var selectedFile = event.target.files[0];
  var reader = new FileReader();

  var imgtag = document.getElementById("SourceImageReveal");
  console.log(imgtag);
  imgtag.title = selectedFile.name;
  reader.onload = function(event) {
    imgtag.src = event.target.result;
  };
  reader.readAsDataURL(selectedFile);

}
function onFileSelectedRevealOriginal(event) {
  var selectedFile = event.target.files[0];
  var reader = new FileReader();

  var imgtag = document.getElementById("SourceOriginal");
  console.log(imgtag);
  imgtag.title = selectedFile.name;

  reader.onload = function(event) {
    imgtag.src = event.target.result;
  };
  reader.readAsDataURL(selectedFile);

}

var canvas;
var context;

function init(data) {
  console.log("in init");
  var image = document.getElementById('SourceImage');
  effectButton = document.getElementById('EffectButton');
  paintButton = document.getElementById('PaintButton');
  canvas = document.getElementById('Canvas');
  context = canvas.getContext('2d');
  
  // Set the canvas the same width and height of the image
  canvas.width = image.width;
  canvas.height = image.height;
  //canvas.width=317;
  //canvas.height=240;

  drawImage(image);
  return addEffect(data);
}
function drawImage(image) {
  canvas = document.getElementById('Canvas');
  context.drawImage(image, 0,0,canvas.width,canvas.height);
}

function addEffect(data) {
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var flag=HideEncryptedMessage(imageData.data,data.data);
    if(flag){
      context.putImageData(imageData, 0, 0);
      return true;
    }
    else{
      return false;
    }
}

function HideEncryptedMessage(data,textData) {
  console.log(data);
  console.log(textData);
  data[0]=textData.length;
  console.log(textData.length/data.length);
  if(textData.length/data.length<0.1){
  for (var i = 1; i < textData.length+1; i=i+1 ) {
    if(data[i]-dict[textData[i-1]]<0)
    data[i] = data[i]+dict[textData[i-1]];
    else{
      data[i] = data[i]-dict[textData[i-1]]
    }
  }

  console.log(data);
  return true
}
else{
  return false
}
}


function closeEnough(dataRSA,RSA){
  var count=0;
  for(var i=0;i<RSA.length;i++){
    if(Math.abs(dataRSA[i]-RSA[i])>2){
      count++
    }
    }
  if(count<10)
  {
    console.log(dataRSA)
    return true;
  }
  return false;
}


function download_image(){
  var canvas = document.getElementById("Canvas");
  image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  var link = document.createElement('a');
  link.download = "my-image.png";
  link.href = image;
  link.click();
}