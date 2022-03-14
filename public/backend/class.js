let className = document.querySelector(".class-name");
let logo = document.querySelector(".logo");
let classOwner = document.querySelector(".class-owner");
let worksContainer = document.getElementById("worksContainer");
let classCode = document.getElementById("classCode");
let sendAnnouncementBtn = document.getElementById("sendAnnouncementBtn");
let usersContainer = document.getElementById("users-container");
let worksAssignement = document.getElementById("worksAssignement");
let flag = false;
let users = [];
let data;
let admin = "";

db.collection("classes")
  .doc(window.localStorage.getItem("document"))
  .onSnapshot((doc) => {
    admin = doc.data().creatorEmail;
    getData(doc);
  });

async function getData(doc) {
  let currentUser = firebase.auth().currentUser;
  data = doc.data();
  users = data.user;
  if (users.includes(`${currentUser.email}`)) {
    admin = data.creatorEmail;
    document.title = data.class;
    className.innerHTML = data.class;
    logo.innerHTML = data.class;
    classOwner.innerHTML = data.creator;
    classCode.innerHTML = doc.id;
    announcementPermission.checked = data.announcementPermssionBoolean;
    window.localStorage.setItem("className", data.class);
    window.localStorage.setItem(
      "announcement_permission",
      data.announcementPermssionBoolean
    );
    adminClassName.value = data.class;
    inviteLink.value = `https://class-suit.web.app/?classCode=${doc.id}`;
    adminSettings(data);
    renderUsers(data.user);
  } else {
    window.location.href = "/";
  }
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

function renderUsers(arr) {
  console.log(admin);
  usersContainer.innerHTML = "";
  for (let i = 0; i < arr.length; i++) {
    if (admin === arr[i]) {
      usersContainer.innerHTML += `
                <div class="user-card">
                    <div class="user">${arr[i]}</div>
                </div>
        `;
    } else {
      usersContainer.innerHTML += `
                <div class="user-card">
                    <div class="user">${arr[i]}</div>
                    <i onclick="removeUser('${arr}', '${arr[i]}')" class="bi bi-trash3-fill"></i>
                </div>
        `;
    }
  }
}

function removeUser(arr, user) {
  let newArr = arr.split(",");
  console.log(newArr);
  db.collection("classes")
    .doc(window.localStorage.getItem("document"))
    .update({
      user: firebase.firestore.FieldValue.arrayRemove(user),
    });
}

function sendAnnouncement() {
  let currentUser = firebase.auth().currentUser;
  let announcement = document.getElementById("announcement");
  let nowDate = getDate();
  db.collection("classes")
    .doc(window.localStorage.getItem("document"))
    .collection("work")
    .add({
      data: announcement.value,
      type: "announcement",
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      date: nowDate,
      user: currentUser.displayName,
      email: currentUser.email,
      creatorEmail: admin,
    });
}

db.collection("classes")
  .doc(window.localStorage.getItem("document"))
  .collection("work")
  .orderBy("timestamp")
  .onSnapshot((querySnapshot) => {
    var works = [];
    querySnapshot.forEach((doc) => {
      let obj = {
        id: doc.id,
        data: doc.data(),
      };
      works.push(obj);
    });
    renderWorks(works);
  });

function renderWorks(works) {
  worksContainer.innerHTML = "";
  for (let i = works.length - 1; i >= 0; i--) {
    console.log(works[i]);
    if (works[i].data.type === "announcement") {
      let { id, data } = works[i];
      worksContainer.innerHTML += `
            <div class="card my-3">
                <div class="card-header">
                    <div class="right">
                        <div class="card-name">${data.user}</div>
                        <div class="date">${data.date}</div>
                    </div>
                    <div class="delete" name="${id}" onclick="deleteWork('${id}', '${data.email}', '${data.creatorEmail}')">
                        <i class="bi bi-trash3-fill"></i>
                    </div>
                </div>
                <div class="card-body">
                ${data.data}
                </div>
            </div>
            `;
    } else {
      localStorage.setItem("workData", JSON.stringify(works[i]));
      let { id, data } = works[i];
      worksContainer.innerHTML += `
            <div class="card my-3">
                <div class="card-header">
                    <div class="right">
                        <div class="card-name">${data.user}</div>
                        <div class="date">${data.date}</div>
                    </div>
                    <div class="delete" name="${id}" onclick="deleteWork('${id}', '${data.email}', '${data.creatorEmail}')">
                        <i class="bi bi-trash3-fill"></i>
                    </div>
                </div>
                <div class="card-body">
               <a title="Click Here To View The Documents" onclick="saveDocIdToLocalStorage('${id}')"> ${data.title}</a>
                </div>
            </div>
            `;
      renderInWorkSections(works[i]);
    }
  }
}

function deleteWork(id, email, creatorEmail) {
  let currentUser = firebase.auth().currentUser;
  if (email === currentUser.email || currentUser.email === creatorEmail) {
    db.collection("classes")
      .doc(window.localStorage.getItem("document"))
      .collection("work")
      .doc(id)
      .delete()
      .then(function () {
        var alertPlaceholder = document.getElementById("liveAlertPlaceholder");
        var alertTrigger = document.getElementById("liveAlertBtn");

        if (alertTrigger) {
          alertTrigger.addEventListener("click", function () {
            alert("Nice, you triggered this alert message!", "success");
          });
        }
      });
  } else {
    alert("Cannot Delete The Announcement");
  }
}

function adminSettings(data) {
  let currentUser = firebase.auth().currentUser;
  if (currentUser.email === data.creatorEmail) {
    settingsSection.style.display = "";
    navigateSettings.style.display = "";
    membersSection.style.display = "";
    navigateMembers.style.display = "";
  } else {
    settingsSection.style.display = "none";
    navigateSettings.style.display = "none";
    membersSection.style.display = "none";
    navigateMembers.style.display = "none";
  }
  if (currentUser.email !== data.creatorEmail) {
    if (data.announcementPermssionBoolean) {
      accordianAnnoucement.style.display = "";
    } else {
      accordianAnnoucement.style.display = "none";
    }
  }
}

function navigate(page) {
  let announcementSection = document.getElementById("announcementSection");
  let workSection = document.getElementById("workSection");
  let membersSection = document.getElementById("membersSection");
  let settingsSection = document.getElementById("settingsSection");
  let navigateAnnouncements = document.getElementById("navigateAnnouncements");
  let navigateWork = document.getElementById("navigateWork");
  let navigateMembers = document.getElementById("navigateMembers");
  let navigateSettings = document.getElementById("navigateSettings");
  switch (page) {
    case "annoucements":
      announcementSection.classList.remove("d-none");
      workSection.classList.add("d-none");
      membersSection.classList.add("d-none");
      settingsSection.classList.add("d-none");
      navigateAnnouncements.classList.add("active");
      navigateWork.classList.remove("active");
      navigateMembers.classList.remove("active");
      navigateSettings.classList.remove("active");
      break;
    case "members":
      announcementSection.classList.add("d-none");
      membersSection.classList.remove("d-none");
      workSection.classList.add("d-none");
      settingsSection.classList.add("d-none");
      navigateAnnouncements.classList.remove("active");
      navigateMembers.classList.add("active");
      navigateWork.classList.remove("active");
      navigateSettings.classList.remove("active");
      break;
    case "work":
      announcementSection.classList.add("d-none");
      membersSection.classList.add("d-none");
      workSection.classList.remove("d-none");
      settingsSection.classList.add("d-none");
      navigateAnnouncements.classList.remove("active");
      navigateMembers.classList.remove("active");
      navigateWork.classList.add("active");
      navigateSettings.classList.remove("active");
      break;
    case "settings":
      announcementSection.classList.add("d-none");
      membersSection.classList.add("d-none");
      workSection.classList.add("d-none");
      settingsSection.classList.remove("d-none");
      navigateAnnouncements.classList.remove("active");
      navigateMembers.classList.remove("active");
      navigateWork.classList.remove("active");
      navigateSettings.classList.add("active");
      break;
    default:
      announcementSection.classList.remove("d-none");
      workSection.classList.add("d-none");
      membersSection.classList.add("d-none");
      settingsSection.classList.add("d-none");
      navigateAnnouncements.classList.add("active");
      navigateWork.classList.remove("active");
      navigateMembers.classList.remove("active");
      navigateSettings.classList.remove("active");
      break;
  }
}

navigate("announcements");

function copyCode() {
  navigator.clipboard.writeText(classCode.innerHTML);
  alert("Copied the text: " + classCode.innerHTML);
}

function updateChanges() {
  let docRef = db
    .collection("classes")
    .doc(window.localStorage.getItem("document"));
  let obj = {
    class: adminClassName.value,
    announcementPermssionBoolean: announcementPermission.checked,
  };
  docRef.update(obj);
}

function cancelChanges() {
  adminClassName.value = window.localStorage.getItem("className");
  announcementPermission.checked = Boolean(
    window.localStorage.getItem("announcement_permission")
  );
}

function saveDocIdToLocalStorage(docId) {
  localStorage.setItem("work_ID", docId);
  window.location = "/work/view/";
}

function redirectToWork() {
  window.location = "/work/";
}

function renderInWorkSections(works) {
  let { id, data } = works;

  worksAssignement.innerHTML += `
  <div class="card my-3">
  <div class="card-header">
      <div class="right">
          <div class="card-name">${data.user}</div>
          <div class="date">${data.date}</div>
      </div>
      <div class="delete" name="${id}" onclick="deleteWork('${id}', '${data.email}', '${data.creatorEmail}')">
          <i class="bi bi-trash3-fill"></i>
      </div>
  </div>
  <div class="card-body">
 <a title="Click Here To View The Documents" onclick="saveDocIdToLocalStorage('${id}')"> ${data.title}</a>
  </div>
</div>
`;
}
