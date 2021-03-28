(function () {
     const form = document.getElementById('form');
     form.addEventListener('submit', event => {
          event.preventDefault();
          const flyerSection = document.getElementById('flyer-section');
          flyerSection.style.display = 'block';
          const submitBtn = document.getElementById('submit');
          submitBtn.disabled = true;
          const loading = document.getElementById('loading');
          const flyers = document.getElementById('flyers');
          loading.style.display = 'block';
          flyers.style.display = 'none';
          fetch('/',{
               method: 'POST',
               body: new FormData(form)
          })
          .then(response => response.text())
          .then(data => { 
               loading.style.display = 'none';
               const flyer1 = document.getElementById('flyer1');
               const flyer2 = document.getElementById('flyer2');
               data = JSON.parse(data);
               flyer1.src = `data:image/png;base64, ${data[0]}`;
               flyer2.src = `data:image/png;base64, ${data[1]}`
               flyers.style.display = 'block';
               submitBtn.disabled = false;
          })
          .catch(error => {
               alert(error)
          }) 
     })
})()