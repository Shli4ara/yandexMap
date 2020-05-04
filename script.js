'use strict'
let myMap,
    inputValue = document.getElementById('bionik'),
    blocks = document.querySelector('.blocks'),
    submit = document.querySelector('.ok'),
    status = document.querySelector('.massage'),
    arrRoute = [];


ymaps.ready(init);
function init () {
    myMap = new ymaps.Map('yMap', {
        center: [55.950127, 56.832204],
        zoom: 4,
    }, {
        searchControlProvider: 'yandex#search'
    });
    var suggestView1 = new ymaps.SuggestView('bionik', {
        results: 3,
    });
    var multiRoute = new ymaps.multiRouter.MultiRoute({
        referencePoints: arrRoute
    }, {
        editorMidPointsType: "via",
        editorDrawOver: false
    });
    myMap.geoObjects.add(multiRoute);
}

const setCenterMap = (city) => {
    fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=a2ac66da-2936-4342-91f1-28c069d9594c&results=1&format=json&geocode=${city}`, {

    })
    .then((response) => {
        if (response.status !== 200){
            throw new Error('status network not 200.');
        }
        return (response.json());
    })
    .then((data) => {
        let point = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos;
        point = point.split(' ');

        myMap.setCenter([point[1], point[0]], 10, {
            checkZoomRange: true
        });
    })
    .catch((error) => console.error(error));

}

const initMap = () => {
    myMap.destroy()
    init();
}

const createBlocks = (city) => {
    let creatDiv = document.createElement('div');

    const creatsCity = () => {
        let dataIndex;
        for (let i = 0; i < 1; i++){
            creatDiv.textContent = city;
            blocks.append(creatDiv);
            creatDiv.classList.add('blocks_items');
            if (blocks.childNodes.length == 2){
                dataIndex = 0;
            } else {
                dataIndex = blocks.children.length - 1;
            }
            creatDiv.dataset.index = dataIndex;
        }
    }
    creatsCity();
    
    const createСontrol = () => {
        for (let i = 0; i <= 2; i++) {
            let creatsSpan = document.createElement('span');
            creatDiv.append(creatsSpan);
        }
        let ssP = creatDiv.querySelectorAll('.blocks_items span');
        ssP.forEach((item, i) => {
            item.classList.add('control');

            if ( i === 0){
                item.classList.add('bottom');
            }
            if (i === 1){
                item.classList.add('top');
            }
            if ( i === 2) {
                item.classList.add('remove');
            }
        })
    }
    createСontrol();

    status.textContent = '';
}

const createArr = (city) => {
    arrRoute.push(city);
    if (arrRoute.length >= 2){
        initMap()
    }
}

const removeBlocks = (removeCity) => {
    let removeBlock = removeCity.closest('div'),
        removeCityText = removeBlock.textContent;

    if (removeBlock){
        removeBlock.remove();
        arrRoute.forEach((item, index) => {
            if (item === removeCityText) {
                arrRoute.splice(index, 1);
            }
        })
        initMap();
    }
}

const moveArray = (index, position) => {
    if (position === 'top') {
        let newIndex = index + 1;

        [arrRoute[index], arrRoute[newIndex]] = [arrRoute[newIndex], arrRoute[index]];
        arrRoute.forEach((e, index) => {
            if (e == undefined) {
                arrRoute.splice(index, 1);
            }
        })
        initMap();      
    } else if (position === 'bottom') {
        let newIndex = index - 1;

        [arrRoute[newIndex], arrRoute[index]] = [arrRoute[index], arrRoute[newIndex]];
        arrRoute.forEach((e, index) => {
            if (e == undefined) {
                arrRoute.splice(index, 1);
            }
        })
        initMap();
    }
}

const moveBlocks = (moveCity) => {
    let moveBlock = moveCity.closest('div'),
        moveElements = blocks.querySelectorAll('.blocks_items');

    if (moveCity.classList.contains('top')) {
        if (moveBlock.dataset.index != 0) {
            let index = moveBlock.dataset.index,
                newIndex = index - 1;

            moveBlock.dataset.index = newIndex;
            moveBlock.previousElementSibling.dataset.index = newIndex + 1;
            blocks.insertBefore(moveElements[index], moveElements[newIndex]);

            moveArray(newIndex, 'top');
            status.textContent = '';
        } else {
            status.textContent = 'Выше уже никак. Это начальная точка.';
        }
    } else if (moveCity.classList.contains('bottom')) {
        if (moveBlock.dataset.index != moveElements.length - 1) {
            let index = moveBlock.dataset.index,
                newIndex = +index + 1;

            moveBlock.dataset.index = newIndex;
            moveBlock.nextElementSibling.dataset.index = newIndex - 1;
            blocks.insertBefore(moveElements[newIndex], moveElements[index]);

            moveArray(newIndex, 'bottom');
            status.textContent = '';
        } else {
            status.textContent = 'Ниже уже никак. Это конечная точка.';
        }
    }
}

document.body.addEventListener('click', (el) => {
    let target = el.target;

    if (target.closest('.ok') && inputValue.value) {
        createBlocks(inputValue.value);
        createArr(inputValue.value);
        setCenterMap(inputValue.value);

        inputValue.value = '';
    }
    if (target.closest('.top') || target.closest('.bottom')) {
        moveBlocks(target);
        setCenterMap(inputValue.value);
    }
    if (target.closest('.remove')) {
        removeBlocks(target);
        setCenterMap(inputValue.value);
    }
})