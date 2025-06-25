import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { Livro } from "../models/Livro";
import { User } from "../models/User";

export class LivroController {
  createLivro = async (req: Request, res: Response) => {
    const { titulo, autor, genero, anoPublicacao, status, userId } = req.body;

    if (!titulo || !autor || !status || !userId) {
      res.status(400).json({ mensagem: "Preencha todos os campos." });
      return
    }

    try {
      const userRepo = AppDataSource.getRepository(User);
      const livroRepo = AppDataSource.getRepository(Livro);

      const usuario = await userRepo.findOne({ where: { id: Number(userId) } });

      if (!usuario) {
        res.status(404).json({ mensagem: "Usuário não encontrado." });
        return;
      }

      const novoLivro = livroRepo.create({
        titulo,
        autor,
        genero,
        anoPublicacao,
        status,
        user: usuario,
      });

      await livroRepo.save(novoLivro);
      res.status(201).json({ mensagem: "Livro criado com sucesso." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao criar livro." });
    }
  };

  getLivros = async (req: Request, res: Response) => {
    try {
      const livroRepo = AppDataSource.getRepository(Livro);
      const livros = await livroRepo.find({ relations: ["user"] });
      res.json(livros);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao buscar livros." });
    }
  };

  getLivroById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    try {
      const livroRepo = AppDataSource.getRepository(Livro);
      const livro = await livroRepo.findOne({ where: { id }, relations: ["user"] });

      if (!livro) {
        res.status(404).json({ mensagem: "Livro não encontrado." });
        return;
      }

      res.json(livro);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao buscar livro." });
    }
  };

  updateLivro = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { titulo, autor, genero, anoPublicacao, status } = req.body;

    try {
      const livroRepo = AppDataSource.getRepository(Livro);
      const livro = await livroRepo.findOne({ where: { id } });

      if (!livro) {
        res.status(404).json({ mensagem: "Livro não encontrado." });
        return;
      }

      livro.titulo = titulo || livro.titulo;
      livro.autor = autor || livro.autor;
      livro.genero = genero || livro.genero;
      livro.anoPublicacao = anoPublicacao || livro.anoPublicacao;
      livro.status = status || livro.status;

      await livroRepo.save(livro);

      res.json({ mensagem: "Livro atualizado com sucesso.", livro });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao atualizar livro." });
      return;
    }
  };

  deleteLivro = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    try {
      const livroRepo = AppDataSource.getRepository(Livro);
      const result = await livroRepo.delete(id);

      if (result.affected === 0) {
        res.status(404).json({ mensagem: "Livro não encontrado." });
        return;
      }

      res.json({ mensagem: "Livro deletado com sucesso." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: "Erro ao deletar livro." });
    }
  };
}
