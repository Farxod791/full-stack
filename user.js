  document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = './login.html'; // Token yo'q bo'lsa, login sahifasiga yo'naltirish
    }

    const problemList = document.getElementById('problemList');
    const addProblemForm = document.getElementById('addProblemForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const menuButtons = document.querySelectorAll('.menu-btn');
    const sections = document.querySelectorAll('.section');

    // Foydalanuvchi ID sini olish (JWT tokenidan)
    async function getUserId() {
      try {
        const response = await fetch('http://localhost:4000/user', {
          headers: {
            'auth-token': token
          }
        });
        const user = await response.json();
        if (response.ok) {
          return user
        } else {
          throw new Error(user.message);
        }
      } catch (error) {
        console.error('Foydalanuvchi ma\'lumotlarini olishda xato:', error);
        localStorage.removeItem('token');
        window.location.href = './login.html';
      }
    }

    // Muammolarni ro'yxatlash
    async function loadProblems() {
        const user = await getUserId();
        const problems = user.requests   
        console.log(problems);
           
        if (user) {
          problemList.innerHTML = ""
          const cont = problems.map((e) => {
            const div = document.createElement("div")
            div.id = "elements"
            div.innerHTML = `
            <p>${e.problem}</p> <p>${e.response?.days ?? "Ko'rib chiqilmoqda"} kun</p> <p>${e.response?.price ?? "Ko'rib chiqilmoqda"} so'm</p> <p>${e.response?.confirmed ?? "Ko'rib chiqilmoqda"}</p>            `
            return div
          })
          problemList.append(...cont)
          
        } else {
          displayProblems(problems);
        }
      
    }

    // Muammolarni HTML da ko'rsatish
    function displayProblems(problems) {
      if (problems.length === 0) {
        problemList.innerHTML = '<p>Hozircha muammolar yo\'q</p>';
        return;
      }

      problemList.innerHTML = problems.map((item, index) => `
        <div class="problem-item">
          <h3>Muammo #${index + 1}: ${item.problem}</h3>
          <p>Javob: ${
            item.response 
              ? `Kunlar: ${item.response.days}, Narx: ${item.response.price} so'm, Tasdiqlangan: ${item.response.confirmed ? 'Ha' : 'Yo\'q'}`
              : 'Javob kutilmoqda'
          }</p>
        </div>
      `).join('');
    }

    // Yangi muammo qo'shish
    addProblemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = await getUserId()
      const title = document.getElementById('title').value;
      const problem = title

      try {
        const user = await getUserId();
        const response = await fetch('http://localhost:4000/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': token
          },
          body: JSON.stringify([user.id,{problem}])
        });
        const result = await response.json();
        if (response.ok) {
          alert(result.message);
          addProblemForm.reset();
          loadProblems(); // Muammolar ro'yxatini yangilash
        } else {
          alert(result.message);
        }
      } catch (error) {
        alert('Muammo qo\'shishda xato yuz berdi');
        console.error('Muammo qo\'shishda xato:', error);
      }
    });

    // Chiqish funksiyasi
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '../index.html';
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
    loadProblems();
  });