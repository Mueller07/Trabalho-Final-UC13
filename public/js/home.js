// Tenta recuperar o ID do usuário logado do armazenamento local do navegador (localStorage)
const userId = localStorage.getItem('userId');
// Também recupera o nome do usuário para mostrar na tela
const nome = localStorage.getItem('nome');

if (!userId) {
  alert('Você precisa estar logado para acessar esta página.');
  window.location.href = 'login.html';
} else {
  const welcomeMsg = document.getElementById('welcome-msg'); // Pega o elemento HTML pelo ID
  if (welcomeMsg) {
    // Atualiza o conteúdo do elemento para exibir o nome do usuário
    welcomeMsg.textContent = `Bem-vindo(a), ${nome}!`;
  }
}


const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    // Redireciona para a página de login
    window.location.href = 'login.html';
  });
}

// Seleciona os elementos da página para manipular o formulário e tabela de livros
const formLivro = document.getElementById('livro-form');              // Formulário para criar/editar livros
const tabelaCorpo = document.querySelector('#livros-table tbody');    // Corpo da tabela onde os livros serão exibidos
const inputLivroId = document.getElementById('livro-id');             // Campo escondido para guardar ID do livro (edição)
const btnCancelar = document.getElementById('cancel-btn');            // Botão para limpar o formulário
const inputPesquisaAutor = document.getElementById('pesquisa-autor'); // Campo para filtro de livros por autor


let listaLivros = [];

// Função que associa uma classe CSS ao status do livro para estilização visual
// Recebe o status do livro (ex: "Lido", "Lendo", "Quero Ler") e retorna uma classe CSS específica
function getStatusClass(status) {
  switch (status.toLowerCase()) {
    case 'lido':
      return 'lido';      
    case 'lendo':
      return 'lendo';      
    case 'quero ler':
      return 'quero-ler';  
    default:
      return '';           
  }
}


// Recebe um parâmetro opcional para filtrar livros por autor
function renderizarTabela(filtrarAutor = '') {
  tabelaCorpo.innerHTML = ''; 

  const livrosFiltrados = listaLivros.filter(livro => {
    if (livro.user.id != userId) return false; // Ignora livros que não pertencem ao usuário

    if (!filtrarAutor) return true; // Se não há filtro, mostra todos

    // Verifica se o nome do autor contém o texto digitado (não diferencia maiúsculas/minúsculas)
    return livro.autor.toLowerCase().includes(filtrarAutor.toLowerCase());
  });

 
  if (livrosFiltrados.length === 0) {
    const linhaVazia = document.createElement('tr');
    const celula = document.createElement('td');
    celula.colSpan = 6; // Faz a célula ocupar todas as colunas da tabela
    celula.textContent = 'Nenhum livro encontrado.';
    linhaVazia.appendChild(celula);
    tabelaCorpo.appendChild(linhaVazia);
    return; // Para execução para não tentar renderizar mais nada
  }

  // Para cada livro filtrado, cria elementos HTML para cada coluna da tabela
  livrosFiltrados.forEach(livro => {
    const linha = document.createElement('tr'); // Linha da tabela

    // Coluna do título do livro
    const colunaTitulo = document.createElement('td');
    colunaTitulo.textContent = livro.titulo;

    // Coluna do autor
    const colunaAutor = document.createElement('td');
    colunaAutor.textContent = livro.autor;

    // Coluna do gênero, mostrando '-' caso esteja vazio
    const colunaGenero = document.createElement('td');
    colunaGenero.textContent = livro.genero || '-';

    // Coluna do ano de publicação, mostrando '-' caso vazio
    const colunaAno = document.createElement('td');
    colunaAno.textContent = livro.anoPublicacao || '-';

    // Coluna do status do livro, com span para aplicar estilos
    const colunaStatus = document.createElement('td');
    const spanStatus = document.createElement('span');
    spanStatus.className = 'status ' + getStatusClass(livro.status || ''); // Aplica classe visual
    spanStatus.textContent = livro.status;
    colunaStatus.appendChild(spanStatus);

    // Coluna para botões de ação (editar e excluir)
    const colunaAcoes = document.createElement('td');

    // Botão para editar o livro - chama função editar passando o ID
    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn-editar';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => editarLivro(livro.id));

    // Botão para excluir o livro - chama função deletar passando o ID
    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'btn-excluir';
    btnExcluir.textContent = 'Excluir';
    btnExcluir.addEventListener('click', () => deletarLivro(livro.id));

    // Adiciona os botões na coluna de ações
    colunaAcoes.appendChild(btnEditar);
    colunaAcoes.appendChild(btnExcluir);

    // Monta a linha adicionando as colunas criadas
    linha.appendChild(colunaTitulo);
    linha.appendChild(colunaAutor);
    linha.appendChild(colunaGenero);
    linha.appendChild(colunaAno);
    linha.appendChild(colunaStatus);
    linha.appendChild(colunaAcoes);

    // Adiciona a linha pronta no corpo da tabela
    tabelaCorpo.appendChild(linha);
  });
}

// Função que busca os livros do backend via API e atualiza a lista local e tabela
async function carregarLivros() {
  try {
    // Faz a requisição GET para o endpoint dos livros
    const response = await fetch('http://localhost:3000/api/livros/');
    const livros = await response.json(); // Converte a resposta para JSON
    listaLivros = livros;                  // Atualiza o array local com os dados
    renderizarTabela();                    // Renderiza a tabela com os livros atualizados
  } catch (err) {
    // Em caso de erro na conexão, mostra no console e alerta o usuário
    console.error('Erro ao carregar livros:', err);
    alert('Erro ao carregar livros.');
  }
}

// Função que carrega os dados de um livro para preencher o formulário de edição
async function editarLivro(id) {
  try {
    // Faz requisição para pegar os dados do livro pelo ID
    const response = await fetch('http://localhost:3000/api/livros/' + id);
    if (!response.ok) throw new Error('Livro não encontrado'); // Se não encontrado, lança erro
    const livro = await response.json();

    // Preenche os campos do formulário com os dados do livro carregado
    inputLivroId.value = livro.id;
    formLivro.titulo.value = livro.titulo;
    formLivro.autor.value = livro.autor;
    formLivro.genero.value = livro.genero || '';
    formLivro.anoPublicacao.value = livro.anoPublicacao || '';
    formLivro.status.value = livro.status;

    // Rola suavemente a página até o formulário para melhorar UX
    formLivro.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    alert('Erro ao carregar o livro para edição.');
    console.error(err);
  }
}

// Função que exclui um livro depois de confirmação do usuário
async function deletarLivro(id) {
  // Pergunta ao usuário se ele tem certeza que quer excluir o livro
  if (!confirm('Tem certeza que deseja excluir este livro?')) return;

  try {
    // Faz a requisição DELETE para o backend com o ID do livro
    const response = await fetch('http://localhost:3000/api/livros/' + id, {
      method: 'DELETE',
    });

    const data = await response.json();

    // Se a resposta não for OK, mostra mensagem de erro
    if (!response.ok) {
      alert(data.mensagem || 'Erro ao excluir o livro.');
      return;
    }

    alert('Livro excluído com sucesso!');
    carregarLivros(); // Atualiza a lista para refletir a exclusão
  } catch (err) {
    alert('Erro ao conectar com o servidor.');
    console.error(err);
  }
}

// Evento que trata o envio do formulário para criar ou atualizar um livro
if (formLivro) {
  formLivro.addEventListener('submit', async (e) => {
    e.preventDefault(); // Previne o envio normal da página para controlar via JS

    // Pega os valores atuais do formulário, removendo espaços em branco no início/fim
    const livroId = inputLivroId.value;
    const titulo = formLivro.titulo.value.trim();
    const autor = formLivro.autor.value.trim();
    const genero = formLivro.genero.value.trim();
    const anoPublicacao = formLivro.anoPublicacao.value.trim();
    const status = formLivro.status.value;

    // Validação simples: título e autor são obrigatórios
    if (!titulo || !autor) {
      alert('Preencha pelo menos o título e o autor.');
      return;
    }

    // Monta objeto com os dados a serem enviados para o backend
    const payload = { titulo, autor, genero, anoPublicacao, status, userId };

    // Define URL e método HTTP, se está criando (POST) ou editando (PUT)
    let url = 'http://localhost:3000/api/livros/';
    let method = 'POST';

    if (livroId) {
      url += livroId; // Se tiver id, está editando livro existente
      method = 'PUT';
    }

    try {
      // Envia requisição com os dados do livro para o backend
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), // Converte para JSON
      });

      const data = await response.json();

      // Se deu erro, mostra a mensagem retornada ou mensagem padrão
      if (!response.ok) {
        alert(data.mensagem || 'Erro ao salvar o livro.');
        return;
      }

      alert(`Livro ${livroId ? 'atualizado' : 'cadastrado'} com sucesso!`);
      formLivro.reset();      // Limpa o formulário para próxima entrada
      inputLivroId.value = ''; // Limpa o id para indicar novo cadastro
      carregarLivros();        // Atualiza a tabela para refletir mudanças
    } catch (error) {
      alert('Erro ao conectar com o servidor.');
      console.error(error);
    }
  });
}

// Evento para o botão cancelar que limpa o formulário e limpa o id do livro em edição
if (btnCancelar) {
  btnCancelar.addEventListener('click', () => {
    formLivro.reset();      // Limpa todos os campos do formulário
    inputLivroId.value = ''; // Limpa o campo do id para evitar confusão
  });
}

// Evento para campo de busca por autor que filtra a tabela em tempo real conforme digita
if (inputPesquisaAutor) {
  inputPesquisaAutor.addEventListener('input', () => {
    const termo = inputPesquisaAutor.value.trim();
    renderizarTabela(termo); // Atualiza a tabela com o filtro aplicado
  });
}

// Chama a função para carregar livros do backend assim que a página termina de carregar
carregarLivros();
