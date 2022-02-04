const Scriptures = (function (){
    "use strict";

/*---------------------------------------------------------------------------
*                 Constants
*/
const URL_BASE = "https://scriptures.byu.edu/";
const URL_BOOKS = `${URL_BASE}mapscrip/model/books.php`;
const URL_VOLUMES = `${URL_BASE}mapscrip/model/volumes.php`;

/*---------------------------------------------------------------------------
*                 Private Variables
*/
let books;
let volumes;


/*---------------------------------------------------------------------------
*                 Private Method Declaration
*/
let ajax;
let cacheBooks;
let init;


/*---------------------------------------------------------------------------
*                 Private Methods
*/

ajax = function(url, successCallback, failureCallback){
    let request = new XMLHttpRequest();

    request.open('GET', url, true);
    
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        let data = JSON.parse(request.response);

        if (typeof successCallback === "function"){
            successCallback(data);
        }
      } else {
          if (typeof failureCallback === "function") {
              failureCallback(request);
          }
    
      }
    };
    
    request.onerror = failureCallback;
    request.send();
};

cacheBooks = function(callback){
    volumes.forEach(volume => {
        let volumeBooks = [];
        let bookId = volume.minBookId;

        while(bookId <= volume.maxBookId) {
            volumeBooks.push(books[bookId])
            bookId += 1;
        }

        volume.books = volumeBooks;
    });

    if (typeof callback === 'function') {
        callback();
    }
}

init = function(callback){
    let booksLoaded = false;
    let volumesLoaded = false;

    ajax(URL_BOOKS,
        data =>{
            books = data;
            booksLoaded = true;

            if (volumesLoaded) {
                cacheBooks(callback);
            }
        } 
    );

    ajax(URL_VOLUMES,
    data =>{
        volumes = data;
        volumesLoaded = true;

        if (booksLoaded) {
            cacheBooks(callback);
        }
        } 
    );
    
};

/*---------------------------------------------------------------------------
*                 Public API
*/
return {
        init
    };
}());