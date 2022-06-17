exports.getDate = function () {

    let today = new Date();
    let day;

    let options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }

    
    day = today.toLocaleDateString('en-US', options);
    return day;
}

exports.getDay = function getDay(){
    let today = new Date();
    let day;

    let options = {
        weekday: 'long'
    }

    
    day = today.toLocaleDateString('en-US', options);
    return day;
}

// console.log(module)