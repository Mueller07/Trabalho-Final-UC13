import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { AppDataSource } from './database/data-source';
import UserRoutes from './routes/UserRoutes';
import LivroRoutes from './routes/LivroRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/usuarios', UserRoutes);
app.use('/api/livros', LivroRoutes);

app.use(express.static(path.join(__dirname, 'public')));

// Conectar no banco e iniciar o servidor
AppDataSource.initialize()
  .then(() => {
    console.log('Banco de dados conectado!');
    app.listen(3000, () => {
      console.log('Servidor rodando na porta 3000');
    });
  })
  .catch((err: any) => {
    console.error('Erro ao conectar com o banco:', err);
  });
