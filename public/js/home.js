// Verifica se o usuário está logado
const userId = localStorage.getItem('userId');
const nome = localStorage.getItem('nome');

if (!userId) {
  alert('Você precisa estar logado para acessar esta página.');
  window.location.href = 'index.html';
} else {
  const welcomeMsg = document.getElementById('welcome-msg');
  if (welcomeMsg) {
    welcomeMsg.textContent = `Bem-vindo(a), ${nome}!`;
  }
}

// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
  });
}

// Elementos do formulário e tabela
const formLivro = document.getElementById('livro-form');
const tabelaCorpo = document.querySelector('#livros-table tbody');
const inputLivroId = document.getElementById('livro-id');
const btnCancelar = document.getElementById('cancel-btn');
const inputPesquisaAutor = document.getElementById('pesquisa-autor');

let listaLivros = []; // Guardará os livros carregados do servidor

// Retorna classe para o status (para estilizar)
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

// Função para renderizar a tabela, opcionalmente filtrando pelo autor
function renderizarTabela(filtrarAutor = '') {
  tabelaCorpo.innerHTML = '';

  const livrosFiltrados = listaLivros.filter(livro => {
    // Só livros do usuário logado
    if (livro.user.id != userId) return false;

    // Se o filtro estiver vazio, mostra todos; se não, verifica autor
    if (!filtrarAutor) return true;

    return livro.autor.toLowerCase().includes(filtrarAutor.toLowerCase());
  });

  if (livrosFiltrados.length === 0) {
    const linhaVazia = document.createElement('tr');
    const celula = document.createElement('td');
    celula.colSpan = 6;
    celula.textContent = 'Nenhum livro encontrado.';
    linhaVazia.appendChild(celula);
    tabelaCorpo.appendChild(linhaVazia);
    return;
  }

  livrosFiltrados.forEach(livro => {
    const linha = document.createElement('tr');

    // Colunas
    const colunaTitulo = document.createElement('td');
    colunaTitulo.textContent = livro.titulo;

    const colunaAutor = document.createElement('td');
    colunaAutor.textContent = livro.autor;

    const colunaGenero = document.createElement('td');
    colunaGenero.textContent = livro.genero || '-';

    const colunaAno = document.createElement('td');
    colunaAno.textContent = livro.anoPublicacao || '-';

    const colunaStatus = document.createElement('td');
    const spanStatus = document.createElement('span');
    spanStatus.className = 'status ' + getStatusClass(livro.status || '');
    spanStatus.textContent = livro.status;
    colunaStatus.appendChild(spanStatus);

    const colunaAcoes = document.createElement('td');

    // Botão Editar
    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn-editar';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => editarLivro(livro.id));

    // Botão Excluir
    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'btn-excluir';
    btnExcluir.textContent = 'Excluir';
    btnExcluir.addEventListener('click', () => deletarLivro(livro.id));

    colunaAcoes.appendChild(btnEditar);
    colunaAcoes.appendChild(btnExcluir);

    // Monta a linha
    linha.appendChild(colunaTitulo);
    linha.appendChild(colunaAutor);
    linha.appendChild(colunaGenero);
    linha.appendChild(colunaAno);
    linha.appendChild(colunaStatus);
    linha.appendChild(colunaAcoes);

    tabelaCorpo.appendChild(linha);
  });
}

// Carrega livros do servidor
async function carregarLivros() {
  try {
    const response = await fetch('http://localhost:3000/api/livros/');
    const livros = await response.json();
    listaLivros = livros;
    renderizarTabela();
  } catch (err) {
    console.error('Erro ao carregar livros:', err);
    alert('Erro ao carregar livros.');
  }
}

// Preenche formulário para edição
async function editarLivro(id) {
  try {
    const response = await fetch('http://localhost:3000/api/livros/' + id);
    if (!response.ok) throw new Error('Livro não encontrado');
    const livro = await response.json();

    inputLivroId.value = livro.id;
    formLivro.titulo.value = livro.titulo;
    formLivro.autor.value = livro.autor;
    formLivro.genero.value = livro.genero || '';
    formLivro.anoPublicacao.value = livro.anoPublicacao || '';
    formLivro.status.value = livro.status;

    formLivro.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    alert('Erro ao carregar o livro para edição.');
    console.error(err);
  }
}

// Deleta livro
async function deletarLivro(id) {
  if (!confirm('Tem certeza que deseja excluir este livro?')) return;

  try {
    const response = await fetch('http://localhost:3000/api/livros/' + id, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.mensagem || 'Erro ao excluir o livro.');
      return;
    }

    alert('Livro excluído com sucesso!');
    carregarLivros();
  } catch (err) {
    alert('Erro ao conectar com o servidor.');
    console.error(err);
  }
}

// Submete formulário para criar ou atualizar livro
if (formLivro) {
  formLivro.addEventListener('submit', async (e) => {
    e.preventDefault();

    const livroId = inputLivroId.value;
    const titulo = formLivro.titulo.value.trim();
    const autor = formLivro.autor.value.trim();
    const genero = formLivro.genero.value.trim();
    const anoPublicacao = formLivro.anoPublicacao.value.trim();
    const status = formLivro.status.value;

    if (!titulo || !autor) {
      alert('Preencha pelo menos o título e o autor.');
      return;
    }

    const payload = { titulo, autor, genero, anoPublicacao, status, userId };

    let url = 'http://localhost:3000/api/livros/';
    let method = 'POST';

    if (livroId) {
      url += livroId;
      method = 'PUT';
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.mensagem || 'Erro ao salvar o livro.');
        return;
      }

      alert(`Livro ${livroId ? 'atualizado' : 'cadastrado'} com sucesso!`);
      formLivro.reset();
      inputLivroId.value = '';
      carregarLivros();
    } catch (error) {
      alert('Erro ao conectar com o servidor.');
      console.error(error);
    }
  });
}

// Botão cancelar limpa o formulário
if (btnCancelar) {
  btnCancelar.addEventListener('click', () => {
    formLivro.reset();
    inputLivroId.value = '';
  });
}

// Pesquisa por autor - evento input para filtro em tempo real
if (inputPesquisaAutor) {
  inputPesquisaAutor.addEventListener('input', () => {
    const termo = inputPesquisaAutor.value.trim();
    renderizarTabela(termo);
  });
}

// Carrega os livros ao abrir a página
carregarLivros();
