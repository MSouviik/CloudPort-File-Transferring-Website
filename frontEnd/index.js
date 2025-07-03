const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browseBtn");
const fileInput = document.querySelector("#fileinput");

const progressContainer = document.querySelector(".progress-container");
const bgProgress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".progress-bar");
const PercentDiv = document.querySelector("#Percent");

const sharingContainer = document.querySelector(".sharing-container")
const fileURLInput = document.querySelector("#fileURL");
const copyBtn = document.querySelector("#copyBtn");

const emailForm = document.querySelector("#emailForm");

const toast = document.querySelector("#toast");
const host = location.origin;
const uploadURL = `${host}/files/upload`;
const emailURL = `${host}/files/upload/sendMail`;

const maxAllowedSize = 100 * 1024 * 1024 //100MB


dropZone.addEventListener("dragover", (e) => {
    e.preventDefault()

    if (!dropZone.classList.contains("dragged")) {
        dropZone.classList.add("dragged");
    }
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragged")
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault()
    dropZone.classList.remove("dragged")
    const files = e.dataTransfer.files
    // console.log(files);
    if (files.length) {
        fileInput.files = files;
        uploadFile();
    }
});

fileInput.addEventListener("change", () => {
    uploadFile();
});

browseBtn.addEventListener("click", () => {
    fileInput.click()
});

copyBtn.addEventListener("click", () => {
    fileURLInput.select()
    document.execCommand("copy")
    showToast("Link Copied")
});

const uploadFile = () => {
    if (fileInput.files.length > 1) {
        fileInput.vale = "";
        showToast("only upload 1 file!")
        return;
    }
    const file = fileInput.files[0];

    if (file.size > maxAllowedSize) {
        showToast("can't upload more than 100MB")
        resetFileIinput();
        return;
    }
    progressContainer.style.display = "block";

    const formData = new FormData();
    formData.append("uploadedFile_", file);

    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            console.log(xhr.response);
            onFileUploadSuccess(xhr.response);
        }
    };

    xhr.upload.onprogress = updateProgress;

    xhr.upload.onerror = () => {
        resetFileIinput();
        showToast(`Error in upload: ${xhr.statusText}`)
    }

    xhr.open("POST", uploadURL);
    xhr.send(formData);
};


const updateProgress = (e) => {
    const percent = Math.round((e.loaded / e.total) * 100);
    // console.log(percent);
    bgProgress.style.width = `${percent}%`;
    PercentDiv.innerText = percent;
    progressBar.style.transform = `scaleX(${percent / 100})`;
};


const onFileUploadSuccess = (res) => {
    fileInput.value = ""; // reset the input
    status.innerText = "Uploaded";

    // remove the disabled attribute from form btn & make text send
    emailForm[2].removeAttribute("disabled");
    emailForm[2].innerText = "Send";
    progressContainer.style.display = "none"; // hide the box

    const { file: url } = JSON.parse(res);
    console.log(url);
    sharingContainer.style.display = "block";
    fileURL.value = url;
};

emailForm.addEventListener("submit", (e) => {
    e.preventDefault()
    console.log("submit form");
    const url = fileURLInput.value;

    const formData = {
        guid: url.split("/").splice(-1, 1)[0],
        toEmail: emailForm.elements["to-email"].value,
        fromEmail: emailForm.elements["from-email"].value,
    };

    const sendBtn = emailForm.querySelector("button");
    sendBtn.disabled = true;
    sendBtn.innerHTML = `<i class="fa fa-spinner fa-spin"></i> Sending...`;  // Spinner icon

    console.table(formData)

    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    })
        .then(res => res.json())
        .then((data) => {
            if (data.success) {
                sharingContainer.style.display = "none";
                showToast("Email Sent");
            } else {
                showToast(data.error || "Failed to send email");
            }
        })
        .catch(err => {
            showToast("Server error while sending email");
        })
        .finally(() => {
            sendBtn.disabled = false;
            sendBtn.innerHTML = `Send`;
        });

});

let toastTimer;
const showToast = (msg) => {
    toast.innerText = msg;
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(-20px)";
    }, 2500);
};

function toggleMenu() {
    const navLinks = document.getElementById("navLinks");
    navLinks.classList.toggle("show");
}