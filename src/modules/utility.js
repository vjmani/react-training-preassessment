const resultApi = 'https://rickandmortyapi.com/api/character/';

const setDataToLocalStorage = (keyName, data) => {
    localStorage.setItem(keyName, JSON.stringify(data));
}

const getDataFromLocalStorage = (keyName) => {
    return JSON.parse(localStorage.getItem(keyName));
}

export { resultApi, setDataToLocalStorage, getDataFromLocalStorage};