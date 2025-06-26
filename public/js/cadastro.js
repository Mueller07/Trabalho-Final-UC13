// Seleciona o formulário pelo ID 'register-form' e adiciona um listener para o evento 'submit'
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // Impede que o formulário recarregue a página ao ser enviado

  // Cria um objeto FormData para facilitar a extração dos dados do formulário
  const formData = new FormData(e.target);
  const nome = formData.get('nome');   // Pega o valor do campo 'nome'
  const email = formData.get('email'); // Pega o valor do campo 'email'
  const senha = formData.get('senha'); // Pega o valor do campo 'senha'

  try {
    // Envia uma requisição POST para a API com os dados do formulário em formato JSON
    const res = await fetch('http://localhost:3000/api/usuarios/users', { 
      method: 'POST', // Método HTTP POST para criar um novo recurso
      headers: { 'Content-Type': 'application/json' }, // Diz que o corpo da requisição é JSON
      body: JSON.stringify({ nome, email, senha }), // Converte os dados para JSON
    });

    // Lê a resposta da API como JSON
    const data = await res.json();

    // Se o status da resposta não for ok (200-299), mostra mensagem de erro
    if (!res.ok) {
      alert(data.mensagem || 'Erro no cadastro'); // Exibe a mensagem enviada pelo backend ou uma padrão
      return; // Sai da função para não continuar o código
    }

    // Se deu tudo certo, mostra mensagem de sucesso para o usuário
    alert('Cadastro realizado com sucesso! Faça login.');

    // Redireciona para a página de login após o cadastro
    window.location.href = 'login.html';

  } catch (error) {
    // Caso haja erro na comunicação com o servidor (ex: servidor offline)
    alert('Erro na conexão com o servidor.');
    console.error('Erro no fetch:', error); // Mostra o erro no console para debug
  }
});
