import 'bootstrap';
import './scss/app.scss';
import $ from 'jquery';
import * as account from './modules/accounts';

(function($) {
        
    const species = new Set();
    const gender = new Set();
    const origin = new Set();

    const resultApi = 'https://rickandmortyapi.com/api/character/';


    async function getResults() {

        let promise = new Promise((resolve, reject) => {
            $.get(resultApi, function( data ) {
                if(data && data.results) {
                    resolve(setUIdata(data.results));                    
                } else {
                    reject('Something Went Wrong.');
                }
            });
        });
        
        const result = await promise;
        const filters = {
            species : [...result.filters.species],
            gender : [...result.filters.gender],
            origin : [...result.filters.origin]
        }

        populateFilters(filters.species, '#species-filter');
        populateFilters(filters.gender, '#gender-filter');
        populateFilters(filters.origin, '#origin-filter');

        console.log(result.card);

        populateCardData(result.card);
    }

    getResults(); 
    
    const setUIdata = (data) => {
        const res = {};
        res['card'] = data;
        data.map((item) => {
            res['filters'] = addFilters(item);
        });
        console.log(res);
        return res;
    }

    const addFilters = (item) => {
        species.add(item.species);
        gender.add(item.gender);
        origin.add(item.origin.name);

        return {
            species,
            gender,
            origin
        };
    }

    const populateFilters = (filterData, filterType) => {
        filterData.map((filter) => {
            $(filterType).append(`
                <label for="${filter}">
                    <input type="checkbox" name="${filter}" value="${filter}" id="${filter}" /> ${filter}
                </label>
            `);
        });
    }

    const populateCardData = (items) => {
        const cards = $('.search-results');
        cards.html('');
        items.map((item) => {
            cards.append(`
                <div class="col-lg-3 col-6">
                    <div class="result-card">
                        <figure>
                            <img class="responsive-img" src="${item.image}" alt="${item.name}">
                            <figcaption>
                                <h3>${item.name}</h3>
                                <div class="small-font">id: <span>${item.id}</span> - created <span>2 years ago</span></div>
                            </figcaption>
                        </figure>
                        <div class="result-card-details small-font">
                            <div class="result-attribute">
                                <span class="result-attribute-name">STATUS</span>
                                <span class="result-attribute-data">${item.status}</span>
                            </div>
                            <div class="result-attribute">
                                <span class="result-attribute-name">SPECIES</span>
                                <span class="result-attribute-data">${item.species}</span>
                            </div>
                            <div class="result-attribute">
                                <span class="result-attribute-name">GENDER</span>
                                <span class="result-attribute-data">${item.gender}</span>
                            </div>
                            <div class="result-attribute">
                                <span class="result-attribute-name">ORIGIN</span>
                                <span class="result-attribute-data">${item.origin.name}</span>
                            </div>
                            <div class="result-attribute">
                                <span class="result-attribute-name">LAST LOCATION</span>
                                <span class="result-attribute-data">${item.location.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        });
    }

})($);

