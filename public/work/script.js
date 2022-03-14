const dropArea = document.querySelector(".drag-area");
const title = document.querySelector("#title");
let description = document.getElementById("description");
(button = dropArea.querySelector("button")),
  (input = dropArea.querySelector("input"));
let fileName = document.getElementById("fileName");
let progressBar = document.getElementById("progress");
let admin = "";
let docRefID = "";
async function getData(doc) {
  let currentUser = firebase.auth().currentUser;
  data = doc.data();
  users = data.user;
  if (users.includes(`${currentUser.email}`)) {
    admin = data.creatorEmail;
  }
}

document.title = window.localStorage.getItem('className')
db.collection("classes")
  .doc(window.localStorage.getItem("document"))
  .onSnapshot((doc) => {
    admin = doc.data().creatorEmail;
    getData(doc);
  });
let file;
button.onclick = () => {
  input.click();
};
input.addEventListener("change", function () {
  file = this.files;
  dropArea.classList.add("active");
  showFile();
});
dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropArea.classList.add("active");
});
dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("active");
});
dropArea.addEventListener("drop", (event) => {
  event.preventDefault();
  file = event.dataTransfer.files;
  showFile();
});
function showFile() {
  for (let i = 0; i < file.length; i++) {
    let fileReader = new FileReader();
    fileReader.onload = () => {
      let fileURL = fileReader.result;
      fileName.innerHTML += file[i].name + "<br>";
    };
    fileReader.readAsDataURL(file[i]);
  }
}

function resetFileInput() {
  let fileInput = document.querySelector("input[type=file]");
  fileInput.value = "";
  fileName.innerHTML = "";
  progressBar.style.width = "0%";
  progressBar.innerHTML = "";
}

let filesArr = [];

function saveFiles() {
  let currentUser = firebase.auth().currentUser;
  for (let i = 0; i < file.length; i++) {
    progressBar.style.display = "";
    let nowDate = getDate();
    db.collection("classes")
      .doc(window.localStorage.getItem("document"))
      .collection("work")
      .add({
        type: "assignment",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        date: nowDate,
        user: currentUser.displayName,
        email: currentUser.email,
        creatorEmail: admin,
        data: filesArr,
      })
      .then((doc) => {
        docRefID = doc.id;
      });
    var ref = firebase.storage().ref().child(`${docRefID}/${file[i].name}`).put(file[i]);
    ref.on(
      "state_changed",
      (snapshot) => {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBar.style.width = progress + "%";
        progressBar.innerHTML = file[i].name;
      },
      (error) => {
        console.log(error);
      },
      () => {
        ref.snapshot.ref.getDownloadURL().then((downloadURL) => {
          let obj = {
            name: file[i].name,
            url: downloadURL,
            type: file[i].type,
          };
          filesArr.push(obj);
        });
      }
    );
  }
}

function postWork() {
  db.collection("classes")
    .doc(window.localStorage.getItem("document"))
    .collection("work")
    .doc(docRefID)
    .update({
      title: title.value,
      description: description.value,
      data: filesArr
    })
    .then(() => {
      setTimeout(() =>{
        window.location = "/class/"
      }, 1000)
    });
}

function getDate() {
  let newDate = new Date();
  let date, month;
  if (newDate.getDate() <= 9) {
    date = `0${newDate.getDate()}`;
  } else {
    date = newDate.getDate();
  }
  if (newDate.getMonth() <= 9) {
    month = `0${newDate.getMonth() + 1}`;
  } else {
    month = newDate.getMonth() + 1;
  }
  let dateString = `${date}-${month}-${newDate.getFullYear()}`;
  return dateString;
}
