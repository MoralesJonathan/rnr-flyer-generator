(function () {
     const form = document.getElementById('form');
     form.addEventListener('submit', event => {
          event.preventDefault();
          fetch('/',{
               method: 'POST',
               body: new FormData(form)
          })
          .then(response => response.text())
          .then(data => alert(data))
          .catch(error => {
               alert(error)
          }) 
     })
})()