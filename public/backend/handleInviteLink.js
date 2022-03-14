let queryString = window.location.search;
let urlParam = new URLSearchParams(queryString);
let id = urlParam.get('classCode');
if (id) {
    joinClassModalBtn.click();
    classCode.value = id
}