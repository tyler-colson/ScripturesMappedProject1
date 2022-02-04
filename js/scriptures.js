const Scriptures = (function (){
    "use strict";

/*---------------------------------------------------------------------------
*                 Constants
*/
const BOTTOM_PADDING = "<br /><br />";
const CLASS_BOOKS = "books";
const CLASS_VOLUME = "volume";
const DIV_SCRIPTURES_NAVIGATOR = "scripnav";
const DIV_SCRIPTURES = "scriptures";
const REQUEST_GET = "GET";
const REQUEST_STATUS_OK = 200;
const REQUEST_STATUS_ERROR = 400;
const TAG_HEADERS = "h5";
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
let bookChapterValid;
let cacheBooks;
let htmlAnchor;
let htmlDiv;
let htmlElement;
let htmlLink;
let htmlHashLink;
let init;
let navigateBook;
let navigateChapter;
let navigateHome;
let onHashChanged;


/*---------------------------------------------------------------------------
*                 Private Methods
*/

ajax = function(url, successCallback, failureCallback){
    let request = new XMLHttpRequest();

    request.open(REQUEST_GET, url, true);
    
    request.onload = function() {
      if (request.status >= REQUEST_STATUS_OK && request.status < REQUEST_STATUS_ERROR) {
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

bookChapterValid = function(bookId, chapter){
    let book = books[bookId];

    if (book === undefined || chapter<0 || chapter > book.numChapters){
        return false;
    }

    if (chapter === 0 && book.numChapters > 0){
        return false
    } 

    return true;
}

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

    htmlDiv = function(parameters){
    let classString = "";
    let contentString = "";
    let idString = "";

    if (parameters.classKey !== undefined){
        classString = `class="${parameters.classKey}"`;
    }
    if (parameters.content !== undefined){
        contentString = parameters.content;
    }
    if (parameters.id !== undefined){
        idString = `id="${parameters.id}"`;
    }

    return `<div${idString}${classString}>${contentString}</div>`;
};

    htmlElement = function(tagName, content){
    return `<${tagName}>${content}</${tagName}>`;
};

    htmlLink = function(parameters){
    let classString = "";
    let contentString = "";
    let hrefString = "";
    let idString = "";

    if (parameters.classKey !== undefined){
        classString = `class="${parameters.classKey}"`;
    }
    if (parameters.content !== undefined){
        contentString = parameters.content;
    }
    if (parameters.href !== undefined){
        hrefString = `href="${parameters.href}"`;
    }
    if (parameters.id !== undefined){
        idString = `id="${parameters.id}"`;
    }

    return `<a${idString}${classString}${hrefString}>${contentString}</a>`;

};

    htmlHashLink = function (hashArguments, content){
    retrun `<a href="javascript:void(0)" onclick=changeHash(${hashArguments})">${content}</a>`;
};

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

navigateBook = function(bookId){
    console.log("navigateBook " + bookId)
};

navigateChapter = function(bookId, chapter){
    console.log("navigateChapter " + bookId + ", " + chapter)
};

navigateHome = function(volumeId){
    document.getElementById(DIV_SCRIPTURES).innerHTML = 
    "<div>Old Testament</div>" +
    "<div>New Testament</div>" +
    "<div>Book of Mormon</div>" +
    "<div>Pearl of Great Price</div>" +
    "<div>Doctrine and Covenants</div>" + volumeId
};

onHashChanged = function() {
    let ids = [];

    if (location.hash !== "" && location.hash.length > 1){
        ids = location.hash.slice(1).split(":");
    }

    if (ids.length <= 0){
        navigateHome()
    }
    else if (ids.length === 1){
        let volumeId = Number(ids[0]);

        if (volumeId < volumes[0].id || volumeId > volumes.slice(-1)[0].id){
            navigateHome();
        }
        
        else{
            navigateHome(volumeId);
        }

    }
    else{
        let bookId = Number(ids[1]);

        if (books[bookId] === undefined){
            navigateHome();
        }
        else{
            

            if (ids.length ===2){
                navigateBook(bookId);
            }
            else{
                let chapter = Number(ids[2]);
                if (bookChapterValid(bookId, chapter)){
                    navigateChapter(bookId, chapter)
                }
                else{
                    navigateHome();
                }
            }
            
        }
    }
}





/*---------------------------------------------------------------------------
*                 Public API
*/
return {
        init,
        onHashChanged
    };
}());