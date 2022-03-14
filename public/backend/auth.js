const provider = new firebase.auth.GoogleAuthProvider();
const db = firebase.firestore();
const signIn = () => {
    firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
            console.log(result.user.displayName);
        }).catch((error) => {
            console.log(error.message);
        });
}

const signOut = () => {
    firebase.auth().signOut().then(() => {
        console.log("User logged out");
    }).catch((error) => {
        console.log(error.message);
    });

}

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        window.localStorage.setItem('email', user.email)
        document.getElementById('profile').src = user.photoURL;
    } else {
        signIn();
    }
});
