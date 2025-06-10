document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = './login.html'; // Token yo'q bo'lsa, login sahifasiga yo'naltirish
  }

  const pendingList = document.getElementById('pendingList');
  const logoutBtn = document.getElementById('logoutBtn');
  const menuButtons = document.querySelectorAll('.menu-btn');
  const sections = document.querySelectorAll('.section');

  // Kutilayotgan tasdiqlashlarni ro'yxatlash
  async function loadPending() {
    try {
      const response = await fetch('http://localhost:4000/admin/pending', {
        headers: {
          'auth-token': token
        }
      });
      const pending = await response.json();
      console.log(pending);
      
      if (response.ok) {
        displayPending(pending);
      } else {
        pendingList.innerHTML = `<p>${pending.message}</p>`;
      }
    } catch (error) {
      pendingList.innerHTML = '<p>Tasdiqlashlarni yuklashda xato yuz berdi</p>';
      console.error('Tasdiqlashlarni yuklashda xato:', error);
    }
  }

  // Tasdiqlashlarni HTML da ko'rsatish
  function displayPending(pending) {
    if (pending.length === 0) {
      pendingList.innerHTML = '<p>Hozircha kutilayotgan tasdiqlashlar yo\'q</p>';
      return;
    }

    pendingList.innerHTML = ''; // Oldingi kontentni tozalash
    const cont = pending.map((item, index) => {
      const div = document.createElement('div');
      div.className = 'elements';
      div.innerHTML = `
        <p>#${index + 1}</p>
        <p>Foydalanuvchi: ${item.username}</p>
        <p>Email: ${item.email}</p>
        <p>Muammo: ${item.problem}</p>
        <p>Kunlar: ${item.days}</p>
        <p>Narx: ${item.price} so'm</p>
        <div class="action-buttons">
          <button class="confirm-btn" data-userid="${item.userId}" data-index="${item.problemIndex}">Confirm</button>
          <button class="reject-btn" data-userid="${item.userId}" data-index="${item.problemIndex}">Reject</button>
        </div>
      `;
      return div;
    });
    pendingList.append(...cont);

    // Tasdiqlash va rad etish hodisalarini qo'shish
    document.querySelectorAll('.confirm-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.getAttribute('data-userid');
        const requestIndex = btn.getAttribute('data-index');
        await handleAction(userId, requestIndex, true);
      });
    });

    document.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.getAttribute('data-userid');
        const requestIndex = btn.getAttribute('data-index');
        await handleAction(userId, requestIndex, false);
      });
    });
  }

  // Tasdiqlash yoki rad etish so'rovini yuborish
  async function handleAction(userId, requestIndex, confirmed) {
    try {
      const response = await fetch('http://localhost:4000/admin/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
        body: JSON.stringify({
          userId: Number(userId),
          problemIndex: Number(requestIndex),
          confirmed
        })
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message || `Muammo ${confirmed ? 'tasdiqlandi' : 'rad etildi'}`);
        loadPending(); // Ro'yxatni yangilash
      } else {
        alert(result.message || 'Xato yuz berdi');
      }
    } catch (error) {
      alert('Amalni bajarishda xato yuz berdi');
      console.error('Amalni bajarishda xato:', error);
    }
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

  // Sahifa yuklanganda tasdiqlashlarni yuklash
  loadPending();
});