const openCreatePlayerButton = document.getElementById('create_player_open_button');
const create_player_section = document.getElementById('create_player');
const close_cup = document.getElementById('cup');

openCreatePlayerButton.addEventListener('click', ()=>{
    create_player_section.classList.add('show');
})

close_cup.addEventListener('click', ()=>{
    create_player_section.classList.remove('show');
})