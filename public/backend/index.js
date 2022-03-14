let joinClassForm = document.getElementById('joinClassForm');
let hostedUrl = "";
async function createClass() {
    let form = document.getElementById('form');
    let user = await firebase.auth().currentUser;
    let className = document.getElementById('className').value;
    let close = document.getElementById('close');
    let userArr = [user.email]
    form.reset();
    close.click()
    let date = new Date()
    await db.collection("classes").add({
        class: className,
        creator: user.displayName,
        announcementPermssionBoolean: true,
        creatorPhoto: user.photoURL,
        creatorEmail: user.email,
        user: userArr,
        time: date.getTime(),
    })
        .then(function (docref) {
            db.collection('classes').doc(docref.id).collection("users").doc(user.email).add({
                class: {
                    name: user.displayName,
                    email: user.email,
                    photo: user.photoURL
                }
            })
                .then(function (doc) {
                    setStorage(doc.id)
                    console.log("hey");
                    setTimeout(() => {
                        window.location.assign("../class/");
                    }, 3000);
                })
        })
}


firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        window.localStorage.setItem('email', user.email)
        document.getElementById('profile').src = user.photoURL;
        console.log(user.displayName);
        db.collection("classes").where("user", "array-contains", user.email).onSnapshot((querySnapshot) => {
            cardContainer.innerHTML = "";
            querySnapshot.forEach((doc) => {
                render(doc.data(), doc.id);
            });
        });
    } else {

    }
});

let cardContainer = document.getElementById('card-container');

const render = (data, id) => {
    cardContainer.innerHTML += `
    <div class="class-card" onclick="setStorage('${id}')">
                <div class="card-head">
                    <div class="class-name">${data.class}</div>
                    <div class="class-creator">${data.creator}</div>
                </div>
                <div class="card-profile"><img
                        src="${data.creatorPhoto}" alt=""></div>
                <div class="card-body"></div>
            </div>
    `
}

function setStorage(id) {
    localStorage.setItem('document', id)
    setTimeout(() => {
        window.location.assign("../class/");
    }, 1000);
}

function resetJoinClassForm() {
    joinClassForm.reset();
    joinClassForm.querySelector('.btn-close').click()
}
function joinClass() {
    let currentUser = firebase.auth().currentUser;
    let classCode = document.getElementById('classCode');
    let users = [];
    let flag = true;
    db.collection('classes').doc(`${classCode.value}`).get()
        .then((doc) => {
            const { user } = doc.data();
            users = user
            users.find(element => {
                bool = element === currentUser.email
            })
            if (!bool) {
                users.push(currentUser.email)
                console.log(users)
                db.collection('classes').doc(`${classCode.value}`).update({ user: users })
            }
            else {
                alert("You are already enrolled for the class!")
            }
        })

}

joinClassForm.addEventListener('submit', (e) => {
    e.preventDefault()
    joinClass()
})