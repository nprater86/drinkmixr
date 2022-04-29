//Populate table with Recipes

async function getRecipes(){
    fetch(`http://localhost:5000/recipes_by_user`)
        .then(res =>  res.json())
        .then(data =>  {
            if (data != null){
                let recipes = document.getElementById("recipes");
                for (let i = 0; i < data.length; i++){
                    let row = document.createElement('tr');
                    row.setAttribute("id",`recipe${data[i].id}`);

                    let name = document.createElement('td');
                    name.setAttribute('class','align-middle');
                    name.setAttribute("id",`name${data[i].id}`);
                    name.innerHTML = data[i].name;
                    row.appendChild(name);

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
                    actions.setAttribute('class','align-middle actionsColumn');
                    actions.innerHTML = `<a href='/recipes/${data[i].id}'><button class="btn btn-link">View Directions</button></a> | <button class="btn btn-link" onclick='editFormDropdown(${data[i].id})'>Edit</button> | <button class="btn btn-link" onclick='deleteRecipe(${data[i].id})'>Delete</button>`;
                    row.appendChild(actions);

                    recipes.appendChild(row);
                }
            }
        })
}

getRecipes();

async function getFavorites() {
    //get favorites now
    let response = await fetch('http://localhost:5000/get_user_info', {method:"POST"});
    let user = await response.json();

    if (user['favorited_recipes']){
        let recipes = document.getElementById("favedRecipes");
        for (let i = 0; i < user['favorited_recipes'].length; i++){
            let row = document.createElement('tr');
            row.setAttribute("id",`recipe${user['favorited_recipes'][i]['id']}`);

            let name = document.createElement('td');
            name.setAttribute('class','align-middle');
            name.setAttribute("id",`name${user['favorited_recipes'][i]['id']}`);
            name.innerHTML = user['favorited_recipes'][i]['name'];
            row.appendChild(name);

            let createdBy = document.createElement('td');
            createdBy.setAttribute('class','align-middle');
            createdBy.setAttribute("id",`createdBy${user['favorited_recipes'][i]['id']}`);
            createdBy.innerHTML = user['favorited_recipes'][i]['user_name'];
            row.appendChild(createdBy);

            let description = document.createElement('td');
            description.setAttribute("id",`description${user['favorited_recipes'][i]['id']}`);
            description.innerHTML = user['favorited_recipes'][i]['description'];
            row.appendChild(description);

            let spirit = document.createElement('td');
            spirit.setAttribute('class','align-middle');
            spirit.setAttribute("id",`spirit${user['favorited_recipes'][i]['id']}`);
            spirit.innerHTML = user['favorited_recipes'][i]['spirit_name'];
            row.appendChild(spirit);

            let actions = document.createElement('td');
            actions.setAttribute('class','align-middle');
            actions.setAttribute('id',`actions${user['favorited_recipes'][i]['id']}`)

            //now add favorite or unfavorite button depending on favorite status
            actions.innerHTML = `<a href='/recipes/${user['favorited_recipes'][i]['id']}'><button class="btn btn-link">View Directions</button></a> | <button class="btn btn-link" onclick='unfavorite(${user['favorited_recipes'][i]['id']})'>Unfavorite</button>`;
            row.appendChild(actions);

            recipes.appendChild(row);
        }
    }
}

getFavorites();

//unfavorite a recipe to remove it from your page

function unfavorite(recipe_id) {
    let recipeRow = document.getElementById(`recipe${recipe_id}`);
    fetch(`http://localhost:5000/unFavorite/${recipe_id}`, {method:"POST"})
        .then(document.getElementById(`recipe${recipe_id}`).remove())
}

//Delete recipe then remove it from table

function deleteRecipe(recipe_id){
    fetch(`http://localhost:5000/delete_recipe/${recipe_id}`, {method:"POST"})
        .then(res => res.json())
        .then(data => {
            let deleted_recipe = document.getElementById(`recipe${data.deleted_id}`);
            deleted_recipe.remove();
        })
}

// Add drop down buttons for create menu

let createBtn = document.getElementById("createBtn");
let createForm = document.getElementById("createForm");

createBtn.onclick = () => {
    resetEditForm();
    resetCreateForm();
    createForm.style.top = '76px';
    createForm.style.zIndex = '10';
    editForm.style.top = '-1130px';
    editForm.style.zIndex = '5';
}

let createCancel = document.getElementById("createCancel");

createCancel.onclick = () => {
    event.preventDefault();
    resetCreateForm();
}

function resetCreateForm(){
    let createValues = document.querySelectorAll(".createValues");
    for (let i = 0; i < createValues.length; i++){
        createValues[i].value='';
    }
    document.getElementById('spirit').selectedIndex = 0;
    document.getElementById('measurement1').selectedIndex = 0;
    while(ingredientCount > 1){
        document.getElementById(`ingredientWrapper${ingredientCount}`).remove();
        ingredientCount--;
    }
    document.getElementById('numOfIngredients').value = ingredientCount;
    document.getElementById('fileupload').value='';
    deleteIngredient.style.display = "none";
    createForm.style.top = '-1130px';
}

//add ingredients
let ingredientsWrapper = document.getElementById("ingredientsWrapper");
let addIngredient = document.getElementById("addIngredient");
let ingredientCount = 1;

addIngredient.onclick = (e) => {
    e.preventDefault();
    ingredientCount++;
    document.getElementById('numOfIngredients').value = ingredientCount;

    //create ingredientWrapper div
    let ingredientWrapper = document.createElement('div');
    ingredientWrapper.setAttribute('class','ingredientWrapper');
    ingredientWrapper.setAttribute('id',`ingredientWrapper${ingredientCount}`);
    ingredientWrapper.style.marginBottom = "4px";


    //create another quantity element
    let quantity = document.createElement('input');
    quantity.setAttribute('class','col-2 form-inline');
    quantity.setAttribute('type','number');
    quantity.setAttribute('name',`quantity${ingredientCount}`);
    quantity.setAttribute('id',`quantity${ingredientCount}`);
    quantity.setAttribute('placeholder','0');
    quantity.setAttribute('step','0.125');
    quantity.setAttribute('required','');
    quantity.style.marginRight = "4px";
    ingredientWrapper.appendChild(quantity)

    // create another measurement element
    let measurement = document.createElement('select');
    measurement.style.marginRight = "4px";
    measurement.setAttribute('class','col-3');
    measurement.setAttribute('name',`measurement${ingredientCount}`);
    measurement.setAttribute('id',`measurement${ingredientCount}`)

    let oz = document.createElement('option');
    oz.setAttribute('value',"oz");
    oz.innerHTML = "oz";
    measurement.appendChild(oz);

    let ml = document.createElement('option');
    ml.setAttribute('value',"ml");
    ml.innerHTML = "mL";
    measurement.appendChild(ml);

    let grams = document.createElement('option');
    grams.setAttribute('value',"grams");
    grams.innerHTML = "grams";
    measurement.appendChild(grams);

    let spritz = document.createElement('option');
    spritz.setAttribute('value',"spritz");
    spritz.innerHTML = "spritz";
    measurement.appendChild(spritz);

    let dash = document.createElement('option');
    dash.setAttribute('value',"dash(es)");
    dash.innerHTML = "dash(es)";
    measurement.appendChild(dash);

    let pinch = document.createElement('option');
    pinch.setAttribute('value',"pinch(es)");
    pinch.innerHTML = "pinch(es)";
    measurement.appendChild(pinch);

    let garnish = document.createElement('option');
    garnish.setAttribute('value',"garnish");
    garnish.innerHTML = "garnish";
    measurement.appendChild(garnish);

    ingredientWrapper.appendChild(measurement);

    //create another ingredient name input
    let ingredientName = document.createElement('input');
    ingredientName.setAttribute('class','form-inline');
    ingredientName.setAttribute('type','text');
    ingredientName.setAttribute('name',`ingredient_name${ingredientCount}`);
    ingredientName.setAttribute('id',`ingredientName${ingredientCount}`);
    ingredientName.setAttribute('placeholder','ingredient name');
    ingredientName.setAttribute('required','');
    ingredientWrapper.appendChild(ingredientName);

    ingredientsWrapper.appendChild(ingredientWrapper); 

    if (ingredientCount == 1){
        deleteIngredient.style.display = "none";
    } else {
        deleteIngredient.style.display = "inline";
    }
}

//delete ingredients
let deleteIngredient = document.getElementById("deleteIngredient");
deleteIngredient.style.display = "none";


deleteIngredient.onclick = (e) => {
    e.preventDefault();

    document.getElementById(`ingredientWrapper${ingredientCount}`).remove();

    ingredientCount--;
    document.getElementById('numOfIngredients').value = ingredientCount;

    if (ingredientCount == 1){
        deleteIngredient.style.display = "none";
    } else {
        deleteIngredient.style.display = "inline";
    }
}

// Create New Recipe Functions
let createNew = document.getElementById('createNew');

createNew.onsubmit = function(e) {
    e.preventDefault();

    let form = new FormData(createNew);
    form.append("file", fileupload.files[0]);

    fetch("http://localhost:5000/recipes/new/create", {method:"POST", body:form})
        .then( res => res.json())
        .then( data => {
            document.getElementById('recipes').innerHTML = '';
            getRecipes();
            resetCreateForm();
        })
}


// Add drop down buttons for edit menu and prefill ingredients

let editForm = document.getElementById("editForm");
let editIngredientsWrapper = document.getElementById("editIngredientsWrapper");
let editIngredientCount = 1;

//prefilling function
async function editFormDropdown(recipe_id){
    resetEditForm();

    let response = await fetch(`http://localhost:5000/recipes/edit/${recipe_id}`, {method:"POST"})
    let recipe = await response.json();

    console.log(recipe);

    //prefill the easy things
    document.getElementById('hiddenRecipeId').value = recipe['id'];
    document.getElementById('editName').value = recipe['name'];
    document.getElementById('editDescription').innerHTML = recipe['description'];
    document.getElementById('editSpiritQuantity').value = recipe['quantity'];
    document.getElementById('editSpirit').selectedIndex = recipe['spirits.id']-1;
    document.getElementById('editDirections').innerHTML = recipe['directions'];

    //prefill the ingredient list

    document.getElementById('editNumOfIngredients').value = recipe['ingredients'].length;

    document.getElementById('editQuantity1').value = recipe['ingredients'][0]['quantity'];
    document.getElementById('editMeasurement1').value = recipe['ingredients'][0]['measurement'];
    document.getElementById('editIngredientName1').value = recipe['ingredients'][0]['ingredient_name'];
    editIngredientCount++;
    for (let i = 1; i < recipe['ingredients'].length; i++) {
        //create ingredientWrapper div
        let editIngredientWrapper = document.createElement('div');
        editIngredientWrapper.setAttribute('class','ingredientWrapper');
        editIngredientWrapper.setAttribute('id',`editIngredientWrapper${editIngredientCount}`);
        editIngredientWrapper.style.marginBottom = "4px";

        //create another quantity element
        let quantity = document.createElement('input');
        quantity.style.marginRight = "4px";
        quantity.setAttribute('class','col-2 form-inline');
        quantity.setAttribute('type','number');
        quantity.setAttribute('name',`quantity${editIngredientCount}`);
        quantity.setAttribute('id',`editQuantity${editIngredientCount}`);
        quantity.setAttribute('placeholder','0');
        quantity.setAttribute('step','0.125');
        quantity.setAttribute('required','');
        quantity.value = recipe['ingredients'][i]['quantity'];
        editIngredientWrapper.appendChild(quantity)

        // create another measurement element
        let measurement = document.createElement('select');
        measurement.style.marginRight = "4px";
        measurement.setAttribute('class','col-3');
        measurement.setAttribute('name',`measurement${editIngredientCount}`);
        measurement.setAttribute('id',`editMeasurement${editIngredientCount}`)

        let oz = document.createElement('option');
        oz.setAttribute('value',"oz");
        oz.innerHTML = "oz";
        measurement.appendChild(oz);

        let ml = document.createElement('option');
        ml.setAttribute('value',"mL");
        ml.innerHTML = "mL";
        measurement.appendChild(ml);

        let grams = document.createElement('option');
        grams.setAttribute('value',"grams");
        grams.innerHTML = "grams";
        measurement.appendChild(grams);

        let spritz = document.createElement('option');
        spritz.setAttribute('value',"spritz");
        spritz.innerHTML = "spritz";
        measurement.appendChild(spritz);

        let dash = document.createElement('option');
        dash.setAttribute('value',"dash(es)");
        dash.innerHTML = "dash(es)";
        measurement.appendChild(dash);

        let pinch = document.createElement('option');
        pinch.setAttribute('value',"pinch(es)");
        pinch.innerHTML = "pinch(es)";
        measurement.appendChild(pinch);

        let garnish = document.createElement('option');
        garnish.setAttribute('value',"garnish");
        garnish.innerHTML = "garnish";
        measurement.appendChild(garnish);

        measurement.value = recipe['ingredients'][i]['measurement'];
        editIngredientWrapper.appendChild(measurement);

        //create another ingredient name input
        let ingredientName = document.createElement('input');
        ingredientName.setAttribute('class','form-inline');
        ingredientName.setAttribute('type','text');
        ingredientName.setAttribute('name',`ingredient_name${editIngredientCount}`);
        ingredientName.setAttribute('id',`editIngredientName${editIngredientCount}`);
        ingredientName.setAttribute('placeholder','ingredient name');
        ingredientName.setAttribute('required','');
        ingredientName.value = recipe['ingredients'][i]['ingredient_name'];
        editIngredientWrapper.appendChild(ingredientName);

        editIngredientsWrapper.appendChild(editIngredientWrapper);
        editIngredientCount++;
    }
    editIngredientCount--;
    if (editIngredientCount == 1){
        editDeleteIngredient.style.display = "none";
    } else {
        editDeleteIngredient.style.display = "inline";
    }

    editForm.style.top = '76px';
    editForm.style.zIndex = '10';
    createForm.style.top = '-1130px';
    createForm.style.zIndex = '5';
}

//add ingredients in edit form
let editAddIngredient = document.getElementById('editAddIngredient');

editAddIngredient.onclick = (e) => {
    e.preventDefault();
    editIngredientCount++;
    document.getElementById('editNumOfIngredients').value = editIngredientCount;

    //create ingredientWrapper div
    let ingredientWrapper = document.createElement('div');
    ingredientWrapper.setAttribute('class','ingredientWrapper');
    ingredientWrapper.setAttribute('id',`editIngredientWrapper${editIngredientCount}`);
    ingredientWrapper.style.marginBottom = "4px";


    //create another quantity element
    let quantity = document.createElement('input');
    quantity.setAttribute('class','col-2 form-inline');
    quantity.setAttribute('type','number');
    quantity.setAttribute('name',`quantity${editIngredientCount}`);
    quantity.setAttribute('id',`editQuantity${editIngredientCount}`);
    quantity.setAttribute('placeholder','0');
    quantity.setAttribute('step','0.125');
    quantity.setAttribute('required','');
    quantity.style.marginRight = "4px";
    ingredientWrapper.appendChild(quantity)

    // create another measurement element
    let measurement = document.createElement('select');
    measurement.setAttribute('class','col-3');
    measurement.setAttribute('name',`measurement${editIngredientCount}`);
    measurement.setAttribute('id',`editMeasurement${editIngredientCount}`);
    measurement.style.marginRight = "4px";

    let oz = document.createElement('option');
    oz.setAttribute('value',"oz");
    oz.innerHTML = "oz";
    measurement.appendChild(oz)

    let ml = document.createElement('option');
    ml.setAttribute('value',"mL");
    ml.innerHTML = "mL";
    measurement.appendChild(ml)

    let grams = document.createElement('option');
    grams.setAttribute('value',"grams");
    grams.innerHTML = "grams";
    measurement.appendChild(grams)

    let spritz = document.createElement('option');
    spritz.setAttribute('value',"spritz");
    spritz.innerHTML = "spritz";
    measurement.appendChild(spritz);

    let dash = document.createElement('option');
    dash.setAttribute('value',"dash(es)");
    dash.innerHTML = "dash(es)";
    measurement.appendChild(dash)

    let pinch = document.createElement('option');
    pinch.setAttribute('value',"pinch(es)");
    pinch.innerHTML = "pinch(es)";
    measurement.appendChild(pinch);

    let garnish = document.createElement('option');
    garnish.setAttribute('value',"garnish");
    garnish.innerHTML = "garnish";
    measurement.appendChild(garnish);

    ingredientWrapper.appendChild(measurement);

    //create another ingredient name input
    let ingredientName = document.createElement('input');
    ingredientName.setAttribute('class','form-inline');
    ingredientName.setAttribute('type','text');
    ingredientName.setAttribute('name',`ingredient_name${editIngredientCount}`);
    ingredientName.setAttribute('id',`editIngredientName${editIngredientCount}`);
    ingredientName.setAttribute('placeholder','ingredient name');
    ingredientName.setAttribute('required','');
    ingredientWrapper.appendChild(ingredientName);

    editIngredientsWrapper.appendChild(ingredientWrapper); 

    if (editIngredientCount == 1){
        editDeleteIngredient.style.display = "none";
    } else {
        editDeleteIngredient.style.display = "inline";
    }
}

//delete editing ingredients
let editDeleteIngredient = document.getElementById("editDeleteIngredient");

editDeleteIngredient.onclick = (e) => {
    e.preventDefault();

    document.getElementById(`editIngredientWrapper${editIngredientCount}`).remove();

    editIngredientCount--;
    document.getElementById('editNumOfIngredients').value = editIngredientCount;

    if (editIngredientCount == 1){
        editDeleteIngredient.style.display = "none";
    } else {
        editDeleteIngredient.style.display = "inline";
    }
}

let editCancel = document.getElementById("editCancel");

editCancel.onclick = () => {
    event.preventDefault();
    resetEditForm();
    editForm.style.top = '-1130px';
}

function resetEditForm(){
    document.getElementById("editName").innerHTML = '';
    document.getElementById("editDescription").innerHTML = '';
    document.getElementById("editSpiritQuantity").value = 0;
    document.getElementById('editDirections').innerHTML = '';

    while(editIngredientCount > 1){
        document.getElementById(`editIngredientWrapper${editIngredientCount}`).remove();
        editIngredientCount--;
    }
    document.getElementById('editNumOfIngredients').value = editIngredientCount;
    editDeleteIngredient.style.display = "none";
    document.getElementById('filereupload').value='';
}

// Update the recipe

let updateRecipe = document.getElementById('updateRecipe')

updateRecipe.onsubmit = function (e) {
    e.preventDefault();

    let form = new FormData(updateRecipe);
    form.append("file", filereupload.files[0]);

    fetch("http://localhost:5000/recipes/update", {method:"POST", body:form})

    location.reload();
    // resetEditForm();
    // document.getElementById('recipes').innerHTML = '';
    // getRecipes();
    // editForm.style.top = '-1130px';
}