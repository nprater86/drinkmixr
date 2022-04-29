//grab the fave count and fave buttons
let faveCount = document.getElementById("faveCount");
let faveBtn = document.getElementById("faveBtn");

function getRecipe () {
    let recipe_id = document.getElementById("hiddenRecipeId").value;
    let user_id = document.getElementById("hiddenUserId").value;

    fetch(`http://localhost:5000/recipes/get/${recipe_id}`)
        .then(res =>  res.json())
        .then(data => {
            //Show/display faveBtn
            if (user_id == data['user_id']) {
                faveBtn.style.display = "none";
            }

            //make fave/unfave depending on if logged user faved this recipe or not
            let isFavorited = false;
            for (faved_user of data['favorited_users']){
                if (faved_user['id'] == user_id) {
                    isFavorited = true;
                }
            }
            if (isFavorited) {
                faveBtn.innerHTML = `<button id="faveBtn" class="btn btn-link" onclick="unfavorite(${recipe_id})">Unfavorite</button>`;
            } else {
                faveBtn.innerHTML = `<button id="faveBtn" class="btn btn-link" onclick="favorite(${recipe_id})">Favorite</button>`;
            }

            //update fave count
            if (data['favorited_users']) {
                faveCount.innerHTML = data['favorited_users'].length
            } else {
                faveCount.innerHTML = 0;
            }
            let directionsContainer = document.getElementById("directionsContainer");
            let directions = data.directions;
            directions.replace('\r\n','<br/>');
            let directionsChild = document.createElement('p');
            directionsChild.innerHTML = directions;
            directionsContainer.appendChild(directionsChild);

            //add comments to page
            let commentsArea = document.getElementById('commentsArea');

            if (data['comments'].length > 0){
                for (comment of data['comments']) {

                    let commentBox = document.createElement('div');
                    commentBox.setAttribute('class','commentBox');
                    commentBox.setAttribute('id',`comment${comment['id']}`);

                    let writer = document.createElement('h6');
                    let date = new Date(comment['created_at']);
                    let formatted_date = formatDate(date);
                    writer.innerHTML = `${comment['user_name']} wrote on ${formatted_date}`;
                    commentBox.appendChild(writer);

                    let content = document.createElement('p');
                    content.innerHTML = comment['content'];
                    commentBox.appendChild(content);

                    if (user_id == comment['user_id']) {
                        let deleteBtn = document.createElement('button');
                        deleteBtn.setAttribute('class','btn btn-link btn-sm');
                        deleteBtn.setAttribute('onclick',`deleteComment(${comment['id']})`);
                        deleteBtn.innerHTML = 'Delete Comment';
                        commentBox.appendChild(deleteBtn);
                    }

                    commentsArea.appendChild(commentBox);
                }
            }
        })
}

//format date for comments
function formatDate(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = (hours + 5) + ':' + minutes + ' ' + ampm;
    return (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
}


getRecipe();

//add favorite functionality

function favorite(recipe_id){
    fetch(`http://localhost:5000/addFavorite/${recipe_id}`, {method:"POST"})
        .then(
            faveBtn.innerHTML = `<button id="faveBtn" class="btn btn-link" onclick="unfavorite(${recipe_id})">Unfavorite</button>`,
            faveCount.innerHTML++
        )
}

function unfavorite(recipe_id){
    fetch(`http://localhost:5000/unFavorite/${recipe_id}`, {method:"POST"})
    .then(
        faveBtn.innerHTML = `<button id="faveBtn" class="btn btn-link" onclick="favorite(${recipe_id})">Favorite</button>`,
        faveCount.innerHTML--
    )
}

//comment form
let addComment = document.getElementById('addComment');
let addCommentBtn = document.getElementById('addCommentBtn');

addCommentBtn.onclick = () => {
    addComment.style.display = "inline";
    document.getElementById('commentContent').focus();
}

function cancelComment(e) {
    e.preventDefault();
    document.getElementById('commentContent').value = '';
    addComment.style.display = "none";
}


let addCommentForm = document.getElementById('addCommentForm')

addCommentForm.onsubmit = (event) => {
    event.preventDefault();

    let addCommentForm = document.getElementById('addCommentForm')
    let form = new FormData(addCommentForm);

    fetch("http://localhost:5000/add_comment", {method:"POST", body:form})

    location.reload();
}

function refreshComments() {
    console.log("refreshComments!")
    let recipe_id = document.getElementById("hiddenRecipeId").value;
    let user_id = document.getElementById("hiddenUserId").value;

    fetch(`http://localhost:5000/recipes/get/${recipe_id}`)
        .then(res =>  res.json())
        .then(data => {
            console.log(data);
            let commentsArea = document.getElementById('commentsArea');
            //wipe comments
            commentsArea.innerHTML = '';

            //add comments back to page
            if (data['comments'].length > 0){
                for (comment of data['comments']) {

                    let commentBox = document.createElement('div');
                    commentBox.setAttribute('class','commentBox');
                    commentBox.setAttribute('id',`comment${comment['id']}`);

                    let writer = document.createElement('h6');
                    let date = new Date(comment['created_at']);
                    let formatted_date = formatDate(date);
                    writer.innerHTML = `${comment['user_name']} wrote on ${formatted_date}`;
                    commentBox.appendChild(writer);

                    let content = document.createElement('p');
                    content.innerHTML = comment['content'];
                    commentBox.appendChild(content);

                    if (user_id == comment['user_id']) {
                        let deleteBtn = document.createElement('button');
                        deleteBtn.setAttribute('class','btn btn-link btn-sm');
                        deleteBtn.setAttribute('onclick',`deleteComment(${comment['id']})`);
                        deleteBtn.innerHTML = 'Delete Comment';
                        commentBox.appendChild(deleteBtn);
                    }

                    commentsArea.appendChild(commentBox);
                }
            }
        })
}

function deleteComment(comment_id) {
    fetch(`http://localhost:5000/delete_comment/${comment_id}`)
        .then(document.getElementById(`comment${comment_id}`).remove())
}