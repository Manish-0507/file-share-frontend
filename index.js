const dropZone = document.querySelector(".drop-zone")
const browseBtn=document.querySelector(".browseBtn")
const fileInput = document.querySelector('#fileInput');

const progressContainer = document.querySelector('.progress-container');
const bgProgress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".progress-bar");
const percentDiv = document.querySelector('#percent');

const fileUrlInput = document.querySelector('#fileUrl');
const sharingContainer = document.querySelector('.sharing-container');
const copyBtn = document.querySelector('#copy-btn');


const submitBtn = document.querySelector('#submit-btn');
const toast = document.querySelector('.toast');

const host = "https://file-sharing-backend-live.herokuapp.com/";
const uploadUrl = `${host}api/files`;
const emailUrl = `${host}api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024;

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();//by default drag krte hi file download ho ja rhi thi so usko stop krne ko....
    if (!dropZone.classList.contains("dragged")) {
        dropZone.classList.add('dragged');
    }
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragged");
})

dropZone.addEventListener('drop', (e) => {//is e m sb kime aa jya h chahe log krwake dekh le.....or isma wa file bhi aa jya h jo aapi drop kranga.
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files = e.dataTransfer.files;
    if (files.length) {
        fileInput.files = files;
        uploadFile();
    }
    
})

fileInput.addEventListener('change', () => {
    uploadFile();//ye isliye chlaya fir se kyuki...uper jb upload kiya to sidha ek link mil rha h file ka wo upload nhi horha h to fir se kiya h.
})

browseBtn.addEventListener('click', () => {
    fileInput.click();
})

copyBtn.addEventListener("click", () => {
    fileUrlInput.select();//select kr dega us url ko.
    document.execCommand("copy");//mtlb jo bhi user select kiya hoga wo copy ho jayega.orText is read from the DOM and placed on the clipboard.
    showToast("copied to clipboard")
})

const uploadFile = () => {
    if (fileInput.files.length > 1) {
        resetFileInput()
        showToast("only upload one file");
        return;
    }
    const file = fileInput.files[0]
    if (file.size > maxAllowedSize) {
        showToast("max size can be 100mb only!")
        resetFileInput()
        return;
    }
    progressContainer.style.display = "block";
    const formData = new FormData()
    formData.append("myfile",file);
 
    const xhr = new XMLHttpRequest(); 
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            onUploadSuccess(JSON.parse(xhr.response));//converting a json to a javascript object.
       }
    }

    //upload progress
    xhr.upload.onprogress = updateProgress;
    xhr.upload.error = () => {
        resetFileInput()
        showToast(`Error in uploading:${xhr.statusText}`);
    }
    
    xhr.open("POST", uploadUrl);//ye ek portal open kiya h.
    xhr.send(formData)//or yha hum is portal me send kr denge.
}

const updateProgress = (e) => {//ye jo e h wo bhot kuchh return krta h but hum dekhenge total kitne bytes h or upload kitne ho gye.
    const percent = Math.round(e.loaded / e.total) * 100;
    bgProgress.style.width = `${percent}%`;
    progressBar.style.transform = `scaleX(${percent/100})`;
    percentDiv.innerText = percent;

}

const onUploadSuccess = ({file:url}) => {//yha res.file krna pdta to usme se destructure krke sidha file nikal liya.
    console.log(url);
    submitBtn.removeAttribute("disabled", "true");
    progressContainer.style.display = "none";
    sharingContainer.style.display = "block";
    fileUrlInput.value = url
}

submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const url =fileUrlInput.value;

    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],///us url m t last m ek unique id si how h ek wa kaadi h space t saari string split kr li fer -1 mtlb peecha t 1 item choose krya or fer 1 mtlb wo 1 remove krke bahr store kr liya.
        emailTo: document.querySelector('#receiver').value,
        emailFrom:document.querySelector('#sender').value,
    };
    console.log(formData);
    submitBtn.setAttribute("disabled", "true");//choosing button element from email-form.
    fetch(emailUrl, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            
        },
        body: JSON.stringify(formData)
    }).then(res => res.json())
      .then(({success}) => {//destructured from the response it returns success :true if it is success in sending..
          if (success) {
              sharingContainer.style.display = "none";
              showToast("Email sent!");
         }
    })
})

let toastTimer;
const showToast = (msg) => {
    toast.innerText = msg;
    toast.style.transform = "translate(-50%,0)";
     clearTimeout(toastTimer);
     toastTimer=setTimeout(() => {
        toast.style.transform = "translate(-50%,60px)";
    },2000)
}

const resetFileInput = () => {
    fileInput.value = "";
}




























