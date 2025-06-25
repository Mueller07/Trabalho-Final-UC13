document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const nome = formData.get('nome');
  const email = formData.get('email');
  const senha = formData.get('senha');

  try {
    const res = await fetch('http://localhost:3000/api/usuarios/users', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.mensagem || 'Erro no cadastro');
      return;
    }

    alert('Cadastro realizado com sucesso! Faça login.');
    window.location.href = 'index.html';

  } catch (error) {
    alert('Erro na conexão com o servidor.');
    console.error('Erro no fetch:', error);
  }
});

