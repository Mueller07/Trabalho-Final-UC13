// Escuta o envio do formulário de login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // Impede o reload da página

  const email = e.target.email.value;
  const senha = e.target.password.value;

  try {
    // Envia dados para o backend autenticar
    const res = await fetch('http://localhost:3000/api/usuarios/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.mensagem || 'Erro no login');
      return;
    }

    // Salva dados no localStorage para manter sessão
    localStorage.setItem('userId', data.userId || '');
    localStorage.setItem('nome', data.nome || 'Usuário');

    alert('Login realizado com sucesso!');
    window.location.href = 'home.html';

  } catch (error) {
    alert('Erro na conexão com o servidor.');
    console.error(error);
  }
});
