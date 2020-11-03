const playerList = document.getElementById('players-list');
const searchBar = document.getElementById('find-player');
const clearButton = document.getElementById('clear-search-bar');


const createPlayerName = document.getElementById('create_name');
const createPlayerNational = document.getElementById('create_national');
const createPlayerPrice = document.getElementById('create_price');

let editActive = false;

const players_url = 'http://localhost:8081/players';

let players = [];

function fetchData(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            for (i = 0; i < data.length; i++) {
                players.push(data[i]);
            }
            displayPlayers(players);
        });
}

let currentPlayers = players

searchBar.addEventListener('keyup', filterPlayers)

function filterPlayers(searchString) {
    const searchFilterString = searchString.target.value.toLowerCase();
    const filteredPlayers = players.filter(player => {
        return player.name.toLowerCase().includes(searchFilterString);
    });
    currentPlayers = filteredPLayers;
    visualiseSortedPlayers();
}

clearButton.addEventListener('click', () => {
    searchBar.value = '';
    currentPlayers = players;
    visualiseSortedPlayers();
})


function calculatePrice() {
    var priceSum = 0;
    var totalPriceLabel = document.getElementById('total-price');
    currentPlayers.forEach(player => priceSum += player.price);
    totalPriceLabel.textContent = 'Total price: ' + priceSum + 'UAH';
}


function visualiseSortedPlayers() {
    var sortType = document.getElementById('sort-select').value;
    if (sortType == 'none') {
        displayPlayers(currentPlayers);
        return;
    } else if (sortType == 'name') {
        currentPlayers.sort(compareByName);
    } else if (sortType == 'price') {
        currentPlayers.sort(compareByPrice);
    }
    displayPlayers(currentPlayers);
}


function compareByName(firstPlayer, secondPlayer) {
    var firstPlayerName = firstPlayer.name.toLowerCase();
    var secondPlayerName = secondPlayer.name.toLowerCase();
    if (firstPlayerName < secondPlayerName) {
        return -1;
    }
    if (firstPlayerName > secondPlayerName) {
        return 1;
    }
    return 0;
}

function compareByPrice(firstPlayer, secondPlayer) {
    return firstPlayer.price - secondPlayer.price;
}


const displayPlayers = (playersToShow) => {
    const htmlString = playersToShow.map((player) => {
        return `
        <li class="player">
            <div>            
                <h2 class="player_id"> ${player.id}</h2>
                <h2> ${player.name}</h2>
                <h3 class="national">National: ${player.national}</h3>
                <h3 class="price">Price: ${player.price}</h3>
            </div>
            <form class="form__edit_player" id="form__edit_player">
                    <input id="edit_name" name="name" type="text" placeholder="Name">
                    <input id="edit_national" name="national" type="text" step=0.1 placeholder="National">
                    <input id="edit_price" name="price" type="number" placeholder="Price">
            </form>
            <div class= "control-buttons">
                <button class="edit-button" id="edit-button" onclick="editRecord(this)">Edit</button>
                <button class="delete-button" id="delete-button" onclick="deleteRecord(this)">Delete</button>
            </div>
        </li>
        `
    }).join('');

    playerList.innerHTML = htmlString;
}

function deleteRecord(record) {
    const list_to_delete = record.parentNode.parentNode;
    let playerId = parseInt(list_to_delete.childNodes[1].childNodes[1].innerHTML);
    let indexToDeleteFromAll = players.findIndex(obj => obj.id == playerId);
    players.splice(indexToDeleteFromAll, 1);
    let indexToDeleteFromCurrent = currentPlayers.findIndex(obj => obj.id == playerId);
    if (indexToDeleteFromCurrent != -1) {
        currentPlayers.splice(indexToDeleteFromCurrent, 1);
    }
    deletePlayer(playerId);
    visualiseSortedPlayers();
    return list_to_delete;
}

function editRecord(record) {
    const nodeList = record.parentNode.parentNode.childNodes;
    const editBar = nodeList[3];
    const infoBar = nodeList[1];
    let playerId = parseInt(infoBar.childNodes[1].innerHTML);
    let playerName = infoBar.childNodes[3].innerHTML;
    let playerNational = infoBar.childNodes[5].innerHTML;
    let playerPrice = parseFloat(infoBar.childNodes[7].innerHTML);
    const editedPlayerName = nodeList[3][0];
    const editedPlayerNational = nodeList[3][1];
    const editedPlayerPrice = nodeList[3][2];

    let indexToEdit = players.findIndex(obj => obj.id == playerId);
    if (editActive == false) {
        openEditBar(editBar, infoBar);
        editActive = true;
    } else if (editActive == true) {
        closeEditBar(editBar, infoBar);
        if (validateNationalAndPrice(editedPlayerNational.value, editedPlayerPrice.value) == false) {
            editedPlayerNational.value = '';
            editedPlayerPrice.value = '';
            editActive = false;
            return;
        }
        let finalName = playerName;
        let finalNational = playerNational;
        let finalPrice = playerPrice;
        if (editedPlayerName.value == "" && editedPlayerNational.value == "" && editedPlayerPrice.value == "") {
            editActive = false;
            visualiseSortedPlayers();
            return
        }
        if (editedPlayerName.value != "") {
            players[indexToEdit]["name"] = editedPlayerName.value;
            finalName = editedPlayerName.value;
        } else {
            players[indexToEdit]["name"] = playerName;
        }
        if (editedPlayerNational.value != "") {
            players[indexToEdit]["national"] = editedPlayerNational.value;
            finalNational = editedPlayerNational.value;
        } else {
            players[indexToEdit]["national"] = playerNational;
        }
        if (editedPlayerPrice.value != "") {
            players[indexToEdit]["price"] = parseFloat(editedPlayerPrice.value);
            finalPrice = parseFloat(editedPlayerPrice.value);
        } else {
            players[indexToEdit]["price"] = playerPrice;
        }

        if (searchBar.value != '' && editedPlayerName.value != '' && editedPlayerName.value.includes(searchBar.value) == false) {
            let indexToDeleteFromCurrent = currentPlayers.findIndex(obj => obj.id == playerId);
            currentPlayers.splice(indexToDeleteFromCurrent, 1);
        }

        const jsonPlayer = createJSON(finalName, finalNational, finalPrice)
        editPlayer(playerId, jsonPlayer)
        editActive = false;
        visualiseSortedPlayers();
    }
}

function openEditBar(editBar, infoBar) {
    editBar.classList.add('open');
    editBar.classList.remove('hide');
    infoBar.classList.add('hide');
    infoBar.classList.remove('open');
}

function closeEditBar(editBar, infoBar) {
    editBar.classList.add('hide');
    editBar.classList.remove('open');
    infoBar.classList.add('open');
    infoBar.classList.remove('hide');
}

async function createPlayer() {
    if (validateFormRequirements(createPlayerName.value, createPlayerNational.value, createPlayerPrice.value) == false) {
        return;
    }
    if (validatePrice(createPlayerPrice.value) == false) {
        return;
    }
    const jsonPlayer = createJSON(createPlayerName.value, createPlayerNational.value, createPlayerPrice.value);
    await postPlayer(jsonPlayer);
    visualiseSortedPlayers();
    return jsonPlayer;
}

async function postPlayer(newPlayer) {
    console.log(players);
    let response = await fetch(players_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(newPlayer)
    }).then(response => response.json())
        .then(data => players.push(data))
    return response;
}

async function deletePlayer(id) {
    let response = await fetch(players_url + '/' + id, {
        method: 'DELETE',
    })
    return response;
}

async function editPlayer(id, editedPlayer) {
    fetch(players_url + '/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(editedPlayer)
    })
}

function createJSON(name, national, price) {
    let createdPlayer = {
        "name": name,
        "national": national,
        "price": parseFloat(price)
    }
    return createdPlayer;
}


function validatePrice(price) {

    if (parseFloat(price) <= 0) {
        alert('price cannot be less then zero');
        return false;
    }
    return true;
}

function validateFormRequirements(name, national, price) {
    if (name == '') {
        alert('name field is requiered')
        return false;
    }
    if (national == '') {
        alert('national field is requiered');
        return false;
    }
    if (price == 0) {
        alert('price  field is requiered');
        return false;
    }
    return true;
}


fetchData(players_url);