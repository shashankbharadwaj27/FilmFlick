var query;

const search = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZTUwM2Y3ZDc3Yzk5YzIxMDliMThkMDJkODhlMzZiOSIsInN1YiI6IjY1ZDlmOWRmNzJkODU1MDE2MmJiY2NhZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3v0fESxS9UBYaVMzt4u6GG-0mBUYBGKIAoQ0CvxWt2I'
    }
  };

document.addEventListener('DOMContentLoaded', function() {
    var searchIcon = document.querySelector('#searchIcon');
    var input = document.querySelector('input');

    searchIcon.addEventListener("click", function(event) {
        query = input.value;
        console.log(query);

        const options = {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZTUwM2Y3ZDc3Yzk5YzIxMDliMThkMDJkODhlMzZiOSIsInN1YiI6IjY1ZDlmOWRmNzJkODU1MDE2MmJiY2NhZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3v0fESxS9UBYaVMzt4u6GG-0mBUYBGKIAoQ0CvxWt2I'
            }
          };
          
          fetch(`https://api.themoviedb.org/3/search/multi?query=${query}&include_adult=false&language=en-US&page=1`, options)
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(err => console.error(err));
    });
});

