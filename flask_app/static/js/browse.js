//get all recipes to populate table
async function getRecipes(){
    //get user favorites first
    let response = await fetch('http://localhost:5000/get_user_info', {method:"POST"});
    let user = await response.json();

    fetch(`http://localhost:5000/all_recipes`, {method:"POST"})
        .then(res =>  res.json())
        .then(data =>  {
            if (data != null){
                let recipes = document.getElementById("recipes");
                for (let i = 0; i < data.length; i++){
                    let row = document.createElement('tr');
                    row.setAttribute("id",`recipe${data[i].id}`);

                    let favoriteCount = document.createElement('td');
                    favoriteCount.setAttribute('class','align-middle text-center');
                    favoriteCount.setAttribute('id',`faveCount${data[i].id}`);
                    //count the favorites
                    if (data[i]['favorited_users']){
                        favoriteCount.innerHTML = data[i]['favorited_users'].length;
                    } else {
                        favoriteCount.innerHTML = 0;
                    }
                    row.appendChild(favoriteCount);

                    let name = document.createElement('td');
                    name.setAttribute('class','align-middle');
                    name.setAttribute("id",`name${data[i].id}`);
                    name.innerHTML = data[i].name;
                    row.appendChild(name);

                    let createdBy = document.createElement('td');
                    createdBy.setAttribute('class','align-middle');
                    createdBy.setAttribute("id",`createdBy${data[i].id}`);
                    createdBy.innerHTML = data[i].user_name;
                    row.appendChild(createdBy);

                    let description = document.createElement('td');
                    description.setAttribute("id",`description${data[i].id}`);
                    description.innerHTML = data[i].description;
                    row.appendChild(description);

                    let spirit = document.createElement('td');
                    spirit.setAttribute('class','align-middle');
                    spirit.setAttribute("id",`spirit${data[i].id}`);
                    spirit.innerHTML = data[i]['spirits.name'];
                    row.appendChild(spirit);

                    let actions = document.createElement('td');
                    actions.setAttribute('class','align-middle');
                    actions.setAttribute('id',`actions${data[i].id}`)

                    //check to see if user favorited this yet or not
                    let userFavorited = false;
                    if (user['favorited_recipes']){
                        for (let favorite of user['favorited_recipes']){
                            if (favorite['id'] == data[i].id){
                                userFavorited = true;
                            }
                        }
                    }
                    //now add favorite or unfavorite button depending on favorite status
                    if (userFavorited == true) {
                        actions.innerHTML = `<a href='/recipes/${data[i].id}'><button class="btn btn-link">view directions</button></a> | <button class="btn btn-link" onclick='unfavorite(${data[i].id})'>unfavorite</button>`;
                    } else {
                        actions.innerHTML = `<a href='/recipes/${data[i].id}'><button class="btn btn-link">view directions</button></a> | <button class="btn btn-link" onclick='favorite(${data[i].id})'>favorite</button>`;
                    }
                    row.appendChild(actions);

                    recipes.appendChild(row);
                }
            }
        })
}

getRecipes();

//add favorite functionality

function favorite(recipe_id){
    fetch(`http://localhost:5000/addFavorite/${recipe_id}`, {method:"POST"})
        .then(
            document.getElementById(`actions${recipe_id}`).innerHTML = `<a href='/recipes/${recipe_id}'><button class="btn btn-link">view directions</button></a> | <button class="btn btn-link" onclick='unfavorite(${recipe_id})'>unfavorite</button>`,
            document.getElementById(`faveCount${recipe_id}`).innerHTML++
        )
}

function unfavorite(recipe_id){
    fetch(`http://localhost:5000/unFavorite/${recipe_id}`, {method:"POST"})
        .then(
            document.getElementById(`actions${recipe_id}`).innerHTML = `<a href='/recipes/${recipe_id}'><button class="btn btn-link">view directions</button></a> | <button class="btn btn-link" onclick='favorite(${recipe_id})'>favorite</button>`,
            document.getElementById(`faveCount${recipe_id}`).innerHTML--
        )
}

//spirit filter 

let spiritFilter = document.getElementById('spiritFilter');

spiritFilter.onchange = async function () {
    if (spiritFilter.value == 0){
        document.getElementById("recipes").innerHTML = '';
        getRecipes();
    } else {
        document.getElementById("recipes").innerHTML = '';
            //get user favorites first
    let response = await fetch('http://localhost:5000/get_user_info', {method:"POST"});
    let user = await response.json();
    console.log(user);

    fetch(`http://localhost:5000/all_recipes_by_spirit/${spiritFilter.value}`, {method:"POST"})
        .then(res =>  res.json())
        .then(data =>  {
            console.log(data);
            if (data != null){
                let recipes = document.getElementById("recipes");
                for (let i = 0; i < data.length; i++){
                    let row = document.createElement('tr');
                    row.setAttribute("id",`recipe${data[i].id}`);

                    let favoriteCount = document.createElement('td');
                    favoriteCount.setAttribute('class','align-middle text-center');
                    favoriteCount.setAttribute('id',`faveCount${data[i].id}`);
                    //count the favorites
                    if (data[i]['favorited_users']){
                        favoriteCount.innerHTML = data[i]['favorited_users'].length;
                    } else {
                        favoriteCount.innerHTML = 0;
                    }
                    row.appendChild(favoriteCount);

                    let name = document.createElement('td');
                    name.setAttribute('class','align-middle');
                    name.setAttribute("id",`name${data[i].id}`);
                    name.innerHTML = data[i].name;
                    row.appendChild(name);

                    let createdBy = document.createElement('td');
                    createdBy.setAttribute('class','align-middle');
                    createdBy.setAttribute("id",`createdBy${data[i].id}`);
                    createdBy.innerHTML = data[i].user_name;
                    row.appendChild(createdBy);

                    let description = document.createElement('td');
                    description.setAttribute("id",`description${data[i].id}`);
                    description.innerHTML = data[i].description;
                    row.appendChild(description);

                    let spirit = document.createElement('td');
                    spirit.setAttribute('class','align-middle');
                    spirit.setAttribute("id",`spirit${data[i].id}`);
                    spirit.innerHTML = data[i]['spirits.name'];
                    row.appendChild(spirit);

                    let actions = document.createElement('td');
                    actions.setAttribute('class','align-middle browseActionsColumn');
                    actions.setAttribute('id',`actions${data[i].id}`);

                    //check to see if user favorited this yet or not
                    let userFavorited = false;
                    if (user['favorited_recipes']){
                        for (let favorite of user['favorited_recipes']){
                            if (favorite['id'] == data[i].id){
                                userFavorited = true;
                            }
                        }
                    }
                    //now add favorite or unfavorite button depending on favorite status
                    if (userFavorited == true) {
                        actions.innerHTML = `<a href='/recipes/${data[i].id}'><button class="btn btn-link">view directions</button></a> | <button class="btn btn-link" onclick='unfavorite(${data[i].id})'>unfavorite</button>`;
                    } else {
                        actions.innerHTML = `<a href='/recipes/${data[i].id}'><button class="btn btn-link">view directions</button></a> | <button class="btn btn-link" onclick='favorite(${data[i].id})'>favorite</button>`;
                    }
                    row.appendChild(actions);

                    recipes.appendChild(row);
                }
            }
        })
    }
}

function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("browser");
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
        switching = false;
        rows = table.rows;
        /* Loop through all table rows (except the
      first, which contains table headers): */
        for (i = 1; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        /* Check if the two rows should switch place,
        based on the direction, asc or desc: */
        if (dir == "asc") {
            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
            }
        } else if (dir == "desc") {
            if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
            }
        }
        }
        if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        // Each time a switch is done, increase this count by 1:
        switchcount ++;
        } else {
        /* If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again. */
        if (switchcount == 0 && dir == "asc") {
            dir = "desc";
            switching = true;
        }
        }
    }
}