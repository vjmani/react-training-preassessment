import $ from 'jquery';

const species = new Set();
const gender = new Set();
const origin = new Set();

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

const populateFilters = (filters) => {
    const filterForm = $('#filter-form');
    filterForm.html('');
    for (const property in filters) {

        filterForm.append(`
            <div class="col-lg-12 col-12 filter-box">
                <h2>${property}</h2>
                <div class="filter-box-section" id="${property}-filter">
                    <!-- Filter checkboxes will be displayed here -->
                </div>
            </div>
        `);

        const filterType = '#' + property + '-filter';
        const filterTypeElem = $(filterType);

        filters[property].map((filter) => {
            $(filterTypeElem).append(`
                <label for="${property}-${filter}">
                    <input class="filter-checkbox" type="checkbox" name="${property}" value="${filter}" id="${property}-${filter}" /> ${filter}
                </label>
            `);
        });

    }
}

const checkValue = value => (typeof value === 'string' ? value.toUpperCase() : value);

const filterSearchResults = (data, filters) => {
    const filterKeys = Object.keys(filters);
    return data.filter(item => {
        return filterKeys.every(key => {
            if (!filters[key].length) return true;
            return filters[key].find((filter) => {
                if (typeof item[key] === 'object') {
                    return checkValue(filter) === checkValue(item[key]['name']);
                } else {
                    return checkValue(filter) === checkValue(item[key])
                }
            });
        });
    });
}

const populateAppliedFilter = (filters) => {
    const filterKeys = Object.keys(filters);
    $('.selected-filters').html('');
    if (filterKeys.length > 0) {
        for (let filter in filters) {
            filters[filter].map((filterName) => {
                $('.selected-filters').append(`
                    <div class="col-lg-2 col-4 applied-filter-container">
                        <div class="applied-filter">
                            <span>${filterName}</span>
                        </div>
                    </div>
                `);
            });
        }
    }
}

export { addFilters, populateFilters, filterSearchResults, populateAppliedFilter };
