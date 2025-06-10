

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = './login.html'; // Token yo'q bo'lsa, login sahifasiga yo'naltirish
  }

  const requestList = document.getElementById('requestList');
  const logoutBtn = document.getElementById('logoutBtn');
  const menuButtons = document.querySelectorAll('.menu-btn');
  const sections = document.querySelectorAll('.section');

  // Kutilayotgan muammolarni ro'yxatlash
  async function loadRequests() {
    try {
      const response = await fetch('http://localhost:4000/master/requests', {
        headers: {
          'auth-token': token
        }
      });
      const requests = await response.json();
      console.log(requests);
      
      if (response.ok) {
        displayRequests(requests);
      } else {
        requestList.innerHTML = `<p>${requests.message}</p>`;
      }
    } catch (error) {
      requestList.innerHTML = '<p>Muammolarni yuklashda xato yuz berdi</p>';
      console.error('Muammolarni yuklashda xato:', error);
    }
  }

  // Muammolarni HTML da ko'rsatish
  function displayRequests(requests) {
    if (requests.length === 0) {
      requestList.innerHTML = '<p>Hozircha kutilayotgan muammolar yo\'q</p>';
      return;
    }

    requestList.innerHTML = ''; // Oldingi kontentni tozalash
    const cont = requests.map((req) => {
      const div = document.createElement('div');
      div.className = 'elements';
      div.innerHTML = `
        <p>Foydalanuvchi: ${req.username}</p>
        <p>Email: ${req.email}</p>
        <p>Muammo: ${req.problem}</p>
        <form class="response-form" data-userid="${req.userId}" data-index="${req.problemIndex}">
          <input type="number" placeholder="Kunlar" class="days" required />
          <input type="number" placeholder="Narx (so'm)" class="price" required />
          <button type="submit">Javob berish</button>
        </form>
      `;
      return div;
    });
    requestList.append(...cont);

    // Formaga submit hodisasini qo'shish
    document.querySelectorAll('.response-form').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = form.getAttribute('data-userid');
        const requestIndex = form.getAttribute('data-index');
        const days = form.querySelector('.days').value;
        const price = form.querySelector('.price').value;

        try {
          const response = await fetch('http://localhost:4000/master/respond', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'auth-token': token
            },
            body: JSON.stringify({
              userId: Number(userId),
              requestIndex: Number(requestIndex),
              days: Number(days),
              price: Number(price)
            })
          });
          const result = await response.json();
          if (response.ok) {
            alert(result.message);
            loadRequests(); // Ro'yxatni yangilash
          } else {
            alert(result.message);
          }
        } catch (error) {
          alert('Javob yuborishda xato yuz berdi');
          console.error('Javob yuborishda xato:', error);
        }
      });
    });
  }

  // Chiqish funksiyasi
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '../login.html';
  });

  // Sidebar menyusidagi bo'limlarni almashtirish
  menuButtons.forEach(button => {
    button.addEventListener('click', () => {
      const sectionId = button.getAttribute('data-section');
      sections.forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
      });
    });
  });

  // Sahifa yuklanganda muammolarni yuklash
  loadRequests();
});